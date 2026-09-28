/**
 * LearnPulse E-Learning Platform - Interactive Post-Video Q&A Engine
 * Enhanced with Exam Integrity & Anti-Cheating Proctoring:
 * 1. Tab-Switch & Blur Detection with 3-Strikes Lockout
 * 2. Fullscreen Mode Enforcement
 * 3. Question & Option Shuffling (Fisher-Yates)
 * 4. Timed Assessments with Auto-Submit Countdown
 * 5. Gamification XP & Badge Dispatch
 */

class QuizController {
  constructor() {
    this.currentModule = null;
    this.quiz = null;
    this.currentIndex = 0;
    this.userAnswers = {}; // questionId -> originalOptionIndex
    this.isSubmitted = false;

    // Proctoring & Integrity State
    this.shuffledQuestions = [];
    this.timerSeconds = 600; // 10 minutes default
    this.timerInterval = null;
    this.proctoringStrikes = 0;
    this.maxStrikes = 3;
    this.isProctoringActive = false;

    // Bound listeners for clean removal
    this.boundVisibilityHandler = this.handleVisibilityChange.bind(this);
    this.boundBlurHandler = this.handleWindowBlur.bind(this);
    this.boundFullscreenHandler = this.handleFullscreenChange.bind(this);
  }

  openQuiz(moduleData) {
    if (!moduleData || !moduleData.quiz) return;

    // Strict watch gate: video must be completed before quiz can be accessed
    if (window.appState && !window.appState.isVideoFinished(moduleData.id)) {
      if (window.app && window.app.showToast) {
        window.app.showToast("⚠️ Please watch the complete video lesson first to unlock the assessment.", "info");
      }
      return;
    }

    this.currentModule = moduleData;
    this.quiz = moduleData.quiz;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.isSubmitted = false;
    this.proctoringStrikes = 0;

    // 1. Prepare Question & Option Shuffling
    this.prepareShuffledQuestions();

    // 2. Setup Timed Assessment (2 minutes per question or min 10 mins)
    const totalQ = this.shuffledQuestions.length;
    this.timerSeconds = Math.max(600, totalQ * 120);

    const modal = document.getElementById("quizModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.scrollTop = 0;
    document.body.classList.add("overflow-hidden");

    // 3. Initiate Proctoring & Fullscreen Mode
    this.initProctoring();

    // 4. Render First Question
    this.renderCurrentQuestion();
  }

  // Fisher-Yates Question & Option Shuffling
  prepareShuffledQuestions() {
    if (!this.quiz || !Array.isArray(this.quiz.questions)) return;

    // Deep copy questions
    const rawQuestions = JSON.parse(JSON.stringify(this.quiz.questions));

    // Shuffle questions order
    for (let i = rawQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawQuestions[i], rawQuestions[j]] = [rawQuestions[j], rawQuestions[i]];
    }

    // For each question, shuffle options while preserving the original index mapping
    this.shuffledQuestions = rawQuestions.map(q => {
      const mappedOptions = q.options.map((optText, origIdx) => ({
        text: optText,
        originalIndex: origIdx
      }));

      // Shuffle options
      for (let i = mappedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mappedOptions[i], mappedOptions[j]] = [mappedOptions[j], mappedOptions[i]];
      }

      return {
        ...q,
        shuffledOptions: mappedOptions
      };
    });
  }

  // Anti-Cheating & Proctoring Lifecycle
  initProctoring() {
    this.isProctoringActive = true;
    this.proctoringStrikes = 0;

    // Request fullscreen for exam integrity
    this.requestFullscreen();

    // Attach listeners
    document.addEventListener("visibilitychange", this.boundVisibilityHandler);
    window.addEventListener("blur", this.boundBlurHandler);
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.addEventListener(evt, this.boundFullscreenHandler);
    });

    // Start live countdown timer
    this.startCountdownTimer();
  }

  cleanupProctoring() {
    this.isProctoringActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    document.removeEventListener("visibilitychange", this.boundVisibilityHandler);
    window.removeEventListener("blur", this.boundBlurHandler);
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.removeEventListener(evt, this.boundFullscreenHandler);
    });

    const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (isFs) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  requestFullscreen() {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Fullscreen request may be blocked by browser without direct user gesture; handled gracefully
        });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } catch (e) {}
  }

  handleFullscreenChange() {
    if (!this.isProctoringActive || this.isSubmitted) return;
    const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!isFs) {
      this.recordStrike("Fullscreen Mode Exited");
    }
  }

  handleVisibilityChange() {
    if (!this.isProctoringActive || this.isSubmitted) return;
    if (document.hidden) {
      this.recordStrike("Tab Switch or Application Hidden");
    }
  }

  handleWindowBlur() {
    if (!this.isProctoringActive || this.isSubmitted) return;
    this.recordStrike("Window Focus Lost (Alt-Tab or Screen Split)");
  }

  recordStrike(reason) {
    if (this.isSubmitted) return;
    this.proctoringStrikes++;

    const strikesLeft = Math.max(0, this.maxStrikes - this.proctoringStrikes);

    if (window.appState) {
      window.appState.logAudit(
        "PROCTORING_INFRACTION",
        this.quiz ? this.quiz.title : "Assessment",
        `Strike ${this.proctoringStrikes}/${this.maxStrikes}: ${reason}`,
        this.proctoringStrikes >= this.maxStrikes ? "CRITICAL" : "WARNING"
      );
    }

    if (this.proctoringStrikes >= this.maxStrikes) {
      // Auto-terminate assessment due to cheating strikes
      alert(`🚨 EXAM INTEGRITY VIOLATION!\n\nYou have triggered ${this.maxStrikes} proctoring strikes (${reason}).\nYour assessment has been automatically locked and submitted for evaluation.`);
      this.submitQuiz(true);
      return;
    }

    // Show high-priority proctoring alert
    if (window.app && window.app.showToast) {
      window.app.showToast(`⚠️ Proctoring Alert [Strike ${this.proctoringStrikes}/${this.maxStrikes}]: ${reason}. Remaining on screen in fullscreen is mandatory.`, "warning");
    }

    // Refresh UI banner
    this.updateProctoringBanner();
  }

  startCountdownTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isSubmitted) {
        clearInterval(this.timerInterval);
        return;
      }

      this.timerSeconds--;

      // Update timer pill in UI
      const timerDisplay = document.getElementById("quizTimerDisplay");
      if (timerDisplay) {
        const mins = Math.floor(this.timerSeconds / 60);
        const secs = this.timerSeconds % 60;
        timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (this.timerSeconds <= 60) {
          timerDisplay.classList.add("text-rose-500", "animate-pulse");
        } else if (this.timerSeconds <= 180) {
          timerDisplay.classList.add("text-amber-400");
        }
      }

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        if (window.app && window.app.showToast) {
          window.app.showToast("⏱ Time Expired! Assessment automatically submitted.", "warning");
        }
        this.submitQuiz(true);
      }
    }, 1000);
  }

  updateProctoringBanner() {
    const badge = document.getElementById("quizProctoringBadge");
    if (badge) {
      badge.innerHTML = `
        <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          this.proctoringStrikes === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
        }">
          <span>🛡️ Proctoring Active</span>
          <span>•</span>
          <span>Strikes: ${this.proctoringStrikes}/${this.maxStrikes}</span>
        </span>
      `;
    }
  }

  closeQuiz() {
    this.cleanupProctoring();
    const modal = document.getElementById("quizModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  renderCurrentQuestion() {
    const container = document.getElementById("quizContentArea");
    if (!container || !this.shuffledQuestions || this.shuffledQuestions.length === 0) return;

    const question = this.shuffledQuestions[this.currentIndex];
    const totalQuestions = this.shuffledQuestions.length;
    const progressPercent = Math.round(((this.currentIndex + 1) / totalQuestions) * 100);
    const selectedOriginalOption = this.userAnswers[question.id];

    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const parentProgram = window.appState ? window.appState.getProgramForModule(this.currentModule.id) : null;
    const passScore = (parentProgram && (parentProgram.passingScore || parentProgram.passing_score)) || this.quiz.passingScore || 80;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Proctoring & Exam Integrity Banner -->
        <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2" id="quizProctoringBadge">
            <span class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full font-bold ${
              this.proctoringStrikes === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
            }">
              <span>🛡️ Proctoring Active</span>
              <span>•</span>
              <span>Strikes: ${this.proctoringStrikes}/${this.maxStrikes}</span>
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-white">
              <span>⏱</span>
              <span id="quizTimerDisplay">${timeFormatted}</span>
            </div>

            <button 
              onclick="window.quizController.requestFullscreen()"
              class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
              title="Lock Screen Fullscreen"
            >
              ⛶ Fullscreen Lock
            </button>
          </div>
        </div>

        <!-- Quiz Header Info -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span class="text-xs uppercase font-bold tracking-wider text-[#dd1f36]">Certified Assessment & Exam</span>
            <h3 class="text-xl font-bold text-white mt-1">${this.quiz.title}</h3>
          </div>
          <div class="text-right">
            <span class="text-sm font-semibold text-slate-300">Question ${this.currentIndex + 1} of ${totalQuestions}</span>
            <div class="text-xs text-amber-400 font-bold">🎯 Pass Threshold: ${passScore}% Marks</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-[#dd1f36] to-[#9744cc] h-full transition-all duration-300" style="width: ${progressPercent}%"></div>
        </div>

        <!-- Question Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 select-none">
          <h4 class="text-lg font-semibold text-slate-100 leading-relaxed mb-6">
            ${this.currentIndex + 1}. ${question.question}
          </h4>

          <!-- Shuffled Options List -->
          <div class="space-y-3">
            ${question.shuffledOptions.map((optObj, sIdx) => {
              const isSelected = selectedOriginalOption === optObj.originalIndex;
              return `
                <div 
                  class="quiz-option p-4 rounded-xl flex items-center justify-between cursor-pointer border ${
                    isSelected ? 'border-[#dd1f36] bg-[#dd1f36]/10 text-white' : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  } transition" 
                  onclick="window.quizController.selectAnswer('${question.id}', ${optObj.originalIndex})"
                >
                  <div class="flex items-center space-x-3.5">
                    <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-[#dd1f36] text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }">
                      ${String.fromCharCode(65 + sIdx)}
                    </span>
                    <span class="text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-slate-300'}">${optObj.text}</span>
                  </div>
                  <div class="w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#dd1f36] bg-[#dd1f36]' : 'border-slate-700'}">
                    ${isSelected ? '<span class="w-2 h-2 rounded-full bg-white"></span>' : ''}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-2">
          <button 
            onclick="window.quizController.prevQuestion()"
            class="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition ${this.currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}"
            ${this.currentIndex === 0 ? 'disabled' : ''}
          >
            ← Previous
          </button>

          <div class="flex items-center space-x-3">
            ${this.currentIndex < totalQuestions - 1 ? `
              <button 
                onclick="window.quizController.nextQuestion()"
                class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
              >
                Next →
              </button>
            ` : `
              <button 
                onclick="window.quizController.submitQuiz(false)"
                class="px-6 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-sm shadow-lg shadow-[#dd1f36]/30 transition transform hover:scale-105"
              >
                Submit Assessment 🚀
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  selectAnswer(questionId, originalOptionIndex) {
    if (this.isSubmitted) return;
    this.userAnswers[questionId] = originalOptionIndex;
    this.renderCurrentQuestion();
  }

  nextQuestion() {
    if (this.currentIndex < this.shuffledQuestions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
      const modal = document.getElementById("quizModal");
      if (modal) modal.scrollTop = 0;
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuestion();
      const modal = document.getElementById("quizModal");
      if (modal) modal.scrollTop = 0;
    }
  }

  submitQuiz(force = false) {
    if (this.isSubmitted) return;

    // Check unanswered questions if not force-submitted
    if (!force) {
      const unanswered = this.shuffledQuestions.filter(q => this.userAnswers[q.id] === undefined);
      if (unanswered.length > 0) {
        if (!confirm(`You have ${unanswered.length} unanswered question(s). Submit examination anyway?`)) {
          return;
        }
      }
    }

    // Cleanup proctoring listeners and timer
    this.cleanupProctoring();

    let correctCount = 0;
    this.shuffledQuestions.forEach(q => {
      if (this.userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = this.shuffledQuestions.length;
    const { percentage, passed } = window.appState.recordQuizSubmission(
      this.currentModule.id,
      correctCount,
      total,
      this.userAnswers
    );

    this.isSubmitted = true;

    // Award Gamification XP
    if (passed) {
      window.appState.addXP(100, `Passed Assessment: ${this.quiz.title}`, true);
      if (percentage >= 95) {
        window.appState.addXP(50, 'Mastery Score (≥95%) Bonus');
      }
    } else {
      window.appState.addXP(15, 'Assessment Attempted');
    }

    this.renderResults(correctCount, total, percentage, passed);
  }

  renderResults(score, total, percentage, passed) {
    const container = document.getElementById("quizContentArea");
    if (!container) return;

    const modal = document.getElementById("quizModal");
    if (modal) modal.scrollTop = 0;

    const parentProgram = window.appState.getProgramForModule(this.currentModule.id);
    const reqPassing = (parentProgram && (parentProgram.passingScore || parentProgram.passing_score)) || this.quiz.passingScore || 80;
    const isProgramComplete = parentProgram ? window.appState.isProgramCompleted(parentProgram.id) : false;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Result Banner -->
        <div class="text-center p-8 rounded-3xl border ${passed ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40 glow-primary' : 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/40'}">
          <div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}">
            ${passed ? `
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ` : `
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            `}
          </div>

          <div class="flex items-center justify-center space-x-2 mb-2">
            <span class="text-xs uppercase font-bold tracking-widest ${passed ? 'text-emerald-400' : 'text-rose-400'}">
              ${passed ? `Module Passed Successfully (≥${reqPassing}%)` : `Passing Threshold Not Met (Requires ${reqPassing}%)`}
            </span>
            ${passed ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">+100 XP ⚡</span>` : ''}
          </div>

          <h2 class="text-3xl font-extrabold text-white mt-1">
            You Scored ${percentage}% (${score}/${total})
          </h2>
          <p class="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            ${passed 
              ? `Outstanding performance! You scored ${percentage}% (satisfying the required ${reqPassing}% benchmark) and unlocked the next phase of your program.` 
              : `You need at least ${reqPassing}% marks in this module to qualify for certification. Review the detailed explanations below and retake the quiz when ready.`}
          </p>

          <!-- CTAs -->
          <div class="flex flex-wrap items-center justify-center gap-4 mt-6">
            ${isProgramComplete ? `
              <button 
                onclick="window.quizController.closeQuiz(); window.certificateStudio.openCertificateModal('${parentProgram.id}');"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold shadow-xl shadow-amber-500/25 transition transform hover:scale-105 flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>Claim Official Program Certificate 🎓</span>
              </button>
            ` : passed ? `
              <button 
                onclick="window.quizController.closeQuiz(); window.app.onModulePassed('${this.currentModule.id}');"
                class="px-6 py-3 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold transition flex items-center space-x-2"
              >
                <span>Continue to Next Lesson →</span>
              </button>
            ` : `
              <button 
                onclick="window.quizController.openQuiz(window.quizController.currentModule)"
                class="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Retry Quiz</span>
              </button>
            `}
          </div>
        </div>

        <!-- Answers Review & Explanations Accordion -->
        <div class="space-y-4 pt-4">
          <h4 class="text-sm uppercase font-bold text-slate-400 tracking-wider">Detailed Answers & Conceptual Explanations</h4>
          
          <div class="space-y-4">
            ${this.shuffledQuestions.map((q, idx) => {
              const selectedOriginal = this.userAnswers[q.id];
              const isCorrect = selectedOriginal === q.correctAnswer;

              return `
                <div class="p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                          ${isCorrect ? '✓ Correct' : '✕ Incorrect'}
                        </span>
                        <span class="text-xs text-slate-400 font-semibold">Question ${idx + 1}</span>
                      </div>
                      <h5 class="text-base font-semibold text-white mt-1">${q.question}</h5>
                    </div>
                  </div>

                  <!-- Explanations Box -->
                  <div class="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                    <p class="text-slate-300">
                      <span class="font-bold text-slate-400">Correct Answer:</span> 
                      <span class="text-emerald-400 font-semibold">${q.options[q.correctAnswer]}</span>
                    </p>
                    ${!isCorrect && selectedOriginal !== undefined ? `
                      <p class="text-slate-300">
                        <span class="font-bold text-slate-400">Your Selection:</span> 
                        <span class="text-rose-400 font-semibold">${q.options[selectedOriginal]}</span>
                      </p>
                    ` : ''}
                    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed mt-2">
                      <span class="font-bold text-[#dd1f36]">Explanation:</span> ${q.explanation}
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }
}

// Global instance
window.quizController = new QuizController();
