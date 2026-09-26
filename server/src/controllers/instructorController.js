/**
 * Instructor & Course Management Controller
 */
const db = require('../db');

exports.createProgram = async (req, res) => {
  try {
    const {
      title,
      tagline,
      category_name,
      level = 'All Levels',
      duration,
      thumbnail_url,
      skills = [],
      instructor_name,
      instructor_role,
      authority_name,
      authority_role,
      authority_title
    } = req.body;

    let instructorId = (req.user && req.user.id) || null;
    const finalInstName = instructor_name || (req.user && req.user.name) || 'Lead Faculty';
    const finalInstRole = instructor_role || 'Lead Faculty & Subject Matter Expert';
    const finalAuthName = authority_name || 'Prof. Arthur Sterling';
    const finalAuthRole = authority_role || 'Dean of Academic Affairs & Governance';
    const finalAuthTitle = authority_title || 'Academic Board';
    const instructorAvatar = (req.user && req.user.avatar_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

    if (instructorId) {
      const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [instructorId]);
      if (userCheck.rows.length === 0) {
        const anyInst = await db.query("SELECT id FROM users WHERE role = 'instructor' LIMIT 1");
        instructorId = anyInst.rows.length > 0 ? anyInst.rows[0].id : null;
      }
    } else {
      const anyInst = await db.query("SELECT id FROM users WHERE role = 'instructor' LIMIT 1");
      instructorId = anyInst.rows.length > 0 ? anyInst.rows[0].id : null;
    }

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
        thumbnail_url, instructor_id, instructor_name, instructor_role, instructor_avatar,
        authority_name, authority_role, authority_title, skills, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE)
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
      finalInstName,
      finalInstRole,
      instructorAvatar,
      finalAuthName,
      finalAuthRole,
      finalAuthTitle,
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

exports.updateProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const {
      title,
      tagline,
      category_name,
      level,
      duration,
      thumbnail_url,
      skills,
      instructor_name,
      instructor_role,
      authority_name,
      authority_role,
      authority_title
    } = req.body;

    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

    let catId = undefined;
    if (category_name) {
      catId = 'cat_' + category_name.toLowerCase().replace(/\s+/g, '');
      await db.query('INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [
        catId, category_name, category_name.toLowerCase().replace(/\s+/g, '-')
      ]);
    }

    const query = `
      UPDATE programs
      SET 
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        tagline = COALESCE($3, tagline),
        category_name = COALESCE($4, category_name),
        category_id = COALESCE($5, category_id),
        level = COALESCE($6, level),
        duration = COALESCE($7, duration),
        thumbnail_url = COALESCE($8, thumbnail_url),
        skills = CASE WHEN $9::jsonb IS NOT NULL THEN $9::jsonb ELSE skills END,
        instructor_name = COALESCE($10, instructor_name),
        instructor_role = COALESCE($11, instructor_role),
        authority_name = COALESCE($12, authority_name),
        authority_role = COALESCE($13, authority_role),
        authority_title = COALESCE($14, authority_title),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `;

    const result = await db.query(query, [
      title || null,
      slug || null,
      tagline || null,
      category_name || null,
      catId || null,
      level || null,
      duration || null,
      thumbnail_url || null,
      skills ? JSON.stringify(skills) : null,
      instructor_name || null,
      instructor_role || null,
      authority_name || null,
      authority_role || null,
      authority_title || null,
      programId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }

    res.json({ success: true, message: 'Program updated successfully!', program: result.rows[0] });
  } catch (err) {
    console.error('updateProgram error:', err);
    res.status(500).json({ success: false, message: 'Failed to update program.', error: err.message });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await db.query('DELETE FROM programs WHERE id = $1 RETURNING id, title', [programId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    res.json({ success: true, message: 'Program deleted successfully!', program: result.rows[0] });
  } catch (err) {
    console.error('deleteProgram error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete program.', error: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, duration, video_url, youtube_id, description, takeaways, resources } = req.body;

    const query = `
      UPDATE modules
      SET 
        title = COALESCE($1, title),
        duration = COALESCE($2, duration),
        video_url = COALESCE($3, video_url),
        youtube_id = COALESCE($4, youtube_id),
        description = COALESCE($5, description),
        takeaways = CASE WHEN $6::jsonb IS NOT NULL THEN $6::jsonb ELSE takeaways END,
        resources = CASE WHEN $7::jsonb IS NOT NULL THEN $7::jsonb ELSE resources END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const result = await db.query(query, [
      title || null,
      duration || null,
      video_url || null,
      youtube_id || null,
      description || null,
      takeaways ? JSON.stringify(takeaways) : null,
      resources ? JSON.stringify(resources) : null,
      moduleId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Module not found.' });
    }

    res.json({ success: true, message: 'Module updated successfully!', module: result.rows[0] });
  } catch (err) {
    console.error('updateModule error:', err);
    res.status(500).json({ success: false, message: 'Failed to update module.', error: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query('DELETE FROM modules WHERE id = $1 RETURNING id, title', [moduleId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Module not found.' });
    }
    res.json({ success: true, message: 'Module deleted successfully!', module: result.rows[0] });
  } catch (err) {
    console.error('deleteModule error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete module.', error: err.message });
  }
};
