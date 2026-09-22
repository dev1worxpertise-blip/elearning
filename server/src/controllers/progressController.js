/**
 * Progress & Quiz Evaluation Controller
 */
const db = require('../db');

exports.updateVideoProgress = async (req, res) => {
  try {
    const { moduleId, percent, isFinished } = req.body;
    const userId = req.user.id;

    if (!moduleId || percent === undefined) {
      return res.status(400).json({ success: false, message: 'moduleId and percent are required.' });
    }

    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    const finished = isFinished || safePercent >= 98;
    const progressId = `prog_${userId}_${moduleId}`;

    const upsertQuery = `
      INSERT INTO module_progress (id, user_id, module_id, video_watched_percent, is_video_finished, last_watched_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, module_id)
      DO UPDATE SET
        video_watched_percent = GREATEST(module_progress.video_watched_percent, EXCLUDED.video_watched_percent),
        is_video_finished = module_progress.is_video_finished OR EXCLUDED.is_video_finished,
        last_watched_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await db.query(upsertQuery, [progressId, userId, moduleId, safePercent, finished]);

    res.json({
      success: true,
      message: 'Video progress saved.',
      progress: result.rows[0],
    });
  } catch (err) {
    console.error('updateVideoProgress error:', err);
    res.status(500).json({ success: false, message: 'Failed to update video progress.' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { moduleId, answers } = req.body; // answers: { [questionId]: selectedOptionIndex }
    const userId = req.user.id;

    if (!moduleId || !answers) {
      return res.status(400).json({ success: false, message: 'moduleId and answers are required.' });
    }

    // 1. Fetch Quiz from Database
    const quizResult = await db.query('SELECT * FROM quizzes WHERE module_id = $1', [moduleId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No quiz found for this module.' });
    }

    const quiz = quizResult.rows[0];
    const questions = quiz.questions || [];
    const totalQuestions = questions.length;
    const passingScore = quiz.passing_score || 80;

    // 2. Grade Answers
    let correctCount = 0;
    const review = questions.map((q) => {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        userChoice,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = percentage >= passingScore;

    // 3. Record Submission
    const submissionId = 'sub_' + Date.now();
    const insertSubQuery = `
      INSERT INTO quiz_submissions (id, user_id, quiz_id, module_id, score, total_questions, percentage, is_passed, user_answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    await db.query(insertSubQuery, [
      submissionId,
      userId,
      quiz.id,
      moduleId,
      correctCount,
      totalQuestions,
      percentage,
      isPassed,
      JSON.stringify(answers),
    ]);

    // 4. If Passed, mark module as completed
    if (isPassed) {
      const progressId = `prog_${userId}_${moduleId}`;
      const markCompleteQuery = `
        INSERT INTO module_progress (id, user_id, module_id, is_completed, is_video_finished, video_watched_percent)
        VALUES ($1, $2, $3, TRUE, TRUE, 100)
        ON CONFLICT (user_id, module_id)
        DO UPDATE SET is_completed = TRUE, is_video_finished = TRUE, video_watched_percent = 100
      `;
      await db.query(markCompleteQuery, [progressId, userId, moduleId]);
    }

    // 5. Check if the parent program is now fully completed
    const moduleInfo = await db.query('SELECT program_id FROM modules WHERE id = $1', [moduleId]);
    let isProgramComplete = false;
    let certificate = null;

    if (moduleInfo.rows.length > 0) {
      const programId = moduleInfo.rows[0].program_id;

      // Count total vs completed modules for this program
      const totalModsRes = await db.query('SELECT COUNT(*) FROM modules WHERE program_id = $1', [programId]);
      const compModsRes = await db.query(
        `SELECT COUNT(*) FROM module_progress mp
         JOIN modules m ON mp.module_id = m.id
         WHERE mp.user_id = $1 AND m.program_id = $2 AND mp.is_completed = TRUE`,
        [userId, programId]
      );

      const totalMods = parseInt(totalModsRes.rows[0].count, 10);
      const compMods = parseInt(compModsRes.rows[0].count, 10);

      if (totalMods > 0 && compMods === totalMods) {
        isProgramComplete = true;

        // Mark enrollment complete
        await db.query(
          'UPDATE enrollments SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND program_id = $2',
          [userId, programId]
        );

        // Auto issue certificate if not already issued
        const certCheck = await db.query('SELECT * FROM certificates WHERE user_id = $1 AND program_id = $2', [
          userId,
          programId,
        ]);

        if (certCheck.rows.length > 0) {
          certificate = certCheck.rows[0];
        } else {
          // Fetch program and user info for certificate
          const pRes = await db.query('SELECT * FROM programs WHERE id = $1', [programId]);
          const uRes = await db.query('SELECT name FROM users WHERE id = $1', [userId]);
          const prog = pRes.rows[0];
          const studentName = uRes.rows[0].name;

          const certId = 'cert_' + Date.now();
          const credentialId = 'CERT-LP-' + Math.floor(100000 + Math.random() * 900000);
          const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const verCode = 'LP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

          const insertCertQuery = `
            INSERT INTO certificates (
              id, credential_id, user_id, program_id, student_name, program_title,
              issue_date, instructor_name, instructor_role, grade, verification_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
          `;
          const certResult = await db.query(insertCertQuery, [
            certId,
            credentialId,
            userId,
            programId,
            studentName,
            prog.title,
            issueDate,
            prog.instructor_name,
            prog.instructor_role,
            'Distinction (Honors)',
            verCode,
          ]);
          certificate = certResult.rows[0];
        }
      }
    }

    res.json({
      success: true,
      score: correctCount,
      total: totalQuestions,
      percentage,
      isPassed,
      passingScore,
      isProgramComplete,
      certificate,
      review,
    });
  } catch (err) {
    console.error('submitQuiz error:', err);
    res.status(500).json({ success: false, message: 'Quiz submission failed.', error: err.message });
  }
};
