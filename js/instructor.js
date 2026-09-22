/**
 * LearnPulse E-Learning Platform - Instructor & Admin Studio
 * Enables creating programs, adding video lessons, and authoring interactive quizzes.
 */

class InstructorStudio {
  constructor() {
    this.activeTab = "programs"; // "programs" | "modules" | "quiz" | "overview"
    this.selectedProgramId = null;
    this.selectedModuleId = null;
    this.quizQuestions = [];
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
    document.getElementById("paneCreateProgram").classList.toggle("hidden", tabName !== "programs");
    document.getElementById("paneAddModule").classList.toggle("hidden", tabName !== "modules");
    document.getElementById("paneAuthorQuiz").classList.toggle("hidden", tabName !== "quiz");
    document.getElementById("paneInstructorOverview").classList.toggle("hidden", tabName !== "overview");

    if (tabName === "modules") this.populateProgramDropdowns();
    if (tabName === "quiz") this.populateQuizDropdowns();
    if (tabName === "overview") this.renderOverview();
  }

  // --- TAB 1: CREATE PROGRAM ---
  async handleCreateProgram(e) {
    e.preventDefault();
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

    try {
      // Try sending to PostgreSQL API
      if (window.apiService && window.apiService.isBackendOnline) {
        const res = await window.apiService.createProgram(payload);
        if (res.success) {
          window.app.showToast("🎉 Program published to PostgreSQL database!", "success");
        }
      }

      // Also add to client COURSES_DATA for instant local availability
      const newProg = {
        id: "prog_" + Date.now(),
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline,
        category: category_name,
        level,
        rating: 5.0,
        enrolledCount: 0,
        duration,
        thumbnail: thumbnail_url,
        instructor: {
          name: window.appState.user.name || "Lead Instructor",
          role: "Verified Instructor",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          bio: "Course Author & Lead Subject Matter Expert"
        },
        skills,
        modules: []
      };

      if (!window.COURSES_DATA) window.COURSES_DATA = [];
      window.COURSES_DATA.unshift(newProg);

      // Reset form
      document.getElementById("formCreateProgram").reset();
      window.app.showToast(`Program "${title}" created! Now add video lessons to it.`, "success");
      
      // Auto switch to Add Module tab for this program
      this.selectedProgramId = newProg.id;
      this.switchTab("modules");
    } catch (err) {
      console.error(err);
      window.app.showToast("Error creating program: " + err.message, "info");
    }
  }

  // --- TAB 2: ADD MODULE ---
  populateProgramDropdowns() {
    const dropdown = document.getElementById("instModuleProgSelect");
    if (!dropdown) return;

    const programs = window.COURSES_DATA || [];
    dropdown.innerHTML = `
      <option value="">-- Select Program to Add Video Lesson --</option>
      ${programs.map(p => `
        <option value="${p.id}" ${p.id === this.selectedProgramId ? 'selected' : ''}>
          ${p.title} (${p.modules ? p.modules.length : 0} modules)
        </option>
      `).join("")}
    `;
  }

  async handleAddModule(e) {
    e.preventDefault();
    const programId = document.getElementById("instModuleProgSelect").value;
    const title = document.getElementById("instModTitle").value.trim();
    const duration = document.getElementById("instModDuration").value.trim();
    const video_url = document.getElementById("instModVideoUrl").value.trim();
    const youtube_id = document.getElementById("instModYoutubeId").value.trim();
    const description = document.getElementById("instModDescription").value.trim();
    const takeawaysRaw = document.getElementById("instModTakeaways").value.trim();
    const takeaways = takeawaysRaw ? takeawaysRaw.split("\n").map(t => t.trim()).filter(Boolean) : [];

    if (!programId) {
      window.app.showToast("Please select a program first.", "info");
      return;
    }
    if (!title || !duration || !video_url || !description) {
      window.app.showToast("Please fill in required lesson details.", "info");
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

    try {
      if (window.apiService && window.apiService.isBackendOnline) {
        await window.apiService.addModule(programId, payload);
      }

      // Add to local data
      const prog = (window.COURSES_DATA || []).find(p => p.id === programId);
      if (prog) {
        const newMod = {
          id: "mod_" + Date.now(),
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

      document.getElementById("formAddModule").reset();
      window.app.showToast(`Lesson "${title}" added! Now author its post-video Q&A.`, "success");
      this.switchTab("quiz");
    } catch (err) {
      console.error(err);
      window.app.showToast("Error adding module: " + err.message, "info");
    }
  }

  // --- TAB 3: AUTHOR QUIZ ---
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
      const prog = programs.find(p => p.id === pId);
      if (prog && prog.modules) {
        modSelect.innerHTML = `
          <option value="">-- 2. Select Video Lesson / Module --</option>
          ${prog.modules.map(m => `
            <option value="${m.id}" ${m.id === this.selectedModuleId ? 'selected' : ''}>
              ${m.order}. ${m.title} ${m.quiz ? '✓ (Quiz Exists)' : '(No Quiz Yet)'}
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

  loadExistingQuiz(moduleId) {
    let existingQuiz = null;
    (window.COURSES_DATA || []).forEach(p => {
      (p.modules || []).forEach(m => {
        if (m.id === moduleId && m.quiz) existingQuiz = m.quiz;
      });
    });

    if (existingQuiz) {
      document.getElementById("instQuizTitle").value = existingQuiz.title;
      document.getElementById("instQuizPassingScore").value = existingQuiz.passingScore || 80;
      this.quizQuestions = JSON.parse(JSON.stringify(existingQuiz.questions || []));
    } else {
      document.getElementById("instQuizTitle").value = "Module Knowledge Verification Assessment";
      document.getElementById("instQuizPassingScore").value = 80;
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
          <label class="block text-xs text-slate-400 mb-1">Question Prompt</label>
          <input 
            type="text" 
            value="${q.question.replace(/"/g, '&quot;')}" 
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
                value="${(q.options[optIdx] || '').replace(/"/g, '&quot;')}" 
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
      if (q.options.some(opt => !opt.trim())) {
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
      console.error(err);
      window.app.showToast("Error saving quiz: " + err.message, "info");
    }
  }

  // --- TAB 4: OVERVIEW ---
  renderOverview() {
    const container = document.getElementById("instructorCoursesList");
    if (!container) return;

    const programs = window.COURSES_DATA || [];
    container.innerHTML = programs.map(p => `
      <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-start space-x-4">
          <img src="${p.thumbnail}" class="w-16 h-16 rounded-xl object-cover border border-slate-800" />
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#dd1f36]/20 text-[#dd1f36]">${p.category}</span>
              <span class="text-[10px] text-slate-400">⏱ ${p.duration}</span>
            </div>
            <h4 class="text-base font-bold text-white mt-1">${p.title}</h4>
            <p class="text-xs text-slate-400">${p.modules ? p.modules.length : 0} Video Modules • ${p.enrolledCount || 0} Learners</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <button 
            onclick="window.instructorStudio.selectedProgramId = '${p.id}'; window.instructorStudio.switchTab('modules');" 
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            + Add Lesson
          </button>
          <button 
            onclick="window.app.startProgram('${p.id}')" 
            class="px-3.5 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-xs font-bold text-white transition"
          >
            Preview Course →
          </button>
        </div>
      </div>
    `).join("");
  }
}

window.instructorStudio = new InstructorStudio();
document.addEventListener("DOMContentLoaded", () => {
  window.instructorStudio.init();
});
