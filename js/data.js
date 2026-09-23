/**
 * LearnPulse E-Learning Platform - Curriculum & Course Data
 * Contains comprehensive programs, video modules, lesson notes, and interactive Q&A question banks.
 */

window.COURSES_DATA = [
  {
    id: "prog-posh-compliance",
    title: "POSH: Prevention of Sexual Harassment at Workplace (Corporate Compliance)",
    slug: "posh-workplace-compliance",
    tagline: "Official corporate compliance program covering the POSH Act 2013, employee rights, identifying workplace harassment, bystander intervention, and Internal Committee (IC) redressal protocols.",
    category: "Corporate Compliance",
    level: "All Levels",
    rating: 4.95,
    enrolledCount: 18540,
    duration: "45 Mins",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Advocate Ananya Deshmukh",
      role: "Head of Legal & POSH External IC Member",
      avatar: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80",
      bio: "Senior Corporate Legal Counsel and External IC Advisor with 15+ years specializing in POSH Act compliance, workplace ethics, and sensitivity governance."
    },
    skills: ["POSH Act 2013", "Workplace Ethics & Sensitivity", "Hostile Work Environment Prevention", "Bystander Intervention (4Ds)", "Internal Committee (IC) Redressal"],
    modules: [
      {
        id: "mod-posh-1",
        title: "POSH Act 2013 Framework & Defining Workplace Harassment",
        order: 1,
        duration: "14:20",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        youtubeId: "f9U6m25v_d0",
        description: "An essential introduction to the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013. Learn the legal definition of sexual harassment, physical vs. non-physical misconduct, the expanded definition of the 'extended workplace' (including remote work, virtual calls, and official travel), and the difference between Quid Pro Quo and Hostile Work Environment.",
        takeaways: [
          "Understand the statutory definition of sexual harassment under Indian law and corporate standards.",
          "Differentiate between 'Quid Pro Quo' (demanding sexual favors for career advancement) and creating a 'Hostile Work Environment'.",
          "Recognize the 'Extended Workplace' doctrine: home office, virtual platforms (Slack, Teams, Zoom), client sites, and official transport.",
          "Recognize that intent does not justify unwelcome behavior—the impact on the recipient is the legal determinant."
        ],
        resources: [
          { name: "POSH Act 2013 Statutory Compliance Handbook.pdf", size: "1.8 MB" },
          { name: "Identifying Unwelcome Workplace Behavior Guide.pdf", size: "1.1 MB" }
        ],
        quiz: {
          id: "quiz-posh-1",
          title: "POSH Act Fundamentals & Behavioral Awareness Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "Under the POSH Act 2013, which of the following is legally considered part of the \"Workplace\"?",
              options: [
                "Only the physical office desk or workstation during official hours",
                "Any place visited by the employee arising out of or during the course of employment, including official travel, client dinners, and remote work communication",
                "Only locations where the company executive directors are physically present",
                "Only registered company headquarters and branch offices"
              ],
              correctAnswer: 1,
              explanation: "The Act adopts the 'Extended Workplace' doctrine: any place visited arising out of or in the course of employment, including transportation provided by the employer, corporate offsites, and virtual work platforms, is legally recognized as the workplace."
            },
            {
              id: "q2",
              question: "A manager promises a junior employee a high rating and promotion in exchange for romantic favors. What form of sexual harassment does this represent?",
              options: [
                "Friendly informal mentorship",
                "Quid Pro Quo harassment",
                "Hostile Work Environment only",
                "Casual workplace banter"
              ],
              correctAnswer: 1,
              explanation: "'Quid Pro Quo' (Latin for 'this for that') occurs when employment decisions, promotions, appraisal ratings, or career opportunities are explicitly or implicitly conditioned on submitting to unwelcome sexual advances or favors."
            },
            {
              id: "q3",
              question: "When evaluating an allegation of sexual harassment under POSH regulations, what is the legal standard regarding \"intent vs. impact\"?",
              options: [
                "If the sender claimed \"it was just a joke\" or had good intentions, it cannot be considered harassment",
                "Only physical acts count; verbal remarks are disregarded without written proof",
                "The impact on the aggrieved person is primary; lack of malicious intent does not excuse unwelcome conduct of a sexual nature",
                "Harassment is only established if confirmed by at least three male witnesses"
              ],
              correctAnswer: 2,
              explanation: "Under POSH jurisprudence, the subjective experience and impact on the recipient take precedence over the initiator's claimed intent. Even if someone claims they 'meant it innocently' or as a joke, unwelcome behavior of a sexual nature is still prohibited."
            },
            {
              id: "q4",
              question: "Which of the following digital actions in corporate messaging (Slack, MS Teams, Email, WhatsApp) violates POSH?",
              options: [
                "Sharing sprint tickets and meeting reminders during working hours",
                "Sending unsolicited sexually suggestive memes, jokes, or making personal comments about a colleague's appearance or body",
                "Tagging a colleague on a GitHub pull request or code review after office hours",
                "Requesting an update on sprint deliverables via corporate email"
              ],
              correctAnswer: 1,
              explanation: "Sending unsolicited sexual innuendos, suggestive memes, inappropriate comments on physical appearance, or unwelcome romantic advances over digital messaging channels violates POSH and IT conduct guidelines."
            }
          ]
        }
      },
      {
        id: "mod-posh-2",
        title: "Workplace Culture, Professional Boundaries & Bystander Intervention",
        order: 2,
        duration: "15:10",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        youtubeId: "3JZ_D3ELwOQ",
        description: "Fostering a culture of psychological safety, zero tolerance, and mutual respect. Learn how to maintain clear professional boundaries, avoid conscious and unconscious gender biases, and effectively practice active bystander intervention through the 4Ds (Direct, Distract, Delegate, Delay).",
        takeaways: [
          "Establish respectful, healthy workplace communication across all professional hierarchies.",
          "Master the 4Ds of Bystander Intervention: Direct action, Distraction, Delegating to HR/IC, and Delaying to support the target.",
          "Recognize subtle microaggressions, sexist commentary, and non-verbal misconduct.",
          "Understand employer obligations in conducting regular employee awareness and sensitization workshops."
        ],
        resources: [
          { name: "4Ds of Bystander Intervention Playbook.pdf", size: "950 KB" },
          { name: "Professional Boundaries in Remote Work Checklist.pdf", size: "1.3 MB" }
        ],
        quiz: {
          id: "quiz-posh-2",
          title: "Workplace Ethics & Bystander Intervention Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "You witness a senior manager repeatedly making uncomfortable personal remarks and inappropriate physical contact with a newly joined team member. What is the most effective immediate bystander intervention using the \"Distract\" technique?",
              options: [
                "Ignore the situation completely because it is not your direct department",
                "Interrupt the conversation by asking the colleague to join you for an urgent work task or project query, defusing the immediate tension",
                "Film the incident secretly and post it on public social media",
                "Wait three months before mentioning anything to anyone"
              ],
              correctAnswer: 1,
              explanation: "The 'Distract' technique interrupts the inappropriate interaction safely and immediately by changing the topic or giving the targeted individual an easy exit without direct physical confrontation."
            },
            {
              id: "q2",
              question: "What does the 4D framework of Bystander Intervention stand for?",
              options: [
                "Deny, Deflect, Dismiss, Disregard",
                "Direct, Distract, Delegate, Delay",
                "Document, Destroy, Disobey, Duplicate",
                "Discuss, Debate, Decide, Demand"
              ],
              correctAnswer: 1,
              explanation: "The internationally recognized 4Ds framework for workplace bystander intervention includes: Direct (call out behavior directly), Distract (interrupt or redirect), Delegate (involve HR, IC, or senior leadership), and Delay (check in with and support the affected colleague afterwards)."
            },
            {
              id: "q3",
              question: "Which of the following represents appropriate professional conduct when organizing team offsites or social celebrations?",
              options: [
                "Pressuring junior team members to drink alcohol or participate in intimate social activities against their wishes",
                "Respecting personal boundaries, providing inclusive non-alcoholic options, ensuring safe transport, and maintaining professional decorum",
                "Insisting on discussing personal dating histories and relationships as a team-building exercise",
                "Permitting inappropriate physical touching under the pretext of festive celebration"
              ],
              correctAnswer: 1,
              explanation: "Company-sponsored events, dinners, and celebrations require the same professional standards of conduct and mutual respect as the daily workplace."
            },
            {
              id: "q4",
              question: "Why is an employer legally required to periodically organize POSH sensitization workshops for all staff?",
              options: [
                "Purely to increase company training billable hours",
                "It is a statutory mandate under the POSH Act to foster an informed, respectful work culture and prevent misconduct before it occurs",
                "To replace the company external audit committee",
                "Only to comply with annual tax filing requirements"
              ],
              correctAnswer: 1,
              explanation: "Section 19 of the POSH Act legally obligates employers to organize regular workshops and awareness programs for sensitizing employees with the provisions of the Act and orienting Internal Committee members."
            }
          ]
        }
      },
      {
        id: "mod-posh-3",
        title: "Redressal Mechanism: Internal Committee (IC) Mandate, Inquiries & Protection",
        order: 3,
        duration: "16:00",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        youtubeId: "aqz-KE-bpKQ",
        description: "An in-depth guide to the complaints and inquiry process. Understand the formation and composition of the Internal Committee (IC), the 90-day filing timeline, conciliation options, the formal inquiry procedure (which follows principles of natural justice and powers of a Civil Court), interim relief, strict confidentiality obligations under Section 16, and zero-tolerance protection against retaliation.",
        takeaways: [
          "Understand the composition of the Internal Committee: Presiding Officer (senior woman), 2+ employee members, and an external independent expert.",
          "Learn the complaint filing timeline (within 3 months of incident, extendable by another 3 months upon justifiable reasons).",
          "Inquiry completion timelines: inquiry must be completed within 90 days, and report submitted within 10 days.",
          "Strict confidentiality is legally enforced under Section 16; leaking names or details incurs statutory penalties.",
          "Whistleblower protection and strong safeguards against victimisation or retaliation for complainants and witnesses."
        ],
        resources: [
          { name: "Internal Committee Complaint Filing & Inquiry Protocol.pdf", size: "2.1 MB" },
          { name: "POSH Section 16 Confidentiality & Anti-Retaliation Policy.pdf", size: "1.4 MB" }
        ],
        quiz: {
          id: "quiz-posh-3",
          title: "Internal Committee (IC) & Redressal Mechanism Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "Under Section 4 of the POSH Act, what is the mandatory composition of an organization's Internal Committee (IC)?",
              options: [
                "Any two male executives chosen by the CEO",
                "A Presiding Officer who must be a senior woman employee, at least 2 members committed to women's causes, an external member from an NGO/legal association, and at least 50% of total members must be women",
                "Only external corporate lawyers with no internal company representation",
                "All department managers regardless of gender balance"
              ],
              correctAnswer: 1,
              explanation: "The law strictly mandates that the Presiding Officer must be a senior female employee, at least 50% of the committee must be women, and at least one member must be an external independent member from an NGO or familiar with women's rights."
            },
            {
              id: "q2",
              question: "What is the standard timeline within which an aggrieved person should submit a written complaint to the Internal Committee?",
              options: [
                "Within 24 hours of the incident only",
                "Within 3 months from the date of the incident (extendable by another 3 months if justifiable reasons prevented earlier filing)",
                "Exactly 1 year after resigning from the company",
                "There is no timeline; inquiries can only begin after police involvement"
              ],
              correctAnswer: 1,
              explanation: "Under the POSH Act, complaints must be submitted in writing within 3 months of the incident (or the last incident in a series), with the IC possessing authority to extend the period by up to another 3 months if satisfied that circumstances prevented earlier filing."
            },
            {
              id: "q3",
              question: "What does Section 16 of the POSH Act strictly prohibit regarding ongoing or resolved complaints?",
              options: [
                "Disallowing both parties from having legal identity documents",
                "Publishing, communicating, or making known to the public, press, or media the contents of the complaint, the identity and addresses of the complainant, respondent, or witnesses",
                "Preventing the IC from taking written minutes",
                "Prohibiting company staff from working in cross-functional teams"
              ],
              correctAnswer: 1,
              explanation: "Section 16 imposes strict non-disclosure obligations. Publishing or leaking the names, addresses, complaints, or inquiry details of any party to colleagues, press, or public channels is a punishable statutory offense."
            },
            {
              id: "q4",
              question: "What legal protection is afforded to a complainant or witness against potential retaliation or career disadvantage after filing or testifying in an IC inquiry?",
              options: [
                "No protection; managers may reassign or terminate employees at will",
                "Employers and IC are legally required to ensure zero victimisation; complainants can request interim relief (such as department transfer, paid leave up to 3 months) and any retaliation is treated as severe misconduct",
                "Employees are required to waive all rights to future appraisals",
                "Protection applies only if the employee has completed 10 years of service"
              ],
              correctAnswer: 1,
              explanation: "Anti-retaliation is a cornerstone of POSH. During the inquiry, the IC can recommend interim relief (including paid leave up to 3 months or transfer), and any retaliatory action against complainants or witnesses is punishable as grave disciplinary misconduct."
            }
          ]
        }
      }
    ]
  },
  {
    id: "prog-fullstack",
    title: "Full-Stack Web Development Mastery",
    slug: "full-stack-web-development",
    tagline: "Build, scale, and deploy enterprise-grade modern web applications from scratch.",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.9,
    enrolledCount: 14280,
    duration: "6 Hours",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Dr. Sarah Chen",
      role: "Principal Software Architect",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      bio: "Ex-Google Staff Engineer with 12+ years of distributed systems and frontend architecture experience."
    },
    skills: ["React & TypeScript", "RESTful APIs", "Node.js & Express", "Docker & CI/CD", "Tailwind CSS"],
    modules: [
      {
        id: "mod-fs-1",
        title: "Modern Frontend Architecture & Component Systems",
        order: 1,
        duration: "10:15",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        youtubeId: "bMknfKXIFA8",
        description: "Explore the core fundamentals of declarative UI, unidirectional data flow, component lifecycle, and modern hooks in web development.",
        takeaways: [
          "Understand Virtual DOM reconciliation and performance optimization.",
          "Master custom hooks for clean business logic separation.",
          "Build scalable component design systems with responsive styling."
        ],
        resources: [
          { name: "Frontend Architecture Checklist.pdf", size: "1.2 MB" },
          { name: "Starter Code Repository (GitHub)", url: "#" }
        ],
        quiz: {
          id: "quiz-fs-1",
          title: "Frontend Architecture & React Fundamentals Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What is the primary benefit of React's Virtual DOM reconciliation process?",
              options: [
                "It bypasses the browser rendering engine entirely",
                "It calculates minimal DOM updates to avoid expensive browser repaints and reflows",
                "It automatically compiles JavaScript code directly into C++ binary",
                "It guarantees zero memory allocation during renders"
              ],
              correctAnswer: 1,
              explanation: "The Virtual DOM is a lightweight memory representation. Reconciliation diffs changes and updates only the necessary nodes in the real DOM, minimizing costly layout reflows."
            },
            {
              id: "q2",
              question: "Why should state updates never mutate the existing state directly in React?",
              options: [
                "JavaScript throws a runtime syntax error on mutation",
                "Direct mutation breaks shallow comparison checks, causing skipped re-renders or unpredictable UI bugs",
                "Because state objects are permanently frozen by the browser",
                "Mutating state deletes all component event listeners"
              ],
              correctAnswer: 1,
              explanation: "React relies on immutable state references to detect changes via fast shallow equality (`prev !== next`). Mutating state directly prevents React from detecting changes."
            },
            {
              id: "q3",
              question: "When should the `useEffect` hook with an empty dependency array `[]` be used?",
              options: [
                "On every single component re-render",
                "Only when unmounting the component",
                "To execute a side-effect exactly once after the initial component mount",
                "Whenever any global state changes"
              ],
              correctAnswer: 2,
              explanation: "An empty dependency array `[]` instructs React to execute the effect only once when the component first mounts into the DOM."
            },
            {
              id: "q4",
              question: "Which pattern is recommended for sharing non-visual business logic across multiple components?",
              options: [
                "Global window variables",
                "Copying and pasting the logic into each file",
                "Custom React Hooks (`use...`)",
                "CSS Custom Properties"
              ],
              correctAnswer: 2,
              explanation: "Custom hooks allow developers to extract and reuse stateful component logic seamlessly across different UI views."
            }
          ]
        }
      },
      {
        id: "mod-fs-2",
        title: "RESTful & GraphQL API Design with Node.js",
        order: 2,
        duration: "12:40",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        youtubeId: "Oe421EPjeBE",
        description: "Master backend API design principles, stateless authentication with JWT, input sanitization, and structured error handling.",
        takeaways: [
          "Designing semantic REST endpoints following RFC standards.",
          "Implementing secure JWT token rotation and HTTP-only cookie storage.",
          "Writing resilient middleware pipelines for logging and error capture."
        ],
        resources: [
          { name: "REST API Design Guidelines.pdf", size: "850 KB" },
          { name: "Postman Collection Export", url: "#" }
        ],
        quiz: {
          id: "quiz-fs-2",
          title: "Backend API Engineering Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "Which HTTP status code is most appropriate when a requested resource is created successfully?",
              options: [
                "200 OK",
                "201 Created",
                "204 No Content",
                "301 Moved Permanently"
              ],
              correctAnswer: 1,
              explanation: "HTTP 201 Created signifies that the request has succeeded and led to the creation of a new resource on the server."
            },
            {
              id: "q2",
              question: "Why should JSON Web Tokens (JWT) for user sessions ideally be stored in `HttpOnly` cookies rather than `localStorage`?",
              options: [
                "localStorage has a 5KB size limit",
                "HttpOnly cookies cannot be accessed by client-side JavaScript, mitigating Cross-Site Scripting (XSS) token theft",
                "localStorage is deleted every time the browser tab is closed",
                "Cookies encrypt the payload automatically using RSA-4096"
              ],
              correctAnswer: 1,
              explanation: "Storing authentication tokens in HttpOnly cookies prevents malicious XSS scripts from reading the token via `document.cookie`."
            },
            {
              id: "q3",
              question: "What does the term 'idempotent' mean in the context of HTTP methods like GET, PUT, and DELETE?",
              options: [
                "The endpoint can only be called once in its lifetime",
                "Calling the endpoint multiple times with the same parameters produces the same resulting server state as calling it once",
                "The response is always encrypted",
                "The server processes the request asynchronously in the background"
              ],
              correctAnswer: 1,
              explanation: "An idempotent HTTP method produces identical side effects on the server regardless of whether it is executed 1 time or 100 times."
            },
            {
              id: "q4",
              question: "What is the primary function of middleware functions in Express/Node.js?",
              options: [
                "Compiling TypeScript into WebAssembly",
                "Intercepting incoming HTTP requests and responses to perform authentication, logging, validation, or transformation before final route handling",
                "Managing SQL database tables automatically",
                "Rendering CSS animations in the terminal"
              ],
              correctAnswer: 1,
              explanation: "Middleware functions have access to the request (`req`), response (`res`), and next middleware in the pipeline, executing preprocessing tasks."
            }
          ]
        }
      },
      {
        id: "mod-fs-3",
        title: "Cloud Deployment, Containers & CI/CD Pipelines",
        order: 3,
        duration: "15:00",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        youtubeId: "31ieHmcTUOk",
        description: "Containerize your full-stack application using Docker, configure automated testing pipelines, and deploy with zero downtime.",
        takeaways: [
          "Building production-optimized multi-stage Dockerfiles.",
          "Setting up GitHub Actions for automated linting, testing, and deployment.",
          "Configuring reverse proxies, SSL certificates, and environment isolation."
        ],
        resources: [
          { name: "Docker & CI/CD Cheat Sheet.pdf", size: "2.1 MB" },
          { name: "Sample GitHub Workflow YAML", url: "#" }
        ],
        quiz: {
          id: "quiz-fs-3",
          title: "Cloud DevOps & Deployment Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What is the primary benefit of multi-stage Docker builds?",
              options: [
                "Running multiple Docker daemons simultaneously",
                "Separating build-time dependencies from the final runtime image, resulting in dramatically smaller and more secure production images",
                "Automatically scaling containers across 10 regions",
                "Eliminating the need for a Dockerfile"
              ],
              correctAnswer: 1,
              explanation: "Multi-stage builds allow you to compile assets in an initial heavy build stage and copy only the compiled production artifacts into a slim base image."
            },
            {
              id: "q2",
              question: "In a Continuous Integration (CI) pipeline, when should automated tests ideally run?",
              options: [
                "Once every month manually",
                "Automatically on every Pull Request / commit before code is merged into the main branch",
                "Only after the code has been deployed to live production users",
                "Only when a user reports a bug"
              ],
              correctAnswer: 1,
              explanation: "CI runs tests immediately upon code push or pull request to catch regressions before code enters production."
            },
            {
              id: "q3",
              question: "What is a Blue-Green deployment strategy?",
              options: [
                "Deploying only on eco-friendly green energy servers",
                "Maintaining two identical production environments, routing traffic to the new version (Green) only after verification, allowing instant rollback to Blue if issues arise",
                "Turning off the server for 2 hours during updates",
                "Deploying random features to random users without testing"
              ],
              correctAnswer: 1,
              explanation: "Blue-Green deployment ensures zero downtime by running the new release on an idle environment and switching traffic via a load balancer once verified."
            },
            {
              id: "q4",
              question: "Why should sensitive credentials like database passwords and API keys NEVER be committed to Git repositories?",
              options: [
                "Git automatically deletes files with passwords",
                "Committed secrets remain visible in git history forever and can be scraped by automated bots, compromising infrastructure",
                "Passwords increase git clone download times",
                "Git only supports alphanumeric passwords"
              ],
              correctAnswer: 1,
              explanation: "Committing secrets exposes them in the repository's permanent history. Environment variables and secret managers should always be used instead."
            }
          ]
        }
      }
    ]
  },
  {
    id: "prog-ai-ml",
    title: "Mastering Artificial Intelligence & LLMs",
    slug: "applied-artificial-intelligence-llms",
    tagline: "Harness modern Large Language Models, Prompt Engineering, Neural Networks, and Autonomous Agents.",
    category: "Artificial Intelligence",
    level: "Advanced",
    rating: 4.95,
    enrolledCount: 19850,
    duration: "8 Hours",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Alex Rivera",
      role: "AI Research Lead & Author",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bio: "Leading AI researcher specializing in Transformer architectures, prompt engineering, and autonomous agent orchestration."
    },
    skills: ["Neural Networks", "Transformer Architectures", "Prompt Engineering", "Autonomous Agents", "RAG Systems"],
    modules: [
      {
        id: "mod-ai-1",
        title: "Deep Learning Foundations & Neural Networks",
        order: 1,
        duration: "14:20",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        youtubeId: "aircAruvnKk",
        description: "Unpack the mathematical intuition behind forward propagation, backpropagation, gradient descent, and loss optimization.",
        takeaways: [
          "Understanding weights, biases, and activation functions (ReLU, Sigmoid, GELU).",
          "Visualizing gradient descent and learning rate tuning.",
          "Techniques to prevent overfitting: Dropout, Regularization, and Data Augmentation."
        ],
        resources: [
          { name: "Neural Networks Math Primer.pdf", size: "3.4 MB" },
          { name: "Jupyter Notebook Experiments", url: "#" }
        ],
        quiz: {
          id: "quiz-ai-1",
          title: "Neural Network Fundamentals Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What is the core role of an activation function in a neural network?",
              options: [
                "To speed up hard drive reading speeds",
                "To introduce non-linearity, enabling the network to learn complex non-linear decision boundaries",
                "To format numbers into currency",
                "To automatically delete corrupt training data"
              ],
              correctAnswer: 1,
              explanation: "Without non-linear activation functions, stacking multiple layers would simply collapse into a single linear transformation regardless of network depth."
            },
            {
              id: "q2",
              question: "What happens during the Backpropagation phase of neural network training?",
              options: [
                "The model outputs its final prediction to the user",
                "Gradients of the loss function with respect to weights are calculated using the calculus chain rule to update parameters via gradient descent",
                "The dataset is shuffled and saved to disk",
                "The computer restarts its cooling fans"
              ],
              correctAnswer: 1,
              explanation: "Backpropagation applies the calculus chain rule backwards from the output loss to compute how much each weight contributed to the error."
            },
            {
              id: "q3",
              question: "What is 'Overfitting' in machine learning?",
              options: [
                "When a model performs exceptionally on training data but fails to generalize to unseen test data",
                "When the model file size exceeds 10 gigabytes",
                "When training runs faster than expected",
                "When the model refuses to accept new inputs"
              ],
              correctAnswer: 0,
              explanation: "Overfitting occurs when a model memorizes noise and specific details of the training set rather than learning generalized underlying patterns."
            },
            {
              id: "q4",
              question: "What is the primary function of the 'Learning Rate' hyperparameter?",
              options: [
                "It specifies how many minutes a human student should study",
                "It controls the step size taken during gradient descent when updating weights towards the minimum loss",
                "It dictates the language the model speaks",
                "It changes the monitor resolution"
              ],
              correctAnswer: 1,
              explanation: "The learning rate scales how large of a step the optimizer takes in the direction of the negative gradient on each iteration."
            }
          ]
        }
      },
      {
        id: "mod-ai-2",
        title: "Transformer Architecture & Advanced Prompt Engineering",
        order: 2,
        duration: "16:45",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        youtubeId: "wjZofJX0v4U",
        description: "Deep dive into Self-Attention mechanisms, tokenization, positional embeddings, and state-of-the-art prompt design techniques.",
        takeaways: [
          "Understanding Query, Key, and Value matrices in multi-head attention.",
          "Few-shot prompting, Chain-of-Thought (CoT), and ReAct prompting frameworks.",
          "Controlling output determinism with temperature and top-p sampling."
        ],
        resources: [
          { name: "Attention Is All You Need Paper Summary.pdf", size: "1.8 MB" },
          { name: "Prompt Engineering Playbook", url: "#" }
        ],
        quiz: {
          id: "quiz-ai-2",
          title: "Transformers & Prompting Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What breakthrough advantage does the Transformer's Self-Attention mechanism offer over traditional Recurrent Neural Networks (RNNs)?",
              options: [
                "It processes text strictly one word at a time sequentially",
                "It computes relationships between all tokens in a sequence concurrently, enabling massive parallelization and capturing long-range context",
                "It eliminates the need for matrix multiplication",
                "It guarantees 100% factual accuracy in all generated answers"
              ],
              correctAnswer: 1,
              explanation: "Transformers process entire token sequences in parallel using attention weights, overcoming the sequential bottleneck and vanishing gradients of RNNs."
            },
            {
              id: "q2",
              question: "What does setting the `temperature` parameter close to 0.0 do in an LLM API call?",
              options: [
                "Causes the model to output random gibberish",
                "Makes the model's token selection highly deterministic and focused on the highest probability tokens",
                "Cools down the server hardware physically",
                "Limits the prompt length to 10 characters"
              ],
              correctAnswer: 1,
              explanation: "Low temperatures (near 0) sharpen token probabilities, producing consistent, deterministic, and repeatable answers ideal for code or structured tasks."
            },
            {
              id: "q3",
              question: "What is 'Chain-of-Thought' (CoT) prompting?",
              options: [
                "Connecting multiple computers together with cables",
                "Instructing the LLM to write out step-by-step reasoning before stating the final conclusion, dramatically improving complex problem solving",
                "Using blockchain to record chat history",
                "Writing prompts in rhyming poetry"
              ],
              correctAnswer: 1,
              explanation: "CoT encourages the model to generate intermediate reasoning tokens ('Let's think step by step'), allowing it to compute multi-step logical deductions."
            },
            {
              id: "q4",
              question: "What is Retrieval-Augmented Generation (RAG)?",
              options: [
                "Retrying an API call until it succeeds",
                "A technique that retrieves relevant proprietary context from an external knowledge base or vector database and injects it into the prompt before generation",
                "A method for compressing video files",
                "Generating random text strings"
              ],
              correctAnswer: 1,
              explanation: "RAG grounds the LLM in real, up-to-date facts by retrieving relevant document chunks from a vector database and providing them inside the prompt context."
            }
          ]
        }
      },
      {
        id: "mod-ai-3",
        title: "Autonomous AI Agents & Tool Calling Workflows",
        order: 3,
        duration: "18:10",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
        youtubeId: "2xxziIWmaSA",
        description: "Build autonomous agents capable of planning, utilizing external tools via function calling, maintaining memory, and executing multi-step goals.",
        takeaways: [
          "Designing robust Function Calling schemas with JSON schema validation.",
          "Implementing ReAct (Reason + Act) autonomous decision-making loops.",
          "Safety guardrails, human-in-the-loop validation, and rate limit management."
        ],
        resources: [
          { name: "Agent Architecture Blueprints.pdf", size: "2.7 MB" },
          { name: "Full Agent Starter Kit", url: "#" }
        ],
        quiz: {
          id: "quiz-ai-3",
          title: "Autonomous Agents & Tool Calling Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "In an agentic loop, what does the 'Reason + Act' (ReAct) cycle entail?",
              options: [
                "Running an endless loop until the computer runs out of memory",
                "The agent alternates between generating an internal thought/reasoning step, selecting and calling an external tool, observing the result, and iterating until the goal is satisfied",
                "Asking the user to type every single command manually",
                "Translating code between Python and Java"
              ],
              correctAnswer: 1,
              explanation: "ReAct combines reasoning traces with action execution, allowing the model to dynamically formulate plans, use tools, and inspect outputs."
            },
            {
              id: "q2",
              question: "How do LLMs execute 'Function Calling' / 'Tool Calling'?",
              options: [
                "The LLM executes arbitrary machine code directly on your CPU",
                "The LLM outputs structured JSON specifying the tool name and argument values, which the host application parses, securely executes, and feeds back to the model",
                "The LLM sends emails directly to software engineers",
                "The LLM guesses the binary compiled code"
              ],
              correctAnswer: 1,
              explanation: "The LLM does not run the code itself; it outputs structured parameters (JSON) which the host environment securely validates and executes."
            },
            {
              id: "q3",
              question: "Why is 'Human-in-the-Loop' (HITL) approval critical for autonomous agents executing destructive actions?",
              options: [
                "To make the agent run 10x slower",
                "To prevent unintended consequences like unauthorized financial transactions, file deletions, or critical infrastructure alterations",
                "Because computers are not legally allowed to use APIs",
                "It is only required for marketing purposes"
              ],
              correctAnswer: 1,
              explanation: "HITL safeguards systems by requiring human confirmation before high-stakes, irrevocable actions (like deleting databases or executing financial transfers) take place."
            },
            {
              id: "q4",
              question: "What is the primary role of Long-Term Memory in an autonomous agent?",
              options: [
                "Increasing the hard disk storage capacity",
                "Persisting facts, user preferences, and previous interaction context across different conversations beyond the fixed context window limit",
                "Replacing the operating system kernel",
                "Encrypting the user's monitor screen"
              ],
              correctAnswer: 1,
              explanation: "Long-term memory stores vectorized embeddings or key-value insights in persistent databases so agents can recall information across distinct sessions."
            }
          ]
        }
      }
    ]
  },
  {
    id: "prog-cybersecurity",
    title: "Cybersecurity Defense & Ethical Hacking",
    slug: "cybersecurity-defense-ethical-hacking",
    tagline: "Master threat modeling, penetration testing, defensive architecture, and cryptographic protocols.",
    category: "Cybersecurity",
    level: "Intermediate",
    rating: 4.88,
    enrolledCount: 11200,
    duration: "5 Hours",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    instructor: {
      name: "Marcus Vance",
      role: "Certified Information Systems Security Professional",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      bio: "Former Red Team Lead with expertise in adversary emulation, threat hunting, and modern cryptographic defense."
    },
    skills: ["Vulnerability Assessment", "OWASP Top 10", "Network Penetration", "Cryptographic Defense", "Zero Trust"],
    modules: [
      {
        id: "mod-sec-1",
        title: "Network Reconnaissance & Vulnerability Assessment",
        order: 1,
        duration: "11:30",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        youtubeId: "inWWhr5tnEA",
        description: "Learn systematic discovery methodologies, network port scanning, banner grabbing, and Common Vulnerabilities & Exposures (CVE) identification.",
        takeaways: [
          "Differentiating between passive and active reconnaissance.",
          "Using port scanners and protocol analyzers responsibly within legal scope.",
          "Interpreting Common Vulnerability Scoring System (CVSS) severity metrics."
        ],
        resources: [
          { name: "Reconnaissance Methodology Guide.pdf", size: "1.5 MB" },
          { name: "Lab Configuration Files", url: "#" }
        ],
        quiz: {
          id: "quiz-sec-1",
          title: "Reconnaissance & Vulnerability Assessment Quiz",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What is the key difference between passive and active reconnaissance?",
              options: [
                "Passive recon uses WiFi, while active recon uses Ethernet cables",
                "Passive recon gathers intelligence without sending packets directly to the target system, whereas active recon directly probes the target's network infrastructure",
                "Active recon is completely legal without authorization",
                "Passive recon requires installing malware on the target"
              ],
              correctAnswer: 1,
              explanation: "Passive recon relies on publicly accessible records (DNS records, WHOIS, search engines), while active recon interacts directly with target ports and services."
            },
            {
              id: "q2",
              question: "What does a TCP SYN (Stealth) scan do during network discovery?",
              options: [
                "It completes the full three-way handshake and downloads all server files",
                "It sends a SYN packet, waits for a SYN-ACK (indicating open port), and immediately sends a RST packet to tear down the connection before full establishment",
                "It shuts down the target server immediately",
                "It changes the target server's IP address"
              ],
              correctAnswer: 1,
              explanation: "A SYN scan resets the connection before the final ACK, avoiding full session creation in older logging mechanisms while determining if the port is open."
            },
            {
              id: "q3",
              question: "What does a CVSS score of 9.8 indicate about a vulnerability?",
              options: [
                "The vulnerability is cosmetic and low risk",
                "The vulnerability is Critical severity, typically easily exploitable remotely without privileges and causes severe impact",
                "The software has 98 active users",
                "The patch will take 9.8 days to install"
              ],
              correctAnswer: 1,
              explanation: "CVSS scores from 9.0 to 10.0 represent Critical severity vulnerabilities requiring immediate remediation."
            },
            {
              id: "q4",
              question: "Why must ethical hackers always obtain written Authorization / Rules of Engagement before testing?",
              options: [
                "It is just a suggestion that can be skipped",
                "Unauthorized penetration testing is illegal under computer crime statutes (such as the CFAA) and can disrupt vital production services",
                "To get discounts on hacking tools",
                "Because routers stop working without letters"
              ],
              correctAnswer: 1,
              explanation: "Testing without explicit written authorization is unlawful and can lead to severe legal prosecution and unintended service outages."
            }
          ]
        }
      },
      {
        id: "mod-sec-2",
        title: "Web Application Security & OWASP Top 10",
        order: 2,
        duration: "13:50",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        youtubeId: "2_lswM1S264",
        description: "Examine critical web vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), Insecure Direct Object References (IDOR), and CSRF.",
        takeaways: [
          "Mitigating SQL Injection using parameterized queries and prepared statements.",
          "Preventing Cross-Site Scripting (XSS) via context-aware output encoding and strict CSPs.",
          "Implementing robust access control checks to eliminate IDOR flaws."
        ],
        resources: [
          { name: "OWASP Top 10 Defensive Guide.pdf", size: "2.4 MB" },
          { name: "Web Security Checklist", url: "#" }
        ],
        quiz: {
          id: "quiz-sec-2",
          title: "Web Application Security Assessment",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "What is the single most effective defense against SQL Injection vulnerabilities?",
              options: [
                "Filtering out the word 'SELECT' with regex",
                "Using Parameterized Queries / Prepared Statements, which strictly separate SQL code logic from user data",
                "Converting all databases into Excel spreadsheets",
                "Hiding the database behind a firewall without changing code"
              ],
              correctAnswer: 1,
              explanation: "Prepared statements treat user input strictly as literal parameter data, ensuring input can never alter the SQL command structure."
            },
            {
              id: "q2",
              question: "What is Stored Cross-Site Scripting (Stored XSS)?",
              options: [
                "When a malicious script is permanently stored in the target database and executed in the browser of any user viewing the page",
                "When a CSS file is stored in browser cache",
                "A script that runs only on the server CPU",
                "When an image fails to load properly"
              ],
              correctAnswer: 0,
              explanation: "Stored XSS occurs when unvalidated user input is saved in the database and subsequently injected into web pages rendered for other users."
            },
            {
              id: "q3",
              question: "What does an Insecure Direct Object Reference (IDOR) vulnerability allow an attacker to do?",
              options: [
                "Access or modify other users' sensitive records simply by guessing or tampering with an object identifier (e.g. changing `?id=101` to `?id=102`)",
                "Change the font color on the website",
                "Download the browser's source code",
                "Bypass internet service provider billing"
              ],
              correctAnswer: 0,
              explanation: "IDOR occurs when access control checks are missing on server endpoints, allowing users to manipulate identifiers to view unauthorized data."
            },
            {
              id: "q4",
              question: "What header provides fine-grained control over which domains can load scripts, images, and fonts on your website?",
              options: [
                "X-Powered-By",
                "Content-Security-Policy (CSP)",
                "User-Agent",
                "Cache-Control"
              ],
              correctAnswer: 1,
              explanation: "Content-Security-Policy (CSP) is an HTTP response header that restricts resource loading, heavily mitigating XSS and data exfiltration."
            }
          ]
        }
      },
      {
        id: "mod-sec-3",
        title: "Cryptographic Systems & Secure Communication",
        order: 3,
        duration: "15:20",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        youtubeId: "jhXCTbFnK8o",
        description: "Understand asymmetric vs symmetric cryptography, TLS 1.3 handshakes, digital signatures, password hashing algorithms, and Zero Trust architecture.",
        takeaways: [
          "Understanding AES-256-GCM symmetric encryption and RSA/ECC asymmetric key pairs.",
          "Securing passwords using modern salted memory-hard algorithms (Argon2id, bcrypt).",
          "The core pillars of Zero Trust architecture: 'Never Trust, Always Verify'."
        ],
        resources: [
          { name: "Applied Cryptography Handbook.pdf", size: "3.1 MB" },
          { name: "Zero Trust Implementation Framework", url: "#" }
        ],
        quiz: {
          id: "quiz-sec-3",
          title: "Cryptography & Zero Trust Architecture Quiz",
          passingScore: 80,
          questions: [
            {
              id: "q1",
              question: "Why should cryptographic hashes like MD5 and SHA-1 NEVER be used for password storage?",
              options: [
                "They produce outputs that are too long to fit in databases",
                "They are fast and vulnerable to rainbow tables and collision attacks; modern password storage requires slow, memory-hard algorithms like Argon2id or bcrypt with unique salts",
                "They were invented in the 19th century",
                "They only work on Windows operating systems"
              ],
              correctAnswer: 1,
              explanation: "General-purpose hashes can be computed billions of times per second on GPUs. Password hashing requires adaptive, salted algorithms designed to resist brute force."
            },
            {
              id: "q2",
              question: "What is the primary role of a Digital Signature in secure communication?",
              options: [
                "Translating text into cursive handwriting",
                "Providing authenticity, non-repudiation, and data integrity by signing a message hash with the sender's private key",
                "Encrypting the file so only the sender can read it",
                "Compressing the file size by 50%"
              ],
              correctAnswer: 1,
              explanation: "Digital signatures verify that the message genuinely originated from the private key owner and has not been tampered with in transit."
            },
            {
              id: "q3",
              question: "What is the central foundational philosophy of 'Zero Trust' network architecture?",
              options: [
                "Firewalls on the network perimeter are completely sufficient",
                "'Never Trust, Always Verify': Assume breach and continuously authenticate, authorize, and encrypt every request regardless of network location",
                "Do not allow any human users to access servers",
                "Trust any device connected to the internal corporate WiFi"
              ],
              correctAnswer: 1,
              explanation: "Zero Trust removes the concept of an implicit trusted internal perimeter. Every access request must be explicitly verified and authenticated."
            },
            {
              id: "q4",
              question: "In Transport Layer Security (TLS), what is the function of Public Key Certificates (X.509)?",
              options: [
                "Allowing servers to speed up internet connections",
                "Binding a public key to an organization's verified identity via a trusted Certificate Authority (CA), preventing Man-in-the-Middle attacks",
                "Replacing the user's password",
                "Encrypting the computer's motherboard"
              ],
              correctAnswer: 1,
              explanation: "Digital certificates prove the identity of the remote server so the client knows it is communicating with the authentic domain rather than an impostor."
            }
          ]
        }
      }
    ]
  }
];
