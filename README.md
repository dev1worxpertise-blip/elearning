# Worxpertise Academy - Video-Based E-Learning & Certification Platform

A modern, comprehensive, video-driven e-learning platform where learners can enroll in industry-accredited programs, watch structured video lessons with completion tracking, complete interactive post-video Q&A assessments, and generate official, verifiable certificates.

![Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Zero-Dependency](https://img.shields.io/badge/Dependencies-Zero%20Setup-blue)
![Format](https://img.shields.io/badge/Certificate-High--Res%20PNG%20%2B%20PDF-gold)

---

## 🌟 Key Features

1. **Program Catalog & 1-Click Enrollment**
   - Filter programs by category (Web Development, Artificial Intelligence, Cybersecurity).
   - Search by program title, topic, or target skills.
   - Comprehensive syllabus view detailing modules, duration, and assessment requirements.

2. **Video-Based Learning Player**
   - High-definition HTML5 video playback with custom controls, scrubbing, and speed adjustment (0.75x, 1x, 1.25x, 1.5x, 2x).
   - **Video Completion Gate**: Post-video assessment remains securely locked until the video lesson is completed.
   - **Test Mode**: Includes an *"Instant Complete (Test Mode)"* button for rapid evaluation of quizzes and certificate generation without waiting for long videos.

3. **Interactive Post-Video Q&A Engine**
   - Step-by-step card-based quiz with progress indicator.
   - Instant scoring against an 80% passing threshold.
   - Comprehensive feedback with question-by-question review, selected answers, and conceptual explanations.
   - Unlimited retries if the passing criteria is not initially met.

4. **Digital Certificate Studio & Export**
   - Automatically issued when all modules in a program are completed and passed.
   - Verified Credential ID, issue timestamp, verification hash, and honors grade.
   - **1-Click High-Res PNG Export**: Renders a 1600×1100 ultra-crisp certificate using HTML5 Canvas.
   - **Print to PDF**: Built-in `@media print` layout for saving clean, high-resolution PDFs.
   - Real-time recipient name editor for personalization.

5. **Student Learning Dashboard**
   - Central hub displaying active enrollments, completed lessons count, quiz average, and certificate count.
   - Resume learning button returning directly to the next incomplete module.

6. **Zero-Setup Offline Persistence**
   - All enrolled programs, video watch positions, quiz scores, and issued certificates persist in `localStorage`.

---

## 🚀 Getting Started

### Method 1: Double-Click Launcher (Windows)
Double-click `start.bat` in the `C:\Users\sachin.chauhan\Downloads\elearning` folder. It will open the application immediately in your default browser.

### Method 2: Open Directly in Any Web Browser
Right-click `index.html` and select **Open with Google Chrome**, **Microsoft Edge**, or **Firefox**.

---

## 📁 Project Architecture

```
C:\Users\sachin.chauhan\Downloads\elearning\
├── index.html                   # Central Single Page Application shell
├── start.bat                    # One-click Windows launcher
├── package.json                 # Project configuration
├── README.md                    # Platform documentation
├── css/
│   └── styles.css               # Dark theme, glassmorphism, quiz cards & certificate styling
└── js/
    ├── data.js                  # Preloaded curriculum, modules, video streams & quiz questions
    ├── state.js                 # State manager & localStorage persistence layer
    ├── player.js                # Video player controller & watch-time completion gate
    ├── quiz.js                  # Post-video interactive Q&A assessment engine
    ├── certificate.js           # Certificate rendering, canvas PNG export & PDF printing
    └── app.js                   # Application coordinator, routing, modals & toast alerts
```

---

## 🎓 Included Programs & Modules

1. **Full-Stack Web Development Mastery** (Dr. Sarah Chen)
   - Module 1: Modern Frontend Architecture & Component Systems
   - Module 2: RESTful & GraphQL API Design with Node.js
   - Module 3: Cloud Deployment, Containers & CI/CD Pipelines
2. **Mastering Artificial Intelligence & LLMs** (Alex Rivera)
   - Module 1: Deep Learning Foundations & Neural Networks
   - Module 2: Transformer Architecture & Advanced Prompt Engineering
   - Module 3: Autonomous AI Agents & Tool Calling Workflows
3. **Cybersecurity Defense & Ethical Hacking** (Marcus Vance)
   - Module 1: Network Reconnaissance & Vulnerability Assessment
   - Module 2: Web Application Security & OWASP Top 10
   - Module 3: Cryptographic Systems & Secure Communication

---

## 🛠 Adding New Courses

To add new programs or modules, edit [js/data.js](file:///C:/Users/sachin.chauhan/Downloads/elearning/js/data.js). Follow the schema:
```javascript
{
  id: "prog-my-course",
  title: "Course Title",
  category: "Web Development",
  duration: "4 Hours",
  thumbnail: "https://...",
  instructor: { name: "Instructor Name", role: "Title", avatar: "https://..." },
  skills: ["Skill 1", "Skill 2"],
  modules: [
    {
      id: "mod-1",
      title: "Module 1 Title",
      duration: "10:00",
      videoUrl: "https://...mp4",
      description: "Description",
      takeaways: ["Takeaway 1", "Takeaway 2"],
      resources: [{ name: "Resource.pdf", size: "1 MB" }],
      quiz: {
        id: "quiz-1",
        title: "Module Quiz",
        passingScore: 80,
        questions: [
          {
            id: "q1",
            question: "Question text?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1, // index of correct option
            explanation: "Detailed reason why Option B is correct."
          }
        ]
      }
    }
  ]
}
```
