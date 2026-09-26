/**
 * Worxpertise Academy - Instructor & Admin Studio
 * Enables creating & editing programs, managing video lessons, authoring interactive quizzes,
 * and maintaining the full curriculum library with PostgreSQL database sync.
 */

class InstructorStudio {
  constructor() {
    this.activeTab = "programs"; // "programs" | "modules" | "quiz" | "overview"
    this.selectedProgramId = null;
    this.selectedModuleId = null;
    this.quizQuestions = [];
    this.collapsedCourses = {}; // Track expanded/collapsed course lessons in overview
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll("[data-instructor-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-instructor-tab");
        this.switchTab(target);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update tab button styles
    document.querySelectorAll("[data-instructor-tab]").forEach(btn => {
      if (btn.getAttribute("data-instructor-tab") === tabName) {
        btn.classList.add("bg-[#dd1f36]", "text-white");
        btn.classList.remove("bg-slate-800", "text-slate-400");
      } else {
        btn.classList.remove("bg-[#dd1f36]", "text-white");
        btn.classList.add("bg-slate-800", "text-slate-400");
      }
    });

    // Toggle panes
    const paneProg = document.getElementById("paneCreateProgram");
    const paneMod = document.getElementById("paneAddModule");
    const paneQuiz = document.getElementById("paneAuthorQuiz");
    const paneOverview = document.getElementById("paneInstructorOverview");

    if (paneProg) paneProg.classList.toggle("hidden", tabName !== "programs");
    if (paneMod) paneMod.classList.toggle("hidden", tabName !== "modules");
    if (paneQuiz) paneQuiz.classList.toggle("hidden", tabName !== "quiz");
    if (paneOverview) paneOverview.classList.toggle("hidden", tabName !== "overview");

    if (tabName === "modules") this.populateProgramDropdowns();
    if (tabName === "quiz") this.populateQuizDropdowns();
    if (tabName === "overview") this.renderOverview();
  }

  // =========================================================================
  // --- TAB 1: CREATE / EDIT PROGRAM ---
  // =========================================================================
  editProgram(programId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!prog) {
      window.app.showToast("Course not found.", "info");
      return;
    }

    const editIdInput = document.getElementById("instEditProgramId");
    const titleInput = document.getElementById("instProgTitle");
    const taglineInput = document.getElementById("instProgTagline");
    const catInput = document.getElementById("instProgCategory");
    const levelInput = document.getElementById("instProgLevel");
    const durInput = document.getElementById("instProgDuration");
    const thumbInput = document.getElementById("instProgThumbnail");
    const skillsInput = document.getElementById("instProgSkills");

    if (editIdInput) editIdInput.value = prog.id;
    if (titleInput) titleInput.value = prog.title || "";
    if (taglineInput) taglineInput.value = prog.tagline || "";
    if (catInput) catInput.value = prog.category || "";
    if (levelInput) levelInput.value = prog.level || "Intermediate";
    if (durInput) durInput.value = prog.duration || "";
    if (thumbInput) thumbInput.value = prog.thumbnail || "";
    if (skillsInput) skillsInput.value = Array.isArray(prog.skills) ? prog.skills.join(", ") : (prog.skills || "");

    // Update form header titles and buttons to Edit mode
    const formTitle = document.getElementById("instProgramFormTitle");
    const formSubtitle = document.getElementById("instProgramFormSubtitle");
    const submitBtnText = document.getElementById("btnSubmitProgramText");
    const cancelBtnTop = document.getElementById("btnCancelEditProgram");
    const cancelBtnBottom = document.getElementById("btnCancelEditProgramBottom");

    if (formTitle) formTitle.innerText = `Edit Course: ${prog.title}`;
    if (formSubtitle) formSubtitle.innerText = "Modify course metadata, syllabus description, or thumbnail. Changes sync with PostgreSQL.";
    if (submitBtnText) submitBtnText.innerText = "💾 Save Course Changes";
    if (cancelBtnTop) cancelBtnTop.classList.remove("hidden");
    if (cancelBtnBottom) cancelBtnBottom.classList.remove("hidden");

    this.switchTab("programs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancelEditProgram() {
    const editIdInput = document.getElementById("instEditProgramId");
    if (editIdInput) editIdInput.value = "";

    const form = document.getElementById("formCreateProgram");
    if (form) form.reset();

    const formTitle = document.getElementById("instProgramFormTitle");
    const formSubtitle = document.getElementById("instProgramFormSubtitle");
    const submitBtnText = document.getElementById("btnSubmitProgramText");
    const cancelBtnTop = document.getElementById("btnCancelEditProgram");
    const cancelBtnBottom = document.getElementById("btnCancelEditProgramBottom");

    if (formTitle) formTitle.innerText = "Publish a New Certification Program";
    if (formSubtitle) formSubtitle.innerText = "Fill in program details to add a new curriculum track to the platform and PostgreSQL.";
    if (submitBtnText) submitBtnText.innerText = "Publish Program & Proceed to Lessons →";
    if (cancelBtnTop) cancelBtnTop.classList.add("hidden");
    if (cancelBtnBottom) cancelBtnBottom.classList.add("hidden");
  }

  async handleCreateProgram(e) {
    e.preventDefault();
    const editProgramId = document.getElementById("instEditProgramId")?.value;

    const title = document.getElementById("instProgTitle").value.trim();
    const tagline = document.getElementById("instProgTagline").value.trim();
    const category_name = document.getElementById("instProgCategory").value.trim();
    const level = document.getElementById("instProgLevel").value;
    const duration = document.getElementById("instProgDuration").value.trim();
    const thumbnail_url = document.getElementById("instProgThumbnail").value.trim();
    const skillsRaw = document.getElementById("instProgSkills").value.trim();
    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    if (!title || !category_name || !duration || !thumbnail_url) {
      window.app.showToast("Please fill in all required fields.", "info");
      return;
    }

    const payload = {
      title,
      tagline,
      category_name,
      level,
      duration,
      thumbnail_url,
      skills
    };

    // --- CASE A: EDITING AN EXISTING PROGRAM ---
    if (editProgramId) {
      try {
        if (window.apiService && window.apiService.isBackendOnline) {
          const res = await window.apiService.updateProgram(editProgramId, payload);
          if (res && res.success) {
            window.app.showToast("🎉 Course updated in PostgreSQL database!", "success");
          }
        }

        // Update in-memory COURSES_DATA
        const prog = (window.COURSES_DATA || []).find(p => p.id === editProgramId);
        if (prog) {
          prog.title = title;
          prog.tagline = tagline;
          prog.category = category_name;
          prog.level = level;
          prog.duration = duration;
          prog.thumbnail = thumbnail_url;
          prog.skills = skills;
        }

        if (window.app && window.app.renderCatalogGrid) {
          window.app.renderCatalogGrid();
        }

        this.cancelEditProgram();
        window.app.showToast(`Course "${title}" updated successfully!`, "success");
        this.switchTab("overview");
      } catch (err) {
        console.error("Update program error:", err);
        window.app.showToast("Error updating course: " + err.message, "info");
      }
      return;
    }

    // --- CASE B: PUBLISHING A NEW PROGRAM ---
    try {
      let createdId = null;

      // Try sending to PostgreSQL API
      if (window.apiService && window.apiService.isBackendOnline) {
        const res = await window.apiService.createProgram(payload);
        if (res && res.success && res.program) {
          createdId = res.program.id;
          window.app.showToast("🎉 Program published to PostgreSQL database!", "success");
        }
      }

      // Add to client COURSES_DATA for instant local availability
      const newProg = {
        id: createdId || ("prog_" + Date.now()),
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline,
        category: category_name,
        level,
        rating: 5.0,
        enrolledCount: 0,
        duration,
        thumbnail: thumbnail_url,
        instructor: {
          name: (window.appState && window.appState.user && window.appState.user.name) || "Lead Instructor",
          role: "Verified Instructor",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          bio: "Course Author & Lead Subject Matter Expert"
        },
        authority: {
          name: "Prof. Arthur Sterling",
          role: "Dean of Academic Affairs & Governance",
          title: "Academic Board"
        },
        skills,
        modules: []
      };

      if (!window.COURSES_DATA) window.COURSES_DATA = [];
      window.COURSES_DATA.unshift(newProg);

      if (window.app && window.app.renderCatalogGrid) {
        window.app.renderCatalogGrid();
      }

      // Reset form
      this.cancelEditProgram();
      window.app.showToast(`Program "${title}" created! Now add video lessons to it.`, "success");

      // Auto switch to Add Module tab for this program
      this.selectedProgramId = newProg.id;
      this.switchTab("modules");
    } catch (err) {
      console.error("Create program error:", err);
      window.app.showToast("Error creating program: " + err.message, "info");
    }
  }

  async deleteProgram(programId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    const title = prog ? prog.title : "this course";

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${title}" along with all its lessons and quizzes?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    try {
      if (window.apiService && window.apiService.isBackendOnline) {
        await window.apiService.deleteProgram(programId);
      }

      window.COURSES_DATA = (window.COURSES_DATA || []).filter(p => p.id !== programId);

      if (window.app && window.app.renderCatalogGrid) {
        window.app.renderCatalogGrid();
      }

      this.renderOverview();
      window.app.showToast(`Course "${title}" and all related lessons deleted.`, "info");
    } catch (err) {
      console.error("Delete program error:", err);
      window.app.showToast("Error deleting program: " + err.message, "info");
    }
  }

  // =========================================================================
  // --- TAB 2: ADD / EDIT MODULE ---
  // =========================================================================
  populateProgramDropdowns() {
    const dropdown = document.getElementById("instModuleProgSelect");
    if (!dropdown) return;

    const programs = window.COURSES_DATA || [];
    dropdown.innerHTML = `
      <option value="">-- Select Program to Add / Edit Video Lesson --</option>
      ${programs.map(p => `
        <option value="${p.id}" ${p.id === this.selectedProgramId ? 'selected' : ''}>
          ${p.title} (${p.modules ? p.modules.length : 0} modules)
        </option>
      `).join("")}
    `;
  }

  editModule(programId, moduleId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!prog) return;
    const mod = (prog.modules || []).find(m => m.id === moduleId);
    if (!mod) return;

    this.selectedProgramId = programId;
    this.populateProgramDropdowns();

    const progSelect = document.getElementById("instModuleProgSelect");
    const editModIdInput = document.getElementById("instEditModuleId");
    const titleInput = document.getElementById("instModTitle");
    const durInput = document.getElementById("instModDuration");
    const videoUrlInput = document.getElementById("instModVideoUrl");
    const ytInput = document.getElementById("instModYoutubeId");
    const descInput = document.getElementById("instModDescription");
    const takeawaysInput = document.getElementById("instModTakeaways");

    if (progSelect) progSelect.value = programId;
    if (editModIdInput) editModIdInput.value = moduleId;
    if (titleInput) titleInput.value = mod.title || "";
    if (durInput) durInput.value = mod.duration || "";
    if (videoUrlInput) videoUrlInput.value = mod.videoUrl || "";
    if (ytInput) ytInput.value = mod.youtubeId || "";
    if (descInput) descInput.value = mod.description || "";
    if (takeawaysInput) {
      takeawaysInput.value = Array.isArray(mod.takeaways) ? mod.takeaways.join("\n") : (mod.takeaways || "");
    }

    const formTitle = document.getElementById("instModuleFormTitle");
    const formSubtitle = document.getElementById("instModuleFormSubtitle");
    const submitBtnText = document.getElementById("btnSubmitModuleText");
    const cancelBtnTop = document.getElementById("btnCancelEditModule");
    const cancelBtnBottom = document.getElementById("btnCancelEditModuleBottom");

    if (formTitle) formTitle.innerText = `Edit Video Lesson: ${mod.title}`;
    if (formSubtitle) formSubtitle.innerText = "Update video stream URL, lesson duration, key takeaways, or description.";
    if (submitBtnText) submitBtnText.innerText = "💾 Save Lesson Changes";
    if (cancelBtnTop) cancelBtnTop.classList.remove("hidden");
    if (cancelBtnBottom) cancelBtnBottom.classList.remove("hidden");

    this.switchTab("modules");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancelEditModule() {
    const editModIdInput = document.getElementById("instEditModuleId");
    if (editModIdInput) editModIdInput.value = "";

    const form = document.getElementById("formAddModule");
    if (form) form.reset();

    const formTitle = document.getElementById("instModuleFormTitle");
    const formSubtitle = document.getElementById("instModuleFormSubtitle");
    const submitBtnText = document.getElementById("btnSubmitModuleText");
    const cancelBtnTop = document.getElementById("btnCancelEditModule");
    const cancelBtnBottom = document.getElementById("btnCancelEditModuleBottom");

    if (formTitle) formTitle.innerText = "Add Video Lesson / Module";
    if (formSubtitle) formSubtitle.innerText = "Attach a high-definition video lesson to an existing program.";
    if (submitBtnText) submitBtnText.innerText = "Save Lesson & Configure Quiz →";
    if (cancelBtnTop) cancelBtnTop.classList.add("hidden");
    if (cancelBtnBottom) cancelBtnBottom.classList.add("hidden");
  }

  async handleAddModule(e) {
    e.preventDefault();
    const editModuleId = document.getElementById("instEditModuleId")?.value;
    const programId = document.getElementById("instModuleProgSelect").value;
    const title = document.getElementById("instModTitle").value.trim();
    const duration = document.getElementById("instModDuration").value.trim();
    const video_url = document.getElementById("instModVideoUrl").value.trim();
    const youtube_id = document.getElementById("instModYoutubeId").value.trim();
    const description = document.getElementById("instModDescription").value.trim();
    const takeawaysRaw = document.getElementById("instModTakeaways").value.trim();
    const takeaways = takeawaysRaw ? takeawaysRaw.split("\n").map(t => t.trim()).filter(Boolean) : [];

    if (!programId) {
      window.app.showToast("Please select a target program.", "info");
      return;
    }
    if (!title || !duration || !video_url || !description) {
      window.app.showToast("Please fill in all required lesson details.", "info");
      return;
    }

    const payload = {
      title,
      duration,
      video_url,
      youtube_id,
      description,
      takeaways,
      resources: [{ name: "Lesson Notes & Cheatsheet.pdf", size: "1.4 MB" }]
    };

    // --- CASE A: EDITING AN EXISTING MODULE ---
    if (editModuleId) {
      try {
        if (window.apiService && window.apiService.isBackendOnline) {
          const res = await window.apiService.updateModule(editModuleId, payload);
          if (res && res.success) {
            window.app.showToast("🎉 Lesson updated in PostgreSQL database!", "success");
          }
        }

        // Update in-memory COURSES_DATA
        (window.COURSES_DATA || []).forEach(p => {
          (p.modules || []).forEach(m => {
            if (m.id === editModuleId) {
              m.title = title;
              m.duration = duration;
              m.videoUrl = video_url;
              m.youtubeId = youtube_id;
              m.description = description;
              m.takeaways = takeaways;
            }
          });
        });

        this.cancelEditModule();
        window.app.showToast(`Lesson "${title}" updated successfully!`, "success");
        this.switchTab("overview");
      } catch (err) {
        console.error("Update module error:", err);
        window.app.showToast("Error updating module: " + err.message, "info");
      }
      return;
    }

    // --- CASE B: ADDING A NEW MODULE ---
    try {
      let createdModId = null;
      if (window.apiService && window.apiService.isBackendOnline) {
        const res = await window.apiService.addModule(programId, payload);
        if (res && res.success && res.module) {
          createdModId = res.module.id;
        }
      }

      // Add to local data
      const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
      if (prog) {
        const newMod = {
          id: createdModId || ("mod_" + Date.now()),
          title,
          order: (prog.modules ? prog.modules.length : 0) + 1,
          duration,
          videoUrl: video_url,
          youtubeId: youtube_id,
          description,
          takeaways,
          resources: [{ name: "Lesson Notes & Cheatsheet.pdf", size: "1.4 MB" }],
          quiz: null
        };
        if (!prog.modules) prog.modules = [];
        prog.modules.push(newMod);

        this.selectedModuleId = newMod.id;
      }

      this.cancelEditModule();
      window.app.showToast(`Lesson "${title}" added! Now author its post-video Q&A.`, "success");
      this.switchTab("quiz");
    } catch (err) {
      console.error("Add module error:", err);
      window.app.showToast("Error adding module: " + err.message, "info");
    }
  }

  async deleteModule(programId, moduleId) {
    const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!prog) return;
    const mod = (prog.modules || []).find(m => m.id === moduleId);
    const modTitle = mod ? mod.title : "this lesson";

    const confirmed = window.confirm(`Are you sure you want to delete lesson "${modTitle}"?\n\nThis will also remove any attached quiz.`);
    if (!confirmed) return;

    try {
      if (window.apiService && window.apiService.isBackendOnline) {
        await window.apiService.deleteModule(moduleId);
      }

      prog.modules = (prog.modules || []).filter(m => m.id !== moduleId);
      // Re-index module orders
      prog.modules.forEach((m, idx) => { m.order = idx + 1; });

      this.renderOverview();
      window.app.showToast(`Lesson "${modTitle}" deleted successfully.`, "info");
    } catch (err) {
      console.error("Delete module error:", err);
      window.app.showToast("Error deleting lesson: " + err.message, "info");
    }
  }

  // =========================================================================
  // --- TAB 3: AUTHOR / EDIT QUIZ ---
  // =========================================================================
  populateQuizDropdowns() {
    const progSelect = document.getElementById("instQuizProgSelect");
    const modSelect = document.getElementById("instQuizModSelect");
    if (!progSelect || !modSelect) return;

    const programs = window.COURSES_DATA || [];
    progSelect.innerHTML = `
      <option value="">-- 1. Select Program --</option>
      ${programs.map(p => `
        <option value="${p.id}" ${p.id === this.selectedProgramId ? 'selected' : ''}>${p.title}</option>
      `).join("")}
    `;

    progSelect.onchange = () => {
      const pId = progSelect.value;
      this.selectedProgramId = pId;
      const prog = programs.find(p => p.id === pId);
      if (prog && prog.modules && prog.modules.length > 0) {
        modSelect.innerHTML = `
          <option value="">-- 2. Select Video Lesson / Module --</option>
          ${prog.modules.map(m => `
            <option value="${m.id}" ${m.id === this.selectedModuleId ? 'selected' : ''}>
              ${m.order}. ${m.title} ${m.quiz ? '✓ (Quiz Configured)' : '(No Quiz Yet)'}
            </option>
          `).join("")}
        `;
      } else {
        modSelect.innerHTML = `<option value="">No modules found in this program</option>`;
      }
    };

    if (this.selectedProgramId) {
      progSelect.value = this.selectedProgramId;
      progSelect.onchange();
      if (this.selectedModuleId) {
        modSelect.value = this.selectedModuleId;
        this.loadExistingQuiz(this.selectedModuleId);
      }
    }

    modSelect.onchange = () => {
      this.selectedModuleId = modSelect.value;
      this.loadExistingQuiz(modSelect.value);
    };
  }

  editQuiz(programId, moduleId) {
    this.selectedProgramId = programId;
    this.selectedModuleId = moduleId;
    this.switchTab("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  loadExistingQuiz(moduleId) {
    let existingQuiz = null;
    (window.COURSES_DATA || []).forEach(p => {
      (p.modules || []).forEach(m => {
        if (m.id === moduleId && m.quiz) existingQuiz = m.quiz;
      });
    });

    if (existingQuiz) {
      const titleInput = document.getElementById("instQuizTitle");
      const scoreInput = document.getElementById("instQuizPassingScore");
      if (titleInput) titleInput.value = existingQuiz.title || "Module Knowledge Verification Assessment";
      if (scoreInput) scoreInput.value = existingQuiz.passingScore || 80;
      this.quizQuestions = JSON.parse(JSON.stringify(existingQuiz.questions || []));
    } else {
      const titleInput = document.getElementById("instQuizTitle");
      const scoreInput = document.getElementById("instQuizPassingScore");
      if (titleInput) titleInput.value = "Module Knowledge Verification Assessment";
      if (scoreInput) scoreInput.value = 80;
      this.quizQuestions = [
        {
          id: "q1",
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: ""
        }
      ];
    }
    this.renderQuizQuestionCards();
  }

  addQuestionCard() {
    this.quizQuestions.push({
      id: "q_" + Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    });
    this.renderQuizQuestionCards();
  }

  removeQuestionCard(index) {
    if (this.quizQuestions.length <= 1) {
      window.app.showToast("A quiz must have at least one question.", "info");
      return;
    }
    this.quizQuestions.splice(index, 1);
    this.renderQuizQuestionCards();
  }

  renderQuizQuestionCards() {
    const container = document.getElementById("quizQuestionsBuilder");
    if (!container) return;

    container.innerHTML = this.quizQuestions.map((q, qIdx) => `
      <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-[#dd1f36]">Question ${qIdx + 1}</span>
          <button 
            type="button" 
            onclick="window.instructorStudio.removeQuestionCard(${qIdx})" 
            class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
          >
            ✕ Remove Question
          </button>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Question Prompt *</label>
          <input 
            type="text" 
            value="${(q.question || '').replace(/"/g, '&quot;')}" 
            placeholder="e.g. What is the primary purpose of this architecture?"
            oninput="window.instructorStudio.quizQuestions[${qIdx}].question = this.value"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#dd1f36]"
            required
          />
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-slate-400">Answer Options (Select the radio button for the correct answer)</label>
          ${[0, 1, 2, 3].map(optIdx => `
            <div class="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <input 
                type="radio" 
                name="correct_${qIdx}" 
                value="${optIdx}" 
                ${q.correctAnswer === optIdx ? 'checked' : ''}
                onchange="window.instructorStudio.quizQuestions[${qIdx}].correctAnswer = ${optIdx}"
                class="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
              />
              <span class="text-xs font-mono font-bold text-slate-400">${String.fromCharCode(65 + optIdx)}:</span>
              <input 
                type="text" 
                value="${((q.options && q.options[optIdx]) || '').replace(/"/g, '&quot;')}" 
                placeholder="Option text..."
                oninput="window.instructorStudio.quizQuestions[${qIdx}].options[${optIdx}] = this.value"
                class="flex-1 bg-transparent border-none text-xs text-white focus:outline-none placeholder-slate-600"
                required
              />
            </div>
          `).join("")}
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Conceptual Explanation (Shown after student submits quiz)</label>
          <textarea 
            rows="2" 
            placeholder="Explain why the correct answer is right and reinforce the lesson..."
            oninput="window.instructorStudio.quizQuestions[${qIdx}].explanation = this.value"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#dd1f36]"
            required
          >${q.explanation || ''}</textarea>
        </div>
      </div>
    `).join("");
  }

  async handleSaveQuiz(e) {
    e.preventDefault();
    const moduleId = document.getElementById("instQuizModSelect").value;
    const title = document.getElementById("instQuizTitle").value.trim();
    const passingScore = parseInt(document.getElementById("instQuizPassingScore").value, 10) || 80;

    if (!moduleId) {
      window.app.showToast("Please select a module to assign this quiz to.", "info");
      return;
    }

    // Validate questions
    for (let i = 0; i < this.quizQuestions.length; i++) {
      const q = this.quizQuestions[i];
      if (!q.question.trim()) {
        window.app.showToast(`Question ${i + 1} has an empty prompt.`, "info");
        return;
      }
      if (!q.options || q.options.some(opt => !opt.trim())) {
        window.app.showToast(`Question ${i + 1} has one or more empty answer options.`, "info");
        return;
      }
    }

    const payload = {
      title,
      passing_score: passingScore,
      questions: this.quizQuestions
    };

    try {
      if (window.apiService && window.apiService.isBackendOnline) {
        await window.apiService.createQuiz(moduleId, payload);
      }

      // Update in local client data
      (window.COURSES_DATA || []).forEach(p => {
        (p.modules || []).forEach(m => {
          if (m.id === moduleId) {
            m.quiz = {
              id: "quiz_" + Date.now(),
              title,
              passingScore,
              questions: this.quizQuestions
            };
          }
        });
      });

      window.app.showToast("🎉 Post-video Q&A assessment saved successfully!", "success");
      this.switchTab("overview");
    } catch (err) {
      console.error("Save quiz error:", err);
      window.app.showToast("Error saving quiz: " + err.message, "info");
    }
  }

  // =========================================================================
  // --- TAB 4: MY COURSES & LESSONS OVERVIEW ---
  // =========================================================================
  toggleCourseLessons(courseId) {
    this.collapsedCourses[courseId] = !this.collapsedCourses[courseId];
    this.renderOverview();
  }

  renderOverview() {
    const container = document.getElementById("instructorCoursesList");
    if (!container) return;

    const programs = window.COURSES_DATA || [];
    if (programs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-4">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-[#dd1f36]/10 border border-[#dd1f36]/30 flex items-center justify-center text-3xl">
            🎓
          </div>
          <h4 class="text-lg font-bold text-white">No Programs Published Yet</h4>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            You haven't authored any courses yet. Click the button below to publish your first program and upload video lessons.
          </p>
          <button 
            onclick="window.instructorStudio.switchTab('programs')" 
            class="px-5 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white text-xs font-bold transition shadow-lg shadow-[#dd1f36]/20"
          >
            + Publish Your First Program
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = programs.map(p => {
      const isExpanded = this.collapsedCourses[p.id] !== false; // Default expanded
      const modulesCount = p.modules ? p.modules.length : 0;

      return `
        <div class="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden transition hover:border-slate-700">
          <!-- Course Card Header -->
          <div class="p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 border-b border-slate-800/80">
            <div class="flex items-start space-x-4 min-w-0">
              <img 
                src="${p.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}" 
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-800 shrink-0 shadow-md" 
                alt="${p.title}"
              />
              <div class="space-y-1.5 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#dd1f36]/15 text-[#dd1f36] border border-[#dd1f36]/25">
                    ${p.category || 'General'}
                  </span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    ${p.level || 'Intermediate'}
                  </span>
                  <span class="text-[10px] text-slate-400">⏱ ${p.duration || 'Flexible'}</span>
                </div>
                <h4 class="text-base sm:text-lg font-bold text-white truncate max-w-xl">${p.title}</h4>
                <p class="text-xs text-slate-400 line-clamp-1 max-w-xl">${p.tagline || ''}</p>
                <div class="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
                  <span class="font-semibold text-slate-300">${modulesCount} Video Lessons</span>
                  <span>•</span>
                  <span>${p.enrolledCount || 0} Active Learners</span>
                  <span>•</span>
                  <span class="text-amber-400">★ ${p.rating || 5.0}</span>
                </div>
              </div>
            </div>

            <!-- Course Level Action Buttons -->
            <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
              <button 
                type="button"
                onclick="window.instructorStudio.editProgram('${p.id}')" 
                class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 hover:border-slate-600 transition flex items-center space-x-1.5 shadow-sm"
                title="Edit Course Metadata, Title, Description"
              >
                <span>✏️</span>
                <span>Edit Course</span>
              </button>

              <button 
                type="button"
                onclick="window.instructorStudio.selectedProgramId = '${p.id}'; window.instructorStudio.switchTab('modules');" 
                class="px-3.5 py-2 rounded-xl bg-[#9744cc]/20 hover:bg-[#9744cc]/30 text-[#9744cc] border border-[#9744cc]/40 text-xs font-bold transition flex items-center space-x-1.5"
                title="Add a new video lesson to this course"
              >
                <span>+</span>
                <span>Add Lesson</span>
              </button>

              <button 
                type="button"
                onclick="window.app.startProgram('${p.id}')" 
                class="px-3.5 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-xs font-bold text-white transition shadow-md shadow-[#dd1f36]/25 flex items-center space-x-1.5"
                title="View course as student"
              >
                <span>Preview →</span>
              </button>

              <button 
                type="button"
                onclick="window.instructorStudio.deleteProgram('${p.id}')" 
                class="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
                title="Delete Course and All Lessons"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>

          <!-- Lessons Accordion Header -->
          <div class="px-5 py-3 bg-slate-950/40 flex items-center justify-between border-b border-slate-800/60">
            <button 
              type="button"
              onclick="window.instructorStudio.toggleCourseLessons('${p.id}')" 
              class="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              <span>${isExpanded ? '▼' : '▶'}</span>
              <span>Course Syllabus & Lessons (${modulesCount})</span>
            </button>
            <span class="text-[11px] text-slate-500">
              ${isExpanded ? 'Click arrow to collapse' : 'Click arrow to expand'}
            </span>
          </div>

          <!-- Lessons List -->
          ${isExpanded ? `
            <div class="p-4 sm:p-5 space-y-2.5 bg-slate-950/20">
              ${modulesCount === 0 ? `
                <div class="text-center py-6 border border-dashed border-slate-800 rounded-2xl p-4">
                  <p class="text-xs text-slate-400 mb-2">No video lessons attached to this course yet.</p>
                  <button 
                    onclick="window.instructorStudio.selectedProgramId = '${p.id}'; window.instructorStudio.switchTab('modules');"
                    class="px-3.5 py-1.5 rounded-lg bg-[#dd1f36]/15 hover:bg-[#dd1f36]/25 text-[#dd1f36] text-xs font-semibold transition"
                  >
                    + Add First Video Lesson
                  </button>
                </div>
              ` : (p.modules || []).map((m, mIdx) => `
                <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-slate-700/80 transition">
                  <div class="flex items-center space-x-3 min-w-0">
                    <span class="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300 shrink-0">
                      ${m.order || mIdx + 1}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center space-x-2">
                        <h5 class="text-xs sm:text-sm font-semibold text-white truncate max-w-md">${m.title}</h5>
                        <span class="text-[10px] text-slate-400 font-mono">⏱ ${m.duration}</span>
                      </div>
                      <div class="flex items-center space-x-2 mt-0.5">
                        ${m.quiz ? `
                          <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ Quiz Configured (${(m.quiz.questions && m.quiz.questions.length) || 1} Qs)
                          </span>
                        ` : `
                          <span class="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            No Quiz Configured
                          </span>
                        `}
                        ${m.youtubeId ? `
                          <span class="text-[9px] text-slate-400">YT: ${m.youtubeId}</span>
                        ` : `
                          <span class="text-[9px] text-slate-500">Direct MP4</span>
                        `}
                      </div>
                    </div>
                  </div>

                  <!-- Module Actions -->
                  <div class="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                    <button 
                      type="button"
                      onclick="window.instructorStudio.editModule('${p.id}', '${m.id}')"
                      class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition"
                      title="Edit Lesson Title, Video Stream, Description"
                    >
                      ✏️ Edit Lesson
                    </button>

                    <button 
                      type="button"
                      onclick="window.instructorStudio.editQuiz('${p.id}', '${m.id}')"
                      class="px-2.5 py-1.5 rounded-lg bg-[#9744cc]/15 hover:bg-[#9744cc]/25 text-[#9744cc] border border-[#9744cc]/30 text-[11px] font-semibold transition"
                      title="Author or Modify Post-Video Quiz Assessment"
                    >
                      ${m.quiz ? '✍️ Edit Quiz' : '+ Add Quiz'}
                    </button>

                    <button 
                      type="button"
                      onclick="window.instructorStudio.deleteModule('${p.id}', '${m.id}')"
                      class="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition"
                      title="Delete this lesson"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");
  }
}

window.instructorStudio = new InstructorStudio();
document.addEventListener("DOMContentLoaded", () => {
  window.instructorStudio.init();
});
