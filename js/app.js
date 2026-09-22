/**
 * LearnPulse E-Learning Platform - Main Application Coordinator & View Router
 */

class App {
  constructor() {
    this.currentView = "catalog"; // "catalog" | "learning" | "dashboard" | "certificates"
    this.selectedCategory = "all";
    this.searchQuery = "";
    this.activeProgram = null;
    this.activeModule = null;
  }

  init() {
    // Set default active program if any
    if (window.COURSES_DATA && window.COURSES_DATA.length > 0) {
      this.activeProgram = window.COURSES_DATA[0];
      this.activeModule = this.activeProgram.modules[0];
    }

    this.bindGlobalEvents();
    this.render();

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
                  window.COURSES_DATA[existingIdx] = { ...window.COURSES_DATA[existingIdx], ...detail.program };
                } else {
                  window.COURSES_DATA.push(detail.program);
                }
              }
            }
            this.renderCatalogGrid();
          }
        } catch (e) {
          console.log('Using local curriculum cache.');
        }
      }, 500);
    }

    // Subscribe to state changes to update stats & UI
    window.appState.subscribe(() => {
      this.updateHeaderProfile();
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
  }

  navigate(viewName, programId = null, moduleId = null) {
    this.currentView = viewName;

    // Update active nav styling
    document.querySelectorAll("[data-nav-target]").forEach(el => {
      if (el.getAttribute("data-nav-target") === viewName) {
        el.classList.add("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        el.classList.remove("text-slate-400");
      } else {
        el.classList.remove("text-[#dd1f36]", "border-b-2", "border-[#dd1f36]");
        el.classList.add("text-slate-400");
      }
    });

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
    const certificatesView = document.getElementById("viewCertificates");
    const instructorView = document.getElementById("viewInstructor");

    // Hide all
    if (catalogView) catalogView.classList.add("hidden");
    if (learningView) learningView.classList.add("hidden");
    if (dashboardView) dashboardView.classList.add("hidden");
    if (certificatesView) certificatesView.classList.add("hidden");
    if (instructorView) instructorView.classList.add("hidden");

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
    } else if (this.currentView === "certificates") {
      if (certificatesView) certificatesView.classList.remove("hidden");
      this.renderCertificatesView();
    } else if (this.currentView === "instructor") {
      if (instructorView) instructorView.classList.remove("hidden");
      if (window.instructorStudio) window.instructorStudio.switchTab(window.instructorStudio.activeTab || "programs");
    }
  }

  updateHeaderProfile() {
    const nameEl = document.getElementById("headerStudentName");
    const certCountEl = document.getElementById("headerCertCount");
    if (nameEl) nameEl.textContent = window.appState.user.name;
    if (certCountEl) certCountEl.textContent = window.appState.certificates.length;
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
    window.videoPlayer.init("videoPlayerMount", this.activeModule);

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

  // --- STUDENT DASHBOARD VIEW ---
  renderDashboard() {
    const enrolledIds = window.appState.enrolledPrograms;
    const courses = (window.COURSES_DATA || []).filter(c => enrolledIds.includes(c.id));
    
    // Stats calculation
    const totalEnrolled = enrolledIds.length;
    const certificatesCount = window.appState.certificates.length;
    const completedModulesCount = window.appState.completedModules.length;

    // Quiz average
    const quizResults = Object.values(window.appState.quizResults);
    const avgScore = quizResults.length > 0 
      ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length)
      : 0;

    const statsContainer = document.getElementById("dashboardStats");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center font-bold text-xl">📚</div>
          <div>
            <div class="text-2xl font-extrabold text-white">${totalEnrolled}</div>
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

    const listContainer = document.getElementById("dashboardEnrolledList");
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
