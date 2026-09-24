-- =============================================================================
-- LearnPulse E-Learning Platform - PostgreSQL Initial Seed Data
-- Database: elearning_db
-- =============================================================================

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE certificates, quiz_submissions, module_progress, enrollments, quizzes, modules, programs, categories, users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. SEED USERS
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, avatar_url, headline, bio) VALUES
(
    'usr_instructor_1',
    'Dr. Sarah Chen',
    'sarah.chen@learnpulse.dev',
    '$2b$10$abcdef1234567890examplehashforsecurity',
    'instructor',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'Principal Software Architect & Lead Instructor',
    'Ex-Google Staff Engineer with 12+ years of distributed systems and frontend architecture experience.'
),
(
    'usr_instructor_2',
    'Alex Rivera',
    'alex.rivera@learnpulse.dev',
    '$2b$10$abcdef1234567890examplehashforsecurity',
    'instructor',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'AI Research Lead & Author',
    'Specializing in Transformer architectures, prompt engineering, and autonomous agent orchestration.'
),
(
    'usr_instructor_3',
    'Marcus Vance',
    'marcus.vance@learnpulse.dev',
    '$2b$10$abcdef1234567890examplehashforsecurity',
    'instructor',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'Certified Information Systems Security Professional (CISSP)',
    'Former Red Team Lead with expertise in adversary emulation, threat hunting, and modern cryptographic defense.'
),
(
    'usr_student_sachin',
    'Sachin Chauhan',
    'sachin@learnpulse.dev',
    '$2b$10$abcdef1234567890examplehashforsecurity',
    'student',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'Full-Stack Developer & Cloud Architect',
    'Passionate about building scalable modern software systems.'
),
(
    'usr_instructor_4',
    'Advocate Ananya Deshmukh',
    'ananya.deshmukh@worxpertise.com',
    '$2b$10$abcdef1234567890examplehashforsecurity',
    'instructor',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80',
    'Head of Legal & POSH External IC Member',
    'Senior Corporate Legal Counsel and External IC Advisor with 15+ years specializing in POSH Act compliance, workplace ethics, and sensitivity governance.'
);

-- -----------------------------------------------------------------------------
-- 2. SEED CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description, icon) VALUES
('cat_webdev', 'Web Development', 'web-development', 'Modern web technologies, frontend frameworks, and backend architectures.', 'code'),
('cat_ai', 'Artificial Intelligence', 'artificial-intelligence', 'Machine Learning, Deep Learning, Large Language Models, and Autonomous Agents.', 'cpu'),
('cat_cyber', 'Cybersecurity', 'cybersecurity', 'Defensive security, penetration testing, ethical hacking, and cryptography.', 'shield'),
('cat_compliance', 'Corporate Compliance', 'corporate-compliance', 'Mandatory workplace compliance, statutory governance, POSH Act 2013, and corporate ethics.', 'shield-check');

-- -----------------------------------------------------------------------------
-- 3. SEED PROGRAMS
-- -----------------------------------------------------------------------------
INSERT INTO programs (
    id, title, slug, tagline, category_id, category_name, level, duration,
    thumbnail_url, rating, enrolled_count, instructor_id, instructor_name,
    instructor_role, instructor_avatar, skills, is_published
) VALUES
(
    'prog-fullstack',
    'Full-Stack Web Development Mastery',
    'full-stack-web-development',
    'Build, scale, and deploy enterprise-grade modern web applications from scratch.',
    'cat_webdev',
    'Web Development',
    'Intermediate',
    '6 Hours',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    4.90,
    14280,
    'usr_instructor_1',
    'Dr. Sarah Chen',
    'Principal Software Architect',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    '["React & TypeScript", "RESTful APIs", "Node.js & Express", "Docker & CI/CD", "Tailwind CSS"]'::jsonb,
    TRUE
),
(
    'prog-ai-ml',
    'Mastering Artificial Intelligence & LLMs',
    'applied-artificial-intelligence-llms',
    'Harness modern Large Language Models, Prompt Engineering, Neural Networks, and Autonomous Agents.',
    'cat_ai',
    'Artificial Intelligence',
    'Advanced',
    '8 Hours',
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    4.95,
    19850,
    'usr_instructor_2',
    'Alex Rivera',
    'AI Research Lead & Author',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    '["Neural Networks", "Transformer Architectures", "Prompt Engineering", "Autonomous Agents", "RAG Systems"]'::jsonb,
    TRUE
),
(
    'prog-cybersecurity',
    'Cybersecurity Defense & Ethical Hacking',
    'cybersecurity-defense-ethical-hacking',
    'Master threat modeling, penetration testing, defensive architecture, and cryptographic protocols.',
    'cat_cyber',
    'Cybersecurity',
    'Intermediate',
    '5 Hours',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    4.88,
    11200,
    'usr_instructor_3',
    'Marcus Vance',
    'Certified Information Systems Security Professional',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    '["Vulnerability Assessment", "OWASP Top 10", "Network Penetration", "Cryptographic Defense", "Zero Trust"]'::jsonb,
    TRUE
),
(
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
    '["POSH Act 2013", "Workplace Ethics & Sensitivity", "Hostile Work Environment Prevention", "Bystander Intervention (4Ds)", "Internal Committee (IC) Redressal"]'::jsonb,
    TRUE
);

-- -----------------------------------------------------------------------------
-- 4. SEED MODULES FOR PROGRAM 1 (Web Development)
-- -----------------------------------------------------------------------------
INSERT INTO modules (
    id, program_id, title, module_order, duration, video_url, youtube_id, description, takeaways, resources
) VALUES
(
    'mod-fs-1',
    'prog-fullstack',
    'Modern Frontend Architecture & Component Systems',
    1,
    '10:15',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'bMknfKXIFA8',
    'Explore declarative UI, unidirectional data flow, component lifecycle, and modern hooks in web development.',
    '["Understand Virtual DOM reconciliation and performance optimization.", "Master custom hooks for clean business logic separation.", "Build scalable component design systems with responsive styling."]'::jsonb,
    '[{"name": "Frontend Architecture Checklist.pdf", "size": "1.2 MB"}, {"name": "Starter Code Repository (GitHub)", "url": "#"}]'::jsonb
),
(
    'mod-fs-2',
    'prog-fullstack',
    'RESTful & GraphQL API Design with Node.js',
    2,
    '12:40',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'Oe421EPjeBE',
    'Master backend API design principles, stateless authentication with JWT, input sanitization, and structured error handling.',
    '["Designing semantic REST endpoints following RFC standards.", "Implementing secure JWT token rotation and HTTP-only cookie storage.", "Writing resilient middleware pipelines for logging and error capture."]'::jsonb,
    '[{"name": "REST API Design Guidelines.pdf", "size": "850 KB"}, {"name": "Postman Collection Export", "url": "#"}]'::jsonb
),
(
    'mod-fs-3',
    'prog-fullstack',
    'Cloud Deployment, Containers & CI/CD Pipelines',
    3,
    '15:00',
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    '31ieHmcTUOk',
    'Containerize your full-stack application using Docker, configure automated testing pipelines, and deploy with zero downtime.',
    '["Building production-optimized multi-stage Dockerfiles.", "Setting up GitHub Actions for automated linting, testing, and deployment.", "Configuring reverse proxies, SSL certificates, and environment isolation."]'::jsonb,
    '[{"name": "Docker & CI/CD Cheat Sheet.pdf", "size": "2.1 MB"}, {"name": "Sample GitHub Workflow YAML", "url": "#"}]'::jsonb
);

-- -----------------------------------------------------------------------------
-- 5. SEED MODULES FOR PROGRAM 2 (AI & LLMs)
-- -----------------------------------------------------------------------------
INSERT INTO modules (
    id, program_id, title, module_order, duration, video_url, youtube_id, description, takeaways, resources
) VALUES
(
    'mod-ai-1',
    'prog-ai-ml',
    'Deep Learning Foundations & Neural Networks',
    1,
    '14:20',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'aircAruvnKk',
    'Unpack the mathematical intuition behind forward propagation, backpropagation, gradient descent, and loss optimization.',
    '["Understanding weights, biases, and activation functions (ReLU, Sigmoid, GELU).", "Visualizing gradient descent and learning rate tuning.", "Techniques to prevent overfitting: Dropout, Regularization, and Data Augmentation."]'::jsonb,
    '[{"name": "Neural Networks Math Primer.pdf", "size": "3.4 MB"}, {"name": "Jupyter Notebook Experiments", "url": "#"}]'::jsonb
),
(
    'mod-ai-2',
    'prog-ai-ml',
    'Transformer Architecture & Advanced Prompt Engineering',
    2,
    '16:45',
    'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
    'wjZofJX0v4U',
    'Deep dive into Self-Attention mechanisms, tokenization, positional embeddings, and state-of-the-art prompt design techniques.',
    '["Understanding Query, Key, and Value matrices in multi-head attention.", "Few-shot prompting, Chain-of-Thought (CoT), and ReAct prompting frameworks.", "Controlling output determinism with temperature and top-p sampling."]'::jsonb,
    '[{"name": "Attention Is All You Need Paper Summary.pdf", "size": "1.8 MB"}, {"name": "Prompt Engineering Playbook", "url": "#"}]'::jsonb
),
(
    'mod-ai-3',
    'prog-ai-ml',
    'Autonomous AI Agents & Tool Calling Workflows',
    3,
    '18:10',
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    '2xxziIWmaSA',
    'Build autonomous agents capable of planning, utilizing external tools via function calling, maintaining memory, and executing multi-step goals.',
    '["Designing robust Function Calling schemas with JSON schema validation.", "Implementing ReAct (Reason + Act) autonomous decision-making loops.", "Safety guardrails, human-in-the-loop validation, and rate limit management."]'::jsonb,
    '[{"name": "Agent Architecture Blueprints.pdf", "size": "2.7 MB"}, {"name": "Full Agent Starter Kit", "url": "#"}]'::jsonb
);

-- -----------------------------------------------------------------------------
-- 6. SEED MODULES FOR PROGRAM 3 (Cybersecurity)
-- -----------------------------------------------------------------------------
INSERT INTO modules (
    id, program_id, title, module_order, duration, video_url, youtube_id, description, takeaways, resources
) VALUES
(
    'mod-sec-1',
    'prog-cybersecurity',
    'Network Reconnaissance & Vulnerability Assessment',
    1,
    '11:30',
    'https://vjs.zencdn.net/v/oceans.mp4',
    'inWWhr5tnEA',
    'Learn systematic discovery methodologies, network port scanning, banner grabbing, and Common Vulnerabilities & Exposures (CVE) identification.',
    '["Differentiating between passive and active reconnaissance.", "Using port scanners and protocol analyzers responsibly within legal scope.", "Interpreting Common Vulnerability Scoring System (CVSS) severity metrics."]'::jsonb,
    '[{"name": "Reconnaissance Methodology Guide.pdf", "size": "1.5 MB"}, {"name": "Lab Configuration Files", "url": "#"}]'::jsonb
),
(
    'mod-sec-2',
    'prog-cybersecurity',
    'Web Application Security & OWASP Top 10',
    2,
    '13:50',
    'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
    '2_lswM1S264',
    'Examine critical web vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), Insecure Direct Object References (IDOR), and CSRF.',
    '["Mitigating SQL Injection using parameterized queries and prepared statements.", "Preventing Cross-Site Scripting (XSS) via context-aware output encoding and strict CSPs.", "Implementing robust access control checks to eliminate IDOR flaws."]'::jsonb,
    '[{"name": "OWASP Top 10 Defensive Guide.pdf", "size": "2.4 MB"}, {"name": "Web Security Checklist", "url": "#"}]'::jsonb
),
(
    'mod-sec-3',
    'prog-cybersecurity',
    'Cryptographic Systems & Secure Communication',
    3,
    '15:20',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'jhXCTbFnK8o',
    'Understand asymmetric vs symmetric cryptography, TLS 1.3 handshakes, digital signatures, password hashing algorithms, and Zero Trust architecture.',
    '["Understanding AES-256-GCM symmetric encryption and RSA/ECC asymmetric key pairs.", "Securing passwords using modern salted memory-hard algorithms (Argon2id, bcrypt).", "The core pillars of Zero Trust architecture: Never Trust, Always Verify."]'::jsonb,
    '[{"name": "Applied Cryptography Handbook.pdf", "size": "3.1 MB"}, {"name": "Zero Trust Implementation Framework", "url": "#"}]'::jsonb
);

-- -----------------------------------------------------------------------------
-- 7. SEED QUIZZES WITH INTERACTIVE QUESTION BANKS
-- -----------------------------------------------------------------------------
INSERT INTO quizzes (id, module_id, title, passing_score, questions) VALUES
(
    'quiz-fs-1',
    'mod-fs-1',
    'Frontend Architecture & React Fundamentals Assessment',
    80,
    '[
        {
            "id": "q1",
            "question": "What is the primary benefit of React Virtual DOM reconciliation process?",
            "options": [
                "It bypasses the browser rendering engine entirely",
                "It calculates minimal DOM updates to avoid expensive browser repaints and reflows",
                "It automatically compiles JavaScript code directly into C++ binary",
                "It guarantees zero memory allocation during renders"
            ],
            "correctAnswer": 1,
            "explanation": "The Virtual DOM is a lightweight memory representation. Reconciliation diffs changes and updates only the necessary nodes in the real DOM, minimizing costly layout reflows."
        },
        {
            "id": "q2",
            "question": "Why should state updates never mutate the existing state directly in React?",
            "options": [
                "JavaScript throws a runtime syntax error on mutation",
                "Direct mutation breaks shallow comparison checks, causing skipped re-renders or unpredictable UI bugs",
                "Because state objects are permanently frozen by the browser",
                "Mutating state deletes all component event listeners"
            ],
            "correctAnswer": 1,
            "explanation": "React relies on immutable state references to detect changes via fast shallow equality (prev !== next). Mutating state directly prevents React from detecting changes."
        },
        {
            "id": "q3",
            "question": "When should the useEffect hook with an empty dependency array [] be used?",
            "options": [
                "On every single component re-render",
                "Only when unmounting the component",
                "To execute a side-effect exactly once after the initial component mount",
                "Whenever any global state changes"
            ],
            "correctAnswer": 2,
            "explanation": "An empty dependency array [] instructs React to execute the effect only once when the component first mounts into the DOM."
        },
        {
            "id": "q4",
            "question": "Which pattern is recommended for sharing non-visual business logic across multiple components?",
            "options": [
                "Global window variables",
                "Copying and pasting the logic into each file",
                "Custom React Hooks (use...)",
                "CSS Custom Properties"
            ],
            "correctAnswer": 2,
            "explanation": "Custom hooks allow developers to extract and reuse stateful component logic seamlessly across different UI views."
        }
    ]'::jsonb
),
(
    'quiz-fs-2',
    'mod-fs-2',
    'Backend API Engineering Assessment',
    80,
    '[
        {
            "id": "q1",
            "question": "Which HTTP status code is most appropriate when a requested resource is created successfully?",
            "options": [
                "200 OK",
                "201 Created",
                "204 No Content",
                "301 Moved Permanently"
            ],
            "correctAnswer": 1,
            "explanation": "HTTP 201 Created signifies that the request has succeeded and led to the creation of a new resource on the server."
        },
        {
            "id": "q2",
            "question": "Why should JSON Web Tokens (JWT) for user sessions ideally be stored in HttpOnly cookies rather than localStorage?",
            "options": [
                "localStorage has a 5KB size limit",
                "HttpOnly cookies cannot be accessed by client-side JavaScript, mitigating Cross-Site Scripting (XSS) token theft",
                "localStorage is deleted every time the browser tab is closed",
                "Cookies encrypt the payload automatically using RSA-4096"
            ],
            "correctAnswer": 1,
            "explanation": "Storing authentication tokens in HttpOnly cookies prevents malicious XSS scripts from reading the token via document.cookie."
        },
        {
            "id": "q3",
            "question": "What does the term idempotent mean in the context of HTTP methods like GET, PUT, and DELETE?",
            "options": [
                "The endpoint can only be called once in its lifetime",
                "Calling the endpoint multiple times with the same parameters produces the same resulting server state as calling it once",
                "The response is always encrypted",
                "The server processes the request asynchronously in the background"
            ],
            "correctAnswer": 1,
            "explanation": "An idempotent HTTP method produces identical side effects on the server regardless of whether it is executed 1 time or 100 times."
        },
        {
            "id": "q4",
            "question": "What is the primary function of middleware functions in Express/Node.js?",
            "options": [
                "Compiling TypeScript into WebAssembly",
                "Intercepting incoming HTTP requests and responses to perform authentication, logging, validation, or transformation before final route handling",
                "Managing SQL database tables automatically",
                "Rendering CSS animations in the terminal"
            ],
            "correctAnswer": 1,
            "explanation": "Middleware functions have access to the request (req), response (res), and next middleware in the pipeline, executing preprocessing tasks."
        }
    ]'::jsonb
),
(
    'quiz-fs-3',
    'mod-fs-3',
    'Cloud DevOps & Deployment Assessment',
    80,
    '[
        {
            "id": "q1",
            "question": "What is the primary benefit of multi-stage Docker builds?",
            "options": [
                "Running multiple Docker daemons simultaneously",
                "Separating build-time dependencies from the final runtime image, resulting in dramatically smaller and more secure production images",
                "Automatically scaling containers across 10 regions",
                "Eliminating the need for a Dockerfile"
            ],
            "correctAnswer": 1,
            "explanation": "Multi-stage builds allow you to compile assets in an initial heavy build stage and copy only the compiled production artifacts into a slim base image."
        },
        {
            "id": "q2",
            "question": "In a Continuous Integration (CI) pipeline, when should automated tests ideally run?",
            "options": [
                "Once every month manually",
                "Automatically on every Pull Request / commit before code is merged into the main branch",
                "Only after the code has been deployed to live production users",
                "Only when a user reports a bug"
            ],
            "correctAnswer": 1,
            "explanation": "CI runs tests immediately upon code push or pull request to catch regressions before code enters production."
        },
        {
            "id": "q3",
            "question": "What is a Blue-Green deployment strategy?",
            "options": [
                "Deploying only on eco-friendly green energy servers",
                "Maintaining two identical production environments, routing traffic to the new version (Green) only after verification, allowing instant rollback to Blue if issues arise",
                "Turning off the server for 2 hours during updates",
                "Deploying random features to random users without testing"
            ],
            "correctAnswer": 1,
            "explanation": "Blue-Green deployment ensures zero downtime by running the new release on an idle environment and switching traffic via a load balancer once verified."
        },
        {
            "id": "q4",
            "question": "Why should sensitive credentials like database passwords and API keys NEVER be committed to Git repositories?",
            "options": [
                "Git automatically deletes files with passwords",
                "Committed secrets remain visible in git history forever and can be scraped by automated bots, compromising infrastructure",
                "Passwords increase git clone download times",
                "Git only supports alphanumeric passwords"
            ],
            "correctAnswer": 1,
            "explanation": "Committing secrets exposes them in the repository permanent history. Environment variables and secret managers should always be used instead."
        }
    ]'::jsonb
);
