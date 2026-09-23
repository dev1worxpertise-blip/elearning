# Worxpertise Academy - Video-Based E-Learning & Certification Platform

A modern, enterprise-grade, video-driven e-learning platform branded for **Worxpertise Academy** (`#dd1f36` crimson, `#9744cc` purple). Learners can enroll in accredited programs, stream structured video lessons, pass interactive post-video assessments, and generate official, verifiable certificates. Instructors and administrators can publish, edit, and manage programs and lessons directly with real-time **PostgreSQL** database synchronization.

[![GitHub Repo](https://img.shields.io/badge/GitHub-dev1worxpertise--blip%2Felearning-blue?logo=github)](https://github.com/dev1worxpertise-blip/elearning.git)
![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)
![Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Certificate](https://img.shields.io/badge/Certificate-High--Res%20PNG%20%2B%20PDF-gold)

---

## 🌟 Key Features

### 1. Program Catalog & 1-Click Enrollment
- Categorized by Web Development, Artificial Intelligence, Cybersecurity, Cloud, and DevOps.
- Instant search filter by program title, topic, or required skillset.
- Detailed syllabus breakdown detailing module durations, video streaming sources, and quiz requirements.

### 2. Video Player & Watch Completion Gate
- Custom video playback controls with scrubbing and speed multipliers (0.75x, 1x, 1.25x, 1.5x, 2x).
- **Completion Gate**: Post-video quiz remains securely locked until the video is finished.
- **Instant Test Mode**: Rapid evaluation button for testing quizzes and certificates without waiting for long videos.

### 3. Interactive Post-Video Q&A Assessment
- Card-based interactive quiz engine with instant scoring against an 80% passing threshold.
- Question-by-question review with answer explanations reinforcing the lesson's core concepts.
- Unlimited retries with immediate feedback.

### 4. Instructor & Admin Studio (Course & Lesson Authoring & Editing)
- **Publish Programs**: Create new programs with custom title, tagline, category, difficulty, duration, thumbnail, and skills.
- **Edit Programs**: Click `✏️ Edit Course` under *My Courses* to update course details; changes persist to PostgreSQL.
- **Video Lesson Management**: Add and edit video lessons (MP4/WebM direct URLs, YouTube fallback, descriptions, and takeaways).
- **Interactive Quiz Authoring**: Add, edit, or remove assessment questions and explanations per lesson.
- **Delete Management**: Delete courses or individual lessons with clean database cascade.

### 5. Verifiable Digital Certificate Studio
- Automatically issued upon completing 100% of video lessons and passing all module quizzes.
- Unique Credential ID, issue timestamp, verification hash, and honors grade.
- **1-Click High-Res PNG Export**: Renders a crisp 1600×1100 certificate using HTML5 Canvas.
- **Print to PDF**: Built-in `@media print` layout for saving high-resolution PDFs.
- Live recipient name customization.

### 6. PostgreSQL Backend & Resilient Fallback
- Connected to PostgreSQL database `elearning_db` running on port 5432.
- Express REST API running on port 5000 with auto-reconnecting heartbeat.
- Dual-layer persistence: Seamlessly functions with PostgreSQL online or in standalone mode with LocalStorage.

---

## 🚀 Getting Started

### Windows One-Click Launcher
Double-click `start.bat` in the project folder. It will:
1. Verify if port 5000 is running; if not, automatically launches the Node.js backend.
2. Verify PostgreSQL database connection (`elearning_db`).
3. Open `index.html` in your default browser.

```cmd
start.bat
```

### Manual Start

1. **Start the API Server**:
   ```cmd
   cd server
   node server.js
   ```

2. **Open the Platform**:
   Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 📁 Repository Structure

```
elearning/
├── index.html                           # Single Page Application frontend
├── start.bat                            # Windows auto-launch script
├── package.json                         # Client metadata
├── README.md                            # Documentation
├── css/
│   └── styles.css                       # Worxpertise styling, glassmorphism & certificates
├── js/
│   ├── api.js                           # REST API client & DB health status polling
│   ├── app.js                           # Application coordinator, routing & toasts
│   ├── certificate.js                   # Certificate rendering, canvas PNG export & PDF
│   ├── data.js                          # Curriculum data & default courses
│   ├── instructor.js                    # Instructor studio: course & quiz authoring/editing
│   ├── player.js                        # Video player controller & completion gate
│   ├── quiz.js                          # Post-video assessment engine
│   └── state.js                         # State manager & localStorage persistence
├── database/
│   ├── schema.sql                       # PostgreSQL database DDL schema
│   └── seed.sql                         # Initial course & user seed data
└── server/
    ├── .env                             # Database connection credentials
    ├── server.js                        # Express server entry point (Port 5000)
    └── src/
        ├── controllers/                 # Route controllers (programs, modules, quiz, auth)
        ├── db/                          # pg pool configuration
        ├── middleware/                  # JWT auth & error handlers
        └── routes/                      # REST API routes
```

---

## 🔗 GitHub Repository

- **Repository**: [https://github.com/dev1worxpertise-blip/elearning.git](https://github.com/dev1worxpertise-blip/elearning.git)
- **Branch**: `main`
