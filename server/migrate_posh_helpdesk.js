const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/db');

async function runPoshMigration() {
  try {
    console.log('--- Initializing POSH Act Section 19 Internal Committee Grievance Helpdesk Schema ---');

    await db.query(`
      CREATE TABLE IF NOT EXISTS posh_grievances (
        id VARCHAR(80) PRIMARY KEY,
        case_number VARCHAR(50) UNIQUE NOT NULL,
        tracking_pin VARCHAR(20) NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        user_id VARCHAR(80),
        complainant_name VARCHAR(150),
        complainant_email VARCHAR(150),
        complainant_phone VARCHAR(50),
        complainant_department VARCHAR(100),
        incident_date VARCHAR(50),
        incident_location VARCHAR(100),
        respondent_name VARCHAR(150) NOT NULL,
        respondent_designation VARCHAR(150),
        respondent_department VARCHAR(100),
        category VARCHAR(100) NOT NULL,
        severity VARCHAR(20) DEFAULT 'Medium',
        description TEXT NOT NULL,
        witnesses TEXT,
        evidence_urls JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'Filed',
        presiding_officer_name VARCHAR(150) DEFAULT 'Advocate Ananya Deshmukh (External IC Chair)',
        presiding_officer_notes TEXT,
        action_taken TEXT,
        timeline JSONB DEFAULT '[]'::jsonb,
        is_confidential BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_posh_case_number ON posh_grievances(case_number);
      CREATE INDEX IF NOT EXISTS idx_posh_user_id ON posh_grievances(user_id);
      CREATE INDEX IF NOT EXISTS idx_posh_status ON posh_grievances(status);
    `);

    // Seed realistic baseline demo cases if table is empty
    const checkCount = await db.query('SELECT count(*) as total FROM posh_grievances');
    if (parseInt(checkCount.rows[0].total, 10) === 0) {
      console.log('Seeding initial demonstration cases for POSH Presiding Officer Inbox...');

      const demoCase1 = {
        id: 'case_posh_demo_1001',
        case_number: 'POSH-2026-CASE-1082',
        tracking_pin: '4491',
        is_anonymous: false,
        user_id: 'usr_trainee_sim1',
        complainant_name: 'Priya Sharma',
        complainant_email: 'priya.sharma@enterprise.com',
        complainant_phone: '+91 98765 43210',
        complainant_department: 'Engineering & Product',
        incident_date: 'October 12, 2026',
        incident_location: 'Virtual / Slack & Late Night Google Meet',
        respondent_name: 'Rajesh K. (Team Lead)',
        respondent_designation: 'Senior Technical Lead',
        respondent_department: 'Engineering',
        category: 'Inappropriate Digital Messages / Late-Night Calls',
        severity: 'High',
        description: 'Repeated inappropriate personal remarks on Slack direct messages after 10 PM and unwanted comments regarding appearance during one-on-one sprint check-ins, creating an intimidating work dynamic.',
        witnesses: 'Sprint Slack conversation logs; two colleagues aware of project reassignments.',
        evidence_urls: JSON.stringify([
          { name: 'slack_chat_transcripts_oct12.pdf', size: '420 KB' }
        ]),
        status: 'Under Review',
        presiding_officer_name: 'Advocate Ananya Deshmukh (External IC Chair)',
        presiding_officer_notes: 'Preliminary assessment completed. Prima facie merit established under Section 9. Complainant offered conciliation or formal inquiry as per Section 10 of POSH Act. Complainant opted for formal inquiry. Notice issued to respondent.',
        action_taken: 'Interim transfer of project reporting line approved to prevent hostile reporting relationship pending completion of inquiry.',
        timeline: JSON.stringify([
          {
            step: 'Grievance Lodged',
            date: '2026-10-12T14:30:00Z',
            actor: 'Priya Sharma (Complainant)',
            status: 'Filed',
            note: 'Confidential complaint registered via portal with supporting Slack transcripts.'
          },
          {
            step: 'Preliminary IC Review',
            date: '2026-10-13T10:00:00Z',
            actor: 'Advocate Ananya Deshmukh (Presiding Officer)',
            status: 'Under Review',
            note: 'Committee convened. Complainant informed of statutory rights under Sections 9-11.'
          },
          {
            step: 'Interim Relief Ordered',
            date: '2026-10-14T11:15:00Z',
            actor: 'Internal Committee (IC)',
            status: 'Under Review',
            note: 'Interim order: Reporting line separated to ensure workplace safety.'
          }
        ]),
        created_at: new Date('2026-10-12T14:30:00Z'),
        updated_at: new Date('2026-10-14T11:15:00Z')
      };

      const demoCase2 = {
        id: 'case_posh_demo_1002',
        case_number: 'POSH-2026-CASE-1095',
        tracking_pin: '7723',
        is_anonymous: true,
        user_id: null,
        complainant_name: 'Confidential / Anonymous Whistleblower',
        complainant_email: null,
        complainant_phone: null,
        complainant_department: 'Business Operations (Mumbai Office)',
        incident_date: 'October 15, 2026',
        incident_location: 'Mumbai Regional Office (6th Floor Cafeteria)',
        respondent_name: 'Amitabh S. (Regional Manager)',
        respondent_designation: 'VP of Business Development',
        respondent_department: 'Sales & BD',
        category: 'Verbal Innuendos & Hostile Work Environment',
        severity: 'Medium',
        description: 'During after-work team gathering, sexually colored remarks and disparaging jokes about female team members were made repeatedly. Filing anonymously due to fear of career reprisal.',
        witnesses: 'Multiple team members present in the lounge area.',
        evidence_urls: JSON.stringify([]),
        status: 'Filed',
        presiding_officer_name: 'Advocate Ananya Deshmukh (External IC Chair)',
        presiding_officer_notes: 'Anonymous complaint received under Section 19. Initial verification initiated with local HR business partner to assess cafeteria CCTV logs and schedule gender sensitivity refresher for the Mumbai branch.',
        action_taken: 'Advisory alert dispatched to branch head. Disciplinary inquiry scheduled.',
        timeline: JSON.stringify([
          {
            step: 'Anonymous Grievance Lodged',
            date: '2026-10-15T18:45:00Z',
            actor: 'Anonymous Employee',
            status: 'Filed',
            note: 'Whistleblower grievance submitted securely with secret tracking PIN 7723.'
          }
        ]),
        created_at: new Date('2026-10-15T18:45:00Z'),
        updated_at: new Date('2026-10-15T18:45:00Z')
      };

      const demoCase3 = {
        id: 'case_posh_demo_1003',
        case_number: 'POSH-2026-CASE-0931',
        tracking_pin: '1209',
        is_anonymous: false,
        user_id: 'usr_trainee_sim3',
        complainant_name: 'Ananya Deshmukh',
        complainant_email: 'ananya.d@enterprise.com',
        complainant_phone: '+91 91234 56789',
        complainant_department: 'Quality Assurance',
        incident_date: 'September 05, 2026',
        incident_location: 'Bengaluru Development Center',
        respondent_name: 'Kunal M.',
        respondent_designation: 'Senior QA Architect',
        respondent_department: 'Quality Assurance',
        category: 'Unwanted Physical Contact / Personal Space Violation',
        severity: 'High',
        description: 'Persistent unwanted proximity and touching shoulder without consent during code review sessions despite verbal objection.',
        witnesses: 'QA cubicle colleagues.',
        evidence_urls: JSON.stringify([]),
        status: 'Resolved',
        presiding_officer_name: 'Advocate Ananya Deshmukh (External IC Chair)',
        presiding_officer_notes: 'Inquiry concluded within 90 days as mandated by Section 11(4). IC report established policy violation. Conciliation requested by complainant; formal unconditional written apology tendered by respondent with mandatory 1-on-1 sensitivity counselling and written warning placed on HR dossier.',
        action_taken: 'Written reprimand placed on record; respondent completed mandatory POSH remediation module; seating separated.',
        timeline: JSON.stringify([
          {
            step: 'Grievance Lodged',
            date: '2026-09-05T11:00:00Z',
            actor: 'Complainant',
            status: 'Filed',
            note: 'Grievance lodged.'
          },
          {
            step: 'Inquiry Commenced',
            date: '2026-09-12T15:00:00Z',
            actor: 'Internal Committee',
            status: 'Inquiry Commenced',
            note: 'Both parties examined.'
          },
          {
            step: 'Inquiry Concluded & Resolved',
            date: '2026-09-28T16:30:00Z',
            actor: 'Presiding Officer',
            status: 'Resolved',
            note: 'Final order issued. Written apology and sensitivity training completed. Case closed.'
          }
        ]),
        created_at: new Date('2026-09-05T11:00:00Z'),
        updated_at: new Date('2026-09-28T16:30:00Z'),
        resolved_at: new Date('2026-09-28T16:30:00Z')
      };

      for (const c of [demoCase1, demoCase2, demoCase3]) {
        await db.query(`
          INSERT INTO posh_grievances (
            id, case_number, tracking_pin, is_anonymous, user_id,
            complainant_name, complainant_email, complainant_phone, complainant_department,
            incident_date, incident_location, respondent_name, respondent_designation, respondent_department,
            category, severity, description, witnesses, evidence_urls, status,
            presiding_officer_name, presiding_officer_notes, action_taken, timeline, is_confidential,
            created_at, updated_at, resolved_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
          )
        `, [
          c.id, c.case_number, c.tracking_pin, c.is_anonymous, c.user_id,
          c.complainant_name, c.complainant_email, c.complainant_phone, c.complainant_department,
          c.incident_date, c.incident_location, c.respondent_name, c.respondent_designation, c.respondent_department,
          c.category, c.severity, c.description, c.witnesses, c.evidence_urls, c.status,
          c.presiding_officer_name, c.presiding_officer_notes, c.action_taken, c.timeline, true,
          c.created_at, c.updated_at, c.resolved_at || null
        ]);
      }
      console.log('✅ Initial demo POSH grievances seeded successfully.');
    }

    console.log('✅ POSH Act Grievance Schema Migration Complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ POSH Migration failed:', err);
    process.exit(1);
  }
}

runPoshMigration();
