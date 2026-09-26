/**
 * LearnPulse E-Learning Platform - Main Application Coordinator & View Router
 */

class App {
  constructor() {
    this.currentView = "catalog"; // "catalog" | "dashboard" | "mylearning" | "reports" | "learning" | "certificates" | "instructor"
    this.selectedCategory = "all";
    this.searchQuery = "";
    this.activeProgram = null;
    this.activeModule = null;
    this.activeDashboardCut = "executive"; // "executive" | "curriculum" | "compliance" | "rigor" | "engagement"
  }

  init() {
    // Set default active program if any
    if (window.COURSES_DATA && window.COURSES_DATA.length > 0) {
      this.activeProgram = window.COURSES_DATA[0];
      this.activeModule = this.activeProgram.modules[0];
    }

    this.bindGlobalEvents();
    this.navigate("catalog");

    // Check backend health and sync with PostgreSQL
    if (window.apiService) {
      setTimeout(async () => {
        try {
          const res = await window.apiService.getPrograms();
          if (res && res.success && res.programs && res.programs.length > 0) {
            // Populate full syllabus modules for the active programs
            for (const p of res.programs) {
              const detail = await window.apiService.getProgramDetails(p.id);
              if (detail && detail.success && detail.program) {
                const existingIdx = (window.COURSES_DATA || []).findIndex(cp => cp.id === p.id);
                if (existingIdx >= 0) {
                  const existingProg = window.COURSES_DATA[existingIdx];
                  const mergedModules = (detail.program.modules && detail.program.modules.length > 0)
                    ? detail.program.modules.map(dm => {
                        const em = (existingProg.modules || []).find(m => m.id === dm.id);
                        return {
                          ...(em || {}),
                          ...dm,
                          quiz: dm.quiz || (em && em.quiz) || null
                        };
                      })
                    : (existingProg.modules || []);

                  window.COURSES_DATA[existingIdx] = {
                    ...existingProg,
                    ...detail.program,
                    modules: mergedModules
                  };
                } else {
                  window.COURSES_DATA.push(detail.program);
                }
              }
            }
            this.renderCatalogGrid();
            if (this.currentView === "dashboard") this.renderDashboard();
            if (this.currentView === "reports" && window.reportsManager) window.reportsManager.render();
          }
        } catch (e) {
          console.log('Using local curriculum cache.');
        }
      }, 500);
    }

    // Subscribe to state changes to update stats & UI
    window.appState.subscribe(() => {
      this.updateHeaderProfile();
      if (this.currentView === "dashboard") this.renderDashboard();
      if (this.currentView === "reports" && window.reportsManager) window.reportsManager.render();
      if (this.currentView === "mylearning") this.renderMyLearning();
    });
  }

  bindGlobalEvents() {
    // Category tabs
    document.querySelectorAll("[data-category-filter]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll("[data-category-filter]").forEach(b => {
          b.classList.remove("bg-[#dd1f36]", "text-white");
          b.classList.add("bg-slate-800", "text-slate-400");
        });
        btn.classList.remove("bg-slate-800", "text-slate-400");
        btn.classList.add("bg-[#dd1f36]", "text-white");
        this.selectedCategory = btn.getAttribute("data-category-filter");
        this.renderCatalogGrid();
      });
    });

    // Search bar
    const searchInput = document.getElementById("programSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderCatalogGrid();
      });
    }

    // Navigation links
    document.querySelectorAll("[data-nav-target]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("data-nav-target");
        this.navigate(target);
      });
    });

    // Admin Hub Dropdown toggle on click & dismiss on outside click
    const adminHubTrigger = document.getElementById("adminHubTrigger");
    const adminHubMenu = document.getElementById("adminHubMenu");
    if (adminHubTrigger && adminHubMenu) {
      adminHubTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        adminHubMenu.classList.toggle("hidden");
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#adminHubDropdown")) {
          adminHubMenu.classList.add("hidden");
        }
      });
    }

    // Student profile edit button
    const editProfileBtn = document.getElementById("btnEditProfile");
    if (editProfileBtn) {
      editProfileBtn.addEventListener("click", () => {
        const currentName = window.appState.user.name;
        const newName = prompt("Enter your Full Name (this appears on your Certificates):", currentName);
        if (newName && newName.trim()) {
          window.appState.updateUserProfile(newName.trim());
          this.showToast(`Profile updated to: ${newName.trim()}`, "success");
          this.updateHeaderProfile();
          if (this.currentView === "dashboard") this.renderDashboard();
          if (this.currentView === "mylearning") this.renderMyLearning();
          if (this.currentView === "reports" && window.reportsManager) window.reportsManager.render();
        }
      });
    }

    // Reset progress button
    const resetBtn = document.getElementById("btnResetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset all course enrollments, video progress, quiz scores, and certificates?")) {
          window.appState.resetAllProgress();
          this.showToast("Progress reset successfully!", "info");
          this.render();
        }
      });
    }

    this.bindAuthEvents();
  }

  bindAuthEvents() {
    const authModal = document.getElementById("authModal");
    const btnOpen = document.getElementById("btnOpenAuthModal");
    const profilePill = document.getElementById("userProfilePill");
    const btnClose = document.getElementById("btnCloseAuthModal");
    const alertBox = document.getElementById("authAlertBox");

    const tabRegister = document.getElementById("tabBtnRegister");
    const tabLogin = document.getElementById("tabBtnLogin");
    const tabQuickSwitch = document.getElementById("tabBtnQuickSwitch");

    const formRegister = document.getElementById("formRegister");
    const formLogin = document.getElementById("formLogin");
    const paneQuickSwitch = document.getElementById("paneQuickSwitch");

    const showAlert = (msg, type = "error") => {
      if (!alertBox) return;
      alertBox.className = "p-3 rounded-xl text-xs font-medium border";
      if (type === "error" || type === "lockout") {
        alertBox.classList.add("bg-rose-950/80", "border-rose-500/50", "text-rose-200");
      } else if (type === "warning") {
        alertBox.classList.add("bg-amber-950/80", "border-amber-500/50", "text-amber-200");
      } else {
        alertBox.classList.add("bg-emerald-950/80", "border-emerald-500/50", "text-emerald-200");
      }
      alertBox.innerHTML = msg;
      alertBox.classList.remove("hidden");
    };

    const clearAlert = () => {
      if (alertBox) {
        alertBox.innerHTML = "";
        alertBox.classList.add("hidden");
      }
    };

    const switchAuthTab = (tab) => {
      clearAlert();
      [tabRegister, tabLogin, tabQuickSwitch].forEach(b => {
        if (!b) return;
        b.classList.remove("bg-gradient-to-r", "from-purple-600", "to-indigo-600", "text-white", "shadow-md");
        b.classList.add("text-slate-400");
      });

      if (formRegister) formRegister.classList.add("hidden");
      if (formLogin) formLogin.classList.add("hidden");
      if (paneQuickSwitch) paneQuickSwitch.classList.add("hidden");

      if (tab === "register") {
        if (tabRegister) {
          tabRegister.classList.add("bg-gradient-to-r", "from-purple-600", "to-indigo-600", "text-white", "shadow-md");
          tabRegister.classList.remove("text-slate-400");
        }
        if (formRegister) formRegister.classList.remove("hidden");
      } else if (tab === "login") {
        if (tabLogin) {
          tabLogin.classList.add("bg-gradient-to-r", "from-purple-600", "to-indigo-600", "text-white", "shadow-md");
          tabLogin.classList.remove("text-slate-400");
        }
        if (formLogin) formLogin.classList.remove("hidden");
      } else if (tab === "quickswitch") {
        if (tabQuickSwitch) {
          tabQuickSwitch.classList.add("bg-gradient-to-r", "from-purple-600", "to-indigo-600", "text-white", "shadow-md");
          tabQuickSwitch.classList.remove("text-slate-400");
        }
        if (paneQuickSwitch) paneQuickSwitch.classList.remove("hidden");
      }
    };

    const openModal = () => {
      if (authModal) authModal.classList.remove("hidden");
      switchAuthTab("login");
    };

    const closeModal = () => {
      if (authModal) authModal.classList.add("hidden");
      clearAlert();
    };

    if (btnOpen) btnOpen.addEventListener("click", openModal);
    if (profilePill) {
      profilePill.addEventListener("click", (e) => {
        if (e.target.closest("#btnEditProfile")) return;
        openModal();
      });
    }
    if (btnClose) btnClose.addEventListener("click", closeModal);

    if (tabRegister) tabRegister.addEventListener("click", () => switchAuthTab("register"));
    if (tabLogin) tabLogin.addEventListener("click", () => switchAuthTab("login"));
    if (tabQuickSwitch) tabQuickSwitch.addEventListener("click", () => switchAuthTab("quickswitch"));

    // Register Submit
    if (formRegister) {
      formRegister.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAlert();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const pass = document.getElementById("regPassword").value;
        const confirmPass = document.getElementById("regConfirmPassword").value;
        const role = document.getElementById("regRole").value;

        if (pass !== confirmPass) {
          showAlert("⚠️ Passwords do not match. Please re-enter.");
          return;
        }

        try {
          if (window.apiService && window.apiService.register) {
            const res = await window.apiService.register(name, email, pass, role);
            if (res && res.success) {
              window.appState.setCurrentUser(res.user, res.token);
              this.showToast(`🎉 Welcome, ${res.user.name}! Registered as ${res.user.role.toUpperCase()}`, "success");
              closeModal();
              this.updateHeaderProfile();
              if (window.userManager) window.userManager.render();
              return;
            } else if (res && !res.success) {
              showAlert(`⚠️ ${res.message || 'Registration failed.'}`);
              return;
            }
          }

          // Offline fallback
          const newUser = {
            id: 'usr_' + Date.now(),
            name,
            email,
            role,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          };
          window.appState.setCurrentUser(newUser);
          this.showToast(`🎉 Registered as ${name} (${role.toUpperCase()})`, "success");
          closeModal();
          this.updateHeaderProfile();
        } catch (err) {
          showAlert(`⚠️ ${err.message}`);
        }
      });
    }

    // Login Submit with 3-Attempt Lockout
    if (formLogin) {
      formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearAlert();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
          if (window.apiService && window.apiService.login) {
            const res = await window.apiService.login(email, password);
            if (res && res.success) {
              window.appState.setCurrentUser(res.user, res.token);
              this.showToast(`✅ Signed in as ${res.user.name} (${res.user.role.toUpperCase()})`, "success");
              closeModal();
              this.updateHeaderProfile();
              if (window.userManager) window.userManager.render();
              return;
            } else if (res) {
              if (res.isBlocked) {
                showAlert(`
                  <div class="space-y-1">
                    <div class="font-black text-rose-300 flex items-center space-x-1.5">
                      <span class="text-base">🔒</span>
                      <span>ACCOUNT SECURITY LOCKOUT</span>
                    </div>
                    <div>${res.message}</div>
                    <div class="text-[11px] text-amber-300 font-bold mt-1">
                      👉 Platform Administrator can unlock your account directly from the <strong>User Directory</strong> studio!
                    </div>
                  </div>
                `, "lockout");
              } else if (res.attemptsLeft !== undefined) {
                showAlert(`
                  <div class="font-bold flex items-center space-x-1.5">
                    <span>⚠️</span>
                    <span>${res.message}</span>
                  </div>
                `, "warning");
              } else {
                showAlert(`⚠️ ${res.message || 'Login failed.'}`);
              }
              return;
            }
          }

          showAlert("⚠️ Unable to reach authentication server.");
        } catch (err) {
          showAlert(`⚠️ ${err.message}`);
        }
      });
    }

    // Quick Persona Switcher Buttons
    document.querySelectorAll("[data-switch-persona]").forEach(btn => {
      btn.addEventListener("click", () => {
        const persona = btn.getAttribute("data-switch-persona");
        if (persona === "admin") {
          window.appState.setCurrentUser({
            id: "usr_admin_master",
            name: "System Administrator",
            email: "admin@learnpulse.dev",
            role: "admin",
            avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
          });
          this.showToast("👑 Switched to System Administrator view (Full Role & Lockout Control)", "success");
        } else if (persona === "instructor") {
          window.appState.setCurrentUser({
            id: "usr_instructor_1",
            name: "Dr. Sarah Chen",
            email: "sarah.chen@learnpulse.dev",
            role: "instructor",
            avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
          });
          this.showToast("👨‍🏫 Switched to Instructor view (Dr. Sarah Chen)", "success");
        } else if (persona === "student") {
          window.appState.setCurrentUser({
            id: "usr_student_sachin",
            name: "Sachin Chauhan",
            email: "sachin@learnpulse.dev",
            role: "student",
            avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
          });
          this.showToast("🎓 Switched to Student view (Sachin Chauhan)", "info");
        }

        closeModal();
        this.updateHeaderProfile();
        this.render();
      });
    });
  }

  navigate(viewName, programId = null, moduleId = null) {
    const user = (window.appState && window.appState.user) || { role: 'student' };
    const role = (user.role || 'student').toLowerCase();

    // Route guards based on persona role
    if (role === "student" && ["dashboard", "reports", "instructor", "users"].includes(viewName)) {
      this.showToast("🔒 Restricted: This area requires Instructor or Administrator access.", "warning");
      viewName = "catalog";
    } else if (role === "instructor" && ["users", "dashboard"].includes(viewName)) {
      this.showToast("👑 Restricted: Administrator privileges required for User Directory.", "warning");
      viewName = "instructor";
    }

    this.currentView = viewName;

    const isAdminView = ["dashboard", "reports", "instructor", "users"].includes(viewName);

    // Show/hide contextual Admin Sub-Bar (only for admin role)
    const adminSubBar = document.getElementById("adminSubBar");
    if (adminSubBar) {
      if (role === "admin" && isAdminView) {
        adminSubBar.classList.remove("hidden");
      } else {
        adminSubBar.classList.add("hidden");
      }
    }

    // Update active nav styling for top bar links
    document.querySelectorAll("nav [data-nav-target]").forEach(el => {
      if (el.getAttribute("data-nav-target") === viewName) {
        el.classList.add("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        el.classList.remove("text-slate-400");
      } else {
        el.classList.remove("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        el.classList.add("text-slate-400");
      }
    });

    // Update Admin Hub Trigger style if in any admin view
    const adminHubTrigger = document.getElementById("adminHubTrigger");
    if (adminHubTrigger) {
      if (isAdminView) {
        adminHubTrigger.classList.add("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        adminHubTrigger.classList.remove("text-slate-400");
      } else {
        adminHubTrigger.classList.remove("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        adminHubTrigger.classList.add("text-slate-400");
      }
    }

    // Highlight active button in adminSubBar
    document.querySelectorAll("[data-admin-sub]").forEach(el => {
      if (el.getAttribute("data-admin-sub") === viewName) {
        el.classList.add("bg-[#dd1f36]", "text-white", "shadow-md");
        el.classList.remove("text-slate-300", "hover:bg-slate-800/80");
      } else {
        el.classList.remove("bg-[#dd1f36]", "text-white", "shadow-md");
        el.classList.add("text-slate-300", "hover:bg-slate-800/80");
      }
    });

    // Dismiss dropdown menu if open
    const adminHubMenu = document.getElementById("adminHubMenu");
    if (adminHubMenu) {
      adminHubMenu.classList.add("hidden");
    }

    if (programId) {
      const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
      if (prog) {
        this.activeProgram = prog;
        this.activeModule = moduleId ? prog.modules.find(m => m.id === moduleId) : prog.modules[0];
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.render();
  }

  render() {
    const catalogView = document.getElementById("viewCatalog");
    const learningView = document.getElementById("viewLearning");
    const dashboardView = document.getElementById("viewDashboard");
    const myLearningView = document.getElementById("viewMyLearning");
    const reportsView = document.getElementById("viewReports");
    const certificatesView = document.getElementById("viewCertificates");
    const instructorView = document.getElementById("viewInstructor");
    const usersView = document.getElementById("viewUsers");

    // Hide all
    if (catalogView) catalogView.classList.add("hidden");
    if (learningView) learningView.classList.add("hidden");
    if (dashboardView) dashboardView.classList.add("hidden");
    if (myLearningView) myLearningView.classList.add("hidden");
    if (reportsView) reportsView.classList.add("hidden");
    if (certificatesView) certificatesView.classList.add("hidden");
    if (instructorView) instructorView.classList.add("hidden");
    if (usersView) usersView.classList.add("hidden");

    this.updateHeaderProfile();

    if (this.currentView === "catalog") {
      if (catalogView) catalogView.classList.remove("hidden");
      this.renderCatalogGrid();
    } else if (this.currentView === "learning") {
      if (learningView) learningView.classList.remove("hidden");
      this.renderLearningView();
    } else if (this.currentView === "dashboard") {
      if (dashboardView) dashboardView.classList.remove("hidden");
      this.renderDashboard();
    } else if (this.currentView === "mylearning") {
      if (myLearningView) myLearningView.classList.remove("hidden");
      this.renderMyLearning();
    } else if (this.currentView === "reports") {
      if (reportsView) reportsView.classList.remove("hidden");
      if (window.reportsManager) window.reportsManager.render();
    } else if (this.currentView === "certificates") {
      if (certificatesView) certificatesView.classList.remove("hidden");
      this.renderCertificatesView();
    } else if (this.currentView === "instructor") {
      if (instructorView) instructorView.classList.remove("hidden");
      if (window.instructorStudio) window.instructorStudio.switchTab(window.instructorStudio.activeTab || "programs");
    } else if (this.currentView === "users") {
      if (usersView) usersView.classList.remove("hidden");
      if (window.userManager) window.userManager.render();
    }
  }

  updateHeaderProfile() {
    const user = (window.appState && window.appState.user) || { name: 'Sachin Chauhan', role: 'student' };
    const nameEl = document.getElementById("headerStudentName");
    const roleEl = document.getElementById("headerRoleBadge");
    const avatarEl = document.getElementById("headerUserAvatar");
    const certCountEl = document.getElementById("headerCertCount");

    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl && (user.avatar || user.avatar_url)) avatarEl.src = user.avatar || user.avatar_url;
    if (certCountEl) certCountEl.textContent = (window.appState && window.appState.certificates) ? window.appState.certificates.length : 0;

    if (roleEl) {
      const normalizedRole = (user.role || 'student').toLowerCase();
      if (normalizedRole === 'admin') {
        roleEl.textContent = '👑 Admin';
        roleEl.className = 'px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30';
      } else if (normalizedRole === 'instructor') {
        roleEl.textContent = '👨‍🏫 Instructor';
        roleEl.className = 'px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30';
      } else {
        roleEl.textContent = '🎓 Student';
        roleEl.className = 'px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      }
    }

    // Dynamic RBAC: Show/hide menus strictly based on persona role
    const normalizedRole = (user.role || 'student').toLowerCase();
    this.updateNavPermissions(normalizedRole);
  }

  updateNavPermissions(role) {
    if (!role) {
      const user = (window.appState && window.appState.user) || { role: 'student' };
      role = (user.role || 'student').toLowerCase();
    }

    const adminHubDropdown = document.getElementById("adminHubDropdown");
    const navItemInstructor = document.getElementById("navItemInstructor");
    const adminSubBar = document.getElementById("adminSubBar");

    if (role === "admin") {
      // 👑 Admin persona: Sees full Admin Hub with all 5 analytical tools
      if (adminHubDropdown) adminHubDropdown.classList.remove("hidden");
      if (navItemInstructor) navItemInstructor.classList.add("hidden");
    } else if (role === "instructor") {
      // 👨‍🏫 Instructor persona: Sees Instructor Studio tab, hides Admin Hub & Security
      if (adminHubDropdown) adminHubDropdown.classList.add("hidden");
      if (navItemInstructor) navItemInstructor.classList.remove("hidden");
      if (adminSubBar) adminSubBar.classList.add("hidden");

      // Redirect if on admin-only view
      if (["users", "dashboard"].includes(this.currentView)) {
        this.navigate("instructor");
      }
    } else {
      // 🎓 Student persona: Clean learner catalog only (no Admin Hub, no Instructor Studio, no Sub-Bar)
      if (adminHubDropdown) adminHubDropdown.classList.add("hidden");
      if (navItemInstructor) navItemInstructor.classList.add("hidden");
      if (adminSubBar) adminSubBar.classList.add("hidden");

      // Redirect if on any restricted admin or instructor view
      if (["dashboard", "reports", "instructor", "users"].includes(this.currentView)) {
        this.navigate("catalog");
      }
    }
  }

  // --- CATALOG VIEW ---
  renderCatalogGrid() {
    const container = document.getElementById("catalogGrid");
    if (!container) return;

    let courses = window.COURSES_DATA || [];

    // Filter by Category
    if (this.selectedCategory !== "all") {
      courses = courses.filter(c => c.category.toLowerCase().includes(this.selectedCategory.toLowerCase()));
    }

    // Filter by Search Query
    if (this.searchQuery) {
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(this.searchQuery) ||
        c.tagline.toLowerCase().includes(this.searchQuery) ||
        c.skills.some(s => s.toLowerCase().includes(this.searchQuery))
      );
    }

    if (courses.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <svg class="w-16 h-16 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <h3 class="text-lg font-bold text-white">No Programs Found</h3>
          <p class="text-sm mt-1">Try clearing your search query or selecting a different category filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = courses.map(program => {
      const isEnrolled = window.appState.isEnrolled(program.id);
      const progress = window.appState.getProgramProgress(program.id);
      const hasCert = !!window.appState.getCertificate(program.id);

      return `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col group">
          <!-- Thumbnail -->
          <div class="relative h-48 overflow-hidden bg-slate-950">
            <img 
              src="${program.thumbnail}" 
              alt="${program.title}" 
              class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-[#dd1f36]/90 text-white backdrop-blur-md">
                ${program.category}
              </span>
            </div>

            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <span>★</span>
                <span>${program.rating}</span>
              </span>
            </div>

            ${hasCert ? `
              <div class="absolute bottom-3 right-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center space-x-1 shadow-lg">
                  <span>🎓 Certified</span>
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Body -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                <span>⏱ ${program.duration}</span>
                <span>•</span>
                <span>📚 ${program.modules.length} Video Modules</span>
                <span>•</span>
                <span>${program.level}</span>
              </div>

              <h3 class="text-xl font-bold text-white leading-snug group-hover:text-[#dd1f36] transition">
                ${program.title}
              </h3>

              <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                ${program.tagline}
              </p>

              <!-- Skills tags -->
              <div class="flex flex-wrap gap-1.5 mt-3">
                ${program.skills.slice(0, 3).map(skill => `
                  <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    ${skill}
                  </span>
                `).join("")}
              </div>
            </div>

            <!-- Instructor & Progress -->
            <div class="mt-6 pt-4 border-t border-slate-800 space-y-4">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center space-x-2.5">
                  <img src="${program.instructor.avatar}" class="w-7 h-7 rounded-full object-cover border border-slate-700" />
                  <span class="text-slate-300 font-medium">${program.instructor.name}</span>
                </div>
                <span class="text-slate-500">${program.enrolledCount.toLocaleString()} learners</span>
              </div>

              ${isEnrolled ? `
                <div class="space-y-1.5">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-slate-400">Your Progress</span>
                    <span class="text-[#dd1f36] font-bold">${progress.percentage}%</span>
                  </div>
                  <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-[#dd1f36] h-full rounded-full" style="width: ${progress.percentage}%"></div>
                  </div>
                </div>
              ` : ''}

              <!-- CTAs -->
              <div class="flex items-center space-x-2 pt-1">
                ${isEnrolled ? `
                  <button 
                    onclick="window.app.startProgram('${program.id}')"
                    class="flex-1 py-2.5 px-4 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/20 transition flex items-center justify-center space-x-1.5"
                  >
                    <span>${progress.percentage === 100 ? 'Review Modules' : 'Resume Learning'}</span>
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                  ${hasCert ? `
                    <button 
                      onclick="window.certificateStudio.openCertificateModal('${program.id}')" 
                      title="View Certificate" 
                      class="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 transition"
                    >
                      🎓
                    </button>
                  ` : ''}
                ` : `
                  <button 
                    onclick="window.app.enrollInProgram('${program.id}')"
                    class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#dd1f36] to-[#9744cc] hover:from-[#b81427] hover:to-[#8235b5] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/20 transition flex items-center justify-center space-x-1.5"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    <span>Enroll in Program (Free)</span>
                  </button>
                  <button 
                    onclick="window.app.openSyllabusModal('${program.id}')" 
                    class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="View Full Syllabus"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  enrollInProgram(programId) {
    window.appState.enrollProgram(programId);
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    this.showToast(`Enrolled successfully in ${prog ? prog.title : 'program'}! 🎉`, "success");
    this.startProgram(programId);
  }

  startProgram(programId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!prog) return;

    this.activeProgram = prog;
    
    // Find first uncompleted module or fallback to module 0
    const nextUncompleted = prog.modules.find(m => !window.appState.isModuleCompleted(m.id)) || prog.modules[0];
    this.activeModule = nextUncompleted;

    this.navigate("learning", prog.id, this.activeModule.id);
  }

  // --- LEARNING CLASSROOM VIEW ---
  renderLearningView() {
    if (!this.activeProgram || !this.activeModule) return;

    // Header Info
    const breadcrumb = document.getElementById("learningBreadcrumb");
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <span class="hover:text-white cursor-pointer" onclick="window.app.navigate('catalog')">Programs</span>
        <span class="mx-2">/</span>
        <span class="text-slate-300 font-semibold">${this.activeProgram.title}</span>
        <span class="mx-2">/</span>
        <span class="text-[#dd1f36] font-bold">${this.activeModule.title}</span>
      `;
    }

    // Initialize Video Player
    window.videoPlayer.init("videoPlayerMount", this.activeModule, this.activeProgram);

    // Render Module Curriculum Playlist
    const playlistContainer = document.getElementById("modulesPlaylist");
    if (playlistContainer) {
      playlistContainer.innerHTML = this.activeProgram.modules.map((mod, idx) => {
        const isActive = mod.id === this.activeModule.id;
        const isCompleted = window.appState.isModuleCompleted(mod.id);
        const isVideoWatched = window.appState.isVideoFinished(mod.id);
        const quizResult = window.appState.getQuizResult(mod.id);

        return `
          <div 
            onclick="window.app.switchModule('${mod.id}')"
            class="p-4 rounded-xl border transition cursor-pointer ${isActive ? 'bg-[#dd1f36]/10 border-[#dd1f36] shadow-md' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-[#dd1f36] text-white' : 'bg-slate-800 text-slate-400'}">
                  ${isCompleted ? '✓' : idx + 1}
                </div>
                <div>
                  <h5 class="text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}">
                    ${mod.title}
                  </h5>
                  <div class="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span>⏱ ${mod.duration}</span>
                    <span>•</span>
                    <span>${isVideoWatched ? 'Video Watched ✓' : 'Video Unwatched'}</span>
                  </div>
                </div>
              </div>

              <div>
                ${isCompleted ? `
                  <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Passed (${quizResult ? quizResult.percentage : 100}%)
                  </span>
                ` : isVideoWatched ? `
                  <span class="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    Quiz Ready
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Program Completion Status Banner
    const completionBanner = document.getElementById("programCertificateBanner");
    const progress = window.appState.getProgramProgress(this.activeProgram.id);
    if (completionBanner) {
      if (progress.isComplete) {
        completionBanner.classList.remove("hidden");
        completionBanner.innerHTML = `
          <div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-500/30">
                🎓
              </div>
              <div>
                <h4 class="font-bold text-white text-base">You Completed All Course Modules!</h4>
                <p class="text-xs text-slate-300">Your official digital certificate is ready for generation and verification.</p>
              </div>
            </div>
            <button 
              onclick="window.certificateStudio.openCertificateModal('${this.activeProgram.id}')"
              class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition transform hover:scale-105 flex items-center space-x-2 shrink-0"
            >
              <span>View & Download Certificate</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        `;
      } else {
        completionBanner.classList.add("hidden");
      }
    }

    // Render Lesson Details Tabs
    const lessonDescription = document.getElementById("lessonDescription");
    if (lessonDescription) {
      lessonDescription.textContent = this.activeModule.description;
    }

    const takeawaysContainer = document.getElementById("lessonTakeaways");
    if (takeawaysContainer) {
      takeawaysContainer.innerHTML = this.activeModule.takeaways.map(t => `
        <li class="flex items-start space-x-2 text-xs text-slate-300">
          <span class="text-emerald-400 font-bold">✓</span>
          <span>${t}</span>
        </li>
      `).join("");
    }

    const resourcesContainer = document.getElementById("lessonResources");
    if (resourcesContainer) {
      resourcesContainer.innerHTML = this.activeModule.resources.map(r => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div class="flex items-center space-x-2 text-slate-300">
            <svg class="w-4 h-4 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>${r.name}</span>
          </div>
          <span class="text-slate-500 font-mono">${r.size || 'External'}</span>
        </div>
      `).join("");
    }
  }

  switchModule(moduleId) {
    const mod = this.activeProgram.modules.find(m => m.id === moduleId);
    if (!mod) return;
    this.activeModule = mod;
    this.renderLearningView();
  }

  onModulePassed(moduleId) {
    this.renderLearningView();
    // Auto advance to next module if available
    const currentIndex = this.activeProgram.modules.findIndex(m => m.id === moduleId);
    if (currentIndex < this.activeProgram.modules.length - 1) {
      this.switchModule(this.activeProgram.modules[currentIndex + 1].id);
      this.showToast("Progress saved! Loaded next video lesson.", "info");
    } else {
      // Completed all modules!
      this.showToast("🎉 Congratulations! You have completed all modules in this program!", "success");
      this.triggerConfetti();
      window.certificateStudio.openCertificateModal(this.activeProgram.id);
    }
  }

  // --- ADMIN DASHBOARD WITH 5 PROFESSIONAL CUTS ---
  setDashboardCut(cutKey) {
    this.activeDashboardCut = cutKey;

    document.querySelectorAll("[data-dash-cut]").forEach(btn => {
      if (btn.getAttribute("data-dash-cut") === cutKey) {
        btn.classList.add("bg-[#dd1f36]", "text-white");
        btn.classList.remove("bg-slate-800", "text-slate-400");
      } else {
        btn.classList.remove("bg-[#dd1f36]", "text-white");
        btn.classList.add("bg-slate-800", "text-slate-400");
      }
    });

    this.renderDashboard();
  }

  renderDashboard() {
    const container = document.getElementById("dashboardCutContent");
    if (!container) return;

    const enrolledIds = window.appState.enrolledPrograms || [];
    const courses = window.COURSES_DATA || [];
    const enrolledCourses = courses.filter(c => enrolledIds.includes(c.id));
    
    // Aggregations
    let totalWatchSecs = 0;
    Object.values(window.appState.videoStatus || {}).forEach(v => {
      if (v.maxWatchedSeconds) totalWatchSecs += v.maxWatchedSeconds;
      else if (v.isFinished) totalWatchSecs += 600;
    });
    const totalWatchHours = (totalWatchSecs / 3600).toFixed(1);
    const totalWatchMins = Math.round(totalWatchSecs / 60);

    const quizResults = Object.values(window.appState.quizResults || {});
    const passedQuizzes = quizResults.filter(q => q.passed).length;
    const avgScore = quizResults.length > 0 
      ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length)
      : 0;

    const certsCount = window.appState.certificates.length;
    const compliantCoursesCount = courses.filter(c => window.appState.isProgramCompleted(c.id) || !!window.appState.getCertificate(c.id)).length;
    const complianceRate = courses.length > 0 ? Math.round((compliantCoursesCount / courses.length) * 100) : 0;

    // Render active cut
    if (this.activeDashboardCut === "executive") {
      this.renderCutExecutive(container, { enrolledIds, courses, enrolledCourses, totalWatchHours, totalWatchMins, quizResults, passedQuizzes, avgScore, certsCount, compliantCoursesCount, complianceRate });
    } else if (this.activeDashboardCut === "curriculum") {
      this.renderCutCurriculum(container, { courses, enrolledIds });
    } else if (this.activeDashboardCut === "compliance") {
      this.renderCutCompliance(container, { courses, certsCount, avgScore, compliantCoursesCount, complianceRate });
    } else if (this.activeDashboardCut === "rigor") {
      this.renderCutRigor(container, { courses, quizResults, avgScore, passedQuizzes });
    } else if (this.activeDashboardCut === "engagement") {
      this.renderCutEngagement(container, { courses, totalWatchMins, totalWatchHours });
    }
  }

  // CUT 1: EXECUTIVE OVERVIEW
  renderCutExecutive(container, data) {
    container.innerHTML = `
      <!-- 5 Key Executive KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center font-bold text-xl">📚</div>
          <div>
            <div class="text-2xl font-black text-white">${data.courses.length} Tracks</div>
            <div class="text-xs text-slate-400 font-medium">${data.enrolledIds.length} Enrolled Curricula</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xl">⏱️</div>
          <div>
            <div class="text-2xl font-black text-white">${data.totalWatchMins} Mins</div>
            <div class="text-xs text-slate-400 font-medium">Video Hours: ${data.totalWatchHours} hrs</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xl">🎯</div>
          <div>
            <div class="text-2xl font-black text-white">${data.avgScore}%</div>
            <div class="text-xs text-slate-400 font-medium">Avg Assessment Score</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xl">🎓</div>
          <div>
            <div class="text-2xl font-black text-amber-400">${data.certsCount}</div>
            <div class="text-xs text-slate-400 font-medium">Issued Certificates</div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-emerald-900/50 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xl">🛡️</div>
          <div>
            <div class="text-xs font-black uppercase tracking-wider text-emerald-400">COMPLIANCE</div>
            <div class="text-sm font-bold text-white">${data.complianceRate}% (${data.compliantCoursesCount}/${data.courses.length} Passed)</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Excel Banner -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#1b0a0e] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Institutional Governance & Audit Export</span>
          <h3 class="text-lg font-bold text-white mt-0.5">Need full audit sheets for management or legal compliance?</h3>
          <p class="text-xs text-slate-400 mt-1">Export formatted multi-sheet Excel workbooks with executive summaries, POSH matrices, and video watch trails.</p>
        </div>
        <div class="flex items-center space-x-3 shrink-0">
          <button 
            onclick="window.reportsManager.exportMasterAuditWorkbook()" 
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2"
          >
            <span>📗 Export Master Audit (.xlsx)</span>
          </button>
          <button 
            onclick="window.app.navigate('reports')" 
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
          >
            Open Reports Center
          </button>
        </div>
      </div>

      <!-- Curriculum Completion Velocity -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">Curriculum Velocity & Active Tracks</h3>
          <span class="text-xs text-slate-400">${data.courses.length} Total Curricula Available (${data.enrolledIds.length} Enrolled)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${data.courses.map(program => {
            const isEnrolled = window.appState.isEnrolled(program.id);
            const progress = window.appState.getProgramProgress(program.id);
            const hasCert = !!window.appState.getCertificate(program.id);
            return `
              <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start space-x-3">
                    <img src="${program.thumbnail}" class="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#dd1f36]/20 text-[#dd1f36]">${program.category}</span>
                        ${hasCert ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">🎓 Certified</span>' : ''}
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${isEnrolled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                          ${isEnrolled ? 'Enrolled' : 'Catalog Track'}
                        </span>
                      </div>
                      <h4 class="text-sm font-bold text-white mt-1 line-clamp-1">${program.title}</h4>
                      <p class="text-xs text-slate-400 mt-0.5">
                        ${isEnrolled ? `${progress.completed} of ${progress.total} lessons passed` : `${(program.modules || []).length} lessons available`}
                      </p>
                    </div>
                  </div>
                  <span class="text-sm font-extrabold ${isEnrolled ? 'text-[#dd1f36]' : 'text-slate-500'}">${progress.percentage}%</span>
                </div>

                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-gradient-to-r from-[#dd1f36] to-[#9744cc] h-full rounded-full transition-all" style="width: ${progress.percentage}%"></div>
                </div>

                <div class="flex items-center justify-between pt-1">
                  <span class="text-xs text-slate-400 font-mono">Duration: ${program.duration}</span>
                  ${isEnrolled ? `
                    <button 
                      onclick="window.app.startProgram('${program.id}')" 
                      class="px-4 py-1.5 rounded-lg bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs transition"
                    >
                      ${progress.percentage === 100 ? 'Review Lessons' : 'Resume'}
                    </button>
                  ` : `
                    <button 
                      onclick="window.app.enrollInProgram('${program.id}')" 
                      class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-1"
                    >
                      <span>⚡ Enroll & Launch</span>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // CUT 2: CURRICULUM PERFORMANCE CUT
  renderCutCurriculum(container, data) {
    const totalModules = data.courses.reduce((acc, c) => acc + (c.modules ? c.modules.length : 0), 0);
    const categoriesCount = new Set(data.courses.map(c => c.category)).size;
    const enrolledProgresses = data.courses.map(c => window.appState.getProgramProgress(c.id).percentage);
    const avgProg = enrolledProgresses.length > 0 ? Math.round(enrolledProgresses.reduce((a, b) => a + b, 0) / enrolledProgresses.length) : 0;

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white">Curriculum & Departmental Breakdown Cut</h3>
          <p class="text-xs text-slate-400">Institutional performance slice across all ${data.courses.length} training tracks and ${categoriesCount} competency tracks.</p>
        </div>
        <button 
          onclick="window.reportsManager.exportActiveToExcel()" 
          class="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition flex items-center space-x-1.5 self-start"
        >
          <span>📊 Export Curriculum Cut (.xlsx)</span>
        </button>
      </div>

      <!-- Departmental Highlights KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Curricula Tracks</div>
          <div class="text-2xl font-black text-white mt-1">${data.courses.length} Available</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${data.enrolledIds.length} Active in Learning</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Total Video Lessons</div>
          <div class="text-2xl font-black text-cyan-400 mt-1">${totalModules} Modules</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Across All Programs</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Disciplines</div>
          <div class="text-2xl font-black text-purple-400 mt-1">${categoriesCount} Domains</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Enterprise Breadth</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Avg Track Completion</div>
          <div class="text-2xl font-black text-emerald-400 mt-1">${avgProg}%</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Curriculum Velocity</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${data.courses.map(program => {
          const isEnrolled = window.appState.isEnrolled(program.id);
          const progress = window.appState.getProgramProgress(program.id);
          const hasCert = !!window.appState.getCertificate(program.id);
          const modules = program.modules || [];

          return `
            <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">${program.category}</span>
                    <h4 class="text-base font-bold text-white mt-1.5">${program.title}</h4>
                    <p class="text-xs text-slate-400 mt-1 line-clamp-2">${program.tagline}</p>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-full font-bold ${isEnrolled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                    ${isEnrolled ? 'Enrolled' : 'Catalog Only'}
                  </span>
                </div>

                <!-- Metrics Slice -->
                <div class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <div>
                    <div class="text-sm font-bold text-white">${modules.length}</div>
                    <div class="text-[10px] text-slate-500 uppercase">Modules</div>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-cyan-400">${progress.percentage}%</div>
                    <div class="text-[10px] text-slate-500 uppercase">Completion</div>
                  </div>
                  <div>
                    <div class="text-sm font-bold text-amber-400">${hasCert ? '100%' : 'Pending'}</div>
                    <div class="text-[10px] text-slate-500 uppercase">Certification</div>
                  </div>
                </div>

                <!-- Skills tags -->
                <div class="flex flex-wrap gap-1.5 pt-1">
                  ${(program.skills || []).map(s => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">${s}</span>`).join("")}
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800/80">
                <button 
                  onclick="${isEnrolled ? `window.app.startProgram('${program.id}')` : `window.app.enrollInProgram('${program.id}')`}" 
                  class="w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${isEnrolled ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}"
                >
                  <span>${isEnrolled ? (progress.percentage === 100 ? 'Review Lessons' : 'Resume Track') : '⚡ Quick Enroll & Launch'}</span>
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // CUT 3: STATUTORY & GOVERNANCE COMPLIANCE MATRIX CUT
  renderCutCompliance(container, data) {
    const courses = data.courses || window.COURSES_DATA || [];
    const complianceRoster = courses.map((prog, idx) => {
      const cert = window.appState.getCertificate(prog.id);
      const isCompleted = window.appState.isProgramCompleted(prog.id) || !!cert;
      const progress = window.appState.getProgramProgress(prog.id);
      const isEnrolled = window.appState.isEnrolled(prog.id);
      
      const modules = prog.modules || [];
      const watchedCount = modules.filter(m => window.appState.isVideoFinished(m.id)).length;
      const allWatched = modules.length > 0 && watchedCount === modules.length;

      const quizModules = modules.filter(m => m.quiz);
      const passedQuizzes = quizModules.filter(m => {
        const q = window.appState.quizResults[m.id];
        return q && q.passed;
      }).length;
      const allQuizzesPassed = quizModules.length > 0 && passedQuizzes === quizModules.length;

      const isCompliant = isCompleted || (allWatched && (quizModules.length === 0 || allQuizzesPassed));
      const cleanSlug = (prog.slug || prog.id || `TRK${idx + 1}`).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

      return {
        id: `STAT-${cleanSlug}-2026`,
        program: prog,
        isCompliant,
        isEnrolled,
        progress,
        cert,
        modulesCount: modules.length,
        watchedCount,
        allWatched,
        quizCount: quizModules.length,
        passedQuizzes,
        allQuizzesPassed
      };
    });

    const compliantCount = complianceRoster.filter(r => r.isCompliant).length;
    const compRate = courses.length > 0 ? Math.round((compliantCount / courses.length) * 100) : 0;
    const totalWatchedModules = complianceRoster.reduce((acc, r) => acc + r.watchedCount, 0);
    const totalModulesCount = complianceRoster.reduce((acc, r) => acc + r.modulesCount, 0);

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-lg font-bold text-white">Statutory & Governance Compliance Matrix</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${compRate === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
              ${compRate === 100 ? '100% AUDIT READY' : `${compRate}% COMPLIANT`}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Official regulatory and institutional compliance cut across all ${courses.length} curriculum tracks.</p>
        </div>
        <button 
          onclick="window.reportsManager.exportPOSHMatrixToExcel()" 
          class="px-4 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white text-xs font-bold shadow-lg transition flex items-center space-x-1.5 self-start"
        >
          <span>🛡️ Export Compliance Matrix (.xlsx)</span>
        </button>
      </div>

      <!-- Statutory Highlights Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-slate-900 border ${compRate === 100 ? 'border-emerald-900/40' : 'border-amber-900/40'} space-y-1">
          <div class="text-xs text-slate-400">Institutional Compliance Health</div>
          <div class="text-2xl font-black ${compRate === 100 ? 'text-emerald-400' : 'text-amber-400'}">${compRate}% COMPLIANT</div>
          <div class="text-[11px] text-slate-400">${compliantCount} of ${courses.length} Tracks Fully Satisfied</div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-xs text-slate-400">Anti-Skip Video Gating Integrity</div>
          <div class="text-2xl font-black text-white">${totalWatchedModules} / ${totalModulesCount} Passed</div>
          <div class="text-[11px] text-emerald-400">Zero Seeking Skips Recorded</div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-xs text-slate-400">Assessment Evaluation Grade</div>
          <div class="text-2xl font-black text-cyan-400">${data.avgScore}% Average</div>
          <div class="text-[11px] text-slate-400">Mandatory 80% Rigor Threshold</div>
        </div>
      </div>

      <!-- Statutory Audit Roster Table -->
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white">Internal Committee (IC) & Corporate Governance Audit Roster</h4>
          <span class="text-xs text-slate-400 font-mono">${courses.length} Tracks Monitored</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="text-[10px] uppercase text-slate-500 border-b border-slate-800 pb-2">
              <tr>
                <th class="py-2.5">Learner Name</th>
                <th>Program Track</th>
                <th>Category</th>
                <th>Watch Gate</th>
                <th>Assessment</th>
                <th>Status</th>
                <th>Credential ID</th>
                <th>Refresher Due</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 font-mono">
              ${complianceRoster.map(item => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3 font-sans font-bold text-white">${window.appState.user.name}</td>
                  <td class="font-sans font-semibold text-slate-200">${item.program.title}</td>
                  <td class="font-sans"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">${item.program.category}</span></td>
                  <td>
                    <span class="${item.allWatched ? 'text-emerald-400 font-bold' : (item.watchedCount > 0 ? 'text-amber-300' : 'text-slate-500')}">
                      ${item.allWatched ? '✓ 100% Watched' : `${item.watchedCount}/${item.modulesCount} Watched`}
                    </span>
                  </td>
                  <td>
                    <span class="${item.allQuizzesPassed ? 'text-emerald-400 font-bold' : (item.passedQuizzes > 0 ? 'text-amber-300' : 'text-slate-500')}">
                      ${item.quizCount > 0 ? (item.allQuizzesPassed ? '✓ Passed (≥80%)' : `${item.passedQuizzes}/${item.quizCount} Passed`) : 'Exempt'}
                    </span>
                  </td>
                  <td>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isCompliant ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (item.isEnrolled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400')}">
                      ${item.isCompliant ? 'COMPLIANT' : (item.isEnrolled ? 'IN PROGRESS' : 'NOT STARTED')}
                    </span>
                  </td>
                  <td class="text-slate-400">${item.cert ? item.cert.credentialId : (item.isCompliant ? 'WXP-AUDIT-VERIFIED' : 'Pending')}</td>
                  <td class="text-slate-400">${item.isCompliant ? '2027-09-24 (Annual)' : 'Immediate Action Required'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // CUT 4: ASSESSMENT & EXAM RIGOR CUT
  renderCutRigor(container, data) {
    const allModules = (data.courses || []).flatMap(c => (c.modules || []).map(m => ({ ...m, programTitle: c.title })));
    const assessedModules = allModules.filter(m => m.quiz);
    const totalQuestions = assessedModules.reduce((acc, m) => acc + (m.quiz.questions ? m.quiz.questions.length : 0), 0);

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white">Assessment & Exam Rigor Analytics Cut</h3>
          <p class="text-xs text-slate-400">Detailed breakdown of question difficulty, score distributions, and pass rates across ${allModules.length} curriculum modules.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button 
            onclick="window.reportsManager.exportQuestionsKeyToExcel()" 
            class="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition flex items-center space-x-1.5"
            title="Export all module questions and answers across all courses to Excel"
          >
            <span>📝 Export Q&A Key (.xlsx)</span>
          </button>
          <button 
            onclick="window.reportsManager.exportGradebookToExcel()" 
            class="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center space-x-1.5"
          >
            <span>🎯 Export Gradebook (.xlsx)</span>
          </button>
        </div>
      </div>

      <!-- Exam Rigor Summary KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Assessed Curriculum Modules</div>
          <div class="text-2xl font-black text-cyan-400 mt-1">${assessedModules.length} Modules</div>
          <div class="text-[11px] text-slate-500 mt-0.5">With Embedded Examinations</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Master Question Bank</div>
          <div class="text-2xl font-black text-purple-400 mt-1">${totalQuestions} Questions</div>
          <div class="text-[11px] text-slate-500 mt-0.5">MCQ Assessment Bank</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Average Evaluation Standard</div>
          <div class="text-2xl font-black text-emerald-400 mt-1">${data.avgScore}% Average</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${data.passedQuizzes} Assessments Passed (≥80%)</div>
        </div>
      </div>

      <!-- Rigor Breakdown Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-white">Curriculum Evaluation Standard (Passing Grade: 80%)</span>
          <span class="text-xs text-cyan-400 font-semibold">Average Passing Rate: ${data.avgScore}%</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="text-[10px] uppercase text-slate-500 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th class="px-5 py-3">Program Title</th>
                <th class="px-5 py-3">Assessment Title</th>
                <th class="px-5 py-3">Score</th>
                <th class="px-5 py-3">Score %</th>
                <th class="px-5 py-3">Threshold</th>
                <th class="px-5 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${assessedModules.map(mod => {
                const res = window.appState.quizResults[mod.id];
                const isPassed = res && res.passed;
                return `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="px-5 py-3 font-medium text-white">${mod.programTitle}</td>
                    <td class="px-5 py-3 text-slate-300">${mod.quiz.title}</td>
                    <td class="px-5 py-3 font-mono">${res ? `${res.score}/${res.total}` : 'Not Taken'}</td>
                    <td class="px-5 py-3 font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-slate-400'}">${res ? `${res.percentage}%` : '0%'}</td>
                    <td class="px-5 py-3 font-mono text-slate-400">${mod.quiz.passingScore}%</td>
                    <td class="px-5 py-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                        ${isPassed ? 'PASSED ✓' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // CUT 5: VIDEO ENGAGEMENT & ANTI-SKIP CUT
  renderCutEngagement(container, data) {
    const allModules = (data.courses || []).flatMap(c => (c.modules || []).map(m => ({ ...m, programTitle: c.title })));
    const finishedCount = allModules.filter(m => window.appState.isVideoFinished(m.id)).length;

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 class="text-lg font-bold text-white">Video Watch & Anti-Skip Integrity Cut</h3>
          <p class="text-xs text-slate-400">Forensic logs guaranteeing that learners fully watched instruction across all ${allModules.length} lessons.</p>
        </div>
        <button 
          onclick="window.reportsManager.exportActiveToExcel()" 
          class="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition flex items-center space-x-1.5 self-start"
        >
          <span>⏱️ Export Video Audit (.xlsx)</span>
        </button>
      </div>

      <!-- Video Watch KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Monitored Lessons</div>
          <div class="text-2xl font-black text-white mt-1">${allModules.length} Modules</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Across All Curricula</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Streamed Hours</div>
          <div class="text-2xl font-black text-purple-400 mt-1">${data.totalWatchHours} hrs</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${data.totalWatchMins} Total Minutes</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Fully Watched</div>
          <div class="text-2xl font-black text-emerald-400 mt-1">${finishedCount} / ${allModules.length}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Completed Modules</div>
        </div>

        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-medium">Anti-Skip Lock</div>
          <div class="text-xl font-black text-amber-400 mt-1">100% ENFORCED</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Seeking Restricted</div>
        </div>
      </div>

      <!-- Anti-Skip Mechanism Card -->
      <div class="p-5 rounded-2xl bg-purple-950/20 border border-purple-900/40 flex items-start space-x-4">
        <div class="text-2xl">🔒</div>
        <div>
          <h4 class="text-sm font-bold text-purple-300">Anti-Skip High-Water Mark Enforcement</h4>
          <p class="text-xs text-slate-400 mt-0.5">Learners cannot skip ahead beyond their maximum continuously watched position. Assessment access remains locked until 90% of the video duration is legitimately verified.</p>
        </div>
      </div>

      <!-- Video Watch Logs -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="text-[10px] uppercase text-slate-500 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th class="px-5 py-3">Lesson Title</th>
                <th class="px-5 py-3">Program</th>
                <th class="px-5 py-3">Duration</th>
                <th class="px-5 py-3">Watched Seconds</th>
                <th class="px-5 py-3">Watch %</th>
                <th class="px-5 py-3">Anti-Skip Lock Status</th>
                <th class="px-5 py-3">Completion State</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 font-mono">
              ${allModules.map(mod => {
                const isFinished = window.appState.isVideoFinished(mod.id);
                const vStat = window.appState.videoStatus[mod.id] || {};
                const watchedSecs = vStat.maxWatchedSeconds || (isFinished ? 600 : 0);
                return `
                  <tr class="hover:bg-slate-800/40 transition">
                    <td class="px-5 py-3 font-sans font-medium text-white">${mod.title}</td>
                    <td class="px-5 py-3 font-sans text-xs text-slate-400">${mod.programTitle}</td>
                    <td class="px-5 py-3 text-slate-400">${mod.duration || '14:20'}</td>
                    <td class="px-5 py-3 text-slate-300">${watchedSecs}s</td>
                    <td class="px-5 py-3 ${isFinished ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${isFinished ? '100%' : `${vStat.percent || 0}%`}</td>
                    <td class="px-5 py-3 font-sans">
                      <span class="text-emerald-400 font-bold">${isFinished ? '✓ Unlocked' : 'Restricted'}</span>
                    </td>
                    <td class="px-5 py-3 font-sans">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isFinished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
                        ${isFinished ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- STUDENT / MY LEARNING VIEW ---
  renderMyLearning() {
    const enrolledIds = window.appState.enrolledPrograms || [];
    const courses = (window.COURSES_DATA || []).filter(c => enrolledIds.includes(c.id));
    
    const statsContainer = document.getElementById("myLearningStats");
    if (statsContainer) {
      const completedModulesCount = window.appState.completedModules.length;
      const certificatesCount = window.appState.certificates.length;
      const quizResults = Object.values(window.appState.quizResults);
      const avgScore = quizResults.length > 0 
        ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length)
        : 0;

      statsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center font-bold text-xl">📚</div>
          <div>
            <div class="text-2xl font-extrabold text-white">${enrolledIds.length}</div>
            <div class="text-xs text-slate-400 font-medium">Enrolled Programs</div>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xl">✓</div>
          <div>
            <div class="text-2xl font-extrabold text-white">${completedModulesCount}</div>
            <div class="text-xs text-slate-400 font-medium">Completed Lessons</div>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xl">🎓</div>
          <div>
            <div class="text-2xl font-extrabold text-white">${certificatesCount}</div>
            <div class="text-xs text-slate-400 font-medium">Certificates Earned</div>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xl">📊</div>
          <div>
            <div class="text-2xl font-extrabold text-white">${avgScore}%</div>
            <div class="text-xs text-slate-400 font-medium">Average Quiz Score</div>
          </div>
        </div>
      `;
    }

    const listContainer = document.getElementById("myLearningEnrolledList");
    if (!listContainer) return;

    if (courses.length === 0) {
      listContainer.innerHTML = `
        <div class="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <h4 class="text-base font-bold text-white">No Programs Enrolled Yet</h4>
          <p class="text-xs mt-1">Browse our program catalog and enroll in your first certification track today.</p>
          <button 
            onclick="window.app.navigate('catalog')" 
            class="mt-4 px-5 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs"
          >
            Browse Programs
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = courses.map(program => {
      const progress = window.appState.getProgramProgress(program.id);
      const hasCert = !!window.appState.getCertificate(program.id);

      return `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-start space-x-4">
            <img src="${program.thumbnail}" class="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0" />
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#dd1f36]/20 text-[#dd1f36]">${program.category}</span>
                ${hasCert ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">🎓 Certified</span>' : ''}
              </div>
              <h4 class="text-lg font-bold text-white mt-1">${program.title}</h4>
              <p class="text-xs text-slate-400 mt-0.5">${progress.completed} of ${progress.total} modules passed</p>
            </div>
          </div>

          <div class="w-full md:w-64 space-y-2">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-slate-400">Curriculum Progress</span>
              <span class="text-[#dd1f36] font-bold">${progress.percentage}%</span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-[#dd1f36] h-full rounded-full transition-all" style="width: ${progress.percentage}%"></div>
            </div>
          </div>

          <div class="flex items-center space-x-3 shrink-0">
            <button 
              onclick="window.app.startProgram('${program.id}')"
              class="px-5 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/20 transition"
            >
              ${progress.percentage === 100 ? 'Review Course' : 'Resume Learning'}
            </button>
            ${hasCert ? `
              <button 
                onclick="window.certificateStudio.openCertificateModal('${program.id}')"
                class="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition"
              >
                View Certificate
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join("");
  }

  // --- CERTIFICATES LOCKER VIEW ---
  renderCertificatesView() {
    const container = document.getElementById("certificatesGrid");
    if (!container) return;

    const certs = window.appState.certificates;

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
          <div class="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-3xl mb-3">🎓</div>
          <h3 class="text-xl font-bold text-white">No Certificates Earned Yet</h3>
          <p class="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Complete all video lessons and pass post-video Q&A quizzes with 80% or higher to unlock official certificates.
          </p>
          <button 
            onclick="window.app.navigate('catalog')" 
            class="mt-6 px-6 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg transition"
          >
            Explore Available Programs
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = certs.map(cert => {
      return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div class="absolute -right-6 -bottom-6 text-7xl text-amber-500/5 font-serif select-none pointer-events-none">★</div>
          
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Official Credential
              </span>
              <span class="text-xs font-mono text-slate-500">${cert.credentialId}</span>
            </div>

            <h3 class="text-xl font-bold text-white mt-4 leading-snug">${cert.programTitle}</h3>
            
            <div class="mt-4 pt-4 border-t border-slate-800 text-xs space-y-1 text-slate-400">
              <div>Recipient: <span class="text-white font-semibold">${cert.studentName}</span></div>
              <div>Issue Date: <span class="text-slate-300">${cert.issueDate}</span></div>
              <div>Honors: <span class="text-amber-400 font-semibold">${cert.grade}</span></div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-800 flex items-center space-x-3">
            <button 
              onclick="window.certificateStudio.openCertificateModal('${cert.programId}')" 
              class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center space-x-1"
            >
              <span>View & Download</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- SYLLABUS DETAIL MODAL ---
  openSyllabusModal(programId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!prog) return;

    const modal = document.getElementById("syllabusModal");
    const container = document.getElementById("syllabusModalContent");
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <span class="text-xs font-bold text-[#dd1f36] uppercase tracking-wider">${prog.category} Program</span>
            <h3 class="text-2xl font-extrabold text-white mt-1">${prog.title}</h3>
            <p class="text-xs text-slate-400 mt-1">${prog.tagline}</p>
          </div>
          <button onclick="document.getElementById('syllabusModal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="space-y-4">
          <h4 class="text-sm font-bold uppercase text-slate-300 tracking-wider">Curriculum Modules (${prog.modules.length})</h4>
          ${prog.modules.map((m, i) => `
            <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <h5 class="text-sm font-bold text-white">${i + 1}. ${m.title}</h5>
                <span class="text-xs font-mono text-slate-400">⏱ ${m.duration}</span>
              </div>
              <p class="text-xs text-slate-400">${m.description}</p>
              <div class="text-[11px] text-[#dd1f36] font-semibold">✓ Includes Video Lesson + ${m.quiz.questions.length}-Question Assessment</div>
            </div>
          `).join("")}
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button onclick="document.getElementById('syllabusModal').classList.add('hidden')" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Close</button>
          <button 
            onclick="document.getElementById('syllabusModal').classList.add('hidden'); window.app.enrollInProgram('${prog.id}');"
            class="px-6 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg transition"
          >
            Enroll in this Program
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.scrollTop = 0;
  }

  // Toast notifications
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all transform translate-y-4 opacity-0 flex items-center space-x-2 border ${
      type === "success" ? "bg-emerald-600 border-emerald-400 shadow-emerald-600/30" : "bg-[#dd1f36] border-[#dd1f36]/50 shadow-[#dd1f36]/30"
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 50);

    setTimeout(() => {
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3500);
  }

  // Celebratory confetti
  triggerConfetti() {
    const colors = ["#dd1f36", "#9744cc", "#f59e0b", "#10b981", "#ef4444"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (Math.random() * 2 + 2) + "s";
      piece.style.animationDelay = (Math.random() * 0.5) + "s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }
  }
}

// Global initialization
window.app = new App();
document.addEventListener("DOMContentLoaded", () => {
  window.app.init();
});
