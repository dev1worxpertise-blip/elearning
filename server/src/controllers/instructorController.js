/**
 * Instructor & Course Management Controller
 */
const db = require('../db');

exports.createProgram = async (req, res) => {
  try {
    const { title, tagline, category_name, level = 'All Levels', duration, thumbnail_url, skills = [] } = req.body;
    const instructorId = req.user.id;
    const instructorName = req.user.name;

    if (!title || !category_name || !duration || !thumbnail_url) {
      return res.status(400).json({ success: false, message: 'Title, category, duration, and thumbnail are required.' });
    }

    const programId = 'prog_' + Date.now();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Get or create category
    let catId = 'cat_' + category_name.toLowerCase().replace(/\s+/g, '');
    const catCheck = await db.query('SELECT id FROM categories WHERE name ILIKE $1', [category_name]);
    if (catCheck.rows.length > 0) {
      catId = catCheck.rows[0].id;
    } else {
      await db.query('INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [
        catId,
        category_name,
        category_name.toLowerCase().replace(/\s+/g, '-'),
      ]);
    }

    const query = `
      INSERT INTO programs (
        id, title, slug, tagline, category_id, category_name, level, duration,
        thumbnail_url, instructor_id, instructor_name, instructor_role, instructor_avatar, skills, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE)
      RETURNING *
    `;

    const result = await db.query(query, [
      programId,
      title,
      slug,
      tagline,
      catId,
      category_name,
      level,
      duration,
      thumbnail_url,
      instructorId,
      instructorName,
      'Lead Instructor',
      req.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      JSON.stringify(skills),
    ]);

    res.status(201).json({ success: true, message: 'Program created successfully!', program: result.rows[0] });
  } catch (err) {
    console.error('createProgram error:', err);
    res.status(500).json({ success: false, message: 'Failed to create program.', error: err.message });
  }
};

exports.addModule = async (req, res) => {
  try {
    const { programId } = req.params;
    const { title, duration, video_url, youtube_id, description, takeaways = [], resources = [] } = req.body;

    if (!title || !duration || !video_url || !description) {
      return res.status(400).json({ success: false, message: 'Title, duration, video_url, and description are required.' });
    }

    // Get next order
    const orderRes = await db.query('SELECT COALESCE(MAX(module_order), 0) + 1 as next_order FROM modules WHERE program_id = $1', [programId]);
    const moduleOrder = orderRes.rows[0].next_order;
    const moduleId = 'mod_' + Date.now();

    const query = `
      INSERT INTO modules (
        id, program_id, title, module_order, duration, video_url, youtube_id, description, takeaways, resources
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await db.query(query, [
      moduleId,
      programId,
      title,
      moduleOrder,
      duration,
      video_url,
      youtube_id || null,
      description,
      JSON.stringify(takeaways),
      JSON.stringify(resources),
    ]);

    res.status(201).json({ success: true, message: 'Module added successfully!', module: result.rows[0] });
  } catch (err) {
    console.error('addModule error:', err);
    res.status(500).json({ success: false, message: 'Failed to add module.', error: err.message });
  }
};

exports.createOrUpdateQuiz = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, passing_score = 80, questions = [] } = req.body;

    if (!title || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz title and questions array are required.' });
    }

    const quizId = 'quiz_' + Date.now();
    const query = `
      INSERT INTO quizzes (id, module_id, title, passing_score, questions)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (module_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        passing_score = EXCLUDED.passing_score,
        questions = EXCLUDED.questions,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await db.query(query, [quizId, moduleId, title, passing_score, JSON.stringify(questions)]);
    res.json({ success: true, message: 'Quiz saved successfully!', quiz: result.rows[0] });
  } catch (err) {
    console.error('createOrUpdateQuiz error:', err);
    res.status(500).json({ success: false, message: 'Failed to save quiz.', error: err.message });
  }
};
