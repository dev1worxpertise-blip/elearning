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
  }

  openCertificateModal(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return;

    let cert = window.appState.getCertificate(programId);
    if (!cert) {
      cert = window.appState.autoIssueCertificate(programId);
    }
    this.currentCert = cert;
    this.currentProgram = program;

    const modal = document.getElementById("certificateModal");
    const container = document.getElementById("certificateModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");
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
            <div class="w-10 h-10 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center border border-[#dd1f36]/30">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-lg font-bold text-white">Worxpertise Credential Studio</h3>
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

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button 
              onclick="window.certificateStudio.downloadPNG()" 
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dd1f36] to-[#b81427] hover:from-[#b81427] hover:to-[#9b1322] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/30 transition flex items-center space-x-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Download PNG</span>
            </button>
            <button 
              onclick="window.print()" 
              class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center space-x-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Print / PDF</span>
            </button>
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
                    ${cert.instructor || cert.instructor_name}
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">${cert.instructorRole || cert.instructor_role || 'Course Director'}</div>
                  <div class="text-[10px] text-slate-500">Lead Faculty</div>
                </div>

                <!-- Gold / Themed Seal -->
                <div class="flex flex-col items-center justify-center">
                  <div class="certificate-seal">
                    <div class="text-center text-white">
                      <div class="text-lg">★</div>
                      <div class="text-[9px] font-black uppercase tracking-tighter">VERIFIED</div>
                    </div>
                  </div>
                  <div class="text-[10px] font-mono text-slate-600 mt-2">ID: ${cert.credentialId}</div>
                </div>

                <!-- Academic Dean Signature -->
                <div class="space-y-1">
                  <div class="font-serif italic text-lg text-indigo-900 font-bold border-b border-slate-400 pb-1 mx-4">
                    Prof. Arthur Sterling
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Dean of Technology</div>
                  <div class="text-[10px] text-slate-500">Issued: ${cert.issueDate || cert.issue_date}</div>
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
            <div class="w-10 h-10 rounded-xl bg-[#dd1f36]/20 text-[#dd1f36] flex items-center justify-center border border-[#dd1f36]/30">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Official Academic Transcript</h3>
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

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <button 
              onclick="window.print()" 
              class="px-4 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white font-bold text-xs shadow-lg shadow-[#dd1f36]/30 transition flex items-center space-x-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Print / Save PDF</span>
            </button>
            <button 
              onclick="window.certificateStudio.closeModal()" 
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
                  Prof. Arthur Sterling
                </div>
                <div class="text-[10px] text-slate-600 uppercase font-bold mt-1">Academic Registrar</div>
              </div>

              <div class="w-14 h-14 rounded-full border-2 border-[#dd1f36] flex items-center justify-center text-center p-1 text-[8px] font-black uppercase text-[#dd1f36]">
                Official Registrar Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "italic bold 26px 'Georgia', serif";
    ctx.fillText(this.currentCert.instructor || this.currentCert.instructor_name || "Lead Instructor", 350, 730);
    ctx.beginPath();
    ctx.moveTo(220, 750);
    ctx.lineTo(480, 750);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(this.currentCert.instructorRole || this.currentCert.instructor_role || "Course Director", 350, 775);
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Lead Faculty", 350, 795);

    // 12. Academic Dean Signature (Right)
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "italic bold 26px 'Georgia', serif";
    ctx.fillText("Prof. Arthur Sterling", 1250, 730);
    ctx.beginPath();
    ctx.moveTo(1120, 750);
    ctx.lineTo(1380, 750);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Dean of Technology", 1250, 775);
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
}

window.certificateStudio = new CertificateStudio();
