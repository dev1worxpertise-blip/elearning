/**
 * LearnPulse E-Learning Platform - State Management & LocalStorage Persistence
 */

const STORAGE_KEY = "learnpulse_state_v1";

class AppState {
  constructor() {
    this.user = {
      name: "Sachin Chauhan",
      email: "sachin@learnpulse.dev",
      role: "Student",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };
    
    // IDs of enrolled programs
    this.enrolledPrograms = [];

    // Current navigation focus
    this.activeProgramId = null;
    this.activeModuleId = null;

    // Video watch statuses: moduleId -> { percent: number, isFinished: boolean }
    this.videoStatus = {};

    // Quiz scores: moduleId -> { score: number, total: number, percentage: number, passed: boolean, date: string }
    this.quizResults = {};

    // Completed module IDs
    this.completedModules = [];

    // Issued certificates: array of certificate objects
    this.certificates = [];

    // Enterprise additions:
    this.playbackPositions = {}; // moduleId -> seconds
    this.videoNotes = {}; // moduleId -> array of notes { id, timestamp, text, createdAt }
    this.discussions = {}; // moduleId -> array of posts { id, userId, userName, userRole, userAvatar, content, createdAt, likes }
    this.xp = 350;
    this.streakDays = 3;
    this.badges = [
      { id: 'b_welcome', name: 'Curious Learner', icon: '🚀', description: 'Started your e-learning journey', unlockedAt: '2026-09-27' },
      { id: 'b_safety', name: 'Compliance Champion', icon: '🛡️', description: 'Enrolled in corporate compliance training', unlockedAt: '2026-09-27' }
    ];
    this.auditLogs = [];
    this.emailLogs = [];

    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) this.user = { ...this.user, ...parsed.user };
        if (Array.isArray(parsed.enrolledPrograms)) this.enrolledPrograms = parsed.enrolledPrograms;
        if (parsed.videoStatus) this.videoStatus = parsed.videoStatus;
        if (parsed.quizResults) this.quizResults = parsed.quizResults;
        if (Array.isArray(parsed.completedModules)) this.completedModules = parsed.completedModules;
        if (Array.isArray(parsed.certificates)) this.certificates = parsed.certificates;
        if (parsed.playbackPositions) this.playbackPositions = parsed.playbackPositions;
        if (parsed.videoNotes) this.videoNotes = parsed.videoNotes;
        if (parsed.discussions) this.discussions = parsed.discussions;
        if (typeof parsed.xp === 'number') this.xp = parsed.xp;
        if (typeof parsed.streakDays === 'number') this.streakDays = parsed.streakDays;
        if (Array.isArray(parsed.badges)) this.badges = parsed.badges;
        if (Array.isArray(parsed.auditLogs)) this.auditLogs = parsed.auditLogs;
        if (Array.isArray(parsed.emailLogs)) this.emailLogs = parsed.emailLogs;
        this.purgeUnearnedCertificates();

        // Auto-reset any previously skipped videos where quiz was not passed
        if (!localStorage.getItem("lp_antiskip_v2")) {
          Object.keys(this.videoStatus).forEach(modId => {
            if (!this.quizResults[modId] || !this.quizResults[modId].passed) {
              this.videoStatus[modId] = { percent: 0, isFinished: false, maxWatchedSeconds: 0 };
            }
          });
          localStorage.setItem("lp_antiskip_v2", "true");
          this.save();
        }
      } else {
        // Pre-enroll in the first program as an interactive welcome demo
        if (window.COURSES_DATA && window.COURSES_DATA.length > 0) {
          this.enrolledPrograms = [window.COURSES_DATA[0].id];
        }
        this.save();
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }

  save() {
    try {
      const payload = {
        user: this.user,
        enrolledPrograms: this.enrolledPrograms,
        videoStatus: this.videoStatus,
        quizResults: this.quizResults,
        completedModules: this.completedModules,
        certificates: this.certificates,
        playbackPositions: this.playbackPositions,
        videoNotes: this.videoNotes,
        discussions: this.discussions,
        xp: this.xp,
        streakDays: this.streakDays,
        badges: this.badges,
        auditLogs: this.auditLogs,
        emailLogs: this.emailLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.notify();
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  saveState() {
    this.save();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (err) { console.error(err); }
    });
  }

  // --- Actions ---

  enrollProgram(programId) {
    if (!this.enrolledPrograms.includes(programId)) {
      this.enrolledPrograms.push(programId);
      this.save();
    }
  }

  isEnrolled(programId) {
    return this.enrolledPrograms.includes(programId);
  }

  updateUserProfile(name, email) {
    if (name) this.user.name = name.trim();
    if (email) this.user.email = email.trim();
    this.save();
  }

  setCurrentUser(user, token = null) {
    if (!user) return;
    this.user = {
      ...this.user,
      id: user.id || this.user.id || 'usr_' + Date.now(),
      name: user.name || this.user.name,
      email: user.email || this.user.email,
      role: (user.role || 'student').toLowerCase(),
      avatar: user.avatar_url || user.avatar || this.user.avatar
    };
    if (token && window.apiService) {
      window.apiService.setToken(token);
    }
    this.purgeUnearnedCertificates();
    this.save();
    this.notify();
  }

  isAdmin() {
    return (this.user.role || '').toLowerCase() === 'admin';
  }

  isInstructor() {
    const r = (this.user.role || '').toLowerCase();
    return r === 'instructor' || r === 'admin';
  }

  isStudent() {
    return (this.user.role || '').toLowerCase() === 'student';
  }

  recordVideoProgress(moduleId, percent, isFinished, maxWatchedSeconds) {
    const current = this.videoStatus[moduleId] || { percent: 0, isFinished: false, maxWatchedSeconds: 0 };
    const newPercent = Math.max(current.percent || 0, Math.min(100, Math.round(percent)));
    const finished = current.isFinished || isFinished === true;
    const updatedMaxSec = Math.max(current.maxWatchedSeconds || 0, maxWatchedSeconds || 0);
    
    this.videoStatus[moduleId] = {
      percent: finished ? 100 : newPercent,
      isFinished: finished,
      maxWatchedSeconds: updatedMaxSec
    };
    this.save();
  }

  isVideoFinished(moduleId) {
    return !!(this.videoStatus[moduleId] && this.videoStatus[moduleId].isFinished);
  }

  getVideoPercent(moduleId) {
    return this.videoStatus[moduleId] ? this.videoStatus[moduleId].percent : 0;
  }

  getMaxWatchedSeconds(moduleId) {
    return (this.videoStatus[moduleId] && this.videoStatus[moduleId].maxWatchedSeconds) || 0;
  }

  resetVideoProgress(moduleId) {
    this.videoStatus[moduleId] = {
      percent: 0,
      isFinished: false,
      maxWatchedSeconds: 0
    };
    if (this.playbackPositions) {
      delete this.playbackPositions[moduleId];
    }
    delete this.quizResults[moduleId];
    this.completedModules = this.completedModules.filter(id => id !== moduleId);
    this.save();
  }

  recordQuizSubmission(moduleId, score, total, userAnswers = {}) {
    const percentage = Math.round((score / total) * 100);
    const program = this.getProgramForModule(moduleId);
    const requiredPassingScore = (program && (program.passingScore || program.passing_score)) || 80;
    const passed = percentage >= requiredPassingScore;

    this.quizResults[moduleId] = {
      score,
      total,
      percentage,
      passed,
      requiredPassingScore,
      userAnswers: { ...userAnswers },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    if (passed && !this.completedModules.includes(moduleId)) {
      this.completedModules.push(moduleId);
    } else if (!passed && this.completedModules.includes(moduleId)) {
      // If retaken and failed, remove from completed
      this.completedModules = this.completedModules.filter(id => id !== moduleId);
    }

    this.save();

    // Check if the parent program is now fully completed
    if (program && this.isProgramCompleted(program.id)) {
      this.autoIssueCertificate(program.id);
    }

    return { percentage, passed, requiredPassingScore };
  }

  getQuizResult(moduleId) {
    return this.quizResults[moduleId] || null;
  }

  isModuleCompleted(moduleId) {
    return this.completedModules.includes(moduleId);
  }

  getProgramForModule(moduleId) {
    if (!window.COURSES_DATA) return null;
    return window.COURSES_DATA.find(p => p.modules.some(m => m.id === moduleId));
  }

  getProgramPassingScore(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    return (program && (program.passingScore || program.passing_score)) || 80;
  }

  getProgramProgress(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return { completed: 0, total: 0, percentage: 0, isComplete: false, passingScore: 80, averageScore: 0 };
    
    const passingScore = program.passingScore || program.passing_score || 80;
    const total = program.modules.length;
    
    // Filter modules that are in completedModules AND meet the course passing threshold
    const completedModulesList = program.modules.filter(m => {
      if (!this.completedModules.includes(m.id)) return false;
      const qRes = this.quizResults[m.id];
      return !qRes || qRes.percentage >= passingScore;
    });

    const completed = completedModulesList.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const scores = program.modules.map(m => this.quizResults[m.id]?.percentage).filter(s => s !== undefined);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const isComplete = total > 0 && completed === total && (scores.length === 0 || averageScore >= passingScore);

    return { completed, total, percentage, isComplete, passingScore, averageScore };
  }

  isProgramCompleted(programId) {
    return this.getProgramProgress(programId).isComplete;
  }

  autoIssueCertificate(programId) {
    // In student mode, strict academic gate: ALL lessons in the course must be 100% complete!
    if (this.isStudent() && !this.isProgramCompleted(programId)) {
      console.warn(`[AppState] Cannot issue certificate for program ${programId}: course is not 100% completed.`);
      return null;
    }

    if (this.getCertificate(programId)) return this.getCertificate(programId);

    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return null;

    const certId = "CERT-LP-" + Math.floor(100000 + Math.random() * 900000);
    const progress = this.getProgramProgress(programId);
    const avg = progress.averageScore || 100;
    const reqPassing = progress.passingScore || 80;
    let honors = "Conferred with Distinction";
    if (avg >= 95) honors = "High Honors & Academic Excellence";
    else if (avg >= 90) honors = "Conferred with Honors";
    else honors = "Certified Professional";
    const grade = `${honors} (${avg}% • Min Required: ${reqPassing}%)`;

    const certificate = {
      id: "cert_" + Date.now(),
      credentialId: certId,
      programId: program.id,
      programTitle: program.title,
      studentName: this.user.name,
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      instructor: program.instructor.name,
      instructorRole: program.instructor.role,
      authorityName: (program.authority && program.authority.name) || "Prof. Arthur Sterling",
      authorityRole: (program.authority && program.authority.role) || "Dean of Technology",
      authorityTitle: (program.authority && program.authority.title) || "Academic Board",
      grade,
      score: avg,
      passingScore: reqPassing,
      verificationCode: "LP-" + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    this.certificates.push(certificate);
    this.save();
    return certificate;
  }

  getCertificate(programId) {
    if (this.isStudent() && !this.isProgramCompleted(programId)) {
      return null;
    }
    return (this.certificates || []).find(c => c.programId === programId) || null;
  }

  getValidCertificates() {
    if (this.isStudent()) {
      return (this.certificates || []).filter(c => this.isProgramCompleted(c.programId));
    }
    return this.certificates || [];
  }

  purgeUnearnedCertificates() {
    if (this.isStudent()) {
      const beforeCount = (this.certificates || []).length;
      this.certificates = (this.certificates || []).filter(c => this.isProgramCompleted(c.programId));
      if (this.certificates.length !== beforeCount) {
        this.save();
      }
    }
  }

  // --- Video Position Memory ---
  saveVideoPosition(moduleId, seconds) {
    if (!moduleId) return;
    this.playbackPositions[moduleId] = Math.round(seconds);
    this.save();
  }

  getVideoPosition(moduleId) {
    return this.playbackPositions[moduleId] || 0;
  }

  // --- Timestamped Learner Notes ---
  getVideoNotes(moduleId) {
    return this.videoNotes[moduleId] || [];
  }

  addVideoNote(moduleId, timestamp, text) {
    if (!this.videoNotes[moduleId]) this.videoNotes[moduleId] = [];
    const sec = Math.round(parseFloat(timestamp) || 0);
    const cleanText = (typeof text === 'string' ? text : (text?.text || text?.content || '')).trim();

    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: sec,
      timestamp_seconds: sec,
      time: sec,
      text: cleanText,
      content: cleanText,
      note: cleanText,
      note_text: cleanText,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    };
    this.videoNotes[moduleId].unshift(newNote);
    this.save();
    return newNote;
  }

  deleteVideoNote(moduleId, noteId) {
    if (!this.videoNotes[moduleId]) return;
    this.videoNotes[moduleId] = this.videoNotes[moduleId].filter(n => n.id !== noteId);
    this.save();
  }

  // --- Module Discussions & Q&A ---
  // --- Module Discussions & Q&A ---
  getDiscussions(moduleId) {
    if (!this.discussions[moduleId]) {
      const isPosh = moduleId.includes("posh") || moduleId.includes("mod-1");
      this.discussions[moduleId] = [
        {
          id: 'disc_seed_q1_' + moduleId,
          userId: 'usr_student_sachin',
          userName: 'Sachin Chauhan',
          author_name: 'Sachin Chauhan',
          userRole: 'student',
          role: 'student',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          content: isPosh 
            ? 'Does the POSH Act apply to remote workers or employees working from home (WFH)?' 
            : 'How does this architecture handle distributed failovers during network partition?',
          createdAt: '1 day ago',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          likes: 4,
          replies: [
            {
              id: 'reply_seed_a1_' + moduleId,
              userId: 'usr_instructor_rajesh',
              userName: 'Dr. Rajesh Sharma',
              author_name: 'Dr. Rajesh Sharma',
              userRole: 'instructor',
              userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              content: isPosh 
                ? 'Yes, absolutely! Under Section 2(o) of the POSH Act, "workplace" is defined comprehensively. Any place visited or used by the employee arising out of or in the course of employment—including home workstations, video calls, Slack/Teams chats, and company emails—is strictly under the jurisdiction of the Internal Committee.' 
                : 'Excellent question! Consensus nodes use the Raft protocol with quorum-based lease renewal to elect a new leader within 150ms of heartbeat loss.',
              createdAt: '18 hours ago',
              created_at: new Date(Date.now() - 64800000).toISOString(),
              isFacultyAnswer: true
            }
          ]
        },
        {
          id: 'disc_seed_welcome_' + moduleId,
          userId: 'usr_instructor_1',
          userName: 'Dr. Sarah Chen',
          author_name: 'Dr. Sarah Chen',
          userRole: 'instructor',
          role: 'instructor',
          userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
          content: 'Welcome everyone! Feel free to ask questions about this lesson or share your real-world observations. Faculty actively monitors this thread.',
          createdAt: '2 days ago',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          likes: 12,
          replies: []
        }
      ];
    }
    return this.discussions[moduleId];
  }

  addDiscussion(moduleId, data) {
    if (!this.discussions[moduleId]) {
      this.discussions[moduleId] = [];
    }

    let text = '';
    let authorName = (this.user && this.user.name) || 'Sachin Chauhan';
    let authorRole = (this.user && this.user.role) || 'student';
    let authorAvatar = (this.user && this.user.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    if (typeof data === 'string') {
      text = data.trim();
    } else if (data && typeof data === 'object') {
      text = (data.content || data.text || '').trim();
      if (data.author_name || data.userName) authorName = data.author_name || data.userName;
      if (data.role || data.userRole) authorRole = data.role || data.userRole;
      if (data.userAvatar || data.avatar_url) authorAvatar = data.userAvatar || data.avatar_url;
    }

    if (!text) return null;

    const newPost = {
      id: 'disc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: (this.user && this.user.id) || 'usr_current',
      userName: authorName,
      author_name: authorName,
      userRole: authorRole.toLowerCase(),
      role: authorRole.toLowerCase(),
      userAvatar: authorAvatar,
      avatar_url: authorAvatar,
      content: text,
      createdAt: 'Just now',
      created_at: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    // Prepend to show immediately at top of discussion thread
    this.discussions[moduleId].unshift(newPost);
    this.addXP(10, 'Community Q&A Discussion Post');
    this.logAudit('LEARNER_QUESTION_POSTED', moduleId, { author: authorName, question: text });
    this.save();
    return newPost;
  }

  addDiscussionReply(moduleId, discussionId, data) {
    const list = this.getDiscussions(moduleId);
    const post = list.find(p => p.id === discussionId);
    if (!post) return null;

    if (!Array.isArray(post.replies)) {
      post.replies = [];
    }

    let text = '';
    let authorName = (this.user && this.user.name) || 'Dr. Rajesh Sharma';
    let authorRole = (this.user && this.user.role) || 'instructor';
    let authorAvatar = (this.user && this.user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

    if (typeof data === 'string') {
      text = data.trim();
    } else if (data && typeof data === 'object') {
      text = (data.content || data.text || '').trim();
      if (data.author_name || data.userName) authorName = data.author_name || data.userName;
      if (data.role || data.userRole) authorRole = data.role || data.userRole;
      if (data.userAvatar || data.avatar_url) authorAvatar = data.userAvatar || data.avatar_url;
    }

    if (!text) return null;

    const isFaculty = authorRole.toLowerCase() === 'instructor' || authorRole.toLowerCase() === 'admin' || authorRole.toLowerCase() === 'faculty';

    const newReply = {
      id: 'reply_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: (this.user && this.user.id) || 'usr_current',
      userName: authorName,
      author_name: authorName,
      userRole: authorRole.toLowerCase(),
      userAvatar: authorAvatar,
      content: text,
      createdAt: 'Just now',
      created_at: new Date().toISOString(),
      isFacultyAnswer: isFaculty
    };

    post.replies.push(newReply);
    this.addXP(isFaculty ? 25 : 15, isFaculty ? 'Faculty Q&A Resolution' : 'Discussion Reply');
    this.logAudit(isFaculty ? 'INSTRUCTOR_QA_ANSWER_POSTED' : 'COMMUNITY_QA_REPLY_POSTED', discussionId, {
      author: authorName,
      role: authorRole,
      isFacultyAnswer: isFaculty,
      moduleId
    });

    // Automated Notification to learner that faculty answered
    this.logEmail(
      post.userEmail || 'student@learnpulse.dev',
      `🎓 Faculty Answered Your Question: "${post.content.substring(0, 45)}..."`,
      'FACULTY_QA_RESPONSE',
      {
        question: post.content,
        facultyAnswer: text,
        answeredBy: authorName,
        moduleId
      }
    );

    this.save();
    return newReply;
  }

  likeDiscussion(moduleId, postId) {
    const list = this.getDiscussions(moduleId);
    const post = list.find(p => p.id === postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.save();
    }
  }

  getAllDiscussions() {
    const all = [];
    const courses = window.COURSES_DATA || [];
    
    courses.forEach(prog => {
      (prog.modules || []).forEach(mod => {
        const posts = this.getDiscussions(mod.id);
        posts.forEach(p => {
          all.push({
            ...p,
            moduleId: mod.id,
            moduleTitle: mod.title,
            programId: prog.id,
            programTitle: prog.title
          });
        });
      });
    });

    return all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  // --- Gamification Engine ---
  addXP(amount, reason = 'Activity', streakIncrement = false) {
    this.xp = (this.xp || 0) + amount;
    if (streakIncrement) {
      this.streakDays = (this.streakDays || 1) + 1;
    }
    this.checkBadges();
    this.save();
    if (window.app && window.app.showToast) {
      window.app.showToast(`⚡ +${amount} XP Earned! (${reason})`, 'info');
    }
    if (window.apiService && window.apiService.awardXP) {
      window.apiService.awardXP(amount, reason, streakIncrement).catch(() => {});
    }
  }

  getLearnerStats() {
    const level = Math.floor((this.xp || 0) / 250) + 1;
    const progressInLevel = (this.xp || 0) % 250;
    const levelPercentage = Math.round((progressInLevel / 250) * 100);
    return {
      xp: this.xp || 0,
      level,
      levelPercentage,
      streakDays: this.streakDays || 3,
      badges: this.badges || []
    };
  }

  checkBadges() {
    if (!this.badges) this.badges = [];
    const certCount = (this.certificates || []).length;
    if (certCount >= 1 && !this.badges.some(b => b.id === 'b_first_cert')) {
      this.badges.push({
        id: 'b_first_cert',
        name: 'Certified Professional',
        icon: '🎓',
        description: 'Earned your first official verified credential',
        unlockedAt: new Date().toISOString().split('T')[0]
      });
      if (window.app && window.app.showToast) {
        window.app.showToast('🏆 Badge Unlocked: Certified Professional!', 'success');
      }
    }
    if ((this.xp || 0) >= 500 && !this.badges.some(b => b.id === 'b_master')) {
      this.badges.push({
        id: 'b_master',
        name: 'Knowledge Seeker',
        icon: '⚡',
        description: 'Accumulated over 500 Knowledge XP',
        unlockedAt: new Date().toISOString().split('T')[0]
      });
    }
  }

  // --- Audit Trail & Security Activity Logging ---
  logAudit(action, target, details, severity = 'INFO') {
    const entry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      user: this.user ? `${this.user.name} (${this.user.role})` : 'System',
      action,
      target: target || 'Platform',
      details: details || '',
      severity
    };
    if (!this.auditLogs) this.auditLogs = [];
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.save();
    if (window.apiService && window.apiService.logAudit) {
      window.apiService.logAudit(action, target, details, severity).catch(() => {});
    }
    return entry;
  }

  getAuditLogs() {
    return this.auditLogs || [];
  }

  // --- Automated Email & Notification Logging ---
  logEmail(recipient, subject, emailType, details) {
    const entry = {
      id: 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      recipient,
      subject,
      emailType,
      status: 'DELIVERED (Simulated)',
      details
    };
    if (!this.emailLogs) this.emailLogs = [];
    this.emailLogs.unshift(entry);
    if (this.emailLogs.length > 100) this.emailLogs.pop();
    this.save();
    if (window.apiService && window.apiService.dispatchEmail) {
      window.apiService.dispatchEmail(recipient, subject, emailType, details).catch(() => {});
    }
    return entry;
  }

  getEmailLogs() {
    return this.emailLogs || [];
  }

  // --- SMTP & Notification Gateway Configuration ---
  getSmtpConfig() {
    const saved = localStorage.getItem("lp_smtp_gateway_config");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      is_live_mode: false,
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      username: "notifications@worxpertise.com",
      password: "",
      sender_name: "Worxpertise Academy",
      sender_email: "noreply@worxpertise.com",
      webhook_url: "",
      notify_on_cert: true,
      notify_on_reminder: true,
      notify_on_lockout: true,
      notify_on_qa: true
    };
  }

  saveSmtpConfig(config) {
    localStorage.setItem("lp_smtp_gateway_config", JSON.stringify(config));
    this.logAudit("SMTP_GATEWAY_CONFIG_UPDATED", "System Settings", {
      host: config.host,
      port: config.port,
      is_live_mode: config.is_live_mode,
      webhook_active: !!config.webhook_url
    });
    if (window.apiService && window.apiService.saveSmtpSettings) {
      window.apiService.saveSmtpSettings(config).catch(() => {});
    }
    return config;
  }

  resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("lp_antiskip_v2");
    this.enrolledPrograms = window.COURSES_DATA && window.COURSES_DATA.length > 0 ? [window.COURSES_DATA[0].id] : [];
    this.videoStatus = {};
    this.quizResults = {};
    this.completedModules = [];
    this.certificates = [];
    this.playbackPositions = {};
    this.videoNotes = {};
    this.discussions = {};
    this.xp = 0;
    this.streakDays = 1;
    this.auditLogs = [];
    this.emailLogs = [];
    this.save();
  }
}

// Global singleton instance
window.appState = new AppState();
