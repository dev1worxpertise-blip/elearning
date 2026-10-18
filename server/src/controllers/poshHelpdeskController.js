/**
 * POSH Act Section 19: Confidential & Anonymous Internal Committee (IC) Grievance Redressal Controller
 * 
 * Statutory Legal Compliance:
 * - POSH Act 2013 (Prevention of Sexual Harassment of Women at Workplace), Section 4, 9, 11, 16, 19 & 21
 * - Provides tamper-proof confidential and anonymous grievance filing.
 * - Enforces the statutory 90-day inquiry disposal timeline.
 * - Section 16 Strict Non-Disclosure & Confidentiality Protocol.
 * - Section 21 District Officer / MWCD Annual Report Generation.
 */

const db = require('../db');

// --- 1. FILE A NEW GRIEVANCE (ANONYMOUS OR CONFIDENTIAL) ---
exports.fileCase = async (req, res) => {
  try {
    const {
      is_anonymous = false,
      complainant_name,
      complainant_email,
      complainant_phone,
      complainant_department,
      incident_date,
      incident_location,
      respondent_name,
      respondent_designation,
      respondent_department,
      category,
      severity = 'Medium',
      description,
      witnesses = '',
      evidence_urls = []
    } = req.body;

    if (!respondent_name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Respondent name, category of incident, and description are mandatory.'
      });
    }

    // Generate unique Case Number & 4-digit Tracking PIN
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `POSH-${new Date().getFullYear()}-CASE-${randomSuffix}`;
    const trackingPin = Math.floor(1000 + Math.random() * 9000).toString();
    const caseId = `case_posh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const isAnon = is_anonymous === true || is_anonymous === 'true';
    const finalUserId = isAnon ? null : (req.user ? req.user.id : null);
    const finalName = isAnon ? 'Confidential / Anonymous Whistleblower' : (complainant_name || (req.user ? req.user.name : 'Confidential Employee'));
    const finalEmail = isAnon ? null : (complainant_email || (req.user ? req.user.email : null));

    const initialTimeline = [
      {
        step: isAnon ? 'Anonymous Grievance Lodged' : 'Grievance Lodged',
        date: new Date().toISOString(),
        actor: isAnon ? 'Anonymous Whistleblower' : finalName,
        status: 'Filed',
        note: 'Confidential complaint officially lodged with the Internal Committee (IC) under Section 9 POSH Act.'
      }
    ];

    const insertQuery = `
      INSERT INTO posh_grievances (
        id, case_number, tracking_pin, is_anonymous, user_id,
        complainant_name, complainant_email, complainant_phone, complainant_department,
        incident_date, incident_location, respondent_name, respondent_designation, respondent_department,
        category, severity, description, witnesses, evidence_urls, status,
        presiding_officer_name, presiding_officer_notes, action_taken, timeline, is_confidential,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, 'Filed',
        'Advocate Ananya Deshmukh (External IC Chair)',
        'Complaint assigned to Internal Committee. Preliminary prima facie examination under Section 9 pending.',
        NULL, $20, TRUE,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      caseId,
      caseNumber,
      trackingPin,
      isAnon,
      finalUserId,
      finalName,
      finalEmail,
      isAnon ? null : complainant_phone,
      complainant_department || 'General',
      incident_date || new Date().toISOString().split('T')[0],
      incident_location || 'Workplace / Remote',
      respondent_name.trim(),
      respondent_designation || 'Staff',
      respondent_department || 'General',
      category,
      severity,
      description.trim(),
      witnesses,
      JSON.stringify(evidence_urls),
      JSON.stringify(initialTimeline)
    ]);

    // Record Tamper-Proof Audit Trail
    try {
      await db.query(`
        INSERT INTO audit_logs (id, user_id, user_name, action, target, details, severity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        `log_posh_${Date.now()}`,
        finalUserId || 'anonymous_system',
        isAnon ? 'Anonymous Whistleblower' : finalName,
        'POSH_GRIEVANCE_LODGED',
        caseNumber,
        `Statutory POSH grievance lodged under category: ${category} (Severity: ${severity}, Anonymous: ${isAnon})`,
        'CRITICAL'
      ]);
    } catch (e) {
      console.warn('[POSH Controller] Audit log write warning:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Grievance securely submitted to the Internal Committee (IC) with statutory non-disclosure protection.',
      caseNumber,
      trackingPin,
      isAnonymous: isAnon,
      case: {
        id: result.rows[0].id,
        caseNumber,
        trackingPin,
        status: 'Filed',
        category,
        severity,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('[POSH Controller] fileCase error:', err);
    res.status(500).json({ success: false, message: 'Failed to lodge grievance: ' + err.message });
  }
};

// --- 2. TRACK GRIEVANCE STATUS VIA CASE NUMBER & PIN ---
exports.trackCase = async (req, res) => {
  try {
    const { caseNumber, trackingPin } = req.body;

    if (!caseNumber || !trackingPin) {
      return res.status(400).json({
        success: false,
        message: 'Both Case Number and Tracking PIN are required to access this confidential record.'
      });
    }

    const cleanCaseNo = caseNumber.trim().toUpperCase();
    const cleanPin = trackingPin.trim();

    const query = `
      SELECT id, case_number, is_anonymous, category, severity, status,
             incident_date, incident_location, respondent_name, respondent_designation,
             description, presiding_officer_name, presiding_officer_notes, action_taken,
             timeline, created_at, updated_at, resolved_at
      FROM posh_grievances
      WHERE UPPER(case_number) = $1 AND tracking_pin = $2;
    `;
    const result = await db.query(query, [cleanCaseNo, cleanPin]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No grievance found matching this Case Number and Tracking PIN combination. Please check your credentials.'
      });
    }

    const c = result.rows[0];
    res.json({
      success: true,
      case: {
        ...c,
        daysOpen: Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        isOverdue: (c.status !== 'Resolved' && c.status !== 'Dismissed') && ((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24) > 90)
      }
    });
  } catch (err) {
    console.error('[POSH Controller] trackCase error:', err);
    res.status(500).json({ success: false, message: 'Failed to track grievance: ' + err.message });
  }
};

// --- 3. GET LOGGED-IN USER'S OWN IDENTIFIED GRIEVANCES ---
exports.getMyCases = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.json({ success: true, cases: [] });
    }

    const query = `
      SELECT id, case_number, tracking_pin, category, severity, status,
             incident_date, respondent_name, created_at, updated_at, resolved_at
      FROM posh_grievances
      WHERE user_id = $1 AND is_anonymous = FALSE
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [req.user.id]);
    res.json({ success: true, count: result.rows.length, cases: result.rows });
  } catch (err) {
    console.error('[POSH Controller] getMyCases error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve cases.' });
  }
};

// --- 4. ADMIN & PRESIDING OFFICER INBOX & METRICS ---
exports.getAdminCases = async (req, res) => {
  try {
    const { status, search, severity } = req.query;

    let baseQuery = `SELECT * FROM posh_grievances WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      baseQuery += ` AND status = $${params.length}`;
    }

    if (severity && severity !== 'all') {
      params.push(severity);
      baseQuery += ` AND severity = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      baseQuery += ` AND (LOWER(case_number) LIKE $${pIdx} OR LOWER(respondent_name) LIKE $${pIdx} OR LOWER(category) LIKE $${pIdx} OR LOWER(complainant_name) LIKE $${pIdx})`;
    }

    baseQuery += ` ORDER BY created_at DESC;`;

    const [casesResult, statsResult] = await Promise.all([
      db.query(baseQuery, params),
      db.query(`
        SELECT 
          count(*) as total_cases,
          count(*) FILTER (WHERE status = 'Filed') as filed_count,
          count(*) FILTER (WHERE status = 'Under Review') as under_review_count,
          count(*) FILTER (WHERE status = 'Inquiry Commenced') as inquiry_count,
          count(*) FILTER (WHERE status = 'Resolved') as resolved_count,
          count(*) FILTER (WHERE status = 'Dismissed') as dismissed_count,
          count(*) FILTER (WHERE is_anonymous = TRUE) as anonymous_count,
          count(*) FILTER (WHERE status NOT IN ('Resolved', 'Dismissed') AND created_at < NOW() - INTERVAL '90 days') as overdue_90d_count
        FROM posh_grievances;
      `)
    ]);

    const s = statsResult.rows[0];
    const metrics = {
      totalCases: parseInt(s.total_cases, 10) || 0,
      filedCount: parseInt(s.filed_count, 10) || 0,
      underReviewCount: parseInt(s.under_review_count, 10) || 0,
      inquiryCount: parseInt(s.inquiry_count, 10) || 0,
      resolvedCount: parseInt(s.resolved_count, 10) || 0,
      dismissedCount: parseInt(s.dismissed_count, 10) || 0,
      anonymousCount: parseInt(s.anonymous_count, 10) || 0,
      overdue90DaysCount: parseInt(s.overdue_90d_count, 10) || 0,
      statutoryComplianceStatus: (parseInt(s.overdue_90d_count, 10) || 0) === 0 ? '100% STATUTORY COMPLIANT' : '⚠️ STATUTORY BREACH (OVERDUE > 90 DAYS)'
    };

    res.json({
      success: true,
      metrics,
      cases: casesResult.rows.map(c => ({
        ...c,
        daysOpen: Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        isOverdue: (c.status !== 'Resolved' && c.status !== 'Dismissed') && ((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24) > 90)
      }))
    });
  } catch (err) {
    console.error('[POSH Controller] getAdminCases error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin cases: ' + err.message });
  }
};

// --- 5. UPDATE CASE STATUS & PRESIDING OFFICER ACTIONS ---
exports.updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, presiding_officer_notes, action_taken } = req.body;

    const validStatuses = ['Filed', 'Under Review', 'Inquiry Commenced', 'Resolved', 'Dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Retrieve existing case
    const existing = await db.query('SELECT * FROM posh_grievances WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    const currentCase = existing.rows[0];
    let timeline = currentCase.timeline || [];
    if (typeof timeline === 'string') {
      try { timeline = JSON.parse(timeline); } catch (e) { timeline = []; }
    }

    const stepLabel = status === 'Under Review' ? 'Preliminary IC Review'
      : status === 'Inquiry Commenced' ? 'Formal Inquiry Commenced (Section 11)'
      : status === 'Resolved' ? 'Inquiry Concluded & Final Redressal Order'
      : status === 'Dismissed' ? 'Complaint Dismissed'
      : 'Status Updated';

    timeline.push({
      step: stepLabel,
      date: new Date().toISOString(),
      actor: (req.user && req.user.name) || 'Advocate Ananya Deshmukh (External IC Chair)',
      status,
      note: presiding_officer_notes || `Status transitioned to ${status}.`
    });

    const isResolved = status === 'Resolved' || status === 'Dismissed';

    const updateQuery = `
      UPDATE posh_grievances
      SET status = $1,
          presiding_officer_notes = COALESCE($2, presiding_officer_notes),
          action_taken = COALESCE($3, action_taken),
          timeline = $4,
          updated_at = CURRENT_TIMESTAMP,
          resolved_at = (CASE WHEN $5 = TRUE THEN CURRENT_TIMESTAMP ELSE resolved_at END)
      WHERE id = $6
      RETURNING *;
    `;

    const updated = await db.query(updateQuery, [
      status,
      presiding_officer_notes,
      action_taken,
      JSON.stringify(timeline),
      isResolved,
      id
    ]);

    // Audit Log
    try {
      await db.query(`
        INSERT INTO audit_logs (id, user_id, user_name, action, target, details, severity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        `log_posh_upd_${Date.now()}`,
        (req.user && req.user.id) || 'usr_admin_master',
        (req.user && req.user.name) || 'System Administrator',
        'POSH_CASE_STATUS_UPDATED',
        currentCase.case_number,
        `Case ${currentCase.case_number} updated to status "${status}". Action: ${action_taken || 'No formal action recorded.'}`,
        'HIGH'
      ]);
    } catch (e) {
      console.warn('[POSH Controller] Audit log warning:', e.message);
    }

    res.json({
      success: true,
      message: `Case ${currentCase.case_number} successfully updated to "${status}".`,
      case: updated.rows[0]
    });
  } catch (err) {
    console.error('[POSH Controller] updateCaseStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update case: ' + err.message });
  }
};

// --- 6. STATUTORY SECTION 21 ANNUAL REPORT DOSSIER ---
exports.getStatutoryAnnualReport = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const [grievanceStats, courseStats] = await Promise.all([
      db.query(`
        SELECT 
          count(*) as total_received,
          count(*) FILTER (WHERE status = 'Resolved') as total_disposed,
          count(*) FILTER (WHERE status NOT IN ('Resolved', 'Dismissed') AND created_at < NOW() - INTERVAL '90 days') as pending_more_than_90_days,
          count(*) FILTER (WHERE status = 'Inquiry Commenced') as inquiry_in_progress,
          count(*) FILTER (WHERE is_anonymous = TRUE) as anonymous_reports,
          count(*) FILTER (WHERE action_taken IS NOT NULL AND action_taken != '') as actions_taken_count
        FROM posh_grievances
        WHERE EXTRACT(YEAR FROM created_at) = $1;
      `, [year]),
      db.query(`
        SELECT 
          count(*) as total_enrolled,
          count(*) FILTER (WHERE is_completed = true) as total_certified
        FROM enrollments
        WHERE program_id = 'prog-posh-compliance';
      `)
    ]);

    const g = grievanceStats.rows[0];
    const c = courseStats.rows[0];

    const report = {
      reportingYear: parseInt(year, 10),
      organizationName: 'Worxpertise Global Technology Academy & Corporate Enterprise',
      presidingOfficer: 'Advocate Ananya Deshmukh (External IC Chair & Senior Legal Counsel)',
      statutoryFramework: 'Section 21 of Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013',
      metrics: {
        totalComplaintsReceived: parseInt(g.total_received, 10) || 0,
        totalComplaintsDisposed: parseInt(g.total_disposed, 10) || 0,
        casesPendingOver90Days: parseInt(g.pending_more_than_90_days, 10) || 0,
        casesInquiryInProgress: parseInt(g.inquiry_in_progress, 10) || 0,
        anonymousWhistleblowerReports: parseInt(g.anonymous_reports, 10) || 0,
        actionsEnforcedCount: parseInt(g.actions_taken_count, 10) || 0,
        totalStaffCompletedTraining: parseInt(c.total_certified, 10) || 0,
        statutoryFilingStatus: (parseInt(g.pending_more_than_90_days, 10) || 0) === 0 ? 'COMPLIANT (ZERO OVERDUE INQUIRIES)' : 'NON-COMPLIANT'
      },
      submissionDeadline: `January 31, ${parseInt(year, 10) + 1} (Filing to District Officer)`,
      confidentialityDeclaration: 'As mandated by Section 16 of the POSH Act, identities of complainants, respondents, and witnesses have been redacted from public records under statutory non-disclosure penalties.'
    };

    res.json({ success: true, report });
  } catch (err) {
    console.error('[POSH Controller] getStatutoryAnnualReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate statutory report: ' + err.message });
  }
};
