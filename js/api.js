/**
 * LearnPulse API Client Service
 * Connects frontend to the PostgreSQL Express backend with automatic fallback.
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('worxpertise_jwt_token') || localStorage.getItem('learnpulse_jwt_token') || null;
    this.isBackendOnline = false;
    this.init();
  }

  init() {
    this.checkHealth();

    // Auto-poll health every 3s if offline, every 20s if online
    setInterval(() => {
      this.checkHealth();
    }, 3000);

    // Interactive status badge click to test
    const setupBadgeClick = () => {
      const badge = document.getElementById('backendStatusBadge');
      if (badge && !badge.dataset.bound) {
        badge.dataset.bound = 'true';
        badge.style.cursor = 'pointer';
        badge.title = 'Click to test PostgreSQL connection';
        badge.addEventListener('click', async () => {
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span class="text-[10px] text-amber-300 font-medium">Testing DB...</span>`;
          await this.checkHealth();
          if (window.app && window.app.showToast) {
            if (this.isBackendOnline) {
              window.app.showToast('✅ PostgreSQL Backend is Online & Connected!', 'success');
            } else {
              window.app.showToast('⚠️ Backend not reachable. Running in Standalone Mode. Double-click start.bat to launch backend.', 'info');
            }
          }
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupBadgeClick);
    } else {
      setupBadgeClick();
    }
  }

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const wasOffline = !this.isBackendOnline;
        this.isBackendOnline = true;
        this.notifyStatus(true);
        if (wasOffline) {
          console.log('✅ Connected to Worxpertise PostgreSQL Backend API');
        }
      } else {
        this.isBackendOnline = false;
        this.notifyStatus(false);
      }
    } catch (e) {
      this.isBackendOnline = false;
      this.notifyStatus(false);
    }
  }

  notifyStatus(online) {
    const badge = document.getElementById('backendStatusBadge');
    if (badge) {
      badge.innerHTML = online 
        ? `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="text-[10px] text-emerald-400 font-bold">PostgreSQL Connected</span>`
        : `<span class="w-2 h-2 rounded-full bg-slate-500"></span><span class="text-[10px] text-slate-400 font-medium">Standalone Mode</span>`;
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('learnpulse_jwt_token', token);
    } else {
      localStorage.removeItem('learnpulse_jwt_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Auth APIs
  async register(name, email, password, role = 'student') {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (data.success && data.token) this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.token) this.setToken(data.token);
    return data;
  }

  async getMe() {
    if (!this.token) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: this.getHeaders() });
    return res.json();
  }

  async switchPersona(persona) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/persona-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona }),
      });
      const data = await res.json();
      if (data && data.success && data.token) {
        this.setToken(data.token);
        return data;
      }
    } catch (e) {
      console.warn('Persona token fetch notice:', e);
    }
    return null;
  }

  // Programs APIs
  async getPrograms(category, search) {
    let url = `${API_BASE_URL}/programs?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return res.json();
  }

  async getProgramDetails(programId) {
    const res = await fetch(`${API_BASE_URL}/programs/${programId}`, { headers: this.getHeaders() });
    return res.json();
  }

  async enroll(programId) {
    const res = await fetch(`${API_BASE_URL}/programs/enroll`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ programId }),
    });
    return res.json();
  }

  // Video Progress & Quiz APIs
  async updateVideoProgress(moduleId, percent, isFinished) {
    if (!this.isBackendOnline || !this.token) return null;
    const res = await fetch(`${API_BASE_URL}/progress/video`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ moduleId, percent, isFinished }),
    });
    return res.json();
  }

  async submitQuiz(moduleId, answers) {
    const res = await fetch(`${API_BASE_URL}/progress/quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ moduleId, answers }),
    });
    return res.json();
  }

  // Certificates APIs
  async getUserCertificates() {
    const res = await fetch(`${API_BASE_URL}/certificates`, { headers: this.getHeaders() });
    return res.json();
  }

  async verifyCertificate(credentialId) {
    const res = await fetch(`${API_BASE_URL}/certificates/verify/${credentialId}`);
    return res.json();
  }

  // Instructor APIs
  async createProgram(payload) {
    const res = await fetch(`${API_BASE_URL}/instructor/programs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async addModule(programId, payload) {
    const res = await fetch(`${API_BASE_URL}/instructor/programs/${programId}/modules`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async createQuiz(moduleId, payload) {
    const res = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}/quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async updateProgram(programId, payload) {
    const res = await fetch(`${API_BASE_URL}/instructor/programs/${programId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async deleteProgram(programId) {
    const res = await fetch(`${API_BASE_URL}/instructor/programs/${programId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async updateModule(moduleId, payload) {
    const res = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async deleteModule(moduleId) {
    const res = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // User Management & Role Assignment APIs
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, { headers: this.getHeaders() });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('API get users failed, falling back to local user store:', e);
      return null;
    }
  }

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  }

  async toggleUserBlock(userId, isBlocked) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ isBlocked }),
    });
    return res.json();
  }

  async resetUserPassword(userId, newPassword) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return res.json();
  }

  async createUser(payload) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- Enterprise Audit & Activity Trail ---
  async getAuditLogs(action = 'all', limit = 100) {
    const res = await fetch(`${API_BASE_URL}/enterprise/audit-logs?action=${encodeURIComponent(action)}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async logAudit(action, target, details, severity = 'INFO') {
    const res = await fetch(`${API_BASE_URL}/enterprise/audit-logs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, target, details, severity }),
    });
    return res.json();
  }

  // --- Community Q&A & Module Discussions ---
  async getDiscussions(moduleId) {
    const res = await fetch(`${API_BASE_URL}/enterprise/discussions/${moduleId}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async postDiscussion(moduleId, content) {
    const res = await fetch(`${API_BASE_URL}/enterprise/discussions/${moduleId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });
    return res.json();
  }

  async likeDiscussion(postId) {
    const res = await fetch(`${API_BASE_URL}/enterprise/discussions/like/${postId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- Learner Video Notes ---
  async getVideoNotes(moduleId) {
    const res = await fetch(`${API_BASE_URL}/enterprise/notes/${moduleId}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async saveVideoNote(moduleId, timestamp, text) {
    const res = await fetch(`${API_BASE_URL}/enterprise/notes/${moduleId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ timestamp, text }),
    });
    return res.json();
  }

  async deleteVideoNote(noteId) {
    const res = await fetch(`${API_BASE_URL}/enterprise/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- Bulk CSV User Import ---
  async bulkImportUsers(users, mandatoryProgramId = null) {
    const res = await fetch(`${API_BASE_URL}/enterprise/bulk-import`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ users, mandatoryProgramId }),
    });
    return res.json();
  }

  // --- Gamification & Leaderboard ---
  async getLeaderboard() {
    const res = await fetch(`${API_BASE_URL}/enterprise/leaderboard`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async awardXP(xp, reason, streakIncrement = false) {
    const res = await fetch(`${API_BASE_URL}/enterprise/award-xp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ xp, reason, streakIncrement }),
    });
    return res.json();
  }

  // --- Email & Notification Dispatches ---
  async getEmailDispatches() {
    const res = await fetch(`${API_BASE_URL}/enterprise/email-dispatches`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async dispatchEmail(recipient, subject, emailType, details) {
    const res = await fetch(`${API_BASE_URL}/enterprise/email-dispatches`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ recipient, subject, emailType, details }),
    });
    return res.json();
  }
}

window.apiService = new ApiService();
