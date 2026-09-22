/**
 * LearnPulse E-Learning Platform - Official Digital Certificate Studio
 * Generates verified certificates and exports high-resolution PNG & PDF.
 */

class CertificateStudio {
  constructor() {
    this.currentCert = null;
  }

  openCertificateModal(programId) {
    const program = (window.COURSES_DATA || []).find(p => p.id === programId);
    if (!program) return;

    let cert = window.appState.getCertificate(programId);
    if (!cert) {
      cert = window.appState.autoIssueCertificate(programId);
    }
    this.currentCert = cert;

    const modal = document.getElementById("certificateModal");
    const container = document.getElementById("certificateModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    this.renderCertificate(container, cert, program);
  }

  closeModal() {
    const modal = document.getElementById("certificateModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  }

  renderCertificate(container, cert, program) {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Official Certificate of Completion</h3>
              <p class="text-xs text-slate-400">Credential ID: <span class="font-mono text-amber-400">${cert.credentialId}</span></p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <button 
              onclick="window.certificateStudio.downloadPNG()" 
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Download High-Res PNG</span>
            </button>
            <button 
              onclick="window.print()" 
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center space-x-1.5"
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

        <!-- Student Name Quick Edit (for testing) -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 no-print text-xs">
          <div class="flex items-center space-x-2 text-slate-300">
            <span>Recipient Name on Certificate:</span>
            <input 
              type="text" 
              id="certStudentNameInput" 
              value="${cert.studentName}" 
              class="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <button 
              onclick="window.certificateStudio.updateRecipientName()" 
              class="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
            >
              Update
            </button>
          </div>
          <span class="text-slate-500">Preview updates automatically in real-time</span>
        </div>

        <!-- Certificate Printable & Preview Visual Box -->
        <div id="certificateVisualElement" class="certificate-preview-box">
          <div class="certificate-border-outer">
            <div class="certificate-border-inner text-center">
              <!-- Corner Ornaments -->
              <div class="absolute top-3 left-3 text-amber-700 opacity-60 text-2xl">⚜</div>
              <div class="absolute top-3 right-3 text-amber-700 opacity-60 text-2xl">⚜</div>
              <div class="absolute bottom-3 left-3 text-amber-700 opacity-60 text-2xl">⚜</div>
              <div class="absolute bottom-3 right-3 text-amber-700 opacity-60 text-2xl">⚜</div>

              <!-- Academy Header -->
              <div class="mb-4">
                <div class="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-black text-amber-800">
                  <span>★</span>
                  <span>LEARNPULSE ACADEMY OF ADVANCED TECHNOLOGY</span>
                  <span>★</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-wide mt-2">
                  CERTIFICATE OF COMPLETION
                </h1>
                <div class="w-24 h-1 bg-amber-600 mx-auto mt-2 rounded"></div>
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
                    ${cert.instructor}
                  </div>
                  <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">${cert.instructorRole}</div>
                  <div class="text-[10px] text-slate-500">Course Director</div>
                </div>

                <!-- Gold Seal -->
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
                  <div class="text-[10px] text-slate-500">Issued: ${cert.issueDate}</div>
                </div>
              </div>

              <!-- Bottom verification footer -->
              <div class="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Credential Verification Hash: ${cert.verificationCode}</span>
                <span>Authorized by LearnPulse Academic Board</span>
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
    const program = (window.COURSES_DATA || []).find(p => p.id === this.currentCert.programId);
    const container = document.getElementById("certificateModalContent");
    if (container && program) {
      this.renderCertificate(container, this.currentCert, program);
    }
    window.app.showToast("Certificate name updated!", "success");
  }

  downloadPNG() {
    if (!this.currentCert) return;

    // Use HTML5 Canvas to render ultra-sharp high resolution certificate graphic
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

    // 2. Outer Navy Frame
    ctx.lineWidth = 24;
    ctx.strokeStyle = "#0f172a";
    ctx.strokeRect(30, 30, 1540, 1040);

    // 3. Inner Gold Border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#b45309";
    ctx.strokeRect(55, 55, 1490, 990);

    // Thin accent inner border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#d97706";
    ctx.strokeRect(65, 65, 1470, 970);

    // 4. Header Badge
    ctx.textAlign = "center";
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 16px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("★  LEARNPULSE ACADEMY OF ADVANCED TECHNOLOGY  ★", 800, 130);

    // 5. Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 44px 'Georgia', serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("CERTIFICATE OF COMPLETION", 800, 200);

    // Gold decorative underline
    ctx.fillStyle = "#b45309";
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
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(this.currentCert.programTitle, 800, 545);

    // 10. Seal Circle in Center
    ctx.beginPath();
    ctx.arc(800, 720, 65, 0, Math.PI * 2);
    ctx.fillStyle = "#b45309";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fbbf24";
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
    ctx.fillText(this.currentCert.instructor, 350, 730);
    ctx.beginPath();
    ctx.moveTo(220, 750);
    ctx.lineTo(480, 750);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(this.currentCert.instructorRole, 350, 775);
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Course Director", 350, 795);

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
    ctx.fillText("Issued: " + this.currentCert.issueDate, 1250, 795);

    // 13. Bottom Verification Code
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Verification Hash: " + this.currentCert.verificationCode, 70, 1010);
    ctx.textAlign = "right";
    ctx.fillText("Authorized by LearnPulse Academic Board", 1530, 1010);

    // Download Data URL
    const imageUri = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const sanitizedTitle = this.currentCert.programTitle.replace(/[^a-zA-Z0-9]/g, "-");
    link.download = `Certificate-${sanitizedTitle}-${this.currentCert.studentName.replace(/\s+/g, "_")}.png`;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showToast("Certificate downloaded successfully as PNG! 📜", "success");
  }
}

window.certificateStudio = new CertificateStudio();
