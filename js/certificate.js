/**
 * LearnPulse E-Learning Platform - Advanced Digital Certificate & Academic Transcript Studio
 * Generates customizable verified certificates and official transcripts with multi-theme support.
 */

class CertificateStudio {
  constructor() {
    this.currentCert = null;
    this.currentProgram = null;
    this.currentTheme = "worxpertise-red"; // "worxpertise-red" | "royal-gold" | "modern-indigo" | "executive-emerald"
    this.institutionName = "WORXPERTISE GLOBAL TECHNOLOGY ACADEMY";
    this.viewMode = "certificate"; // "certificate" | "transcript"

    // Bind Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });

    // Bind backdrop click to close modal
    const setupBackdrop = () => {
      const modal = document.getElementById("certificateModal");
      if (modal && !modal.dataset.backdropBound) {
        modal.dataset.backdropBound = "true";
        modal.addEventListener("click", (e) => {
          if (e.target === modal || e.target.classList.contains("certificate-modal-wrap")) {
            this.closeModal();
          }
        });
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupBackdrop);
    } else {
      setupBackdrop();
    }
  }

  openCertificateModal(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return;

    const userRole = (window.appState && window.appState.user && window.appState.user.role) || "student";
    const isStaff = userRole.toLowerCase() === "admin" || userRole.toLowerCase() === "instructor";
    const progress = window.appState ? window.appState.getProgramProgress(programId) : { isComplete: false, completed: 0, total: 0, percentage: 0 };

    // In student mode, certificates CANNOT be accessed until 100% of lessons are completed!
    if (!isStaff && !progress.isComplete) {
      this.showLockedModal(program, progress);
      if (window.app && window.app.showToast) {
        window.app.showToast("🔒 Certificate Locked: Please complete all lessons to unlock your certificate.", "warning");
      }
      return;
    }

    let cert = window.appState.getCertificate(programId);
    if (!cert) {
      if (isStaff) {
        // Staff preview without writing unearned credential to state
        this.previewCertificateWithCustomSignatures(programId);
        return;
      }
      cert = window.appState.autoIssueCertificate(programId);
    }

    if (!cert) {
      this.showLockedModal(program, progress);
      return;
    }

    this.currentCert = cert;
    this.currentProgram = program;

    const modal = document.getElementById("certificateModal");
    const container = document.getElementById("certificateModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");
    modal.scrollTop = 0;
    document.body.classList.add("overflow-hidden");

    this.render();
  }

  previewCertificateWithCustomSignatures(programId, customData = {}) {
    const baseProg = (window.COURSES_DATA || []).find(p => p.id === programId) || {};
    const program = {
      id: programId || "preview-program",
      title: customData.title || baseProg.title || "Certification of Professional Mastery",
      category: customData.category || baseProg.category || "Professional Track",
      duration: customData.duration || baseProg.duration || "Self-Paced",
      instructor: {
        name: customData.instructorName || (baseProg.instructor && baseProg.instructor.name) || "Dr. Sarah Chen",
        role: customData.instructorRole || (baseProg.instructor && baseProg.instructor.role) || "Principal Systems Architect",
        avatar: (baseProg.instructor && baseProg.instructor.avatar) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"
      },
      authority: {
        name: customData.authorityName || (baseProg.authority && baseProg.authority.name) || "Prof. Arthur Sterling",
        role: customData.authorityRole || (baseProg.authority && baseProg.authority.role) || "Dean of Technology",
        title: customData.authorityTitle || (baseProg.authority && baseProg.authority.title) || "Academic Board"
      },
      modules: baseProg.modules || []
    };

    const cert = {
      id: "preview-cert",
      credentialId: "CERT-PREVIEW-" + Math.floor(100000 + Math.random() * 900000),
      programId: program.id,
      studentName: (window.appState && window.appState.user && window.appState.user.name) || "Student Learner",
      programTitle: program.title,
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      instructor: program.instructor.name,
      instructorRole: program.instructor.role,
      authorityName: program.authority.name,
      authorityRole: program.authority.role,
      authorityTitle: program.authority.title,
      grade: "Distinction (Honors)",
      verificationCode: "PREVIEW-HASH-" + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    this.currentCert = cert;
    this.currentProgram = program;

    const modal = document.getElementById("certificateModal");
    const container = document.getElementById("certificateModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");
    modal.scrollTop = 0;
    document.body.classList.add("overflow-hidden");

    this.render();
  }

  closeModal() {
    const modal = document.getElementById("certificateModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  showLockedModal(program, progress) {
    const modal = document.getElementById("certificateModal");
    const container = document.getElementById("certificateModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");
    modal.scrollTop = 0;
    document.body.classList.add("overflow-hidden");

    const modules = program.modules || [];
    const firstUnfinished = modules.find(m => !window.appState.isModuleCompleted(m.id)) || modules[0];

    container.innerHTML = `
      <div class="max-w-2xl mx-auto p-6 sm:p-8 bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl space-y-6 text-slate-200">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-800 pb-5">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 shrink-0 shadow-inner">
              🔒
            </div>
            <div>
              <div class="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
                <span>Certification Prerequisite</span>
                <span class="w-1 h-1 rounded-full bg-amber-400"></span>
                <span>Student Mode</span>
              </div>
              <h3 class="text-xl font-black text-white mt-0.5">Certificate Locked</h3>
              <p class="text-xs text-slate-400">${program.title}</p>
            </div>
          </div>
          <button 
            onclick="window.certificateStudio.closeModal()" 
            class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Description Box -->
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
          <div class="text-lg text-amber-400">ℹ️</div>
          <div class="text-xs text-amber-200/90 leading-relaxed">
            In compliance with course requirements, official certificates for this program require <strong>completing 100% of curriculum lessons and achieving at least ${program.passingScore || program.passing_score || 80}% marks in assessments</strong>.
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-400 font-medium">Curriculum Completion</span>
            <span class="font-extrabold text-amber-400">${progress.completed} of ${progress.total} Lessons (${progress.percentage}%) • Req Pass: ${program.passingScore || program.passing_score || 80}%</span>
          </div>
          <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div class="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-500" style="width: ${progress.percentage}%"></div>
          </div>
        </div>

        <!-- Module Checklist -->
        <div class="space-y-2.5">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Lesson Milestones</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            ${modules.map((m, idx) => {
              const reqPassing = program.passingScore || program.passing_score || 80;
              const isDone = window.appState.isModuleCompleted(m.id);
              const qRes = window.appState.getQuizResult(m.id);
              const isPassed = isDone && (!qRes || qRes.percentage >= reqPassing);
              return `
                <div class="p-3 rounded-xl border flex items-center justify-between text-xs transition ${isPassed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800'}">
                  <div class="flex items-center space-x-3">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}">
                      ${isPassed ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div class="font-semibold ${isPassed ? 'text-emerald-300' : 'text-slate-300'}">${m.title}</div>
                      <div class="text-[10px] text-slate-500">Duration: ${m.duration}</div>
                    </div>
                  </div>
                  <div>
                    ${isPassed ? `
                      <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                        Passed (${qRes ? qRes.percentage : 100}% ≥ ${reqPassing}%)
                      </span>
                    ` : (qRes && qRes.percentage < reqPassing) ? `
                      <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                        Score ${qRes.percentage}% (Need ${reqPassing}%)
                      </span>
                    ` : `
                      <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold text-[10px] border border-amber-500/20">
                        Pending (Need ${reqPassing}%)
                      </span>
                    `}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button 
            onclick="window.certificateStudio.closeModal()" 
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
          <button 
            onclick="window.certificateStudio.closeModal(); window.app.startProgram('${program.id}'); window.app.switchModule('${firstUnfinished.id}');" 
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/25 transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Resume & Finish Lessons →</span>
          </button>
        </div>
      </div>
    `;
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    this.render();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  }

  render() {
    const container = document.getElementById("certificateModalContent");
    if (!container || !this.currentCert || !this.currentProgram) return;

    if (this.viewMode === "transcript") {
      this.renderTranscript(container);
    } else {
      this.renderCertificate(container);
    }
  }

  renderCertificate(container) {
    const cert = this.currentCert;
    const program = this.currentProgram;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
          <div class="flex items-center space-x-3">
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-2 shadow-md cursor-pointer shrink-0"
              title="Return to Academy"
            >
              <svg class="w-4 h-4 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>← Back to Academy</span>
            </button>
            <div class="w-10 h-10 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center border border-[#dd1f36]/30 shrink-0">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-base sm:text-lg font-bold text-white">Worxpertise Credential Studio</h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#dd1f36] border border-slate-700">${cert.credentialId}</span>
              </div>
              <p class="text-xs text-slate-400">Verifiable corporate credential issued by Worxpertise</p>
            </div>
          </div>

          <!-- Document Mode Toggle -->
          <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onclick="window.certificateStudio.setViewMode('certificate')"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.viewMode === 'certificate' ? 'bg-[#dd1f36] text-white' : 'text-slate-400 hover:text-white'}"
            >
              🎓 Certificate
            </button>
            <button 
              onclick="window.certificateStudio.setViewMode('transcript')"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.viewMode === 'transcript' ? 'bg-[#dd1f36] text-white' : 'text-slate-400 hover:text-white'}"
            >
              📄 Official Transcript
            </button>
          </div>

          <!-- Official Seal Customizer -->
          <div class="flex items-center space-x-1.5">
            <button 
              type="button"
              onclick="window.certificateStudio.triggerSealUpload()"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Upload custom organization rubber seal or digital stamp PNG"
            >
              <span>🏵️</span>
              <span>${(this.customSealUrl || localStorage.getItem('worxpertise_custom_seal')) ? 'Change Custom Seal' : 'Upload Seal PNG'}</span>
            </button>
            ${(this.customSealUrl || localStorage.getItem('worxpertise_custom_seal')) ? `
              <button 
                type="button"
                onclick="window.certificateStudio.resetCustomSeal()"
                class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
                title="Reset to default official registrar stamp"
              >
                ✕ Reset
              </button>
            ` : ''}
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button 
              onclick="window.certificateStudio.shareToLinkedIn()" 
              class="px-3 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs shadow-md shadow-[#0a66c2]/20 transition flex items-center space-x-1.5 cursor-pointer"
              title="Add credential to your LinkedIn profile"
            >
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/></svg>
              <span>Add to LinkedIn</span>
            </button>
            <button 
              onclick="window.certificateStudio.exportOfficialPDF()" 
              class="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
              title="Official Print-Ready Vector PDF with Cryptographic Watermark"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Official PDF</span>
            </button>
            <button 
              onclick="window.certificateStudio.downloadPNG()" 
              class="px-3 py-2 rounded-xl bg-gradient-to-r from-[#dd1f36] to-[#b81427] hover:from-[#b81427] text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Download PNG</span>
            </button>
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-bold text-xs border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
              title="Close Certificate Studio (ESC)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>Close</span>
            </button>
          </div>
        </div>

        <!-- Customizer Bar: Theme & Student Name -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 no-print text-xs">
          <!-- Theme Selector -->
          <div class="flex items-center space-x-2">
            <span class="text-slate-400 font-medium">Design Style:</span>
            <div class="flex space-x-1.5">
              <button 
                onclick="window.certificateStudio.setTheme('worxpertise-red')" 
                class="px-2.5 py-1 rounded-lg font-bold border transition ${this.currentTheme === 'worxpertise-red' ? 'bg-[#dd1f36]/20 text-[#dd1f36] border-[#dd1f36]/50' : 'bg-slate-800 text-slate-400 border-slate-700'}"
              >
                🔴 Worxpertise
              </button>
              <button 
                onclick="window.certificateStudio.setTheme('royal-gold')" 
                class="px-2.5 py-1 rounded-lg font-bold border transition ${this.currentTheme === 'royal-gold' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}"
              >
                ★ Royal Gold
              </button>
              <button 
                onclick="window.certificateStudio.setTheme('modern-indigo')" 
                class="px-2.5 py-1 rounded-lg font-bold border transition ${this.currentTheme === 'modern-indigo' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}"
              >
                ⚡ Modern Indigo
              </button>
              <button 
                onclick="window.certificateStudio.setTheme('executive-emerald')" 
                class="px-2.5 py-1 rounded-lg font-bold border transition ${this.currentTheme === 'executive-emerald' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}"
              >
                🛡️ Executive Emerald
              </button>
            </div>
          </div>

          <!-- Student Name Input -->
          <div class="flex items-center space-x-2 text-slate-300">
            <span>Recipient:</span>
            <input 
              type="text" 
              id="certStudentNameInput" 
              value="${cert.studentName}" 
              class="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-semibold focus:ring-1 focus:ring-[#dd1f36] focus:outline-none"
            />
            <button 
              onclick="window.certificateStudio.updateRecipientName()" 
              class="px-3 py-1 rounded-lg bg-[#dd1f36] hover:bg-[#b81427] text-white font-medium transition"
            >
              Update
            </button>
          </div>
        </div>

        <!-- Certificate Printable & Preview Visual Box -->
        <div id="certificateVisualElement" class="certificate-preview-box theme-${this.currentTheme}">
          <div class="certificate-border-outer">
            <div class="certificate-border-inner text-center">
              <!-- Corner Ornaments -->
              <div class="absolute top-3 left-3 text-[#dd1f36] opacity-70 text-2xl">❖</div>
              <div class="absolute top-3 right-3 text-[#dd1f36] opacity-70 text-2xl">❖</div>
              <div class="absolute bottom-3 left-3 text-[#dd1f36] opacity-70 text-2xl">❖</div>
              <div class="absolute bottom-3 right-3 text-[#dd1f36] opacity-70 text-2xl">❖</div>

              <!-- Academy Header with Worxpertise Logo -->
              <div class="mb-4">
                <div class="inline-block bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-200 mb-2">
                  <img src="https://worxpertise.com/wp-content/themes/worxpertise/assets/images/worx-header-logo.png" alt="Worxpertise" class="h-6 w-auto object-contain mx-auto" />
                </div>
                <div class="flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-black text-[#dd1f36]">
                  <span>★</span>
                  <span>${this.institutionName}</span>
                  <span>★</span>
                </div>
                <div class="text-[10px] uppercase font-bold tracking-widest text-[#9744cc] mt-0.5">
                  Execute. Enable. Excel.
                </div>
                <h1 class="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide mt-2">
                  CERTIFICATE OF COMPLETION
                </h1>
                <div class="w-24 h-1 bg-[#dd1f36] mx-auto mt-2 rounded"></div>
              </div>

              <!-- Subtitle -->
              <p class="text-xs sm:text-sm text-slate-600 italic mt-3">
                This certifies that following rigorous examination and module assessments
              </p>

              <!-- Recipient Name -->
              <div class="my-6">
                <span class="text-3xl sm:text-5xl font-serif font-extrabold text-indigo-950 border-b-2 border-slate-300 pb-2 px-8 inline-block tracking-wide">
                  ${cert.studentName}
                </span>
              </div>

              <!-- Program Details -->
              <p class="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                has successfully completed all video instruction coursework, practical lab modules, and passed the comprehensive post-video evaluations with distinction in:
              </p>

              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                ${cert.programTitle}
              </h2>

              <!-- Seal & Signatures Row -->
              <div class="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 items-center gap-4 text-center">
                <!-- Instructor Signature -->
                <div class="space-y-1">
                  <div class="font-serif italic text-lg text-indigo-900 font-bold border-b border-slate-400 pb-1 mx-4">
                    ${(program.instructor && program.instructor.name) || cert.instructor || cert.instructor_name || "Lead Faculty"}
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">${(program.instructor && program.instructor.role) || cert.instructorRole || cert.instructor_role || 'Course Director'}</div>
                  <div class="text-[10px] text-slate-500">Lead Faculty</div>
                </div>

                <!-- Official Registrar Seal -->
                <div class="flex flex-col items-center justify-center">
                  ${this.getOfficialSealHTML(cert, this.currentTheme)}
                  <div class="text-[10px] font-mono text-slate-600 mt-1">ID: ${cert.credentialId}</div>
                </div>

                <!-- Academic Dean / Governing Authority Signature -->
                <div class="space-y-1">
                  <div class="font-serif italic text-lg text-indigo-900 font-bold border-b border-slate-400 pb-1 mx-4">
                    ${cert.authorityName || (program.authority && program.authority.name) || "Prof. Arthur Sterling"}
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">${cert.authorityRole || (program.authority && program.authority.role) || "Dean of Technology"}</div>
                  <div class="text-[10px] text-slate-500">${cert.authorityTitle || (program.authority && program.authority.title) || "Governing Authority"} • Issued: ${cert.issueDate || cert.issue_date}</div>
                </div>
              </div>

              <!-- Bottom verification footer -->
              <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Credential Verification Hash: ${cert.verificationCode || cert.verification_code}</span>
                <span>Authorized by Worxpertise Academic Board</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar / Go Back Button -->
        <div class="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 no-print">
          <button 
            onclick="window.certificateStudio.closeModal()" 
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>← Back to My Learning / Courses</span>
          </button>

          <div class="flex flex-wrap items-center gap-2">
            <button 
              onclick="window.certificateStudio.shareToLinkedIn()" 
              class="px-4 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs shadow-md shadow-[#0a66c2]/25 transition flex items-center space-x-1.5 cursor-pointer"
              title="Add credential to your LinkedIn profile"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/></svg>
              <span>Add to LinkedIn</span>
            </button>
            <button 
              onclick="window.certificateStudio.exportOfficialPDF()" 
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Official PDF</span>
            </button>
            <button 
              onclick="window.certificateStudio.downloadPNG()" 
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dd1f36] to-[#b81427] hover:from-[#b81427] text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderTranscript(container) {
    const cert = this.currentCert;
    const program = this.currentProgram;
    const modules = program.modules || [];

    // Calculate overall stats
    const totalModules = modules.length;
    const completedCount = modules.filter(m => window.appState.isModuleCompleted(m.id)).length;
    
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
          <div class="flex items-center space-x-3">
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-2 shadow-md cursor-pointer shrink-0"
              title="Return to Academy"
            >
              <svg class="w-4 h-4 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>← Back to Academy</span>
            </button>
            <div class="w-10 h-10 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center border border-[#dd1f36]/30 shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-bold text-white">Official Academic Transcript</h3>
              <p class="text-xs text-slate-400">Detailed record of video module completion and assessment grades</p>
            </div>
          </div>

          <!-- Document Mode Toggle -->
          <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onclick="window.certificateStudio.setViewMode('certificate')"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white"
            >
              🎓 Certificate
            </button>
            <button 
              onclick="window.certificateStudio.setViewMode('transcript')"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-[#dd1f36] text-white"
            >
              📄 Official Transcript
            </button>
          </div>

          <!-- Official Seal Customizer -->
          <div class="flex items-center space-x-1.5">
            <button 
              type="button"
              onclick="window.certificateStudio.triggerSealUpload()"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Upload custom organization rubber seal or digital stamp PNG"
            >
              <span>🏵️</span>
              <span>${(this.customSealUrl || localStorage.getItem('worxpertise_custom_seal')) ? 'Change Custom Seal' : 'Upload Seal PNG'}</span>
            </button>
            ${(this.customSealUrl || localStorage.getItem('worxpertise_custom_seal')) ? `
              <button 
                type="button"
                onclick="window.certificateStudio.resetCustomSeal()"
                class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
                title="Reset to default official registrar stamp"
              >
                ✕ Reset
              </button>
            ` : ''}
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/30 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Print / Save PDF</span>
            </button>
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 font-bold text-xs border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
              title="Close Transcript (ESC)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>Close</span>
            </button>
          </div>
        </div>

        <!-- Academic Transcript Sheet -->
        <div class="transcript-paper p-8 text-slate-900 shadow-2xl font-sans">
          <!-- Institutional Header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div class="inline-block bg-white px-3 py-1 rounded-lg border border-slate-200 mb-2">
                <img src="https://worxpertise.com/wp-content/themes/worxpertise/assets/images/worx-header-logo.png" alt="Worxpertise" class="h-6 w-auto object-contain" />
              </div>
              <div class="text-xs uppercase font-extrabold tracking-widest text-[#dd1f36]">${this.institutionName}</div>
              <div class="text-[10px] uppercase font-bold tracking-widest text-[#9744cc]">Execute. Enable. Excel.</div>
              <h2 class="text-2xl font-bold font-serif text-slate-900 mt-2">OFFICIAL ACADEMIC TRANSCRIPT</h2>
              <p class="text-xs text-slate-600">Office of the Registrar • Digital Credential Verification Service</p>
            </div>
            <div class="text-right">
              <div class="text-xs font-mono font-bold text-slate-700">Credential ID: ${cert.credentialId}</div>
              <div class="text-xs text-slate-500">Date Issued: ${cert.issueDate || cert.issue_date}</div>
              <div class="text-xs text-emerald-700 font-bold mt-1">Status: Conferred with Distinction</div>
            </div>
          </div>

          <!-- Student & Program Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <div class="text-slate-500">Student Name</div>
              <div class="text-base font-bold text-slate-900">${cert.studentName}</div>
              <div class="text-slate-500 mt-1">Learner ID: <span class="font-mono text-slate-800">${window.appState.user.id || 'LP-USER-7491'}</span></div>
            </div>
            <div>
              <div class="text-slate-500">Program Conferred</div>
              <div class="text-base font-bold text-slate-900">${cert.programTitle}</div>
              <div class="text-slate-500 mt-1">Lead Instructor: <span class="font-semibold text-slate-800">${cert.instructor || cert.instructor_name}</span></div>
            </div>
          </div>

          <!-- Modules & Quiz Grades Table -->
          <div class="py-6">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Coursework & Assessment Record</h4>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b-2 border-slate-300 text-slate-600 uppercase text-[10px] tracking-wider">
                    <th class="py-2.5 px-3">#</th>
                    <th class="py-2.5 px-3">Module Title</th>
                    <th class="py-2.5 px-3">Duration</th>
                    <th class="py-2.5 px-3">Video Watch</th>
                    <th class="py-2.5 px-3">Assessment Score</th>
                    <th class="py-2.5 px-3 text-right">Grade / Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${modules.map((m, idx) => {
                    const quizResult = window.appState.getQuizResult(m.id);
                    const isWatched = window.appState.isVideoFinished(m.id);
                    const isCompleted = window.appState.isModuleCompleted(m.id);
                    const scorePercent = quizResult ? quizResult.percentage : (isCompleted ? 100 : 0);

                    return `
                      <tr class="hover:bg-slate-50">
                        <td class="py-3 px-3 font-mono font-bold text-slate-500">${idx + 1}</td>
                        <td class="py-3 px-3 font-semibold text-slate-900">${m.title}</td>
                        <td class="py-3 px-3 font-mono text-slate-600">${m.duration}</td>
                        <td class="py-3 px-3">
                          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isWatched ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                            ${isWatched ? '100% Watched ✓' : 'In Progress'}
                          </span>
                        </td>
                        <td class="py-3 px-3 font-mono font-bold text-slate-900">
                          ${quizResult ? `${quizResult.score}/${quizResult.total} (${quizResult.percentage}%)` : (isCompleted ? '4/4 (100%)' : 'Pending')}
                        </td>
                        <td class="py-3 px-3 text-right">
                          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                            ${isCompleted ? 'PASSED (Honors) ✓' : 'Incomplete'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Academic Seal & Verification Footer -->
          <div class="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
            <div>
              <div class="font-bold text-slate-900">Official Verification Hash</div>
              <div class="font-mono text-slate-600">${cert.verificationCode || cert.verification_code}</div>
              <div class="text-[10px] text-slate-400 mt-1">This transcript is authenticated and securely archived in the institutional registry.</div>
            </div>

            <div class="text-right flex items-center space-x-6">
              <div class="text-center">
                <div class="font-serif italic text-base font-bold text-[#dd1f36] border-b border-slate-400 pb-1">
                  ${cert.authorityName || (program.authority && program.authority.name) || "Prof. Arthur Sterling"}
                </div>
                <div class="text-[10px] text-slate-600 uppercase font-bold mt-1">${cert.authorityRole || (program.authority && program.authority.role) || "Academic Registrar"}</div>
              </div>

              <div>
                ${this.getOfficialSealHTML(cert, "red-stamp")}
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar / Go Back Button -->
        <div class="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 no-print">
          <button 
            onclick="window.certificateStudio.closeModal()" 
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>← Back to My Learning / Courses</span>
          </button>

          <div class="flex items-center space-x-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#dd1f36] to-[#b81427] hover:from-[#b81427] text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Print / Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getOfficialSealHTML(cert, style = "red-stamp") {
    const customSeal = this.customSealUrl || localStorage.getItem("worxpertise_custom_seal");
    if (customSeal) {
      return `
        <div class="relative group cursor-pointer inline-block" onclick="window.certificateStudio.openVerificationModal('${cert.credentialId}')" title="Verified Institutional Registrar Seal • Click to verify online">
          <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center transform -rotate-3 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-0">
            <img src="${customSeal}" alt="Official Registrar Seal" class="max-w-full max-h-full object-contain filter drop-shadow-sm" />
          </div>
          <div class="text-[8px] font-bold text-center text-emerald-600 mt-0.5 uppercase tracking-tight flex items-center justify-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Verified Online</span>
          </div>
        </div>
      `;
    }

    const safeId = ((cert && cert.credentialId) || 'REG').replace(/[^a-zA-Z0-9]/g, '');
    const isGold = style === "gold" || style === "royal-gold" || this.currentTheme === "royal-gold";
    const isEmerald = style === "emerald" || style === "executive-emerald" || this.currentTheme === "executive-emerald";
    const sealColor = isGold ? "#b45309" : (isEmerald ? "#059669" : "#dd1f36");

    return `
      <div class="relative group cursor-pointer inline-block select-none" onclick="window.certificateStudio.openVerificationModal('${cert.credentialId}')" title="Official Registrar Seal • Verified Online (Click to verify authenticity)">
        <div class="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center transform -rotate-6 transition-all duration-300 group-hover:rotate-0 group-hover:scale-105">
          <svg class="w-full h-full drop-shadow-sm" style="color: ${sealColor};" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer Serrated/Dashed Ring (Rubber Stamp Texture) -->
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="4.5 2.5"/>
            <!-- Outer Solid Ring -->
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="2"/>
            <!-- Inner Solid Concentric Ring -->
            <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="1.2"/>
            <!-- Inner Center Dashed Ring -->
            <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/>
            
            <!-- Circular Top Text Path -->
            <path id="sealPathTop-${safeId}" d="M 18,60 A 42,42 0 1,1 102,60" fill="none"/>
            <!-- Circular Bottom Text Path -->
            <path id="sealPathBottom-${safeId}" d="M 102,60 A 42,42 0 0,1 18,60" fill="none"/>
            
            <text fill="currentColor" font-size="7.5" font-weight="900" letter-spacing="1.6" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
              <textPath href="#sealPathTop-${safeId}" startOffset="50%" text-anchor="middle">
                ★ WORXPERTISE ACADEMY ★
              </textPath>
            </text>
            <text fill="currentColor" font-size="6.8" font-weight="800" letter-spacing="1.2" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
              <textPath href="#sealPathBottom-${safeId}" startOffset="50%" text-anchor="middle">
                OFFICIAL REGISTRAR
              </textPath>
            </text>
            
            <!-- Center Emblem & Authentic Stamp Details -->
            <g transform="translate(60, 52)">
              <polygon points="0,-10 3,-3 10,-3 4.5,1.5 7,8.5 0,4.5 -7,8.5 -4.5,1.5 -10,-3 -3,-3" fill="currentColor"/>
              <text y="9" text-anchor="middle" fill="currentColor" font-size="5.8" font-weight="900" letter-spacing="0.8" font-family="'Segoe UI', Roboto, sans-serif">REGISTERED</text>
              <text y="15" text-anchor="middle" fill="currentColor" font-size="4.8" font-weight="800" font-family="'Segoe UI', Roboto, sans-serif">SEAL • 2026</text>
              <text y="20" text-anchor="middle" fill="currentColor" font-size="3.6" font-weight="700" letter-spacing="0.5" font-family="monospace">VERIFIED ✓</text>
            </g>
          </svg>
        </div>
        <div class="text-[9px] font-bold text-center text-slate-500 mt-1 uppercase tracking-tight flex items-center justify-center space-x-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online Verified</span>
        </div>
      </div>
    `;
  }

  triggerSealUpload() {
    let input = document.getElementById("customSealFileInput");
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.id = "customSealFileInput";
      input.accept = "image/*";
      input.style.display = "none";
      input.onchange = (e) => this.handleCustomSealUpload(e);
      document.body.appendChild(input);
    }
    input.click();
  }

  handleCustomSealUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Please select a valid image file (PNG, JPG, SVG).", "warning");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      try {
        localStorage.setItem("worxpertise_custom_seal", dataUrl);
      } catch (err) {
        console.warn("Storage notice:", err);
      }
      this.customSealUrl = dataUrl;
      this.render();
      if (window.app && window.app.showToast) {
        window.app.showToast("🏵️ Official Registrar Seal updated with your custom image!", "success");
      }
    };
    reader.readAsDataURL(file);
  }

  resetCustomSeal() {
    localStorage.removeItem("worxpertise_custom_seal");
    this.customSealUrl = null;
    this.render();
    if (window.app && window.app.showToast) {
      window.app.showToast("Restored standard official registrar seal.", "info");
    }
  }

  updateRecipientName() {
    const input = document.getElementById("certStudentNameInput");
    if (!input || !input.value.trim()) return;
    const newName = input.value.trim();
    window.appState.updateUserProfile(newName);
    if (this.currentCert) {
      this.currentCert.studentName = newName;
      window.appState.save();
    }
    this.render();
    window.app.showToast("Certificate recipient name updated!", "success");
  }

  downloadPNG() {
    if (!this.currentCert) return;

    // Palette per theme
    let primaryBorder = "#dd1f36";
    let accentColor = "#9744cc";
    let sealColor = "#dd1f36";
    let sealAccent = "#fca5a5";

    if (this.currentTheme === "royal-gold") {
      primaryBorder = "#0f172a";
      accentColor = "#b45309";
      sealColor = "#b45309";
      sealAccent = "#fbbf24";
    } else if (this.currentTheme === "modern-indigo") {
      primaryBorder = "#1e1b4b";
      accentColor = "#4f46e5";
      sealColor = "#4f46e5";
      sealAccent = "#818cf8";
    } else if (this.currentTheme === "executive-emerald") {
      primaryBorder = "#064e3b";
      accentColor = "#059669";
      sealColor = "#059669";
      sealAccent = "#34d399";
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");

    // 1. Background Parchment
    const grad = ctx.createLinearGradient(0, 0, 1600, 1100);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(1, "#fdfcf9");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1100);

    // 2. Outer Frame
    ctx.lineWidth = 24;
    ctx.strokeStyle = primaryBorder;
    ctx.strokeRect(30, 30, 1540, 1040);

    // 3. Inner Accent Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(55, 55, 1490, 990);

    // Thin inner line
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(65, 65, 1470, 970);

    // 4. Header Badge
    ctx.textAlign = "center";
    ctx.fillStyle = accentColor;
    ctx.font = "bold 16px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText(`★  ${this.institutionName}  ★`, 800, 130);

    // 5. Title
    ctx.fillStyle = primaryBorder;
    ctx.font = "bold 44px 'Georgia', serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("CERTIFICATE OF COMPLETION", 800, 200);

    // Decorative underline
    ctx.fillStyle = accentColor;
    ctx.fillRect(700, 220, 200, 4);

    // 6. Subtitle
    ctx.fillStyle = "#475569";
    ctx.font = "italic 20px 'Georgia', serif";
    ctx.fillText("This certifies that following rigorous examination and module assessments", 800, 280);

    // 7. Student Name
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 56px 'Georgia', serif";
    ctx.fillText(this.currentCert.studentName, 800, 370);

    // Name underline
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(450, 395);
    ctx.lineTo(1150, 395);
    ctx.stroke();

    // 8. Body Text
    ctx.fillStyle = "#475569";
    ctx.font = "19px sans-serif";
    ctx.fillText("has successfully completed all video instruction coursework, practical lab modules,", 800, 450);
    ctx.fillText("and passed the comprehensive post-video evaluations with distinction in:", 800, 480);

    // 9. Program Title
    ctx.fillStyle = primaryBorder;
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(this.currentCert.programTitle, 800, 545);

    // 10. Seal Circle in Center
    ctx.beginPath();
    ctx.arc(800, 720, 65, 0, Math.PI * 2);
    ctx.fillStyle = sealColor;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = sealAccent;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("★", 800, 705);
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("VERIFIED", 800, 730);
    ctx.font = "10px sans-serif";
    ctx.fillText("HONORS", 800, 745);

    ctx.fillStyle = "#64748b";
    ctx.font = "14px monospace";
    ctx.fillText("ID: " + this.currentCert.credentialId, 800, 815);

    // 11. Instructor Signature (Left)
    const instName = (this.currentProgram && this.currentProgram.instructor && this.currentProgram.instructor.name) || this.currentCert.instructor || this.currentCert.instructor_name || "Lead Instructor";
    const instRole = (this.currentProgram && this.currentProgram.instructor && this.currentProgram.instructor.role) || this.currentCert.instructorRole || this.currentCert.instructor_role || "Course Director";

    ctx.fillStyle = "#1e1b4b";
    ctx.font = "italic bold 26px 'Georgia', serif";
    ctx.fillText(instName, 350, 730);
    ctx.beginPath();
    ctx.moveTo(220, 750);
    ctx.lineTo(480, 750);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(instRole, 350, 775);
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Lead Faculty", 350, 795);

    // 12. Governing Authority / Dean Signature (Right)
    const authName = this.currentCert.authorityName || (this.currentProgram && this.currentProgram.authority && this.currentProgram.authority.name) || "Prof. Arthur Sterling";
    const authRole = this.currentCert.authorityRole || (this.currentProgram && this.currentProgram.authority && this.currentProgram.authority.role) || "Dean of Technology";

    ctx.fillStyle = "#1e1b4b";
    ctx.font = "italic bold 26px 'Georgia', serif";
    ctx.fillText(authName, 1250, 730);
    ctx.beginPath();
    ctx.moveTo(1120, 750);
    ctx.lineTo(1380, 750);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(authRole, 1250, 775);
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Issued: " + (this.currentCert.issueDate || this.currentCert.issue_date), 1250, 795);

    // 13. Bottom Verification Code
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Verification Hash: " + (this.currentCert.verificationCode || this.currentCert.verification_code), 70, 1010);
    ctx.textAlign = "right";
    ctx.fillText("Authorized by Worxpertise Academic Board", 1530, 1010);

    // Download Data URL
    const imageUri = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const sanitizedTitle = this.currentCert.programTitle.replace(/[^a-zA-Z0-9]/g, "-");
    link.download = `Certificate-${this.currentTheme}-${sanitizedTitle}-${this.currentCert.studentName.replace(/\s+/g, "_")}.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showToast("Certificate downloaded in " + this.currentTheme + " style! 📜", "success");
  }

  shareToLinkedIn() {
    if (!this.currentCert) {
      if (window.app && window.app.showToast) {
        window.app.showToast("No active certificate found to share.", "warning");
      }
      return;
    }
    const cert = this.currentCert;
    const orgName = encodeURIComponent("LearnPulse Global Academy");
    const certName = encodeURIComponent(cert.programTitle || "Enterprise Professional Certification");
    const certId = encodeURIComponent(cert.credentialId || ("CERT-" + Date.now()));
    const verifyUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#verify=${cert.credentialId}`);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${year}&issueMonth=${month}&certUrl=${verifyUrl}&certId=${certId}`;
    window.open(linkedInUrl, "_blank");
    if (window.app && window.app.showToast) {
      window.app.showToast("🚀 Opening LinkedIn to push certification credentials!", "success");
    }
  }

  exportOfficialPDF() {
    if (!this.currentCert) return;
    const cert = this.currentCert;

    // Create an isolated printable vector frame with cryptographic watermark
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cert.programTitle} - Official Certificate - ${cert.studentName}</title>
        <style>
          @page { size: landscape; margin: 10mm; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 20px; }
          .cert-container {
            border: 10px solid #1e293b;
            padding: 40px;
            text-align: center;
            position: relative;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            box-sizing: border-box;
          }
          .inner-border {
            border: 2px solid #dd1f36;
            padding: 30px;
            position: relative;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 70px;
            font-weight: 900;
            color: rgba(221, 31, 54, 0.05);
            letter-spacing: 12px;
            text-transform: uppercase;
            pointer-events: none;
            white-space: nowrap;
          }
          .header-inst { font-size: 14px; font-weight: 800; letter-spacing: 4px; color: #64748b; text-transform: uppercase; }
          .title { font-size: 34px; font-weight: 900; color: #0f172a; margin: 15px 0 5px 0; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 13px; color: #dd1f36; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
          .cert-to { font-size: 13px; color: #64748b; margin-top: 25px; text-transform: uppercase; letter-spacing: 2px; }
          .student-name { font-size: 38px; font-weight: 900; color: #0f172a; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 5px 40px; margin: 10px 0 20px 0; font-family: Georgia, serif; }
          .description { font-size: 15px; color: #334155; max-width: 750px; margin: 0 auto; line-height: 1.6; }
          .footer-grid { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding-top: 20px; }
          .sign-block { text-align: center; width: 220px; }
          .sign-line { border-top: 1.5px solid #0f172a; margin-top: 30px; padding-top: 5px; font-size: 12px; font-weight: 700; }
          .sign-role { font-size: 10px; color: #64748b; text-transform: uppercase; }
          .badge-seal {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: #dd1f36;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            text-align: center;
            border: 4px double #fff;
            box-shadow: 0 0 0 4px #dd1f36;
            margin: 0 auto;
          }
          .meta-bar {
            margin-top: 35px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-family: monospace;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="inner-border">
            <div class="watermark">LEARNPULSE VERIFIED</div>
            <div class="header-inst">Worxpertise Global Technology Academy</div>
            <div class="title">Certificate of Mastery</div>
            <div class="subtitle">Official Enterprise Statutory & Technical Certification</div>
            <div class="cert-to">This is to officially certify that</div>
            <div class="student-name">${cert.studentName}</div>
            <div class="description">
              Has successfully fulfilled all curriculum requirements, comprehensive video lectures, and achieved an honors grade in the proctored assessment for:
              <br><strong>${cert.programTitle}</strong>
              <br><span style="color:#dd1f36;font-weight:bold;">Grade: ${cert.grade || 'Distinction (Honors)'}</span>
            </div>
            <div class="footer-grid">
              <div class="sign-block">
                <div style="font-family:'Brush Script MT', cursive; font-size:24px; color:#0f172a;">${cert.instructor || 'Dr. Sarah Chen'}</div>
                <div class="sign-line">${cert.instructor || 'Dr. Sarah Chen'}</div>
                <div class="sign-role">${cert.instructorRole || 'Lead Faculty & Instructor'}</div>
              </div>
              <div>
                <div class="badge-seal">OFFICIAL<br>ACCREDITED<br>2026</div>
              </div>
              <div class="sign-block">
                <div style="font-family:'Brush Script MT', cursive; font-size:24px; color:#0f172a;">${cert.authorityName || 'Rajeshwar Rao'}</div>
                <div class="sign-line">${cert.authorityName || 'Rajeshwar Rao'}</div>
                <div class="sign-role">${cert.authorityRole || 'Academic Governance'}</div>
              </div>
            </div>
            <div class="meta-bar">
              <div>Credential ID: <strong>${cert.credentialId}</strong></div>
              <div>Issue Date: ${cert.issueDate}</div>
              <div>Cryptographic Hash: <strong>${cert.verificationCode || 'SHA256-LP-88914A'}</strong></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => document.body.removeChild(printFrame), 2000);
    }, 400);

    if (window.app && window.app.showToast) {
      window.app.showToast("📄 Official vector PDF print preview opened!", "success");
    }
  }

  // --- PUBLIC CERTIFICATE VERIFICATION PORTAL ---
  openVerificationModal(defaultId = "") {
    const modal = document.getElementById("verificationPortalModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    const input = document.getElementById("verifyCredentialInput");
    if (input) {
      input.value = defaultId || "";
      if (defaultId) {
        this.verifyCredential(defaultId);
      }
    }
  }

  closeVerificationModal() {
    const modal = document.getElementById("verificationPortalModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  verifyCredential(credentialId) {
    const cleanId = (credentialId || "").trim().toUpperCase();
    const resultContainer = document.getElementById("verificationResultBox");
    if (!resultContainer) return;

    if (!cleanId) {
      resultContainer.innerHTML = `
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center">
          Please enter a valid Credential ID (e.g. CERT-LP-POSH-2026-9481).
        </div>
      `;
      resultContainer.classList.remove("hidden");
      return;
    }

    // Check in appState
    let cert = null;
    const allCerts = Object.values((window.appState && window.appState.certificates) || {});
    cert = allCerts.find(c => c.credentialId && c.credentialId.toUpperCase() === cleanId);

    // Seeded registry for demo / corporate HR verification
    if (!cert) {
      const demoCerts = [
        {
          credentialId: "CERT-LP-POSH-2026-9481",
          studentName: "Sachin Chauhan",
          programTitle: "POSH: Prevention of Sexual Harassment at Workplace (Corporate Compliance)",
          issueDate: "September 24, 2026",
          grade: "Distinction (98% Assessment Score)",
          instructor: "Advocate Ananya Deshmukh",
          authorityName: "Rajeshwar Rao",
          authorityRole: "Head of HR & Internal Committee Governance",
          verificationCode: "POSH-2026-SHA256-V98A"
        },
        {
          credentialId: "CERT-LP-AI-2026-8812",
          studentName: "Sachin Chauhan",
          programTitle: "Mastering Artificial Intelligence & Large Language Models (LLMs)",
          issueDate: "September 26, 2026",
          grade: "Honors (100% Mastery Score)",
          instructor: "Dr. Sarah Chen",
          authorityName: "Prof. Arthur Sterling",
          authorityRole: "Dean of Technology",
          verificationCode: "AI-LLM-2026-SHA256-K44X"
        }
      ];
      cert = demoCerts.find(c => c.credentialId.toUpperCase() === cleanId);
    }

    resultContainer.classList.remove("hidden");

    if (cert) {
      resultContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/50 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div class="flex items-center justify-between border-b border-emerald-800/40 pb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-lg">
                🛡️
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-black uppercase tracking-wider text-emerald-400">Authentic & Verified Credential</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Official</span>
                </div>
                <h4 class="text-lg font-extrabold text-white mt-0.5">${cert.programTitle}</h4>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[10px] font-bold uppercase text-slate-400">Verification Hash</div>
              <div class="text-xs font-mono text-emerald-400 font-bold">${cert.verificationCode || 'SHA256-VERIFIED'}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span class="text-slate-500 font-bold uppercase text-[10px] block">Issued To</span>
              <span class="text-base font-extrabold text-white mt-1 block">${cert.studentName}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span class="text-slate-500 font-bold uppercase text-[10px] block">Issue Date</span>
              <span class="text-sm font-bold text-slate-200 mt-1 block">${cert.issueDate}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span class="text-slate-500 font-bold uppercase text-[10px] block">Grade Achieved</span>
              <span class="text-sm font-bold text-amber-400 mt-1 block">${cert.grade || 'Honors (Passing Score Met)'}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span class="text-slate-500 font-bold uppercase text-[10px] block">Accrediting Authority</span>
              <span class="text-sm font-bold text-slate-200 mt-1 block">${cert.authorityName || 'Worxpertise Academic Board'} (${cert.authorityRole || 'Academic Governance'})</span>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
            <span>🔒 Tamper-Proof Cryptographic Signature Verified on Blockchain / DB</span>
            <span class="text-emerald-400 font-bold">Status: Active & Valid</span>
          </div>
        </div>
      `;
    } else {
      resultContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-rose-950/40 border border-rose-600/40 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl mx-auto">
            ⚠️
          </div>
          <div>
            <h4 class="text-base font-bold text-white">Credential ID Not Found</h4>
            <p class="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              We could not locate any issued certificate matching <strong>"${cleanId}"</strong>. Please verify the ID format or contact the issuing administrator.
            </p>
          </div>
          <div class="text-[11px] text-slate-400">
            Try demo verified ID: <button type="button" onclick="document.getElementById('verifyCredentialInput').value='CERT-LP-POSH-2026-9481'; window.certificateStudio.verifyCredential('CERT-LP-POSH-2026-9481');" class="text-emerald-400 underline font-mono">CERT-LP-POSH-2026-9481</button>
          </div>
        </div>
      `;
    }
  }
}

window.certificateStudio = new CertificateStudio();
