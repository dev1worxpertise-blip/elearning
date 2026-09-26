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
        certificates: this.certificates
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      this.notify();
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
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
    this.save();
    this.notify();
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
    if (this.videoStatus[moduleId]) {
      this.videoStatus[moduleId] = {
        percent: 0,
        isFinished: false,
        maxWatchedSeconds: 0
      };
    }
    // Remove from completed modules if quiz wasn't passed
    if (!this.quizResults[moduleId] || !this.quizResults[moduleId].passed) {
      this.completedModules = this.completedModules.filter(id => id !== moduleId);
    }
    this.save();
  }

  recordQuizSubmission(moduleId, score, total, userAnswers = {}) {
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 80;

    this.quizResults[moduleId] = {
      score,
      total,
      percentage,
      passed,
      userAnswers: { ...userAnswers },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    if (passed && !this.completedModules.includes(moduleId)) {
      this.completedModules.push(moduleId);
    }

    this.save();

    // Check if the parent program is now fully completed
    const program = this.getProgramForModule(moduleId);
    if (program && this.isProgramCompleted(program.id)) {
      this.autoIssueCertificate(program.id);
    }

    return { percentage, passed };
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

  getProgramProgress(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return { completed: 0, total: 0, percentage: 0, isComplete: false };
    
    const total = program.modules.length;
    const completed = program.modules.filter(m => this.completedModules.includes(m.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = total > 0 && completed === total;

    return { completed, total, percentage, isComplete };
  }

  isProgramCompleted(programId) {
    return this.getProgramProgress(programId).isComplete;
  }

  autoIssueCertificate(programId) {
    if (this.getCertificate(programId)) return this.getCertificate(programId);

    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return null;

    const certId = "CERT-LP-" + Math.floor(100000 + Math.random() * 900000);
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
      grade: "Distinction (Honors)",
      verificationCode: "LP-" + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    this.certificates.push(certificate);
    this.save();
    return certificate;
  }

  getCertificate(programId) {
    return this.certificates.find(c => c.programId === programId) || null;
  }

  resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
    this.enrolledPrograms = window.COURSES_DATA && window.COURSES_DATA.length > 0 ? [window.COURSES_DATA[0].id] : [];
    this.videoStatus = {};
    this.quizResults = {};
    this.completedModules = [];
    this.certificates = [];
    this.save();
  }
}

// Global singleton instance
window.appState = new AppState();
