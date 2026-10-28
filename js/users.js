/**
 * LearnPulse / Worxpertise - User Management & Role Assignment Studio
 * Enables Administrators to:
 * 1. View all users, roles, and security statuses
 * 2. Assign and switch roles on the fly (Student <-> Instructor <-> Admin)
 * 3. Detect accounts locked by 3 failed password attempts and 1-click Unlock/Reset them
 * 4. Reset user passwords directly from the panel
 * 5. Add new users with assigned roles
 * 6. Export user roster to Excel
 */

class UserManager {
  constructor() {
    this.users = [];
    this.activeFilter = "all"; // "all" | "student" | "instructor" | "admin" | "locked"
    this.courseFilter = "all"; // "all" | "completed_any" | "completed:<progId>" | "enrolled_any" | "enrolled:<progId>" | "not_enrolled:<progId>" | "no_courses"
    this.searchQuery = "";
    this.selectedUserIds = new Set();
    this.assignModalTargetUserIds = [];
    this.bulkMode = "new"; // "new" | "existing"
    this.pendingImportUsers = [];
    this.pendingEmails = [];
    this.isLoading = false;

    // Seeded fallback users if standalone offline
    this.fallbackUsers = [
      {
        id: "usr_admin_master",
        name: "System Administrator",
        email: "admin@learnpulse.dev",
        role: "admin",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T10:00:00.000Z",
        enrollments: [
          { program_id: "prog-posh-compliance", program_title: "POSH: Prevention of Sexual Harassment", is_completed: true }
        ]
      },
      {
        id: "usr_instructor_1",
        name: "Dr. Sarah Chen",
        email: "sarah.chen@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z",
        enrollments: []
      },
      {
        id: "usr_instructor_2",
        name: "Alex Rivera",
        email: "alex.rivera@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z",
        enrollments: []
      },
      {
        id: "usr_instructor_3",
        name: "Marcus Vance",
        email: "marcus.vance@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z",
        enrollments: []
      },
      {
        id: "usr_instructor_4",
        name: "Advocate Ananya Deshmukh",
        email: "ananya.deshmukh@worxpertise.com",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-23T16:18:28.466Z",
        enrollments: []
      },
      {
        id: "usr_student_sachin",
        name: "Sachin Chauhan",
        email: "sachin@learnpulse.dev",
        role: "student",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z",
        enrollments: [
          { program_id: "prog-posh-compliance", program_title: "POSH: Prevention of Sexual Harassment", is_completed: true }
        ]
      }
    ];
  }

  async init() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.isLoading = true;
    try {
      if (window.apiService && window.apiService.getUsers) {
        const res = await window.apiService.getUsers();
        if (res && res.success && Array.isArray(res.users)) {
          this.users = res.users.map(u => {
            const enrollments = Array.isArray(u.enrollments) ? u.enrollments : [];
            // Merge with local state if this user is active
            if (window.appState && (u.id === window.appState.user.id || u.email === window.appState.user.email)) {
              (window.appState.enrolledPrograms || []).forEach(pId => {
                if (!enrollments.some(e => e.program_id === pId)) {
                  const progObj = (window.COURSES_DATA || []).find(c => c.id === pId);
                  const isCompleted = (window.appState.certificates || []).some(c => (c.programId || c.program_id) === pId);
                  enrollments.push({
                    program_id: pId,
                    program_title: progObj ? progObj.title : pId,
                    is_completed: isCompleted,
                    enrolled_at: new Date().toISOString()
                  });
                }
              });
            }
            return { ...u, enrollments };
          });
          // Store in localStorage for offline availability
          localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));
          this.isLoading = false;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch users from backend, using cache or fallback.', e);
    }

    const cached = localStorage.getItem('worxpertise_cached_users');
    if (cached) {
      try {
        this.users = JSON.parse(cached);
      } catch (e) {
        this.users = [...this.fallbackUsers];
      }
    } else {
      this.users = [...this.fallbackUsers];
    }
    this.isLoading = false;
  }

  async render() {
    const container = document.getElementById("viewUsers");
    if (!container) return;

    // Refresh user list from backend
    await this.loadUsers();

    const totalCount = this.users.length;
    const studentCount = this.users.filter(u => u.role === "student").length;
    const instructorCount = this.users.filter(u => u.role === "instructor").length;
    const adminCount = this.users.filter(u => u.role === "admin").length;
    const lockedCount = this.users.filter(u => u.is_blocked || u.failed_login_attempts >= 3).length;

    // Filter users according to role tab
    let filtered = [...this.users];
    if (this.activeFilter === "student") filtered = filtered.filter(u => u.role === "student");
    else if (this.activeFilter === "instructor") filtered = filtered.filter(u => u.role === "instructor");
    else if (this.activeFilter === "admin") filtered = filtered.filter(u => u.role === "admin");
    else if (this.activeFilter === "locked") filtered = filtered.filter(u => u.is_blocked || u.failed_login_attempts >= 3);

    // Filter by Course & Completion Status (Case 1)
    if (this.courseFilter && this.courseFilter !== "all") {
      if (this.courseFilter === "completed_any") {
        filtered = filtered.filter(u => (u.enrollments || []).some(e => e.is_completed));
      } else if (this.courseFilter.startsWith("completed:")) {
        const progId = this.courseFilter.replace("completed:", "");
        filtered = filtered.filter(u => (u.enrollments || []).some(e => e.program_id === progId && e.is_completed));
      } else if (this.courseFilter === "enrolled_any") {
        filtered = filtered.filter(u => (u.enrollments || []).length > 0);
      } else if (this.courseFilter === "no_courses") {
        filtered = filtered.filter(u => !u.enrollments || u.enrollments.length === 0);
      } else if (this.courseFilter.startsWith("enrolled:")) {
        const progId = this.courseFilter.replace("enrolled:", "");
        filtered = filtered.filter(u => (u.enrollments || []).some(e => e.program_id === progId));
      } else if (this.courseFilter.startsWith("not_enrolled:")) {
        const progId = this.courseFilter.replace("not_enrolled:", "");
        filtered = filtered.filter(u => !(u.enrollments || []).some(e => e.program_id === progId));
      }
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    }

    const allFilteredSelected = filtered.length > 0 && filtered.every(u => this.selectedUserIds.has(u.id));

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#1b121e] to-slate-900 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-2xl">
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                👑 Admin Control Center
              </span>
              <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live PostgreSQL Sync
              </span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Enterprise User Directory & Course Assignment
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Manage platform members, assign single or bulk courses (<span class="text-purple-300 font-bold">Case 1: Assign Second Course to Existing Completers</span>), toggle system roles, unlock accounts blocked by 3 failed attempts, and export audit rosters.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button 
              id="btnOpenAssignCourseModal"
              onclick="window.userManager.openAssignCourseModal()"
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center space-x-2 cursor-pointer"
              title="Assign a course to selected users or filter"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>📚 Assign Course to Users</span>
            </button>
            <button 
              id="btnOpenBulkImportModal"
              onclick="window.userManager.openBulkImportModal()"
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/40 transition flex items-center space-x-2 cursor-pointer"
              title="Bulk import hundreds of employees via CSV with auto-enrollment"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <span>📁 Bulk CSV Import</span>
            </button>
            <button 
              id="btnOpenAddUserModal"
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              <span>+ Add User</span>
            </button>
            <button 
              id="btnExportUsersExcel"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center space-x-2 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Export Roster</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Total Users -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</div>
          <div class="mt-1 text-2xl font-black text-white">${totalCount}</div>
          <div class="mt-1 text-[11px] text-slate-500">Platform Accounts</div>
        </div>

        <!-- Students -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/30 shadow-md">
          <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Students / Learners</div>
          <div class="mt-1 text-2xl font-black text-emerald-300">${studentCount}</div>
          <div class="mt-1 text-[11px] text-emerald-500/80">Active Trainees</div>
        </div>

        <!-- Instructors -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/30 shadow-md">
          <div class="text-[10px] font-bold uppercase tracking-wider text-[#dd1f36]">Instructors / Faculty</div>
          <div class="mt-1 text-2xl font-black text-rose-300">${instructorCount}</div>
          <div class="mt-1 text-[11px] text-rose-500/80">Curriculum Creators</div>
        </div>

        <!-- Administrators -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/30 shadow-md">
          <div class="text-[10px] font-bold uppercase tracking-wider text-purple-400">System Admins</div>
          <div class="mt-1 text-2xl font-black text-purple-300">${adminCount}</div>
          <div class="mt-1 text-[11px] text-purple-500/80">Super / Institutional</div>
        </div>

        <!-- Locked / Blocked Accounts -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border ${lockedCount > 0 ? 'border-amber-500/60 bg-amber-950/20' : 'border-slate-800'} shadow-md">
          <div class="text-[10px] font-bold uppercase tracking-wider ${lockedCount > 0 ? 'text-amber-400 font-black' : 'text-slate-400'} flex items-center justify-between">
            <span>Locked Accounts</span>
            ${lockedCount > 0 ? '<span class="animate-pulse">🔒 ALERT</span>' : ''}
          </div>
          <div class="mt-1 text-2xl font-black ${lockedCount > 0 ? 'text-amber-400' : 'text-slate-400'}">${lockedCount}</div>
          <div class="mt-1 text-[11px] ${lockedCount > 0 ? 'text-amber-400' : 'text-slate-500'}">
            ${lockedCount > 0 ? '3 Wrong Password Lockouts' : 'Zero Lockouts'}
          </div>
        </div>
      </div>

      <!-- Action & Filter Toolbar -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button 
            data-user-filter="all" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            All (${totalCount})
          </button>
          <button 
            data-user-filter="student" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Students (${studentCount})
          </button>
          <button 
            data-user-filter="instructor" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'instructor' ? 'bg-[#dd1f36] text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Instructors (${instructorCount})
          </button>
          <button 
            data-user-filter="admin" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Admins (${adminCount})
          </button>
          <button 
            data-user-filter="locked" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'locked' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'} flex items-center space-x-1"
          >
            <span>🔒 Locked</span>
            ${lockedCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">${lockedCount}</span>` : ''}
          </button>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Course & Completion Filter Dropdown (Case 1) -->
          <div class="relative">
            <select 
              id="userCourseFilterSelect"
              class="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="all" ${this.courseFilter === 'all' ? 'selected' : ''}>🌐 All Courses & Statuses</option>
              <optgroup label="✓ Filter by Completed Course (Case 1)">
                <option value="completed_any" ${this.courseFilter === 'completed_any' ? 'selected' : ''}>✓ Completed Any Course</option>
                ${(window.COURSES_DATA || []).map(c => `
                  <option value="completed:${c.id}" ${this.courseFilter === `completed:${c.id}` ? 'selected' : ''}>
                    ✓ Completed: ${c.title.split('(')[0].replace(/^(POSH|GDPR):\s*/, '').trim()}
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="📚 Filter by Enrolled Course">
                <option value="enrolled_any" ${this.courseFilter === 'enrolled_any' ? 'selected' : ''}>📚 Enrolled in Any Course</option>
                <option value="no_courses" ${this.courseFilter === 'no_courses' ? 'selected' : ''}>❌ No Courses Enrolled</option>
                ${(window.COURSES_DATA || []).map(c => `
                  <option value="enrolled:${c.id}" ${this.courseFilter === `enrolled:${c.id}` ? 'selected' : ''}>
                    📚 Enrolled: ${c.title.split('(')[0].replace(/^(POSH|GDPR):\s*/, '').trim()}
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="🔍 Needs Course (Not Enrolled)">
                ${(window.COURSES_DATA || []).map(c => `
                  <option value="not_enrolled:${c.id}" ${this.courseFilter === `not_enrolled:${c.id}` ? 'selected' : ''}>
                    Needs: ${c.title.split('(')[0].replace(/^(POSH|GDPR):\s*/, '').trim()}
                  </option>
                `).join('')}
              </optgroup>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              id="userSearchInput" 
              value="${this.searchQuery}"
              placeholder="Search user, email, id..." 
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>
      </div>

      <!-- Users Roster Table -->
      <div class="overflow-x-auto overflow-y-auto max-h-[72vh] custom-scrollbar rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950/95 backdrop-blur-md sticky top-0 z-20 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-3 py-4 w-10 text-center">
                <input 
                  type="checkbox" 
                  id="userSelectAllHeader" 
                  ${allFilteredSelected ? 'checked' : ''}
                  class="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 cursor-pointer"
                  title="Select / Deselect all visible users"
                />
              </th>
              <th class="px-4 py-4">User / Identity</th>
              <th class="px-4 py-4">Assigned Role</th>
              <th class="px-4 py-4">Enrolled Curricula & Badges</th>
              <th class="px-4 py-4">Security / Status</th>
              <th class="px-4 py-4">Created</th>
              <th class="px-5 py-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                  <div class="text-3xl mb-2">🔍</div>
                  <div class="font-bold text-sm text-slate-400">No users found matching current filter</div>
                  <div class="text-xs text-slate-500 mt-1">Try switching tabs, clearing search query, or resetting the course filter.</div>
                </td>
              </tr>
            ` : filtered.map(user => {
              const isLocked = user.is_blocked || (user.failed_login_attempts >= 3);
              const isSelected = this.selectedUserIds.has(user.id);
              const roleColor = user.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : (user.role === 'instructor' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40');

              const createdFormatted = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                year: 'numeric', month: 'short', day: 'numeric'
              }) : 'N/A';

              const enrollments = Array.isArray(user.enrollments) ? user.enrollments : [];

              return `
                <tr class="hover:bg-slate-800/40 transition ${isSelected ? 'bg-purple-950/20' : ''}">
                  <!-- Select Checkbox -->
                  <td class="px-3 py-4 text-center">
                    <input 
                      type="checkbox" 
                      data-user-checkbox="${user.id}"
                      ${isSelected ? 'checked' : ''}
                      class="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-700 cursor-pointer"
                    />
                  </td>

                  <!-- User identity -->
                  <td class="px-4 py-4">
                    <div class="flex items-center space-x-3">
                      <img 
                        src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}" 
                        alt="${user.name}" 
                        class="w-9 h-9 rounded-full border ${isLocked ? 'border-amber-500' : 'border-slate-700'} object-cover"
                      />
                      <div>
                        <div class="font-bold text-white text-sm flex items-center space-x-1.5">
                          <span>${user.name}</span>
                          ${user.email === 'admin@learnpulse.dev' ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-extrabold border border-purple-700">SUPER</span>' : ''}
                        </div>
                        <div class="text-slate-400 font-medium text-[11px]">${user.email}</div>
                        <div class="text-[9px] text-slate-500 font-mono">${user.id}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Role Dropdown -->
                  <td class="px-4 py-4">
                    <div class="flex items-center space-x-2">
                      <div class="relative">
                        <select 
                          data-role-selector="${user.id}"
                          class="appearance-none pl-2.5 pr-7 py-1 rounded-xl text-xs font-extrabold ${roleColor} border bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-pointer"
                        >
                          <option value="student" ${user.role === 'student' ? 'selected' : ''}>🎓 Student</option>
                          <option value="instructor" ${user.role === 'instructor' ? 'selected' : ''}>👨‍🏫 Faculty</option>
                          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Enrolled Curricula & Badges -->
                  <td class="px-4 py-4">
                    <div class="space-y-1.5">
                      ${enrollments.length > 0 ? `
                        <div class="flex flex-wrap gap-1 max-w-xs">
                          ${enrollments.map(e => {
                            const isDone = !!e.is_completed;
                            const shortTitle = (e.program_title || e.program_id).split('(')[0].replace(/^(POSH|GDPR):\s*/, '').trim();
                            return isDone ? `
                              <span title="${e.program_title} (Completed - Certificate Issued)" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <span>✓</span>
                                <span class="truncate max-w-[120px]">${shortTitle}</span>
                              </span>
                            ` : `
                              <span title="${e.program_title} (Active - In Progress)" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <span>⏳</span>
                                <span class="truncate max-w-[120px]">${shortTitle}</span>
                              </span>
                            `;
                          }).join('')}
                        </div>
                      ` : `
                        <div class="text-[10px] text-slate-500 italic">No courses enrolled</div>
                      `}
                      <button 
                        data-btn-assign-row="${user.id}"
                        class="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer"
                        title="Assign a course to this user"
                      >
                        <span>+ Assign Course</span>
                      </button>
                    </div>
                  </td>

                  <!-- Security / Lockout Status -->
                  <td class="px-4 py-4">
                    ${isLocked ? `
                      <div class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                        <span>🔒 LOCKED</span>
                      </div>
                      <div class="text-[9px] text-rose-400 mt-0.5 font-medium">3 Failed Attempts</div>
                    ` : `
                      <div class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active</span>
                      </div>
                      ${user.failed_login_attempts > 0 ? `
                        <div class="text-[9px] text-amber-400 mt-0.5 font-medium">${user.failed_login_attempts} failed</div>
                      ` : `
                        <div class="text-[9px] text-slate-500 mt-0.5">Platform access</div>
                      `}
                    `}
                  </td>

                  <!-- Created Date -->
                  <td class="px-4 py-4 text-slate-400 font-medium text-[11px]">
                    ${createdFormatted}
                  </td>

                  <!-- Admin Actions -->
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end space-x-1.5">
                      <button 
                        data-btn-assign-row="${user.id}"
                        title="Assign another course to this user"
                        class="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 font-bold text-[11px] border border-purple-700/60 transition flex items-center space-x-1 cursor-pointer"
                      >
                        <span>📚 Assign</span>
                      </button>

                      ${isLocked ? `
                        <button 
                          data-btn-unlock="${user.id}"
                          title="Unblock account and reset failed password attempts"
                          class="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-md transition flex items-center space-x-1 cursor-pointer"
                        >
                          <span>🔓 Unlock</span>
                        </button>
                      ` : `
                        <button 
                          data-btn-lock="${user.id}"
                          title="Manually lock/suspend this user account"
                          class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-900/60 text-slate-300 hover:text-amber-300 font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
                        >
                          <span>🔒 Lock</span>
                        </button>
                      `}

                      <button 
                        data-btn-reset-pw="${user.id}"
                        title="Set a new password for this user"
                        class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-300 font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
                      >
                        <span>🔑 PW</span>
                      </button>

                      ${user.email !== 'admin@learnpulse.dev' ? `
                        <button 
                          data-btn-delete="${user.id}"
                          title="Remove user account"
                          class="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <!-- Floating Bulk Action Toolbar (When 1+ users selected) -->
      ${this.selectedUserIds.size > 0 ? `
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-purple-500/80 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-xl flex items-center space-x-3.5 animate-bounce-short">
          <div class="flex items-center space-x-2 border-r border-slate-700 pr-3.5">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
            <span class="text-xs font-black text-white whitespace-nowrap"><span id="bulkSelectedCount">${this.selectedUserIds.size}</span> Users Selected</span>
          </div>
          <button 
            id="btnFloatingBulkAssign"
            onclick="window.userManager.openAssignCourseModal()"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-900/40 cursor-pointer whitespace-nowrap"
          >
            <span>📚 Assign Course to Selected (${this.selectedUserIds.size})</span>
          </button>
          <button 
            onclick="window.userManager.exportSelectedUsersExcel()"
            class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer whitespace-nowrap"
          >
            <span>Export Selected</span>
          </button>
          <button 
            onclick="window.userManager.deselectAllUsers()"
            class="px-2.5 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <span>✕ Clear</span>
          </button>
        </div>
      ` : ''}
    `;

    this.bindEvents(filtered);
  }

  bindEvents(filteredList = []) {
    const container = document.getElementById("viewUsers");
    if (!container) return;

    // Filter Buttons
    container.querySelectorAll("[data-user-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeFilter = btn.getAttribute("data-user-filter");
        this.render();
      });
    });

    // Course Filter Dropdown Change
    const courseFilterSelect = container.querySelector("#userCourseFilterSelect");
    if (courseFilterSelect) {
      courseFilterSelect.addEventListener("change", (e) => {
        this.courseFilter = e.target.value;
        this.render();
      });
    }

    // Search Input
    const searchInput = container.querySelector("#userSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Header Select All Checkbox
    const headerCheck = container.querySelector("#userSelectAllHeader");
    if (headerCheck) {
      headerCheck.addEventListener("change", (e) => {
        const checked = e.target.checked;
        if (checked) {
          filteredList.forEach(u => this.selectedUserIds.add(u.id));
        } else {
          filteredList.forEach(u => this.selectedUserIds.delete(u.id));
        }
        this.render();
      });
    }

    // Row Checkboxes
    container.querySelectorAll("[data-user-checkbox]").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const uid = cb.getAttribute("data-user-checkbox");
        if (e.target.checked) {
          this.selectedUserIds.add(uid);
        } else {
          this.selectedUserIds.delete(uid);
        }
        this.render();
      });
    });

    // Assign Course Row Button
    container.querySelectorAll("[data-btn-assign-row]").forEach(btn => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-btn-assign-row");
        this.openAssignCourseModal([uid]);
      });
    });

    // Role Dropdown Change
    container.querySelectorAll("[data-role-selector]").forEach(select => {
      select.addEventListener("change", async (e) => {
        const userId = select.getAttribute("data-role-selector");
        const newRole = e.target.value;
        await this.handleRoleChange(userId, newRole);
      });
    });

    // Unlock Account Button
    container.querySelectorAll("[data-btn-unlock]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-btn-unlock");
        await this.handleToggleBlock(userId, false);
      });
    });

    // Lock Account Button
    container.querySelectorAll("[data-btn-lock]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-btn-lock");
        await this.handleToggleBlock(userId, true);
      });
    });

    // Reset Password Button
    container.querySelectorAll("[data-btn-reset-pw]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-btn-reset-pw");
        await this.handleResetPassword(userId);
      });
    });

    // Delete User Button
    container.querySelectorAll("[data-btn-delete]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.getAttribute("data-btn-delete");
        await this.handleDeleteUser(userId);
      });
    });

    // Add User Modal Button
    const btnOpenAdd = container.querySelector("#btnOpenAddUserModal");
    if (btnOpenAdd) {
      btnOpenAdd.addEventListener("click", () => {
        this.openAddUserModal();
      });
    }

    // Export Excel Button
    const btnExport = container.querySelector("#btnExportUsersExcel");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        this.exportUsersExcel();
      });
    }
  }

  async handleRoleChange(userId, newRole) {
    const user = this.users.find(u => u.id === userId);
    const userName = user ? user.name : "User";

    try {
      if (window.apiService && window.apiService.updateUserRole) {
        const res = await window.apiService.updateUserRole(userId, newRole);
        if (res && res.success) {
          if (window.app && window.app.showToast) {
            window.app.showToast(`✅ ${res.message}`, "success");
          }
        }
      }

      // Update local state
      if (user) {
        user.role = newRole;
      }

      // If active current user role changed, sync state
      if (window.appState && window.appState.user && (window.appState.user.id === userId || window.appState.user.email === (user && user.email))) {
        window.appState.setCurrentUser({ ...window.appState.user, role: newRole });
      }

      if (window.appState && typeof window.appState.logAudit === "function") {
        window.appState.logAudit("USER_ROLE_CHANGED", userName, { userId, newRole });
      }

      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));
      this.render();
    } catch (e) {
      console.error('Role update failed:', e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Role update failed: ${e.message}`, "error");
      }
    }
  }

  async handleToggleBlock(userId, isBlocked) {
    const user = this.users.find(u => u.id === userId);
    const userName = user ? user.name : "User";

    try {
      if (window.apiService && window.apiService.toggleUserBlock) {
        const res = await window.apiService.toggleUserBlock(userId, isBlocked);
        if (res && res.success) {
          if (window.app && window.app.showToast) {
            window.app.showToast(`✅ ${res.message}`, "success");
          }
        }
      }

      // Log to enterprise audit trail
      if (window.appState && typeof window.appState.logAudit === "function") {
        window.appState.logAudit(isBlocked ? "ACCOUNT_LOCKED" : "ACCOUNT_UNBLOCKED", userName, { userId, isBlocked });
      }

      // Dispatch alert email if account locked
      if (isBlocked && window.appState && typeof window.appState.logEmail === "function") {
        window.appState.logEmail(
          user ? user.email : "user@company.com",
          "ACCOUNT_LOCKED",
          "⚠️ Security Alert: Worxpertise Academy Account Locked",
          { userName, reason: "3 Consecutive Failed Password Attempts" }
        );
      }

      // Update local cache
      if (user) {
        user.is_blocked = isBlocked;
        user.failed_login_attempts = isBlocked ? 3 : 0;
      }
      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));
      this.render();
    } catch (e) {
      console.error('Toggle block failed:', e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Status update failed: ${e.message}`, "error");
      }
    }
  }

  async handleResetPassword(userId) {
    const user = this.users.find(u => u.id === userId);
    const userName = user ? user.name : "User";
    const newPass = prompt(`Enter new password for ${user ? user.name : 'user'} (Minimum 4 characters):`, "Pass@1234");
    if (!newPass || newPass.trim().length < 4) {
      if (newPass !== null && window.app && window.app.showToast) {
        window.app.showToast("Password must be at least 4 characters long.", "warning");
      }
      return;
    }

    try {
      if (window.apiService && window.apiService.resetUserPassword) {
        const res = await window.apiService.resetUserPassword(userId, newPass.trim());
        if (res && res.success) {
          if (window.app && window.app.showToast) {
            window.app.showToast(`🔑 ${res.message}`, "success");
          }
        }
      }

      // Log to audit trail
      if (window.appState && typeof window.appState.logAudit === "function") {
        window.appState.logAudit("USER_PASSWORD_RESET", userName, { userId });
      }

      if (user) {
        user.is_blocked = false;
        user.failed_login_attempts = 0;
      }
      this.render();
    } catch (e) {
      console.error('Password reset failed:', e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Password reset failed: ${e.message}`, "error");
      }
    }
  }

  async handleDeleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!confirm(`Are you sure you want to permanently delete user "${user ? user.name : userId}"?`)) {
      return;
    }

    try {
      if (window.apiService && window.apiService.deleteUser) {
        const res = await window.apiService.deleteUser(userId);
        if (res && res.success) {
          if (window.app && window.app.showToast) {
            window.app.showToast("User account deleted successfully.", "info");
          }
        }
      }

      this.users = this.users.filter(u => u.id !== userId);
      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));
      this.render();
    } catch (e) {
      console.error('User delete failed:', e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`User delete failed: ${e.message}`, "error");
      }
    }
  }

  openAddUserModal() {
    let modal = document.getElementById("addUserModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "addUserModal";
      modal.className = "fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="relative bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center space-x-2">
            <span class="text-xl">➕</span>
            <h3 class="text-lg font-black text-white">Create New Platform User</h3>
          </div>
          <button id="btnCloseAddUserModal" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <form id="addUserForm" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
            <input 
              type="text" 
              id="newUserName" 
              required 
              placeholder="e.g. Priya Sharma" 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              id="newUserEmail" 
              required 
              placeholder="e.g. priya.sharma@worxpertise.com" 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Password</label>
            <input 
              type="password" 
              id="newUserPassword" 
              required 
              placeholder="••••••••" 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assign System Role</label>
            <select 
              id="newUserRole" 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="student">🎓 Student / Learner</option>
              <option value="instructor">👨‍🏫 Instructor / Faculty</option>
              <option value="admin">👑 Administrator</option>
            </select>
          </div>

          <div class="pt-2 flex items-center justify-end space-x-3">
            <button 
              type="button" 
              id="btnCancelAddUser" 
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove("hidden");

    // Close handlers
    const closeModal = () => modal.classList.add("hidden");
    modal.querySelector("#btnCloseAddUserModal").addEventListener("click", closeModal);
    modal.querySelector("#btnCancelAddUser").addEventListener("click", closeModal);

    // Form submit
    modal.querySelector("#addUserForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = modal.querySelector("#newUserName").value.trim();
      const email = modal.querySelector("#newUserEmail").value.trim();
      const password = modal.querySelector("#newUserPassword").value;
      const role = modal.querySelector("#newUserRole").value;

      try {
        if (window.apiService && window.apiService.createUser) {
          const res = await window.apiService.createUser({ name, email, password, role });
          if (res && res.success) {
            if (window.app && window.app.showToast) {
              window.app.showToast(`✅ ${res.message}`, "success");
            }
          } else if (res && !res.success) {
            alert(res.message || "Failed to create user.");
            return;
          }
        }
        closeModal();
        await this.render();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }

  exportUsersExcel() {
    if (typeof XLSX === "undefined") {
      alert("Excel export library is loading, please try again in a moment.");
      return;
    }

    const data = this.users.map((u, idx) => ({
      "S.No": idx + 1,
      "User ID": u.id,
      "Full Name": u.name,
      "Email Address": u.email,
      "Platform Role": (u.role || "student").toUpperCase(),
      "Account Security Status": u.is_blocked ? "LOCKED (3 Wrong Password Attempts)" : "ACTIVE",
      "Failed Password Attempts": u.failed_login_attempts || 0,
      "Account Created Date": u.created_at ? new Date(u.created_at).toLocaleString() : "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Directory");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Worxpertise_User_Directory_Roster_${dateStr}.xlsx`);

    if (window.app && window.app.showToast) {
      window.app.showToast("📊 Users Roster exported to Excel successfully!", "success");
    }
  }

  // --- SELECTION & BULK ACTIONS ---
  deselectAllUsers() {
    this.selectedUserIds.clear();
    this.render();
  }

  exportSelectedUsersExcel() {
    if (this.selectedUserIds.size === 0) {
      if (window.app && window.app.showToast) window.app.showToast("No users selected to export.", "warning");
      return;
    }
    const selected = this.users.filter(u => this.selectedUserIds.has(u.id));
    this.exportUsersListExcel(selected, "Selected_Users_Export");
  }

  exportUsersListExcel(userList, filePrefix = "Worxpertise_User_Directory_Roster") {
    if (typeof XLSX === "undefined") {
      alert("Excel export library is loading, please try again in a moment.");
      return;
    }

    const data = userList.map((u, idx) => {
      const enrolledStr = (u.enrollments || []).map(e => `${e.program_title || e.program_id} (${e.is_completed ? 'Completed' : 'In Progress'})`).join("; ");
      return {
        "S.No": idx + 1,
        "User ID": u.id,
        "Full Name": u.name,
        "Email Address": u.email,
        "Platform Role": (u.role || "student").toUpperCase(),
        "Enrolled Curricula": enrolledStr || "None",
        "Account Security Status": u.is_blocked ? "LOCKED (3 Wrong Password Attempts)" : "ACTIVE",
        "Failed Password Attempts": u.failed_login_attempts || 0,
        "Account Created Date": u.created_at ? new Date(u.created_at).toLocaleString() : "N/A"
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Directory");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `${filePrefix}_${dateStr}.xlsx`);

    if (window.app && window.app.showToast) {
      window.app.showToast(`📊 Exported ${userList.length} user record(s) to Excel successfully!`, "success");
    }
  }

  // --- MODAL: ASSIGN COURSE TO USERS (SINGLE OR BULK - CASE 1) ---
  openAssignCourseModal(targetUserIds = null) {
    if (targetUserIds && Array.isArray(targetUserIds)) {
      this.assignModalTargetUserIds = targetUserIds;
    } else if (typeof targetUserIds === "string") {
      this.assignModalTargetUserIds = [targetUserIds];
    } else {
      this.assignModalTargetUserIds = Array.from(this.selectedUserIds);
    }

    if (this.assignModalTargetUserIds.length === 0) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Please select at least 1 user from the list first.", "warning");
      }
      return;
    }

    const modal = document.getElementById("assignCourseModal");
    if (!modal) return;

    // Populate course selector
    const select = document.getElementById("assignModalCourseSelect");
    if (select) {
      select.innerHTML = (window.COURSES_DATA || []).map(c => `
        <option value="${c.id}">
          ${c.title} (${c.category || 'General'})
        </option>
      `).join("");
    }

    // Populate recipient chips
    const countBadge = document.getElementById("assignModalUserCountBadge");
    if (countBadge) {
      countBadge.textContent = `${this.assignModalTargetUserIds.length} User(s) Selected`;
    }

    const userListBox = document.getElementById("assignModalUserList");
    if (userListBox) {
      const selectedUsers = this.users.filter(u => this.assignModalTargetUserIds.includes(u.id));
      userListBox.innerHTML = selectedUsers.map(u => `
        <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white">
          <span class="w-2 h-2 rounded-full bg-purple-400"></span>
          <span class="font-bold">${u.name}</span>
          <span class="text-[10px] text-slate-400 font-mono">(${u.email})</span>
        </span>
      `).join("");
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  closeAssignCourseModal() {
    const modal = document.getElementById("assignCourseModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    this.assignModalTargetUserIds = [];
  }

  async executeAssignCourseModal() {
    const courseSelect = document.getElementById("assignModalCourseSelect");
    const programId = courseSelect ? courseSelect.value : null;
    if (!programId) {
      if (window.app && window.app.showToast) window.app.showToast("Please select a course to assign.", "warning");
      return;
    }

    const progObj = (window.COURSES_DATA || []).find(c => c.id === programId);
    const courseTitle = progObj ? progObj.title : programId;

    const notifyCheck = document.getElementById("assignModalNotifyCheck");
    const notifyEmail = notifyCheck ? notifyCheck.checked : true;

    const userIds = [...this.assignModalTargetUserIds];
    if (userIds.length === 0) return;

    const btn = document.getElementById("btnConfirmAssignCourse");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳ Assigning to ${userIds.length} users...</span>`;
    }

    try {
      let enrolledCount = userIds.length;
      let alreadyEnrolledCount = 0;

      if (window.apiService && window.apiService.bulkEnrollUsers) {
        try {
          const res = await window.apiService.bulkEnrollUsers({
            userIds,
            programId,
            notifyEmail
          });
          if (res && res.success) {
            enrolledCount = res.newlyEnrolledCount !== undefined ? res.newlyEnrolledCount : userIds.length;
            alreadyEnrolledCount = res.alreadyEnrolledCount || 0;
          }
        } catch (apiErr) {
          console.warn("Backend bulk-enroll fallback to client state:", apiErr);
        }
      }

      // Update local state and cached users
      userIds.forEach(uid => {
        const u = this.users.find(usr => usr.id === uid);
        if (u) {
          u.enrollments = u.enrollments || [];
          if (!u.enrollments.some(e => e.program_id === programId)) {
            u.enrollments.push({
              program_id: programId,
              program_title: courseTitle,
              is_completed: false,
              enrolled_at: new Date().toISOString()
            });
          }
        }

        // If this user is the active logged-in user in window.appState, enroll them
        if (window.appState && window.appState.user && (window.appState.user.id === uid || (u && window.appState.user.email === u.email))) {
          window.appState.enrollProgram(programId);
        }
      });

      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));

      // Record enterprise audit log
      if (window.appState && typeof window.appState.logAudit === "function") {
        window.appState.logAudit("BULK_COURSE_ASSIGNED", courseTitle, {
          courseId: programId,
          assignedCount: enrolledCount,
          alreadyEnrolledCount,
          userIds
        });
      }

      this.closeAssignCourseModal();
      this.selectedUserIds.clear();
      await this.render();

      if (window.app && window.app.showToast) {
        window.app.showToast(`🎉 Successfully assigned "${courseTitle}" to ${enrolledCount} user(s)! ${alreadyEnrolledCount > 0 ? `(${alreadyEnrolledCount} already enrolled).` : ''}`, "success");
      }
    } catch (err) {
      console.error("Execute assign course error:", err);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Course assignment failed: ${err.message}`, "error");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🚀 Assign Course Now</span>`;
      }
    }
  }

  // --- DUAL-MODE BULK USER IMPORT VIA CSV / EMAIL LIST ---
  openBulkImportModal() {
    const modal = document.getElementById("bulkImportModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // Populate course selector in modal
    const courseSelect = document.getElementById("bulkImportCourseSelect");
    if (courseSelect) {
      courseSelect.innerHTML = (window.COURSES_DATA || []).map(c => `
        <option value="${c.id}" ${c.category === 'Corporate Compliance' || c.title.includes('POSH') ? 'selected' : ''}>
          ${c.title} (${c.category || 'Curriculum'})
        </option>
      `).join("");
    }

    const countBadge = document.getElementById("bulkImportCountBadge");
    if (countBadge) countBadge.classList.add("hidden");
    const fileInput = document.getElementById("bulkImportFileInput");
    if (fileInput) fileInput.value = "";
    const textInput = document.getElementById("bulkImportTextInput");
    if (textInput) textInput.value = "";
    this.pendingImportUsers = [];
    this.pendingEmails = [];

    // Default to 'new' mode or maintain current
    this.switchBulkImportMode(this.bulkMode || 'new');
  }

  closeBulkImportModal() {
    const modal = document.getElementById("bulkImportModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    this.pendingImportUsers = [];
    this.pendingEmails = [];
  }

  switchBulkImportMode(mode) {
    this.bulkMode = mode;
    const tabNew = document.getElementById("tabBulkModeNew");
    const tabExisting = document.getElementById("tabBulkModeExisting");
    const heading = document.getElementById("bulkImportModalHeading");
    const subheading = document.getElementById("bulkImportModalSubheading");
    const templateBox = document.getElementById("bulkTemplateActionBox");
    const existingHelpBox = document.getElementById("bulkExistingHelpBox");
    const inputLabel = document.getElementById("bulkInputLabel");
    const textInput = document.getElementById("bulkImportTextInput");
    const btnSubmit = document.getElementById("btnSubmitBulkModalText");

    if (mode === "existing") {
      if (tabNew) {
        tabNew.className = "flex-1 py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white flex items-center justify-center space-x-1.5 cursor-pointer";
      }
      if (tabExisting) {
        tabExisting.className = "flex-1 py-2 rounded-xl text-xs font-bold transition bg-purple-600 text-white shadow-md flex items-center justify-center space-x-1.5 cursor-pointer";
      }
      if (heading) heading.textContent = "Assign Second / Subsequent Course to Existing Users (Case 1)";
      if (subheading) subheading.textContent = "Target existing users who completed Course 1 and assign Course 2 to them. Accounts, credentials, past scores & certificates remain untouched.";
      if (templateBox) templateBox.classList.add("hidden");
      if (existingHelpBox) existingHelpBox.classList.remove("hidden");
      if (inputLabel) inputLabel.textContent = "Paste Existing User Emails (One per line, comma-separated, or CSV)";
      if (textInput) textInput.placeholder = "pooja.iyer@worxpertise.com\nramesh.sharma@worxpertise.com\nvikram.m@worxpertise.com\nsachin@learnpulse.dev";
      if (btnSubmit) btnSubmit.textContent = "🚀 Assign Course to Existing Users";
    } else {
      if (tabNew) {
        tabNew.className = "flex-1 py-2 rounded-xl text-xs font-bold transition bg-blue-600 text-white shadow-md flex items-center justify-center space-x-1.5 cursor-pointer";
      }
      if (tabExisting) {
        tabExisting.className = "flex-1 py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white flex items-center justify-center space-x-1.5 cursor-pointer";
      }
      if (heading) heading.textContent = "Bulk User Import & Mandatory Auto-Enrollment";
      if (subheading) subheading.textContent = "Upload an employee roster CSV to onboard hundreds of team members in 1-click and automatically enroll them in compliance curricula.";
      if (templateBox) templateBox.classList.remove("hidden");
      if (existingHelpBox) existingHelpBox.classList.add("hidden");
      if (inputLabel) inputLabel.textContent = "Upload CSV File or Paste Raw Text";
      if (textInput) textInput.placeholder = "Name,Email,Role,Department\nRamesh Sharma,ramesh.sharma@worxpertise.com,student,Technology\nPooja Iyer,pooja.iyer@worxpertise.com,student,HR";
      if (btnSubmit) btnSubmit.textContent = "🚀 Confirm Import & Auto-Enroll";
    }

    if (textInput && textInput.value) {
      this.handleBulkInputUpdate(textInput.value);
    }
  }

  handleBulkInputUpdate(text) {
    const badge = document.getElementById("bulkImportCountBadge");
    if (!text || !text.trim()) {
      if (badge) badge.classList.add("hidden");
      this.pendingImportUsers = [];
      this.pendingEmails = [];
      return;
    }

    if (this.bulkMode === "existing") {
      // Extract emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matched = text.match(emailRegex) || [];
      const uniqueEmails = Array.from(new Set(matched.map(e => e.toLowerCase().trim())));
      this.pendingEmails = uniqueEmails;

      // Count how many are in existing users roster
      const registeredCount = uniqueEmails.filter(e => this.users.some(u => u.email && u.email.toLowerCase() === e)).length;

      if (badge) {
        badge.textContent = `${uniqueEmails.length} Email(s) (${registeredCount} Registered Matches)`;
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30";
        badge.classList.remove("hidden");
      }
    } else {
      this.pendingImportUsers = this.parseCSV(text);
      const count = this.pendingImportUsers.length;
      if (badge) {
        badge.textContent = `${count} Employees Detected`;
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30";
        badge.classList.remove("hidden");
      }
    }
  }

  async executeCurrentBulkModalAction() {
    const courseSelect = document.getElementById("bulkImportCourseSelect");
    const courseId = courseSelect ? courseSelect.value : null;

    if (this.bulkMode === "existing") {
      const textInput = document.getElementById("bulkImportTextInput");
      const text = textInput ? textInput.value : "";
      this.handleBulkInputUpdate(text);
      await this.executeBulkAssignExisting(this.pendingEmails, courseId);
    } else {
      const users = (this.pendingImportUsers && this.pendingImportUsers.length > 0) 
        ? this.pendingImportUsers 
        : this.parseCSV(document.getElementById("bulkImportTextInput")?.value || "");
      await this.executeBulkImport(users, courseId);
    }
  }

  async executeBulkAssignExisting(emails, courseId) {
    if (!emails || emails.length === 0) {
      if (window.app && window.app.showToast) window.app.showToast("No valid emails found to assign course.", "warning");
      return;
    }

    const prog = (window.COURSES_DATA || []).find(c => c.id === courseId);
    const courseTitle = prog ? prog.title : "Assigned Course";

    try {
      let enrolledCount = 0;
      let alreadyEnrolledCount = 0;

      if (window.apiService && window.apiService.bulkEnrollUsers) {
        const res = await window.apiService.bulkEnrollUsers({
          emails,
          programId: courseId,
          notifyEmail: true
        });
        if (res && res.success) {
          enrolledCount = res.newlyEnrolledCount;
          alreadyEnrolledCount = res.alreadyEnrolledCount;
        }
      }

      // Sync local cache
      const cleanEmails = emails.map(e => e.toLowerCase().trim());
      this.users.forEach(u => {
        if (u.email && cleanEmails.includes(u.email.toLowerCase())) {
          u.enrollments = u.enrollments || [];
          if (!u.enrollments.some(e => e.program_id === courseId)) {
            u.enrollments.push({
              program_id: courseId,
              program_title: courseTitle,
              is_completed: false,
              enrolled_at: new Date().toISOString()
            });
          }
        }
      });
      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));

      this.closeBulkImportModal();
      await this.render();

      if (window.app && window.app.showToast) {
        window.app.showToast(`🎉 Case 1 Course Assigned: "${courseTitle}" assigned to ${enrolledCount} existing user(s)! ${alreadyEnrolledCount > 0 ? `(${alreadyEnrolledCount} already enrolled).` : ''}`, "success");
      }
    } catch (e) {
      console.error("Bulk assign existing error:", e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Course assignment failed: ${e.message}`, "error");
      }
    }
  }

  downloadCSVTemplate() {
    const csvContent = "Name,Email,Role,Department\nRamesh Sharma,ramesh.sharma@worxpertise.com,student,Technology\nPooja Iyer,pooja.iyer@worxpertise.com,student,Human Resources\nVikram Malhotra,vikram.m@worxpertise.com,student,Legal & Compliance\nSunita Kulkarni,sunita.k@worxpertise.com,instructor,Academic Faculty";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Worxpertise_Bulk_User_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  parseCSV(text) {
    if (!text || !text.trim()) return [];
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
      if (values.length < 2) continue;

      const user = {
        name: values[0] || `Employee ${i}`,
        email: values[1] || `user${i}@company.com`,
        role: (values[2] || "student").toLowerCase(),
        department: values[3] || "General Operations"
      };

      if (!user.role.match(/^(admin|instructor|student)$/)) {
        user.role = "student";
      }

      users.push(user);
    }
    return users;
  }

  async executeBulkImport(users, mandatoryCourseId) {
    const importList = (users && users.length > 0) ? users : (this.pendingImportUsers || []);
    if (!importList || importList.length === 0) {
      if (window.app && window.app.showToast) window.app.showToast("No valid employees loaded to import.", "warning");
      return;
    }

    const prog = (window.COURSES_DATA || []).find(c => c.id === mandatoryCourseId);
    const courseTitle = prog ? prog.title : "Mandatory Compliance Training";

    try {
      let createdCount = importList.length;
      let existingEnrolledCount = 0;

      if (window.apiService && window.apiService.bulkImportUsers) {
        try {
          const res = await window.apiService.bulkImportUsers({ users: importList, mandatoryProgramId: mandatoryCourseId });
          if (res && res.success) {
            createdCount = res.importedCount !== undefined ? res.importedCount : createdCount;
            existingEnrolledCount = res.existingEnrolledCount || 0;
          }
        } catch (err) {
          console.warn("Backend bulk import API fallback:", err);
        }
      }

      // Add to local state/cache (avoiding duplicate emails)
      importList.forEach((nu, idx) => {
        const existing = this.users.find(u => u.email && u.email.toLowerCase() === nu.email.toLowerCase());
        if (!existing) {
          const id = `usr_imp_${Date.now()}_${idx}`;
          this.users.push({
            id,
            name: nu.name,
            email: nu.email,
            role: nu.role || "student",
            avatar_url: `https://images.unsplash.com/photo-1535713875002?w=150&auto=format&fit=crop&q=80`,
            is_blocked: false,
            failed_login_attempts: 0,
            created_at: new Date().toISOString(),
            enrollments: mandatoryCourseId ? [{ program_id: mandatoryCourseId, program_title: courseTitle, is_completed: false }] : []
          });
        } else {
          existing.enrollments = existing.enrollments || [];
          if (mandatoryCourseId && !existing.enrollments.some(e => e.program_id === mandatoryCourseId)) {
            existing.enrollments.push({ program_id: mandatoryCourseId, program_title: courseTitle, is_completed: false });
          }
        }

        // Auto-enroll active user if matches
        if (mandatoryCourseId && window.appState && (nu.email === window.appState.user.email)) {
          window.appState.enrollProgram(mandatoryCourseId);
        }
      });

      localStorage.setItem('worxpertise_cached_users', JSON.stringify(this.users));

      // Log enterprise audit action
      if (window.appState) {
        window.appState.logAudit("BULK_USER_IMPORT", `${importList.length} Roster Processed`, {
          count: importList.length,
          course: courseTitle,
          mandatoryCourseId
        });

        // Log automated compliance email dispatch
        window.appState.logEmail(
          importList[0].email,
          "COMPLIANCE_REMINDER",
          `Welcome to Worxpertise: Enrolled in Mandatory "${courseTitle}"`,
          { batchSize: importList.length, courseId: mandatoryCourseId }
        );
      }

      this.closeBulkImportModal();
      await this.render();

      if (window.app && window.app.showToast) {
        const msg = existingEnrolledCount > 0 
          ? `🎉 Roster Processed: ${createdCount} new accounts created, and ${existingEnrolledCount} existing users enrolled into "${courseTitle}"!`
          : `🎉 Successfully onboarded ${createdCount} employees & auto-enrolled in "${courseTitle}"!`;
        window.app.showToast(msg, "success");
      }
    } catch (e) {
      console.error("Bulk import failed:", e);
      if (window.app && window.app.showToast) {
        window.app.showToast(`Bulk import failed: ${e.message}`, "error");
      }
    }
  }
}

window.userManager = new UserManager();
