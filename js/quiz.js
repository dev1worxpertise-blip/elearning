/**
 * LearnPulse E-Learning Platform - Interactive Post-Video Q&A Engine
 * Handles questions navigation, scoring, explanations, and certificate eligibility.
 */

class QuizController {
  constructor() {
    this.currentModule = null;
    this.quiz = null;
    this.currentIndex = 0;
    this.userAnswers = {}; // questionId -> selectedIndex
    this.isSubmitted = false;
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

    const modal = document.getElementById("quizModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    this.renderCurrentQuestion();
  }

  closeQuiz() {
    const modal = document.getElementById("quizModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  renderCurrentQuestion() {
    const container = document.getElementById("quizContentArea");
    if (!container) return;

    const question = this.quiz.questions[this.currentIndex];
    const totalQuestions = this.quiz.questions.length;
    const progressPercent = Math.round(((this.currentIndex + 1) / totalQuestions) * 100);
    const selectedOption = this.userAnswers[question.id];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Quiz Header Info -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span class="text-xs uppercase font-bold tracking-wider text-[#dd1f36]">Post-Video Q&A Assessment</span>
            <h3 class="text-xl font-bold text-white mt-1">${this.quiz.title}</h3>
          </div>
          <div class="text-right">
            <span class="text-sm font-semibold text-slate-300">Question ${this.currentIndex + 1} of ${totalQuestions}</span>
            <div class="text-xs text-slate-500">Passing Grade: ${this.quiz.passingScore}%</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-[#dd1f36] to-[#9744cc] h-full transition-all duration-300" style="width: ${progressPercent}%"></div>
        </div>

        <!-- Question Card -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h4 class="text-lg font-semibold text-slate-100 leading-relaxed mb-6">
            ${this.currentIndex + 1}. ${question.question}
          </h4>

          <!-- Options List -->
          <div class="space-y-3">
            ${question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return `
                <div 
                  class="quiz-option p-4 rounded-xl flex items-center justify-between ${isSelected ? 'selected' : ''}" 
                  onclick="window.quizController.selectAnswer('${question.id}', ${idx})"
                >
                  <div class="flex items-center space-x-3.5">
                    <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#dd1f36] text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                      ${String.fromCharCode(65 + idx)}
                    </span>
                    <span class="text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}">${option}</span>
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
            class="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition ${this.currentIndex === 0 ? 'invisible' : ''}"
          >
            ← Previous
          </button>

          <div class="flex items-center space-x-3">
            ${this.currentIndex < totalQuestions - 1 ? `
              <button 
                onclick="window.quizController.nextQuestion()" 
                class="px-6 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white text-sm font-bold shadow-lg shadow-[#dd1f36]/25 transition"
              >
                Next Question →
              </button>
            ` : `
              <button 
                onclick="window.quizController.submitQuiz()" 
                class="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
              >
                <span>Submit Assessment</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  selectAnswer(questionId, optionIndex) {
    this.userAnswers[questionId] = optionIndex;
    this.renderCurrentQuestion();
  }

  nextQuestion() {
    if (this.currentIndex < this.quiz.questions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuestion();
    }
  }

  submitQuiz() {
    // Check if all questions are answered
    const unanswered = this.quiz.questions.filter(q => this.userAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    let correctCount = 0;
    this.quiz.questions.forEach(q => {
      if (this.userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = this.quiz.questions.length;
    const { percentage, passed } = window.appState.recordQuizSubmission(this.currentModule.id, correctCount, total);
    this.isSubmitted = true;
    this.renderResults(correctCount, total, percentage, passed);
  }

  renderResults(score, total, percentage, passed) {
    const container = document.getElementById("quizContentArea");
    if (!container) return;

    const parentProgram = window.appState.getProgramForModule(this.currentModule.id);
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

          <span class="text-xs uppercase font-bold tracking-widest ${passed ? 'text-emerald-400' : 'text-rose-400'}">
            ${passed ? 'Module Passed Successfully!' : 'Passing Threshold Not Met'}
          </span>
          <h2 class="text-3xl font-extrabold text-white mt-1">
            You Scored ${percentage}% (${score}/${total})
          </h2>
          <p class="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            ${passed 
              ? 'Outstanding performance! You demonstrated mastery of this lesson and unlocked the next phase of your program.' 
              : 'You need at least 80% to pass this module. Review the detailed explanations below and retake the quiz when ready.'}
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
          ${this.quiz.questions.map((q, idx) => {
            const userChoice = this.userAnswers[q.id];
            const isCorrect = userChoice === q.correctAnswer;
            return `
              <div class="p-5 rounded-2xl border ${isCorrect ? 'bg-slate-900/60 border-emerald-900/40' : 'bg-slate-900/60 border-rose-900/40'} space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <h5 class="text-sm font-semibold text-slate-200">
                    ${idx + 1}. ${q.question}
                  </h5>
                  <span class="text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                    ${isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                  </span>
                </div>

                <div class="text-xs space-y-1">
                  <div class="text-slate-400">Your Answer: <span class="${isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}">${userChoice !== undefined ? q.options[userChoice] : 'Not Answered'}</span></div>
                  ${!isCorrect ? `<div class="text-slate-400">Correct Answer: <span class="text-emerald-400 font-medium">${q.options[q.correctAnswer]}</span></div>` : ''}
                </div>

                <div class="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <span class="font-bold text-[#dd1f36]">Explanation:</span> ${q.explanation}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Trigger fireworks/celebration if program is completed
    if (isProgramComplete) {
      window.app.triggerConfetti();
    }
  }
}

window.quizController = new QuizController();
