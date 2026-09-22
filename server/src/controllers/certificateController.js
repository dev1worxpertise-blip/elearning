/**
 * Certificates Controller
 */
const db = require('../db');

exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT c.*, p.thumbnail_url as program_thumbnail
      FROM certificates c
      JOIN programs p ON c.program_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    res.json({ success: true, count: result.rows.length, certificates: result.rows });
  } catch (err) {
    console.error('getUserCertificates error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const query = `
      SELECT c.credential_id, c.student_name, c.program_title, c.issue_date,
             c.instructor_name, c.instructor_role, c.grade, c.verification_code,
             p.thumbnail_url, p.skills
      FROM certificates c
      JOIN programs p ON c.program_id = p.id
      WHERE c.credential_id = $1
    `;
    const result = await db.query(query, [credentialId.trim().toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No official credential found matching this ID.',
      });
    }

    res.json({
      success: true,
      valid: true,
      certificate: result.rows[0],
    });
  } catch (err) {
    console.error('verifyCertificate error:', err);
    res.status(500).json({ success: false, message: 'Verification lookup failed.' });
  }
};
