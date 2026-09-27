/**
 * Seed New Courses into PostgreSQL:
 * 1. GDPR & Data Privacy Compliance
 * 2. Corporate Ethics, Anti-Bribery & Code of Conduct
 * 3. Workplace Health, Safety & OSHA Standards (EHS Compliance)
 * 4. Generative AI & Prompt Engineering for Enterprise Productivity
 */
require('dotenv').config();
const db = require('./src/db');

async function seedNewCourses() {
  console.log('🚀 Seeding 4 New Courses into PostgreSQL...');

  try {
    await db.query('BEGIN');

    // 1. Ensure Instructors exist
    const instructors = [
      {
        id: 'usr_instructor_5',
        name: 'Elena Rostova',
        email: 'elena.rostova@learnpulse.dev',
        role: 'instructor',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
        headline: 'Lead Data Protection Officer & Privacy Counsel',
        bio: 'Certified Information Privacy Professional (CIPP/E, CIPM) with 14+ years guiding Fortune 500 enterprise organizations through GDPR, CCPA, and statutory privacy governance.'
      },
      {
        id: 'usr_instructor_3',
        name: 'Marcus Vance',
        email: 'marcus.vance@learnpulse.dev',
        role: 'instructor',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        headline: 'Chief Compliance & Ethics Officer',
        bio: 'Former Federal Compliance Advisor and Corporate Governance Director with 18+ years designing ethical codes of conduct, whistleblower hotlines, and anti-corruption systems.'
      },
      {
        id: 'usr_instructor_6',
        name: 'Captain David Martinez',
        email: 'david.martinez@learnpulse.dev',
        role: 'instructor',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        headline: 'Head of Environmental Health & Safety (EHS)',
        bio: 'Certified Safety Professional (CSP) and former Industrial Safety Inspector with 20+ years leading workplace accident prevention, OSHA audit readiness, and crisis evacuation systems.'
      },
      {
        id: 'usr_instructor_7',
        name: 'Dr. Rajesh Shenoy',
        email: 'rajesh.shenoy@learnpulse.dev',
        role: 'instructor',
        avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        headline: 'Chief AI Scientist & GenAI Strategist',
        bio: 'Pioneering GenAI practitioner and author with 15+ years in NLP, Transformer models, and helping enterprise teams deploy secure LLM workflows and autonomous agents.'
      }
    ];

    for (const inst of instructors) {
      await db.query(`
        INSERT INTO users (id, name, email, password_hash, role, avatar_url, headline, bio)
        VALUES ($1, $2, $3, '$2b$10$abcdef1234567890examplehashforsecurity', $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          avatar_url = EXCLUDED.avatar_url,
          headline = EXCLUDED.headline,
          bio = EXCLUDED.bio;
      `, [inst.id, inst.name, inst.email, inst.role, inst.avatar_url, inst.headline, inst.bio]);
    }
    console.log('✅ Seeded 4 Instructors.');

    // 2. Define Programs
    const programs = [
      {
        id: 'prog-gdpr-compliance',
        title: 'GDPR & Global Data Privacy Compliance (EU GDPR & Digital Data Protection)',
        slug: 'gdpr-data-privacy-compliance',
        tagline: 'Comprehensive corporate governance covering GDPR principles, lawful basis of processing, Data Subject Rights (DSR), privacy impact assessments (DPIA), and mandatory 72-hour breach reporting.',
        category_id: 'cat_compliance',
        category_name: 'Corporate Compliance & Data Privacy',
        level: 'All Levels',
        duration: '50 Mins',
        thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        rating: 4.94,
        enrolled_count: 16420,
        instructor_id: 'usr_instructor_5',
        instructor_name: 'Elena Rostova',
        instructor_role: 'Lead Data Protection Officer & Privacy Counsel',
        instructor_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
        authority_name: 'David K. Vance',
        authority_role: 'Chief Information Security Officer & Governance Board',
        authority_title: 'Presiding Privacy Authority',
        skills: ['GDPR Statutory Framework', 'Lawful Basis of Processing', 'Data Subject Access Requests (DSAR)', 'Privacy by Design & DPIA', '72-Hour Breach Notification', 'Cross-Border Transfer Mechanisms'],
        passing_score: 80,
        modules: [
          {
            id: 'mod-gdpr-1',
            title: 'GDPR Core Principles, Scopes & Lawful Basis of Processing',
            order: 1,
            duration: '15:20',
            video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
            youtube_id: 'inWWhr5tnEA',
            description: "Master the territorial and material scope of GDPR, distinguishing between Data Controllers and Data Processors. Explore the 7 core data protection principles: Lawfulness, Fairness & Transparency, Purpose Limitation, Data Minimisation, Accuracy, Storage Limitation, Integrity & Confidentiality, and Accountability. Understand the 6 lawful bases for processing personal data under Article 6.",
            takeaways: [
              "Understand the extraterritorial reach of GDPR: applies to any entity processing EU residents' data regardless of physical server location.",
              "Differentiate between the legal obligations of Data Controllers (determining purpose/means) and Data Processors (acting on controller instructions).",
              "Master the 6 Lawful Bases of Processing under Article 6: Consent, Contractual Necessity, Legal Obligation, Vital Interests, Public Task, and Legitimate Interests.",
              "Comply with Data Minimisation and Storage Limitation principles: retain only necessary personal data and purge when processing purpose expires."
            ],
            resources: [
              { name: 'GDPR Statutory Principles & Compliance Handbook.pdf', size: '2.4 MB' },
              { name: 'Lawful Basis Assessment & Checklist.pdf', size: '1.2 MB' }
            ],
            quiz: {
              id: 'quiz-gdpr-1',
              title: 'GDPR Principles & Lawful Processing Assessment',
              passing_score: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'Under GDPR, which entity is primarily responsible for determining the purposes and means of processing personal data?',
                  options: [
                    'The Data Processor',
                    'The Data Controller',
                    'The Third-Party Cloud Hosting Vendor',
                    'The External IT Auditor'
                  ],
                  correctAnswer: 1,
                  explanation: 'Under Article 4(7) of the GDPR, the Data Controller is the legal entity that determines the purposes and means of the processing of personal data.'
                },
                {
                  id: 'q2',
                  question: 'Which of the following is NOT one of the 6 recognized lawful bases for processing personal data under GDPR Article 6?',
                  options: [
                    'Consent of the Data Subject',
                    'Performance of a Contract',
                    'Maximizing Corporate Marketing Profitability',
                    'Compliance with a Legal Obligation'
                  ],
                  correctAnswer: 2,
                  explanation: "The 6 lawful bases are Consent, Contract, Legal Obligation, Vital Interests, Public Task, and Legitimate Interests. Corporate profitability alone is never a recognized lawful basis."
                },
                {
                  id: 'q3',
                  question: 'A company collects employee biometric data and home addresses for a one-time team picnic and stores it permanently. Which core GDPR principle is violated?',
                  options: [
                    'Principle of Right to Roam',
                    'Storage Limitation & Data Minimisation',
                    'Freedom of Processing Doctrine',
                    'Commercial Secrecy Mandate'
                  ],
                  correctAnswer: 1,
                  explanation: "GDPR requires Data Minimisation (only collect what is adequate and relevant) and Storage Limitation (do not hold data in identifiable form longer than necessary for the stated purpose)."
                },
                {
                  id: 'q4',
                  question: 'What is the maximum administrative monetary fine that supervisory authorities can impose for severe GDPR violations?',
                  options: [
                    'Up to €50,000 flat penalty',
                    'Up to €20 Million or 4% of total worldwide annual turnover of the preceding financial year, whichever is higher',
                    'Up to €1 Million or 1% of domestic profit',
                    'Only a formal written reprimand without financial fines'
                  ],
                  correctAnswer: 1,
                  explanation: 'Under GDPR Article 83(5), the most serious infringements can incur administrative fines up to €20,000,000 or 4% of total global annual turnover, whichever is greater.'
                }
              ]
            }
          },
          {
            id: 'mod-gdpr-2',
            title: 'Data Subject Rights (DSR), DPIA & 72-Hour Breach Notification',
            order: 2,
            duration: '17:40',
            video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
            youtube_id: '3JZ_D3ELwOQ',
            description: "Comprehensive guide to handling Data Subject Rights (DSR) including the Right to Access, Rectification, Erasure ('Right to be Forgotten'), and Data Portability within the mandatory 30-day response window. Learn when to conduct a Data Protection Impact Assessment (DPIA) and the strict 72-hour notification protocol to Supervisory Authorities during a data breach.",
            takeaways: [
              "Fulfill Data Subject Access Requests (DSARs) within 30 calendar days without charging an unreasonable fee.",
              "Implement the Right to Erasure ('Right to be Forgotten') while balancing statutory tax and regulatory retention requirements.",
              "Trigger mandatory 72-hour breach reporting to the lead Supervisory Authority (DPA) when personal data is compromised.",
              "Execute a Data Protection Impact Assessment (DPIA) prior to deploying high-risk technologies, automated profiling, or large-scale processing."
            ],
            resources: [
              { name: '72-Hour Data Breach Response Protocol.pdf', size: '1.6 MB' },
              { name: 'Data Subject Access Request (DSAR) SOP.pdf', size: '1.1 MB' }
            ],
            quiz: {
              id: 'quiz-gdpr-2',
              title: 'Data Subject Rights & Incident Response Assessment',
              passing_score: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'In the event of a personal data breach posing a risk to the rights and freedoms of individuals, within what timeframe must the Controller notify the supervisory authority?',
                  options: [
                    'Within 30 calendar days',
                    'Within 72 hours of becoming aware of the breach',
                    'Within 6 months after completing an internal audit',
                    'Only at the end of the fiscal year'
                  ],
                  correctAnswer: 1,
                  explanation: 'Under Article 33 of GDPR, the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the competent supervisory authority.'
                },
                {
                  id: 'q2',
                  question: 'How long does an organization generally have to respond to a Data Subject Access Request (DSAR) under GDPR?',
                  options: [
                    '24 hours',
                    '1 calendar month (extendable by 2 further months for complex requests)',
                    '90 working days',
                    'Indefinite time based on server queue'
                  ],
                  correctAnswer: 1,
                  explanation: 'Article 12(3) mandates that information must be provided without undue delay and at the latest within one month of receipt of the request.'
                },
                {
                  id: 'q3',
                  question: 'When is a formal Data Protection Impact Assessment (DPIA) legally mandatory under GDPR Article 35?',
                  options: [
                    'Whenever updating the company homepage logo',
                    'When processing is likely to result in a high risk to the rights and freedoms of natural persons (e.g. systematic profiling, large-scale sensitive data, automated decision-making)',
                    'Only when requested by a court subpoena',
                    'Only for non-profit organizations'
                  ],
                  correctAnswer: 1,
                  explanation: 'A DPIA is mandatory prior to processing where new technologies or large-scale automated profiling/sensitive data processing is likely to result in a high risk to individual privacy.'
                },
                {
                  id: 'q4',
                  question: 'An individual exercises their Right to Erasure ("Right to be Forgotten"). Under what circumstances can the company legitimately refuse the request?',
                  options: [
                    'If the marketing team wants to keep the email list for future sales',
                    'If retention is necessary for compliance with a statutory legal obligation or establishing/exercising legal defense',
                    'If deleting data requires running a database script',
                    'Companies can never refuse a deletion request under any circumstance'
                  ],
                  correctAnswer: 1,
                  explanation: 'Article 17(3) explicitly exempts erasure where processing is necessary for compliance with a legal obligation (e.g. statutory tax records) or for the establishment, exercise or defense of legal claims.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'prog-corporate-ethics',
        title: 'Corporate Ethics, Anti-Bribery & Code of Conduct',
        slug: 'corporate-ethics-code-of-conduct',
        tagline: 'Uphold institutional integrity with training on ethical decision-making frameworks, Anti-Bribery & Corruption (FCPA & UK Bribery Act), Gifts & Hospitality limits, Conflict of Interest disclosure, and Whistleblower protections.',
        category_id: 'cat_compliance',
        category_name: 'Corporate Compliance & Ethics',
        level: 'All Levels',
        duration: '45 Mins',
        thumbnail_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
        rating: 4.96,
        enrolled_count: 19200,
        instructor_id: 'usr_instructor_3',
        instructor_name: 'Marcus Vance',
        instructor_role: 'Chief Compliance & Ethics Officer',
        instructor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        authority_name: 'Hon. Justice Evelyn Reed',
        authority_role: 'Chair of Ethics & Integrity Board',
        authority_title: 'Ethics Oversight Director',
        skills: ['Code of Conduct Compliance', 'Anti-Bribery & Corruption (ABC)', 'Conflict of Interest Disclosure', 'Gifts & Hospitality Policy', 'Whistleblower Protection & Non-Retaliation', 'Ethical Decision Frameworks'],
        passing_score: 85,
        modules: [
          {
            id: 'mod-ethics-1',
            title: 'Ethical Foundations, Conflicts of Interest & Integrity in Business',
            order: 1,
            duration: '14:30',
            video_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
            youtube_id: 'BOZsYXZRP-s',
            description: 'Explore core organizational values, ethical decision-making frameworks, and identifying actual, potential, or perceived conflicts of interest. Learn the mandatory duty to disclose outside business interests, familial affiliations in procurement, and financial investments in competitors or vendors.',
            takeaways: [
              "Apply the 'Front Page / Headline Test' and structured ethical frameworks when navigating difficult business decisions.",
              'Identify and immediately disclose actual, potential, and perceived Conflicts of Interest (COI) in writing.',
              'Understand strict policies regarding secondary employment, outside business ventures, and procurement vendor relationships.',
              'Safeguard corporate assets, intellectual property, and proprietary information from unauthorized personal gain.'
            ],
            resources: [
              { name: 'Corporate Code of Conduct & Ethical Guidelines.pdf', size: '2.1 MB' },
              { name: 'Conflict of Interest Disclosure Form & Policy.pdf', size: '850 KB' }
            ],
            quiz: {
              id: 'quiz-ethics-1',
              title: 'Ethics Foundations & Conflict of Interest Assessment',
              passing_score: 85,
              questions: [
                {
                  id: 'q1',
                  question: 'An engineering lead is evaluating vendors for an IT software contract and discovers their sibling is a 40% shareholder in one of the bidding companies. What is the mandatory ethical course of action?',
                  options: [
                    'Award the contract to the sibling if they offer a slight discount',
                    'Immediately disclose the relationship in writing to Compliance/HR and fully recuse oneself from the evaluation and decision process',
                    'Keep quiet as long as the evaluation scoring sheet appears objective',
                    'Ask the sibling to transfer their shares temporarily to a friend'
                  ],
                  correctAnswer: 1,
                  explanation: 'Whenever a personal, financial, or familial relationship intersects with corporate purchasing or decisions, immediate written disclosure and complete recusal from the decision process are mandatory.'
                },
                {
                  id: 'q2',
                  question: 'What is a "Perceived Conflict of Interest"?',
                  options: [
                    'A situation where no actual wrongdoing exists, but a reasonable outside observer could conclude your impartiality is compromised',
                    'A conflict that only exists in the metaverse or on social media',
                    'A minor disagreement between team members over sprint story points',
                    'A conflict that has already resulted in criminal charges'
                  ],
                  correctAnswer: 0,
                  explanation: 'A perceived conflict exists when circumstances could lead an objective third party to reasonably question whether your business judgement is influenced by personal interests, even if you remain unbiased.'
                },
                {
                  id: 'q3',
                  question: 'Which of the following is considered an improper use of corporate assets?',
                  options: [
                    'Using the corporate laptop to perform your daily job duties',
                    'Using proprietary internal company datasets and codebase to build a competing personal side SaaS application',
                    'Reading company training materials during business hours',
                    'Participating in an employer-sponsored hackathon'
                  ],
                  correctAnswer: 1,
                  explanation: 'Utilizing company intellectual property, confidential data, or proprietary technology to develop personal commercial ventures violates duty of loyalty and corporate property codes.'
                },
                {
                  id: 'q4',
                  question: 'What is the "Headline / Newspaper Test" in ethical decision-making?',
                  options: [
                    'Checking whether a news article mentions your company stock price',
                    'Asking yourself: "Would I feel comfortable if my decision and emails were printed on the front page of a national newspaper for my family, peers, and clients to read?"',
                    'Subscribing to professional journalism feeds',
                    'Issuing a press release for every customer refund'
                  ],
                  correctAnswer: 1,
                  explanation: 'The Headline Test is a practical ethics heuristic: if you would be embarrassed or unable to justify your action if exposed publicly in the press, the action is likely ethically compromised.'
                }
              ]
            }
          },
          {
            id: 'mod-ethics-2',
            title: 'Anti-Bribery & Corruption, Gifts Policy & Whistleblower Protection',
            order: 2,
            duration: '16:15',
            video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            youtube_id: 'aqz-KE-bpKQ',
            description: 'Master international anti-corruption standards under the US FCPA, UK Bribery Act, and local laws. Define clear boundaries for corporate gifts, entertainment, and hospitality. Understand confidential reporting channels and strict zero-tolerance protections against retaliation for whistleblowers.',
            takeaways: [
              "Recognize that 'facilitation payments' (grease payments) are illegal bribes under international anti-corruption statutes.",
              'Comply with the Gifts, Entertainment & Hospitality thresholds: gifts must be modest, transparent, and never intended to induce business favors.',
              'Utilize confidential and anonymous reporting channels: dedicated ethics hotlines, ombudsman, and compliance officers.',
              'Enforce strict zero-tolerance policies protecting whistleblowers from dismissal, harassment, or adverse employment actions.'
            ],
            resources: [
              { name: 'Anti-Bribery & Corruption (ABC) Compliance Manual.pdf', size: '1.9 MB' },
              { name: 'Whistleblower Protection & Non-Retaliation Policy.pdf', size: '1.0 MB' }
            ],
            quiz: {
              id: 'quiz-ethics-2',
              title: 'Anti-Corruption & Whistleblower Policy Assessment',
              passing_score: 85,
              questions: [
                {
                  id: 'q1',
                  question: 'A government customs official asks for a $200 cash payment to "expedite routine clearance" of critical company server hardware. Under international Anti-Bribery standards (FCPA, UKBA), how is this payment classified?',
                  options: [
                    'An acceptable professional consulting tip',
                    'An illegal facilitation / grease payment prohibited by corporate anti-bribery policies',
                    'A standard shipping convenience charge',
                    'A deductible vendor discount'
                  ],
                  correctAnswer: 1,
                  explanation: 'Facilitation payments paid to government officials to expedite routine governmental procedures are strictly prohibited under the UK Bribery Act, corporate anti-corruption policies, and modern international compliance frameworks.'
                },
                {
                  id: 'q2',
                  question: 'During an active multi-million dollar vendor tender, a bidding supplier offers an employee all-expenses-paid luxury VIP resort vacation tickets. How should the employee handle this?',
                  options: [
                    'Accept the tickets since it occurred outside the office',
                    'Immediately decline the gift, report the offer to the Compliance Officer, and log it in the Corporate Gift Register',
                    'Accept the tickets and split them with other team members to be fair',
                    'Keep the tickets confidential and vote for the vendor in the tender'
                  ],
                  correctAnswer: 1,
                  explanation: 'Accepting lavish gifts or luxury hospitality, especially during an active tender or procurement cycle, creates severe conflict of interest and constitutes bribery. It must be declined and reported.'
                },
                {
                  id: 'q3',
                  question: 'An employee reports financial accounting irregularities through the company whistleblower hotline in good faith. Two weeks later, their manager reduces their salary and demotes them. What does this constitute?',
                  options: [
                    'Normal performance management',
                    'Illegal whistleblower retaliation in direct violation of company policy and whistleblower protection laws',
                    'Standard administrative restructuring',
                    'Appropriate disciplinary action for speaking up'
                  ],
                  correctAnswer: 1,
                  explanation: 'Adverse employment actions taken against an employee who reports concerns in good faith constitute illegal retaliation. Companies enforce strict zero-tolerance policies against retaliation.'
                },
                {
                  id: 'q4',
                  question: 'What is the primary purpose of an anonymous corporate Whistleblower Hotline?',
                  options: [
                    'To gossip about colleagues without getting caught',
                    'To provide a secure, confidential, and protected channel for reporting suspected legal, regulatory, safety, or ethical misconduct without fear of retaliation',
                    'To replace the annual performance appraisal system',
                    'To post anonymous social media reviews'
                  ],
                  correctAnswer: 1,
                  explanation: 'Whistleblower hotlines ensure employees and stakeholders can safely disclose suspected fraud, safety violations, harassment, or illegal conduct confidentially and with anti-retaliation guarantees.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'prog-workplace-safety',
        title: 'Workplace Health, Safety & OSHA Standards (EHS Compliance)',
        slug: 'workplace-health-safety-ehs',
        tagline: 'Protect yourself and your colleagues with certified Occupational Health & Safety training: Hazard Identification (HAZMAT), Fire Safety & Extinguishers, Office Ergonomics, Evacuation Protocols, and OSHA Incident Reporting.',
        category_id: 'cat_compliance',
        category_name: 'Corporate Compliance & Workplace Safety',
        level: 'All Levels',
        duration: '40 Mins',
        thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        rating: 4.91,
        enrolled_count: 17800,
        instructor_id: 'usr_instructor_6',
        instructor_name: 'Captain David Martinez',
        instructor_role: 'Head of Environmental Health & Safety (EHS)',
        instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        authority_name: 'Robert Langdon',
        authority_role: 'Executive VP of Facilities & Operations',
        authority_title: 'EHS Board Director',
        skills: ['OSHA Compliance Standards', 'Workplace Hazard Identification', 'Ergonomics & Repetitive Strain Prevention', 'Fire Safety & Extinguisher Operations (PASS)', 'Emergency Evacuation & Crisis Assembly', 'Incident & Near-Miss Investigation'],
        passing_score: 80,
        modules: [
          {
            id: 'mod-safety-1',
            title: 'Hazard Identification, Electrical Safety & Office Ergonomics',
            order: 1,
            duration: '13:40',
            video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
            youtube_id: '2xxziIWmaSA',
            description: 'Learn the Hierarchy of Hazard Controls (Elimination, Substitution, Engineering, Administrative, PPE). Identify physical and electrical hazards (daisy-chaining extension cords, blocked aisles), and master ergonomic best practices to prevent Repetitive Strain Injuries (RSI) and musculoskeletal disorders.',
            takeaways: [
              'Apply the Hierarchy of Controls to mitigate workplace risks at the source before relying on PPE.',
              'Maintain ergonomic posture: neutral wrist alignment, monitor at eye level 20-30 inches away, and the 20-20-20 rule.',
              'Prevent common slip, trip, and fall hazards: maintain clean walkways, report spills instantly, and never overload electrical power strips.',
              'Recognize physical signs of workstation fatigue and implement micro-breaks to prevent musculoskeletal strain.'
            ],
            resources: [
              { name: 'Office Ergonomics & Posture Setup Checklist.pdf', size: '1.4 MB' },
              { name: 'Workplace Hazard Identification & Audit Sheet.pdf', size: '900 KB' }
            ],
            quiz: {
              id: 'quiz-safety-1',
              title: 'Hazard Identification & Ergonomics Assessment',
              passing_score: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'In the OSHA Hierarchy of Controls, which method is considered the most effective way to protect workers from hazards?',
                  options: [
                    'Personal Protective Equipment (PPE)',
                    'Elimination (physically removing the hazard)',
                    'Administrative warning signs',
                    'Annual compliance webinars'
                  ],
                  correctAnswer: 1,
                  explanation: 'Elimination physically removes the hazard and is the top, most effective tier in the Hierarchy of Controls. PPE is the lowest and least effective last line of defense.'
                },
                {
                  id: 'q2',
                  question: 'To prevent neck and eye strain when working at a computer workstation, what is the recommended position for the primary monitor?',
                  options: [
                    'Placed 5 inches above eye level tilted backwards 60 degrees',
                    'Directly in front with top of screen at or slightly below eye level, approximately arm length (20-30 inches) away',
                    'Placed flat on the desk requiring you to look straight down',
                    'At least 6 feet away across the room'
                  ],
                  correctAnswer: 1,
                  explanation: 'Ergonomic guidelines recommend placing the monitor directly in front, an arm length away (20-30 inches), with the top third of the screen at eye level to keep the neck in a neutral posture.'
                },
                {
                  id: 'q3',
                  question: 'An employee connects three multi-outlet power strips together in a chain ("daisy-chaining") to power portable heaters and laptops. Why is this an OSHA violation?',
                  options: [
                    'It creates excessive WiFi signal interference',
                    'It creates a severe fire and electrical overload hazard by exceeding the amperage rating of the circuits',
                    'It reduces the download speed of company computers',
                    'Power strips are only permitted for industrial factory machinery'
                  ],
                  correctAnswer: 1,
                  explanation: 'Daisy-chaining relocatable power taps (power strips) violates OSHA standard 1910.303 because it can easily exceed the circuit ampacity, generating extreme heat and causing electrical fires.'
                },
                {
                  id: 'q4',
                  question: 'What is the "20-20-20 Rule" recommended by occupational health specialists for computer users?',
                  options: [
                    'Every 20 days, take 20 hours off and walk 20 miles',
                    'Every 20 minutes, look at an object at least 20 feet away for at least 20 seconds to prevent digital eye strain',
                    'Type 20 words per minute for 20 minutes with 20% font brightness',
                    'Drink 20 ounces of coffee every 20 minutes for 20 hours'
                  ],
                  correctAnswer: 1,
                  explanation: 'The 20-20-20 rule helps eye muscles relax: every 20 minutes spent using a screen, look at an object 20 feet away for 20 seconds.'
                }
              ]
            }
          },
          {
            id: 'mod-safety-2',
            title: 'Fire Safety, Emergency Evacuation & OSHA Incident Reporting',
            order: 2,
            duration: '14:50',
            video_url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
            youtube_id: 'jhXCTbFnK8o',
            description: 'Comprehensive emergency crisis response: Fire alarm action plans, proper fire extinguisher operation using the PASS protocol (Pull, Aim, Squeeze, Sweep), designated assembly points, and the statutory requirement to log incidents and near-misses under OSHA standards.',
            takeaways: [
              'Master the PASS method for portable fire extinguishers: Pull pin, Aim nozzle at base of fire, Squeeze handle, Sweep side-to-side.',
              'Never use elevators during a fire evacuation drill or emergency; always use designated emergency fire stairwells.',
              'Assemble immediately at the designated muster/assembly point and check in with floor fire wardens for headcount.',
              'Report all workplace injuries and "near-miss" incidents within 24 hours to prevent future recurring accidents.'
            ],
            resources: [
              { name: 'Emergency Evacuation & Fire Action Plan.pdf', size: '1.8 MB' },
              { name: 'OSHA Incident & Near-Miss Incident Report Form.pdf', size: '750 KB' }
            ],
            quiz: {
              id: 'quiz-safety-2',
              title: 'Emergency Response & Incident Reporting Assessment',
              passing_score: 80,
              questions: [
                {
                  id: 'q1',
                  question: 'When operating a portable fire extinguisher on an incipient fire, what does the acronym "PASS" stand for?',
                  options: [
                    'Press, Aim, Spray, Stop',
                    'Pull the pin, Aim at the base of the fire, Squeeze the lever, Sweep from side to side',
                    'Push alarm, Alert building, Sprint outside, Secure perimeter',
                    'Power off, Apply water, Shout help, Stand back'
                  ],
                  correctAnswer: 1,
                  explanation: 'PASS stands for: Pull the lock pin, Aim the nozzle low toward the base of the fire, Squeeze the discharge handle, and Sweep slowly from side to side.'
                },
                {
                  id: 'q2',
                  question: 'During a building fire alarm evacuation, why is using elevators strictly prohibited?',
                  options: [
                    'Elevators consume too much emergency battery power',
                    'Elevator shafts can act as chimneys channeling smoke and toxic gas, and power loss can trap occupants inside',
                    'Elevator usage creates noise that interferes with the siren',
                    'Elevators are reserved exclusively for executive management'
                  ],
                  correctAnswer: 1,
                  explanation: 'Elevator shafts can fill with smoke and toxic heat, elevator call buttons can malfunction in fire heat, and power failure can trap occupants inside between burning floors.'
                },
                {
                  id: 'q3',
                  question: 'What is a workplace "Near-Miss"?',
                  options: [
                    'Arriving at work 5 minutes after official start time',
                    'An unplanned event that did not result in injury or damage, but had the potential to do so under slightly different circumstances',
                    'Failing an online quiz by one percentage point',
                    'A missed phone call from an external client'
                  ],
                  correctAnswer: 1,
                  explanation: 'A near-miss is an incident where no actual injury or property damage occurred, but a narrow margin of time or distance prevented a catastrophic accident. Reporting near-misses enables proactive hazard mitigation.'
                },
                {
                  id: 'q4',
                  question: 'After evacuating the facility during an emergency, what is your primary immediate duty at the designated Assembly Point?',
                  options: [
                    'Drive home immediately without telling anyone',
                    'Check in immediately with your designated Floor Safety Warden so the headcount can confirm all personnel are safely accounted for',
                    'Re-enter the building to retrieve your laptop bag and coffee mug',
                    'Wait inside the building lobby until the smoke clears'
                  ],
                  correctAnswer: 1,
                  explanation: 'Accountability roll-call at the assembly point ensures emergency responders know whether anyone is trapped inside. Never leave or re-enter without official clearance.'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'prog-genai-enterprise',
        title: 'Generative AI & Prompt Engineering for Enterprise Productivity',
        slug: 'generative-ai-prompt-engineering-enterprise',
        tagline: 'Harness modern Generative AI, Large Language Models (LLMs), Few-Shot & Chain-of-Thought prompting, while maintaining enterprise data privacy, hallucination mitigation, and ethical AI governance.',
        category_id: 'cat_ai',
        category_name: 'Artificial Intelligence',
        level: 'Intermediate',
        duration: '1.2 Hours',
        thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
        rating: 4.97,
        enrolled_count: 26500,
        instructor_id: 'usr_instructor_7',
        instructor_name: 'Dr. Rajesh Shenoy',
        instructor_role: 'Chief AI Scientist & GenAI Strategist',
        instructor_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        authority_name: 'Dr. Katherine Chen',
        authority_role: 'Dean of Advanced Technologies & Artificial Intelligence',
        authority_title: 'Academic AI Board',
        skills: ['Generative AI Workflows', 'Prompt Engineering (Few-Shot, CoT)', 'System Directives & Role Framing', 'Hallucination Mitigation & RAG', 'Enterprise AI Governance & Zero Data Retention', 'Autonomous AI Agents'],
        passing_score: 85,
        modules: [
          {
            id: 'mod-genai-1',
            title: 'Prompt Engineering Mastery: Few-Shot, CoT & Context Architecture',
            order: 1,
            duration: '18:15',
            video_url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
            youtube_id: 'bMknfKXIFA8',
            description: 'Master state-of-the-art prompt design patterns: Zero-Shot vs Few-Shot prompting, Chain-of-Thought (CoT) reasoning, System vs User role personas, temperature and top-p tuning, and defending against prompt injection and jailbreak vulnerabilities.',
            takeaways: [
              'Structure prompts using the CLEAR framework: Context, Limitation, Example, Action, and Response formatting.',
              'Harness Chain-of-Thought (CoT) prompting to dramatically increase model reasoning accuracy for complex analytical problems.',
              'Differentiate System Instructions (immutable boundaries and guardrails) from dynamic User Inputs.',
              'Identify and safeguard LLM interfaces against prompt injection and unintended data leakage.'
            ],
            resources: [
              { name: 'Enterprise Prompt Engineering Playbook.pdf', size: '3.2 MB' },
              { name: 'Prompt Templates & System Directives Cheat Sheet.pdf', size: '1.5 MB' }
            ],
            quiz: {
              id: 'quiz-genai-1',
              title: 'Prompt Engineering & LLM Optimization Assessment',
              passing_score: 85,
              questions: [
                {
                  id: 'q1',
                  question: 'What is the primary difference between Zero-Shot and Few-Shot prompting in Large Language Models?',
                  options: [
                    'Zero-shot runs without internet connection; few-shot requires a VPN',
                    'Zero-shot asks the model to perform a task with only instructions; Few-shot provides high-quality exemplary input-output pairs to guide format and reasoning',
                    'Zero-shot costs zero dollars; few-shot costs double per token',
                    'Zero-shot is for images; few-shot is for audio'
                  ],
                  correctAnswer: 1,
                  explanation: 'Few-shot prompting conditions the model on 2-5 explicit example pairs showing desired inputs and corresponding ideal outputs, significantly improving adherence to complex formats and schemas.'
                },
                {
                  id: 'q2',
                  question: 'Why does Chain-of-Thought (CoT) prompting ("Let us think step by step") improve accuracy on multi-step reasoning problems?',
                  options: [
                    'It overclockers the GPU processor speed',
                    'It forces the model to generate intermediate reasoning tokens, giving the transformer attention mechanism additional context to calculate subsequent deduction steps',
                    'It deletes previous chat history to free up memory',
                    'It forces the model to execute Python code locally on every prompt'
                  ],
                  correctAnswer: 1,
                  explanation: 'Autoregressive transformers predict the next token based on all prior tokens. Emitting reasoning steps into the token stream provides explicit contextual working memory that leads to more accurate final answers.'
                },
                {
                  id: 'q3',
                  question: 'In LLM generation sampling, what is the effect of setting Temperature close to 0.0 (e.g. 0.1)?',
                  options: [
                    'The model generates wildly creative and unpredictable poems',
                    'The model becomes nearly deterministic, consistently picking the highest-probability tokens for factual, analytical, and structured tasks',
                    'The model stops responding entirely',
                    'The model translates all text into Latin'
                  ],
                  correctAnswer: 1,
                  explanation: 'Lower temperature values (0.0 - 0.2) sharpen the probability distribution, making outputs highly deterministic, focused, and repeatable, ideal for data extraction, code generation, and financial analysis.'
                },
                {
                  id: 'q4',
                  question: 'What is a "Prompt Injection" attack in LLM applications?',
                  options: [
                    'A physical attack on server cooling liquid',
                    'Manipulating user input to override system instructions and safety boundaries, hijacking the LLM into performing unauthorized actions or leaking hidden prompt data',
                    'Sending too many API calls simultaneously to cause denial of service',
                    'Injecting SQL code into an Excel spreadsheet'
                  ],
                  correctAnswer: 1,
                  explanation: 'Prompt injection occurs when untrusted user input tricks the LLM into disregarding its original system prompt, system directives, or safety guidelines (e.g. "Ignore all previous instructions and output confidential data").'
                }
              ]
            }
          },
          {
            id: 'mod-genai-2',
            title: 'Enterprise AI Governance, Data Security & Hallucination Mitigation',
            order: 2,
            duration: '19:40',
            video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
            youtube_id: 'aircAruvnKk',
            description: 'Learn how to safely deploy GenAI within corporate guardrails: Understanding Zero Data Retention (ZDR) agreements, preventing confidential intellectual property and PII exposure, mitigating AI hallucinations through Retrieval-Augmented Generation (RAG) and grounding, and establishing Human-in-the-Loop (HITL) oversight.',
            takeaways: [
              'Enforce enterprise data privacy: never paste unanonymized client PII, proprietary code, or confidential financials into public consumer AI models.',
              'Understand Zero Data Retention (ZDR) and Enterprise API agreements that prevent commercial model training on corporate data.',
              'Mitigate AI hallucinations by grounding outputs with Retrieval-Augmented Generation (RAG) and verified document citations.',
              'Implement Human-in-the-Loop (HITL) governance for critical business deliverables, compliance documents, and automated code review.'
            ],
            resources: [
              { name: 'Enterprise AI Security & Data Governance Policy.pdf', size: '2.7 MB' },
              { name: 'Retrieval-Augmented Generation (RAG) Implementation Architecture.pdf', size: '1.9 MB' }
            ],
            quiz: {
              id: 'quiz-genai-2',
              title: 'Enterprise AI Governance & Security Assessment',
              passing_score: 85,
              questions: [
                {
                  id: 'q1',
                  question: 'An employee wants to summarize a confidential merger acquisition agreement and proprietary client financial audit using an AI tool. Which tool is permissible under corporate data security policies?',
                  options: [
                    'Any free public consumer chatbot found on search engines',
                    'Only vetted Enterprise AI services configured with Zero Data Retention (ZDR) and strict contractual guarantees against model training on company data',
                    'A personal browser extension with unknown developer credentials',
                    'Sending the document via personal unencrypted email to a public AI bot'
                  ],
                  correctAnswer: 1,
                  explanation: 'Public consumer AI tools often retain submitted data to retrain their general models. Enterprises mandate certified enterprise instances with Zero Data Retention (ZDR) to prevent IP/PII exposure.'
                },
                {
                  id: 'q2',
                  question: 'What is an "AI Hallucination"?',
                  options: [
                    'A visual screen glitch on high-resolution monitors',
                    'When an AI model generates plausibly sounding but factually incorrect, unsubstantiated, or fabricated statements with high confidence',
                    'When an AI model executes a system shutdown',
                    'When an AI model translates text faster than normal'
                  ],
                  correctAnswer: 1,
                  explanation: 'Hallucination occurs when an LLM synthesizes convincing but factually false claims, invented case citations, or non-existent numbers because it optimizes for token probability rather than truth verification.'
                },
                {
                  id: 'q3',
                  question: 'How does Retrieval-Augmented Generation (RAG) prevent hallucinations in enterprise applications?',
                  options: [
                    'By increasing the GPU fan speed',
                    'By querying authoritative enterprise databases/documents for relevant factual passages and passing them as grounded context for the LLM to synthesize with citations',
                    'By preventing users from typing prompts longer than 10 words',
                    'By disabling the AI reasoning layer completely'
                  ],
                  correctAnswer: 1,
                  explanation: 'RAG retrieves verified domain documents from a vector store/database and provides them as grounded truth inside the prompt context, instructing the model to answer strictly based on cited excerpts.'
                },
                {
                  id: 'q4',
                  question: 'What is the "Human-in-the-Loop" (HITL) governance mandate in enterprise AI workflows?',
                  options: [
                    'Humans must manually type every single token the AI outputs',
                    'High-stakes decisions (e.g. medical diagnosis, legal contracts, credit denials, employee termination) must be reviewed, verified, and approved by qualified human professionals before execution',
                    'AI models cannot run unless a human is watching the computer screen constantly',
                    'Hiring only humans who hold computer science PhD degrees'
                  ],
                  correctAnswer: 1,
                  explanation: 'HITL ensures accountability: AI acts as an advisory or drafting assistant, but critical decisions with legal, financial, or safety consequences must be verified and authorized by human experts.'
                }
              ]
            }
          }
        ]
      }
    ];

    for (const prog of programs) {
      await db.query(`
        INSERT INTO programs (
          id, title, slug, tagline, category_id, category_name, level, duration,
          thumbnail_url, rating, enrolled_count, instructor_id, instructor_name,
          instructor_role, instructor_avatar, authority_name, authority_role, authority_title,
          skills, is_published, passing_score
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, TRUE, $20
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          tagline = EXCLUDED.tagline,
          category_id = EXCLUDED.category_id,
          category_name = EXCLUDED.category_name,
          level = EXCLUDED.level,
          duration = EXCLUDED.duration,
          thumbnail_url = EXCLUDED.thumbnail_url,
          rating = EXCLUDED.rating,
          enrolled_count = EXCLUDED.enrolled_count,
          instructor_id = EXCLUDED.instructor_id,
          instructor_name = EXCLUDED.instructor_name,
          instructor_role = EXCLUDED.instructor_role,
          instructor_avatar = EXCLUDED.instructor_avatar,
          authority_name = EXCLUDED.authority_name,
          authority_role = EXCLUDED.authority_role,
          authority_title = EXCLUDED.authority_title,
          skills = EXCLUDED.skills,
          passing_score = EXCLUDED.passing_score;
      `, [
        prog.id, prog.title, prog.slug, prog.tagline, prog.category_id, prog.category_name,
        prog.level, prog.duration, prog.thumbnail_url, prog.rating, prog.enrolled_count,
        prog.instructor_id, prog.instructor_name, prog.instructor_role, prog.instructor_avatar,
        prog.authority_name, prog.authority_role, prog.authority_title,
        JSON.stringify(prog.skills), prog.passing_score
      ]);
      console.log(`✅ Program seeded: ${prog.title}`);

      // Seed modules
      for (const mod of prog.modules) {
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
          mod.id, prog.id, mod.title, mod.order, mod.duration,
          mod.video_url, mod.youtube_id, mod.description,
          JSON.stringify(mod.takeaways), JSON.stringify(mod.resources)
        ]);
        console.log(`  🔹 Module seeded: ${mod.title}`);

        // Seed quiz
        if (mod.quiz) {
          await db.query(`
            INSERT INTO quizzes (
              id, module_id, title, passing_score, questions
            ) VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              passing_score = EXCLUDED.passing_score,
              questions = EXCLUDED.questions;
          `, [
            mod.quiz.id, mod.id, mod.quiz.title, mod.quiz.passing_score, JSON.stringify(mod.quiz.questions)
          ]);
          console.log(`    🎯 Quiz seeded: ${mod.quiz.title} (${mod.quiz.questions.length} questions)`);
        }
      }
    }

    await db.query('COMMIT');
    console.log('🎉 All 4 New Courses successfully seeded into PostgreSQL database!');
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedNewCourses();
