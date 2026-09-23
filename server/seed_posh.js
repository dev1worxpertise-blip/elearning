/**
 * Seed POSH Program into PostgreSQL Database
 */
require('dotenv').config();
const db = require('./src/db');

async function seedPOSH() {
  console.log('Connecting to PostgreSQL database to seed POSH Compliance program...');

  try {
    await db.query('BEGIN');

    // 1. Insert/Update Instructor
    await db.query(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_url, headline, bio)
      VALUES (
        'usr_instructor_4',
        'Advocate Ananya Deshmukh',
        'ananya.deshmukh@worxpertise.com',
        '$2b$10$abcdef1234567890examplehashforsecurity',
        'instructor',
        'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80',
        'Head of Legal & POSH External IC Member',
        'Senior Corporate Legal Counsel and External IC Advisor with 15+ years specializing in POSH Act compliance, workplace ethics, and sensitivity governance.'
      )
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio;
    `);
    console.log('✅ Instructor created/updated: Advocate Ananya Deshmukh');

    // 2. Insert/Update Category
    await db.query(`
      INSERT INTO categories (id, name, slug, description, icon)
      VALUES (
        'cat_compliance',
        'Corporate Compliance',
        'corporate-compliance',
        'Mandatory workplace compliance, statutory governance, POSH Act 2013, and corporate ethics.',
        'shield-check'
      )
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `);
    console.log('✅ Category created/updated: Corporate Compliance');

    // 3. Insert/Update Program
    const skillsJson = JSON.stringify([
      'POSH Act 2013',
      'Workplace Ethics & Sensitivity',
      'Hostile Work Environment Prevention',
      'Bystander Intervention (4Ds)',
      'Internal Committee (IC) Redressal'
    ]);

    await db.query(`
      INSERT INTO programs (
        id, title, slug, tagline, category_id, category_name, level, duration,
        thumbnail_url, rating, enrolled_count, instructor_id, instructor_name,
        instructor_role, instructor_avatar, skills, is_published
      ) VALUES (
        'prog-posh-compliance',
        'POSH: Prevention of Sexual Harassment at Workplace (Corporate Compliance)',
        'posh-workplace-compliance',
        'Official corporate compliance program covering the POSH Act 2013, employee rights, identifying workplace harassment, bystander intervention, and Internal Committee (IC) redressal protocols.',
        'cat_compliance',
        'Corporate Compliance',
        'All Levels',
        '45 Mins',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
        4.95,
        18540,
        'usr_instructor_4',
        'Advocate Ananya Deshmukh',
        'Head of Legal & POSH External IC Member',
        'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80',
        $1::jsonb,
        TRUE
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        tagline = EXCLUDED.tagline,
        duration = EXCLUDED.duration,
        category_id = EXCLUDED.category_id,
        category_name = EXCLUDED.category_name,
        thumbnail_url = EXCLUDED.thumbnail_url,
        skills = EXCLUDED.skills;
    `, [skillsJson]);
    console.log('✅ Program created/updated: POSH Compliance Program');

    // 4. Insert Modules
    const modules = [
      {
        id: 'mod-posh-1',
        title: 'POSH Act 2013 Framework & Defining Workplace Harassment',
        order: 1,
        duration: '14:20',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        youtube_id: 'f9U6m25v_d0',
        description: "An essential introduction to the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. Learn the legal definition of sexual harassment, physical vs. non-physical misconduct, the expanded definition of the 'extended workplace' (including remote work, virtual calls, and official travel), and the difference between Quid Pro Quo and Hostile Work Environment.",
        takeaways: [
          'Understand the statutory definition of sexual harassment under Indian law and corporate standards.',
          "Differentiate between 'Quid Pro Quo' (demanding sexual favors for career advancement) and creating a 'Hostile Work Environment'.",
          "Recognize the 'Extended Workplace' doctrine: home office, virtual platforms (Slack, Teams, Zoom), client sites, and official transport.",
          'Recognize that intent does not justify unwelcome behavior—the impact on the recipient is the legal determinant.'
        ],
        resources: [
          { name: 'POSH Act 2013 Statutory Compliance Handbook.pdf', size: '1.8 MB' },
          { name: 'Identifying Unwelcome Workplace Behavior Guide.pdf', size: '1.1 MB' }
        ]
      },
      {
        id: 'mod-posh-2',
        title: 'Workplace Culture, Professional Boundaries & Bystander Intervention',
        order: 2,
        duration: '15:10',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        youtube_id: '3JZ_D3ELwOQ',
        description: 'Fostering a culture of psychological safety, zero tolerance, and mutual respect. Learn how to maintain clear professional boundaries, avoid conscious and unconscious gender biases, and effectively practice active bystander intervention through the 4Ds (Direct, Distract, Delegate, Delay).',
        takeaways: [
          'Establish respectful, healthy workplace communication across all professional hierarchies.',
          'Master the 4Ds of Bystander Intervention: Direct action, Distraction, Delegating to HR/IC, and Delaying to support the target.',
          'Recognize subtle microaggressions, sexist commentary, and non-verbal misconduct.',
          'Understand employer obligations in conducting regular employee awareness and sensitization workshops.'
        ],
        resources: [
          { name: '4Ds of Bystander Intervention Playbook.pdf', size: '950 KB' },
          { name: 'Professional Boundaries in Remote Work Checklist.pdf', size: '1.3 MB' }
        ]
      },
      {
        id: 'mod-posh-3',
        title: 'Redressal Mechanism: Internal Committee (IC) Mandate, Inquiries & Protection',
        order: 3,
        duration: '16:00',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        youtube_id: 'aqz-KE-bpKQ',
        description: 'An in-depth guide to the complaints and inquiry process. Understand the formation and composition of the Internal Committee (IC), the 90-day filing timeline, conciliation options, the formal inquiry procedure (which follows principles of natural justice and powers of a Civil Court), interim relief, strict confidentiality obligations under Section 16, and zero-tolerance protection against retaliation.',
        takeaways: [
          'Understand the composition of the Internal Committee: Presiding Officer (senior woman), 2+ employee members, and an external independent expert.',
          'Learn the complaint filing timeline (within 3 months of incident, extendable by another 3 months upon justifiable reasons).',
          'Inquiry completion timelines: inquiry must be completed within 90 days, and report submitted within 10 days.',
          'Strict confidentiality is legally enforced under Section 16; leaking names or details incurs statutory penalties.',
          'Whistleblower protection and strong safeguards against victimisation or retaliation for complainants and witnesses.'
        ],
        resources: [
          { name: 'Internal Committee Complaint Filing & Inquiry Protocol.pdf', size: '2.1 MB' },
          { name: 'POSH Section 16 Confidentiality & Anti-Retaliation Policy.pdf', size: '1.4 MB' }
        ]
      }
    ];

    for (const mod of modules) {
      await db.query(`
        INSERT INTO modules (
          id, program_id, title, module_order, duration, video_url, youtube_id, description, takeaways, resources
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          module_order = EXCLUDED.module_order,
          duration = EXCLUDED.duration,
          video_url = EXCLUDED.video_url,
          youtube_id = EXCLUDED.youtube_id,
          description = EXCLUDED.description,
          takeaways = EXCLUDED.takeaways,
          resources = EXCLUDED.resources;
      `, [
        mod.id,
        'prog-posh-compliance',
        mod.title,
        mod.order,
        mod.duration,
        mod.video_url,
        mod.youtube_id,
        mod.description,
        JSON.stringify(mod.takeaways),
        JSON.stringify(mod.resources)
      ]);
      console.log(`✅ Module seeded: ${mod.title}`);
    }

    // 5. Insert Quizzes
    const quizzes = [
      {
        id: 'quiz-posh-1',
        module_id: 'mod-posh-1',
        title: 'POSH Act Fundamentals & Behavioral Awareness Assessment',
        passing_score: 80,
        questions: [
          {
            id: 'q1',
            question: 'Under the POSH Act 2013, which of the following is legally considered part of the "Workplace"?',
            options: [
              'Only the physical office desk or workstation during official hours',
              'Any place visited by the employee arising out of or during the course of employment, including official travel, client dinners, and remote work communication',
              'Only locations where the company executive directors are physically present',
              'Only registered company headquarters and branch offices'
            ],
            correctAnswer: 1,
            explanation: "The Act adopts the 'Extended Workplace' doctrine: any place visited arising out of or in the course of employment, including transportation provided by the employer, corporate offsites, and virtual work platforms, is legally recognized as the workplace."
          },
          {
            id: 'q2',
            question: 'A manager promises a junior employee a high rating and promotion in exchange for romantic favors. What form of sexual harassment does this represent?',
            options: [
              'Friendly informal mentorship',
              'Quid Pro Quo harassment',
              'Hostile Work Environment only',
              'Casual workplace banter'
            ],
            correctAnswer: 1,
            explanation: "'Quid Pro Quo' (Latin for 'this for that') occurs when employment decisions, promotions, appraisal ratings, or career opportunities are explicitly or implicitly conditioned on submitting to unwelcome sexual advances or favors."
          },
          {
            id: 'q3',
            question: 'When evaluating an allegation of sexual harassment under POSH regulations, what is the legal standard regarding "intent vs. impact"?',
            options: [
              'If the sender claimed "it was just a joke" or had good intentions, it cannot be considered harassment',
              'Only physical acts count; verbal remarks are disregarded without written proof',
              'The impact on the aggrieved person is primary; lack of malicious intent does not excuse unwelcome conduct of a sexual nature',
              'Harassment is only established if confirmed by at least three male witnesses'
            ],
            correctAnswer: 2,
            explanation: "Under POSH jurisprudence, the subjective experience and impact on the recipient take precedence over the initiator's claimed intent. Even if someone claims they 'meant it innocently' or as a joke, unwelcome behavior of a sexual nature is still prohibited."
          },
          {
            id: 'q4',
            question: 'Which of the following digital actions in corporate messaging (Slack, MS Teams, Email, WhatsApp) violates POSH?',
            options: [
              'Sharing sprint tickets and meeting reminders during working hours',
              'Sending unsolicited sexually suggestive memes, jokes, or making personal comments about a colleague appearance or body',
              'Tagging a colleague on a GitHub pull request or code review after office hours',
              'Requesting an update on sprint deliverables via corporate email'
            ],
            correctAnswer: 1,
            explanation: 'Sending unsolicited sexual innuendos, suggestive memes, inappropriate comments on physical appearance, or unwelcome romantic advances over digital messaging channels violates POSH and IT conduct guidelines.'
          }
        ]
      },
      {
        id: 'quiz-posh-2',
        module_id: 'mod-posh-2',
        title: 'Workplace Ethics & Bystander Intervention Assessment',
        passing_score: 80,
        questions: [
          {
            id: 'q1',
            question: 'You witness a senior manager repeatedly making uncomfortable personal remarks and inappropriate physical contact with a newly joined team member. What is the most effective immediate bystander intervention using the "Distract" technique?',
            options: [
              'Ignore the situation completely because it is not your direct department',
              'Interrupt the conversation by asking the colleague to join you for an urgent work task or project query, defusing the immediate tension',
              'Film the incident secretly and post it on public social media',
              'Wait three months before mentioning anything to anyone'
            ],
            correctAnswer: 1,
            explanation: "The 'Distract' technique interrupts the inappropriate interaction safely and immediately by changing the topic or giving the targeted individual an easy exit without direct physical confrontation."
          },
          {
            id: 'q2',
            question: 'What does the 4D framework of Bystander Intervention stand for?',
            options: [
              'Deny, Deflect, Dismiss, Disregard',
              'Direct, Distract, Delegate, Delay',
              'Document, Destroy, Disobey, Duplicate',
              'Discuss, Debate, Decide, Demand'
            ],
            correctAnswer: 1,
            explanation: 'The internationally recognized 4Ds framework for workplace bystander intervention includes: Direct (call out behavior directly), Distract (interrupt or redirect), Delegate (involve HR, IC, or senior leadership), and Delay (check in with and support the affected colleague afterwards).'
          },
          {
            id: 'q3',
            question: 'Which of the following represents appropriate professional conduct when organizing team offsites or social celebrations?',
            options: [
              'Pressuring junior team members to drink alcohol or participate in intimate social activities against their wishes',
              'Respecting personal boundaries, providing inclusive non-alcoholic options, ensuring safe transport, and maintaining professional decorum',
              'Insisting on discussing personal dating histories and relationships as a team-building exercise',
              'Permitting inappropriate physical touching under the pretext of festive celebration'
            ],
            correctAnswer: 1,
            explanation: 'Company-sponsored events, dinners, and celebrations require the same professional standards of conduct and mutual respect as the daily workplace.'
          },
          {
            id: 'q4',
            question: 'Why is an employer legally required to periodically organize POSH sensitization workshops for all staff?',
            options: [
              'Purely to increase company training billable hours',
              'It is a statutory mandate under the POSH Act to foster an informed, respectful work culture and prevent misconduct before it occurs',
              'To replace the company external audit committee',
              'Only to comply with annual tax filing requirements'
            ],
            correctAnswer: 1,
            explanation: 'Section 19 of the POSH Act legally obligates employers to organize regular workshops and awareness programs for sensitizing employees with the provisions of the Act and orienting Internal Committee members.'
          }
        ]
      },
      {
        id: 'quiz-posh-3',
        module_id: 'mod-posh-3',
        title: 'Internal Committee (IC) & Redressal Mechanism Assessment',
        passing_score: 80,
        questions: [
          {
            id: 'q1',
            question: 'Under Section 4 of the POSH Act, what is the mandatory composition of an organization Internal Committee (IC)?',
            options: [
              'Any two male executives chosen by the CEO',
              'A Presiding Officer who must be a senior woman employee, at least 2 members committed to women causes, an external member from an NGO/legal association, and at least 50% of total members must be women',
              'Only external corporate lawyers with no internal company representation',
              'All department managers regardless of gender balance'
            ],
            correctAnswer: 1,
            explanation: "The law strictly mandates that the Presiding Officer must be a senior female employee, at least 50% of the committee must be women, and at least one member must be an external independent member from an NGO or familiar with women's rights."
          },
          {
            id: 'q2',
            question: 'What is the standard timeline within which an aggrieved person should submit a written complaint to the Internal Committee?',
            options: [
              'Within 24 hours of the incident only',
              'Within 3 months from the date of the incident (extendable by another 3 months if justifiable reasons prevented earlier filing)',
              'Exactly 1 year after resigning from the company',
              'There is no timeline; inquiries can only begin after police involvement'
            ],
            correctAnswer: 1,
            explanation: 'Under the POSH Act, complaints must be submitted in writing within 3 months of the incident (or the last incident in a series), with the IC possessing authority to extend the period by up to another 3 months if satisfied that circumstances prevented earlier filing.'
          },
          {
            id: 'q3',
            question: 'What does Section 16 of the POSH Act strictly prohibit regarding ongoing or resolved complaints?',
            options: [
              'Disallowing both parties from having legal identity documents',
              'Publishing, communicating, or making known to the public, press, or media the contents of the complaint, the identity and addresses of the complainant, respondent, or witnesses',
              'Preventing the IC from taking written minutes',
              'Prohibiting company staff from working in cross-functional teams'
            ],
            correctAnswer: 1,
            explanation: 'Section 16 imposes strict non-disclosure obligations. Publishing or leaking the names, addresses, complaints, or inquiry details of any party to colleagues, press, or public channels is a punishable statutory offense.'
          },
          {
            id: 'q4',
            question: 'What legal protection is afforded to a complainant or witness against potential retaliation or career disadvantage after filing or testifying in an IC inquiry?',
            options: [
              'No protection; managers may reassign or terminate employees at will',
              'Employers and IC are legally required to ensure zero victimisation; complainants can request interim relief (such as department transfer, paid leave up to 3 months) and any retaliation is treated as severe misconduct',
              'Employees are required to waive all rights to future appraisals',
              'Protection applies only if the employee has completed 10 years of service'
            ],
            correctAnswer: 1,
            explanation: 'Anti-retaliation is a cornerstone of POSH. During the inquiry, the IC can recommend interim relief (including paid leave up to 3 months or transfer), and any retaliatory action against complainants or witnesses is punishable as grave disciplinary misconduct.'
          }
        ]
      }
    ];

    for (const quiz of quizzes) {
      await db.query(`
        INSERT INTO quizzes (id, module_id, title, passing_score, questions)
        VALUES ($1, $2, $3, $4, $5::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          passing_score = EXCLUDED.passing_score,
          questions = EXCLUDED.questions;
      `, [
        quiz.id,
        quiz.module_id,
        quiz.title,
        quiz.passing_score,
        JSON.stringify(quiz.questions)
      ]);
      console.log(`✅ Quiz seeded: ${quiz.title}`);
    }

    await db.query('COMMIT');
    console.log('🎉 POSH Program and all modules & quizzes successfully seeded into PostgreSQL!');
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Failed to seed POSH program:', err);
    process.exit(1);
  }
}

seedPOSH();
