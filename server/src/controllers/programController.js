/**
 * Programs & Curriculum Controller
 */
const db = require('../db');

exports.getAllPrograms = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM programs WHERE is_published = TRUE';
    const params = [];

    if (category && category !== 'all') {
      params.push(`%${category}%`);
      query += ` AND category_name ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR tagline ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at ASC';
    const result = await db.query(query, params);

    // If authenticated, attach user's enrollment status
    let userEnrollments = [];
    if (req.user) {
      const enrollResult = await db.query('SELECT program_id, is_completed FROM enrollments WHERE user_id = $1', [req.user.id]);
      userEnrollments = enrollResult.rows;
    }

    const programs = result.rows.map((prog) => {
      const enrollment = userEnrollments.find((e) => e.program_id === prog.id);
      return {
        ...prog,
        is_enrolled: !!enrollment,
        is_completed: enrollment ? enrollment.is_completed : false,
      };
    });

    res.json({ success: true, count: programs.length, programs });
  } catch (err) {
    console.error('getAllPrograms error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch programs.', error: err.message });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch Program
    const progResult = await db.query('SELECT * FROM programs WHERE id = $1 OR slug = $1', [id]);
    if (progResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    const program = progResult.rows[0];

    // Fetch Modules & Quizzes
    const modulesQuery = `
      SELECT m.*, 
             q.id as quiz_id, q.title as quiz_title, q.passing_score, q.questions as quiz_questions
      FROM modules m
      LEFT JOIN quizzes q ON m.id = q.module_id
      WHERE m.program_id = $1
      ORDER BY m.module_order ASC
    `;
    const modulesResult = await db.query(modulesQuery, [program.id]);

    // Attach user's progress if authenticated
    let progressMap = {};
    let isEnrolled = false;
    if (req.user) {
      const enrollCheck = await db.query('SELECT * FROM enrollments WHERE user_id = $1 AND program_id = $2', [
        req.user.id,
        program.id,
      ]);
      isEnrolled = enrollCheck.rows.length > 0;

      const progressResult = await db.query('SELECT * FROM module_progress WHERE user_id = $1', [req.user.id]);
      progressResult.rows.forEach((p) => {
        progressMap[p.module_id] = p;
      });
    }

    const modules = modulesResult.rows.map((m) => {
      const progress = progressMap[m.id] || null;
      return {
        id: m.id,
        program_id: m.program_id,
        title: m.title,
        order: m.module_order,
        duration: m.duration,
        video_url: m.video_url,
        videoUrl: m.video_url,
        youtube_id: m.youtube_id,
        youtubeId: m.youtube_id,
        description: m.description,
        takeaways: m.takeaways,
        resources: m.resources,
        quiz: m.quiz_id
          ? {
              id: m.quiz_id,
              title: m.quiz_title,
              passing_score: m.passing_score,
              passingScore: m.passing_score,
              questions: m.quiz_questions,
            }
          : null,
        progress: {
          video_watched_percent: progress ? progress.video_watched_percent : 0,
          is_video_finished: progress ? progress.is_video_finished : false,
          is_completed: progress ? progress.is_completed : false,
        },
      };
    });

    res.json({
      success: true,
      program: {
        ...program,
        thumbnail: program.thumbnail_url,
        is_enrolled: isEnrolled,
        modules,
      },
    });
  } catch (err) {
    console.error('getProgramById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch program details.', error: err.message });
  }
};

exports.enrollProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    const userId = req.user.id;

    if (!programId) {
      return res.status(400).json({ success: false, message: 'programId is required.' });
    }

    // Check if already enrolled
    const check = await db.query('SELECT * FROM enrollments WHERE user_id = $1 AND program_id = $2', [
      userId,
      programId,
    ]);
    if (check.rows.length > 0) {
      return res.json({ success: true, message: 'Already enrolled in this program.', enrollment: check.rows[0] });
    }

    const enrollmentId = 'enr_' + Date.now();
    const insertQuery = `
      INSERT INTO enrollments (id, user_id, program_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [enrollmentId, userId, programId]);

    // Increment program enrolled_count
    await db.query('UPDATE programs SET enrolled_count = enrolled_count + 1 WHERE id = $1', [programId]);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in program! 🎉',
      enrollment: result.rows[0],
    });
  } catch (err) {
    console.error('enrollProgram error:', err);
    res.status(500).json({ success: false, message: 'Enrollment failed.', error: err.message });
  }
};

exports.getUserEnrolledPrograms = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT p.*, e.enrolled_at, e.is_completed as enrollment_completed,
             (SELECT COUNT(*) FROM modules WHERE program_id = p.id) as total_modules,
             (SELECT COUNT(*) FROM module_progress mp 
              JOIN modules m ON mp.module_id = m.id 
              WHERE mp.user_id = $1 AND m.program_id = p.id AND mp.is_completed = TRUE) as completed_modules
      FROM enrollments e
      JOIN programs p ON e.program_id = p.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `;
    const result = await db.query(query, [userId]);

    const programs = result.rows.map((row) => {
      const total = parseInt(row.total_modules || '0', 10);
      const completed = parseInt(row.completed_modules || '0', 10);
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...row,
        progress: {
          total_modules: total,
          completed_modules: completed,
          percentage,
          is_complete: total > 0 && completed === total,
        },
      };
    });

    res.json({ success: true, count: programs.length, programs });
  } catch (err) {
    console.error('getUserEnrolledPrograms error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled programs.' });
  }
};
