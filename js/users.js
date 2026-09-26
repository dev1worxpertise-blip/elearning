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
    this.searchQuery = "";
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
        created_at: "2026-09-22T10:00:00.000Z"
      },
      {
        id: "usr_instructor_1",
        name: "Dr. Sarah Chen",
        email: "sarah.chen@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z"
      },
      {
        id: "usr_instructor_2",
        name: "Alex Rivera",
        email: "alex.rivera@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z"
      },
      {
        id: "usr_instructor_3",
        name: "Marcus Vance",
        email: "marcus.vance@learnpulse.dev",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z"
      },
      {
        id: "usr_instructor_4",
        name: "Advocate Ananya Deshmukh",
        email: "ananya.deshmukh@worxpertise.com",
        role: "instructor",
        avatar_url: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-23T16:18:28.466Z"
      },
      {
        id: "usr_student_sachin",
        name: "Sachin Chauhan",
        email: "sachin@learnpulse.dev",
        role: "student",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        is_blocked: false,
        failed_login_attempts: 0,
        created_at: "2026-09-22T14:58:44.294Z"
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
          this.users = res.users;
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

    // Filter users according to tab and search query
    let filtered = [...this.users];
    if (this.activeFilter === "student") filtered = filtered.filter(u => u.role === "student");
    else if (this.activeFilter === "instructor") filtered = filtered.filter(u => u.role === "instructor");
    else if (this.activeFilter === "admin") filtered = filtered.filter(u => u.role === "admin");
    else if (this.activeFilter === "locked") filtered = filtered.filter(u => u.is_blocked || u.failed_login_attempts >= 3);

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    }

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
              Enterprise User Directory & Role Assignment
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Manage platform members, assign & toggle system roles on the fly (<span class="text-purple-300 font-bold">Admin</span>, <span class="text-rose-300 font-bold">Instructor</span>, <span class="text-emerald-300 font-bold">Student</span>), unlock accounts blocked by 3 failed password attempts, and export audit rosters.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button 
              id="btnOpenAddUserModal"
              class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              <span>+ Add New User</span>
            </button>
            <button 
              id="btnExportUsersExcel"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Export Roster (Excel)</span>
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
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button 
            data-user-filter="all" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'all' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            All Users (${totalCount})
          </button>
          <button 
            data-user-filter="student" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Students (${studentCount})
          </button>
          <button 
            data-user-filter="instructor" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'instructor' ? 'bg-[#dd1f36] text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Instructors (${instructorCount})
          </button>
          <button 
            data-user-filter="admin" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}"
          >
            Admins (${adminCount})
          </button>
          <button 
            data-user-filter="locked" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.activeFilter === 'locked' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'} flex items-center space-x-1"
          >
            <span>🔒 Locked / Blocked</span>
            ${lockedCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">${lockedCount}</span>` : ''}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-72">
          <svg class="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            id="userSearchInput" 
            value="${this.searchQuery}"
            placeholder="Search by name, email, id..." 
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      <!-- Users Roster Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-950/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-5 py-4">User / Identity</th>
              <th class="px-4 py-4">Assigned Role</th>
              <th class="px-4 py-4">Security / Lockout Status</th>
              <th class="px-4 py-4">Account Created</th>
              <th class="px-5 py-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  <div class="text-3xl mb-2">🔍</div>
                  <div class="font-bold text-sm text-slate-400">No users found matching current filter</div>
                  <div class="text-xs text-slate-500 mt-1">Try switching tabs or clearing your search query.</div>
                </td>
              </tr>
            ` : filtered.map(user => {
              const isLocked = user.is_blocked || (user.failed_login_attempts >= 3);
              const roleColor = user.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : (user.role === 'instructor' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40');
              
              const roleIcon = user.role === 'admin' ? '👑' : (user.role === 'instructor' ? '👨‍🏫' : '🎓');

              const createdFormatted = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", {
                year: 'numeric', month: 'short', day: 'numeric'
              }) : 'N/A';

              return `
                <tr class="hover:bg-slate-800/40 transition">
                  <!-- User identity -->
                  <td class="px-5 py-4">
                    <div class="flex items-center space-x-3">
                      <img 
                        src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}" 
                        alt="${user.name}" 
                        class="w-10 h-10 rounded-full border ${isLocked ? 'border-amber-500' : 'border-slate-700'} object-cover"
                      />
                      <div>
                        <div class="font-bold text-white text-sm flex items-center space-x-1.5">
                          <span>${user.name}</span>
                          ${user.email === 'admin@learnpulse.dev' ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-extrabold border border-purple-700">SUPER</span>' : ''}
                        </div>
                        <div class="text-slate-400 font-medium">${user.email}</div>
                        <div class="text-[10px] text-slate-500 font-mono mt-0.5">${user.id}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Role Dropdown -->
                  <td class="px-4 py-4">
                    <div class="flex items-center space-x-2">
                      <div class="relative">
                        <select 
                          data-role-selector="${user.id}"
                          class="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-extrabold ${roleColor} border bg-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-pointer"
                        >
                          <option value="student" ${user.role === 'student' ? 'selected' : ''}>🎓 Student / Learner</option>
                          <option value="instructor" ${user.role === 'instructor' ? 'selected' : ''}>👨‍🏫 Instructor / Faculty</option>
                          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Administrator</option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Security / Lockout Status -->
                  <td class="px-4 py-4">
                    ${isLocked ? `
                      <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-black">
                        <span>🔒 LOCKED</span>
                        <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-200">3 Failed Attempts</span>
                      </div>
                      <div class="text-[10px] text-rose-400 mt-1 font-medium">Blocked from login</div>
                    ` : `
                      <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active</span>
                      </div>
                      ${user.failed_login_attempts > 0 ? `
                        <div class="text-[10px] text-amber-400 mt-1 font-medium">${user.failed_login_attempts} failed attempt(s)</div>
                      ` : `
                        <div class="text-[10px] text-slate-500 mt-1">Full platform access</div>
                      `}
                    `}
                  </td>

                  <!-- Created Date -->
                  <td class="px-4 py-4 text-slate-400 font-medium">
                    ${createdFormatted}
                  </td>

                  <!-- Admin Actions -->
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      ${isLocked ? `
                        <button 
                          data-btn-unlock="${user.id}"
                          title="Unblock account and reset failed password attempts"
                          class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center space-x-1"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                          <span>🔓 Unlock Account</span>
                        </button>
                      ` : `
                        <button 
                          data-btn-lock="${user.id}"
                          title="Manually lock/suspend this user account"
                          class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-900/60 text-slate-300 hover:text-amber-300 font-semibold text-xs border border-slate-700 transition"
                        >
                          <span>🔒 Lock</span>
                        </button>
                      `}

                      <button 
                        data-btn-reset-pw="${user.id}"
                        title="Set a new password for this user"
                        class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-300 font-semibold text-xs border border-slate-700 transition"
                      >
                        <span>🔑 Reset PW</span>
                      </button>

                      ${user.email !== 'admin@learnpulse.dev' ? `
                        <button 
                          data-btn-delete="${user.id}"
                          title="Remove user account"
                          class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
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
    `;

    this.bindEvents();
  }

  bindEvents() {
    const container = document.getElementById("viewUsers");
    if (!container) return;

    // Filter Buttons
    container.querySelectorAll("[data-user-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeFilter = btn.getAttribute("data-user-filter");
        this.render();
      });
    });

    // Search Input
    const searchInput = container.querySelector("#userSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

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
}

window.userManager = new UserManager();
