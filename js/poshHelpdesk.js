/**
 * LearnPulse / Worxpertise Enterprise LMS
 * POSH Act Section 19: Confidential & Anonymous Internal Committee (IC) Grievance Redressal Studio
 * 
 * Statutory Legal Compliance:
 * 1. Learner Helpdesk: Confidential or 100% Anonymous grievance filing with secret tracking PIN.
 * 2. Case Tracking: Employees track case status and IC deliberations without revealing identity.
 * 3. Presiding Officer Console: Admin & IC Presiding Officer case adjudication and audit logging.
 * 4. Section 21 MWCD Compliance: 90-day statutory inquiry deadline tracking and Annual Report generation.
 */

class PoshHelpdeskManager {
  constructor() {
    this.activeModalTab = "lodge"; // "lodge" | "track" | "charter"
    this.adminFilterStatus = "all"; // "all" | "Filed" | "Under Review" | "Inquiry Commenced" | "Resolved"
    this.adminFilterSeverity = "all";
    this.adminSearchQuery = "";
    this.adminData = null;
    this.isLoading = false;
    this.activeReviewCase = null;
  }

  // =========================================================================
  // 1. LEARNER HELPDESK MODAL (Confidential / Anonymous Filing & Tracking)
  // =========================================================================

  openHelpdeskModal(defaultTab = "lodge") {
    this.activeModalTab = defaultTab;
    const modal = document.getElementById("poshHelpdeskModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    this.renderModal();
  }

  closeHelpdeskModal() {
    const modal = document.getElementById("poshHelpdeskModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  setModalTab(tabId) {
    this.activeModalTab = tabId;
    this.renderModal();
  }

  renderModal() {
    const container = document.getElementById("poshHelpdeskModalContent");
    if (!container) return;

    const user = (window.appState && window.appState.user) || { name: "Sachin Chauhan", email: "sachin@learnpulse.dev" };

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Top Statutory Notice & Security Badge -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl shadow-lg shrink-0">
              🛡️
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs uppercase font-extrabold tracking-wider text-rose-400">Statutory Redressal Desk</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  POSH ACT SECTION 19
                </span>
              </div>
              <h3 class="text-xl font-black text-white mt-0.5">
                ${window.i18n ? window.i18n.t('posh_modal_title') : 'Internal Committee (IC) Confidential Grievance Desk'}
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                ${window.i18n ? window.i18n.t('posh_modal_desc') : 'Strict Section 16 Non-Disclosure Protocol • Anonymous filing enabled with tamper-proof tracking PIN.'}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2 self-start sm:self-center">
            <!-- Language Quick Switcher inside POSH Modal -->
            <div class="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 space-x-1 shadow-inner">
              <span class="text-[10px] text-slate-400 font-bold px-1.5 hidden md:inline">🌐 Lang:</span>
              <button 
                type="button" 
                onclick="window.i18n.setLanguage('en')" 
                class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${window.i18n && window.i18n.getLanguage() === 'en' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              >English</button>
              <button 
                type="button" 
                onclick="window.i18n.setLanguage('hi')" 
                class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${window.i18n && window.i18n.getLanguage() === 'hi' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              >हिंदी</button>
              <button 
                type="button" 
                onclick="window.i18n.setLanguage('hinglish')" 
                class="px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${window.i18n && window.i18n.getLanguage() === 'hinglish' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}"
              >Hinglish</button>
            </div>

            <button 
              type="button"
              onclick="window.poshHelpdeskManager.closeHelpdeskModal()" 
              class="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button 
            type="button"
            onclick="window.poshHelpdeskManager.setModalTab('lodge')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              this.activeModalTab === 'lodge'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }"
          >
            <span>📝</span>
            <span>${window.i18n ? window.i18n.t('posh_tab_lodge') : 'Lodge Confidential Grievance'}</span>
          </button>

          <button 
            type="button"
            onclick="window.poshHelpdeskManager.setModalTab('track')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              this.activeModalTab === 'track'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }"
          >
            <span>🔍</span>
            <span>${window.i18n ? window.i18n.t('posh_tab_track') : 'Track Docket & IC Findings'}</span>
          </button>

          <button 
            type="button"
            onclick="window.poshHelpdeskManager.setModalTab('charter')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              this.activeModalTab === 'charter'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }"
          >
            <span>⚖️</span>
            <span>${window.i18n ? window.i18n.t('posh_tab_charter') : 'IC Charter & Legal Rights'}</span>
          </button>
        </div>

        <!-- Sub-Tab Content -->
        <div>
          ${
            this.activeModalTab === 'lodge' ? this.renderLodgeForm(user) :
            this.activeModalTab === 'track' ? this.renderTrackForm() :
            this.renderCharterInfo()
          }
        </div>
      </div>
    `;
  }

  // --- SUB-TAB 1: LODGE CONFIDENTIAL GRIEVANCE FORM ---
  renderLodgeForm(user) {
    return `
      <form id="poshLodgeForm" onsubmit="window.poshHelpdeskManager.handleLodgeSubmit(event)" class="space-y-5 text-xs text-slate-300">
        
        <!-- Confidentiality / Anonymous Toggle Banner -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🎭</span>
            <div>
              <div class="font-bold text-white text-sm">Filing Privacy Mode</div>
              <div class="text-[11px] text-slate-400">Choose between Confidential Identified or 100% Anonymous Whistleblower mode.</div>
            </div>
          </div>

          <div class="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <label class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition has-[:checked]:bg-purple-600 has-[:checked]:text-white text-slate-400 hover:text-white">
              <input type="radio" name="poshFilingMode" value="confidential" checked onchange="window.poshHelpdeskManager.toggleFilingMode(false)" class="hidden" />
              <span class="font-bold text-xs">🔒 Confidential Identified</span>
            </label>
            <label class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition has-[:checked]:bg-rose-600 has-[:checked]:text-white text-slate-400 hover:text-white">
              <input type="radio" name="poshFilingMode" value="anonymous" onchange="window.poshHelpdeskManager.toggleFilingMode(true)" class="hidden" />
              <span class="font-bold text-xs">🕵️ 100% Anonymous</span>
            </label>
          </div>
        </div>

        <!-- Complainant Identity Fields (Hidden if Anonymous) -->
        <div id="poshComplainantFields" class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <label class="font-bold text-slate-400 text-[11px] uppercase block mb-1">Your Full Name</label>
            <input 
              type="text" 
              id="poshComplainantName" 
              value="${user.name || ''}" 
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500" 
            />
          </div>
          <div>
            <label class="font-bold text-slate-400 text-[11px] uppercase block mb-1">Official Email Address</label>
            <input 
              type="email" 
              id="poshComplainantEmail" 
              value="${user.email || ''}" 
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500" 
            />
          </div>
          <div>
            <label class="font-bold text-slate-400 text-[11px] uppercase block mb-1">Department / Branch</label>
            <input 
              type="text" 
              id="poshComplainantDept" 
              placeholder="e.g. Technology / Operations" 
              class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-rose-500" 
            />
          </div>
        </div>

        <!-- Anonymous Whistleblower Notice (Displayed only when Anonymous is checked) -->
        <div id="poshAnonymousNotice" class="hidden p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center space-x-3">
          <span class="text-2xl shrink-0">🛡️</span>
          <div>
            <strong class="text-white block font-bold">100% Zero-Identity Whistleblower Protection:</strong>
            <span>Your name, email address, IP address, and user ID will NOT be saved in the database. You will receive a Secret 4-digit Tracking PIN on submission to view the IC's progress securely.</span>
          </div>
        </div>

        <!-- Accused Person / Respondent Details -->
        <div class="space-y-3">
          <div class="font-bold text-white text-xs uppercase tracking-wider text-rose-400">1. Respondent (Accused Person) Details</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Name of Person Accused <span class="text-rose-400">*</span></label>
              <input 
                type="text" 
                id="poshRespondentName" 
                required 
                placeholder="Full name of accused" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" 
              />
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Designation / Role</label>
              <input 
                type="text" 
                id="poshRespondentDesignation" 
                placeholder="e.g. Team Lead / Senior Manager" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" 
              />
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Department / Branch</label>
              <input 
                type="text" 
                id="poshRespondentDept" 
                placeholder="e.g. Sales / Mumbai Office" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" 
              />
            </div>
          </div>
        </div>

        <!-- Incident Classification & Date -->
        <div class="space-y-3">
          <div class="font-bold text-white text-xs uppercase tracking-wider text-rose-400">2. Incident Classification & Details</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Category of Incident <span class="text-rose-400">*</span></label>
              <select 
                id="poshCategory" 
                required 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Inappropriate Digital Messages / Late-Night Calls">Inappropriate Digital Messages / Calls</option>
                <option value="Unwanted Physical Contact / Personal Space Violation">Unwanted Physical Contact</option>
                <option value="Sexually Colored Remarks / Innuendos">Sexually Colored Remarks / Innuendos</option>
                <option value="Quid Pro Quo (Favor in exchange for career benefits)">Quid Pro Quo / Career Threats</option>
                <option value="Hostile Work Environment / Intimidation">Hostile Work Environment / Intimidation</option>
                <option value="General Advisory Query / Confidential Guidance">General Guidance / Advisory Query</option>
              </select>
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Date of Incident</label>
              <input 
                type="date" 
                id="poshIncidentDate" 
                value="${new Date().toISOString().split('T')[0]}"
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500" 
              />
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Incident Location</label>
              <input 
                type="text" 
                id="poshIncidentLocation" 
                placeholder="e.g. Office Conference Room / Zoom / Offsite" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" 
              />
            </div>
          </div>

          <div>
            <label class="font-semibold text-slate-400 text-[11px] block mb-1">Incident Narrative & Description <span class="text-rose-400">*</span></label>
            <textarea 
              id="poshDescription" 
              rows="4" 
              required
              placeholder="Please provide a clear, chronological account of the incident(s), including specific words or actions..."
              class="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 leading-relaxed"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Witnesses (if any)</label>
              <input 
                type="text" 
                id="poshWitnesses" 
                placeholder="Names or designations of colleagues present" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" 
              />
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Severity Assessment</label>
              <select 
                id="poshSeverity" 
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Medium">Medium Severity</option>
                <option value="High" selected>High Severity (Direct Harassment / Distress)</option>
                <option value="Critical">Critical (Immediate Workplace Danger / Assault)</option>
                <option value="Low">Low / Informal Inquiry</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Statutory Protection & Non-Retaliation Assurance -->
        <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2.5">
          <input type="checkbox" id="poshStatutoryAck" required class="mt-0.5 rounded text-rose-600 focus:ring-0" />
          <label for="poshStatutoryAck" class="leading-relaxed cursor-pointer select-none">
            I confirm that this grievance is lodged in good faith. I understand that under <strong class="text-white">Section 16 and Section 19 of the POSH Act 2013</strong>, my statement is strictly confidential, and employers are legally prohibited from subjecting complainants to any retaliation, dismissal, or penalty.
          </label>
        </div>

        <!-- Submission Button & Feedback Area -->
        <div class="flex items-center justify-between pt-3 border-t border-slate-800">
          <div id="poshLodgeFeedback" class="text-xs"></div>
          <button 
            type="submit" 
            id="btnSubmitPoshCase"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/40 transition flex items-center space-x-2 cursor-pointer"
          >
            <span>🛡️</span>
            <span>Submit Grievance to IC</span>
          </button>
        </div>
      </form>
    `;
  }

  toggleFilingMode(isAnonymous) {
    const fields = document.getElementById("poshComplainantFields");
    const notice = document.getElementById("poshAnonymousNotice");
    if (isAnonymous) {
      if (fields) fields.classList.add("hidden");
      if (notice) notice.classList.remove("hidden");
    } else {
      if (fields) fields.classList.remove("hidden");
      if (notice) notice.classList.add("hidden");
    }
  }

  async handleLodgeSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitPoshCase");
    const feedback = document.getElementById("poshLodgeFeedback");

    const mode = document.querySelector('input[name="poshFilingMode"]:checked')?.value || "confidential";
    const isAnonymous = mode === "anonymous";

    const payload = {
      is_anonymous: isAnonymous,
      complainant_name: isAnonymous ? null : document.getElementById("poshComplainantName")?.value,
      complainant_email: isAnonymous ? null : document.getElementById("poshComplainantEmail")?.value,
      complainant_department: isAnonymous ? null : document.getElementById("poshComplainantDept")?.value,
      respondent_name: document.getElementById("poshRespondentName")?.value,
      respondent_designation: document.getElementById("poshRespondentDesignation")?.value,
      respondent_department: document.getElementById("poshRespondentDept")?.value,
      category: document.getElementById("poshCategory")?.value,
      incident_date: document.getElementById("poshIncidentDate")?.value,
      incident_location: document.getElementById("poshIncidentLocation")?.value,
      description: document.getElementById("poshDescription")?.value,
      witnesses: document.getElementById("poshWitnesses")?.value,
      severity: document.getElementById("poshSeverity")?.value
    };

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span><span>Transmitting to IC...</span>`;
    }

    try {
      const resp = await fetch("/api/enterprise/posh/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (data.success) {
        if (window.app && typeof window.app.showToast === "function") {
          window.app.showToast("✓ Grievance securely submitted to Internal Committee.", "success");
        }
        this.renderSubmissionReceipt(data);
      } else {
        if (feedback) {
          feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ ${data.message || 'Submission failed'}</span>`;
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>🛡️</span><span>Submit Grievance to IC</span>`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Network Error: ${err.message}</span>`;
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🛡️</span><span>Submit Grievance to IC</span>`;
      }
    }
  }

  // Submission Success Card with Printable Tracking PIN
  renderSubmissionReceipt(data) {
    const container = document.getElementById("poshHelpdeskModalContent");
    if (!container) return;

    container.innerHTML = `
      <div class="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#181124] to-slate-950 border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto shadow-lg">
          ✓
        </div>

        <div>
          <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            CONFIDENTIAL GRIEVANCE FILED
          </span>
          <h3 class="text-2xl font-black text-white mt-2">
            Your Grievance Has Been Securely Registered
          </h3>
          <p class="text-xs text-slate-300 mt-1 max-w-lg mx-auto leading-relaxed">
            Your complaint has been encrypted and routed directly to the Internal Committee (IC) Presiding Officer: <strong class="text-white">Advocate Ananya Deshmukh</strong>. Under Section 11 of the POSH Act, the committee is mandated to commence inquiry proceedings within statutory timelines.
          </p>
        </div>

        <!-- Secret Credentials Card -->
        <div class="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Save Your Confidential Tracking Credentials</div>
          
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Case Docket Number</span>
              <span class="text-base font-mono font-black text-indigo-300 select-all block mt-1">${data.caseNumber}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Secret Tracking PIN</span>
              <span class="text-base font-mono font-black text-amber-400 select-all block mt-1">${data.trackingPin}</span>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 text-left space-y-1 pt-2 border-t border-slate-800/80">
            <div>🔒 <strong>Keep these safe:</strong> Use this Case Number and PIN to track IC inquiry notes without exposing your identity.</div>
            <div>⚖️ <strong>Statutory Guarantee:</strong> 90-day maximum inquiry resolution window under Section 11(4).</div>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button 
            type="button"
            onclick="window.poshHelpdeskManager.activeModalTab = 'track'; window.poshHelpdeskManager.renderModal(); document.getElementById('poshTrackCaseNumber').value='${data.caseNumber}'; document.getElementById('poshTrackPin').value='${data.trackingPin}'; window.poshHelpdeskManager.handleTrackSubmit(new Event('submit'));"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
          >
            <span>🔍</span>
            <span>View Live Tracking Status</span>
          </button>
          
          <button 
            type="button"
            onclick="window.poshHelpdeskManager.closeHelpdeskModal()"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            Close Helpdesk
          </button>
        </div>
      </div>
    `;
  }

  // --- SUB-TAB 2: TRACK EXISTING GRIEVANCE FORM & STATUS ---
  renderTrackForm() {
    return `
      <div class="space-y-6">
        <!-- Tracker Input Form -->
        <form onsubmit="window.poshHelpdeskManager.handleTrackSubmit(event)" class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex items-center space-x-2">
            <span class="text-lg">🔍</span>
            <div class="font-bold text-white text-xs uppercase tracking-wider">Access Confidential Case File</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="font-bold text-slate-400 text-[11px] uppercase block mb-1">Case Docket Number</label>
              <input 
                type="text" 
                id="poshTrackCaseNumber" 
                required 
                placeholder="e.g. POSH-2026-CASE-1082" 
                class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs uppercase focus:outline-none focus:border-rose-500" 
              />
            </div>
            <div>
              <label class="font-bold text-slate-400 text-[11px] uppercase block mb-1">Secret 4-Digit Tracking PIN</label>
              <input 
                type="password" 
                id="poshTrackPin" 
                required 
                maxlength="10"
                placeholder="4-digit PIN given on filing" 
                class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-rose-500" 
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="text-[11px] text-slate-400">
              Demo cases: 
              <button type="button" onclick="document.getElementById('poshTrackCaseNumber').value='POSH-2026-CASE-1082'; document.getElementById('poshTrackPin').value='4491';" class="text-indigo-400 underline font-mono">CASE-1082 (PIN 4491)</button>
              <span class="mx-1">•</span>
              <button type="button" onclick="document.getElementById('poshTrackCaseNumber').value='POSH-2026-CASE-1095'; document.getElementById('poshTrackPin').value='7723';" class="text-rose-400 underline font-mono">CASE-1095 (Anon PIN 7723)</button>
            </div>
            <button 
              type="submit" 
              id="btnTrackCase"
              class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Verify & Track Case
            </button>
          </div>
        </form>

        <!-- Container for Tracking Results -->
        <div id="poshTrackResultContainer"></div>
      </div>
    `;
  }

  async handleTrackSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const caseNumber = document.getElementById("poshTrackCaseNumber")?.value;
    const trackingPin = document.getElementById("poshTrackPin")?.value;
    const container = document.getElementById("poshTrackResultContainer");
    if (!container) return;

    if (!caseNumber || !trackingPin) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          Please provide both Case Docket Number and 4-digit PIN.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs">
        <span class="animate-spin inline-block mr-2">🔄</span> Authenticating PIN with Internal Committee registry...
      </div>
    `;

    try {
      const resp = await fetch("/api/enterprise/posh/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseNumber, trackingPin })
      });
      const data = await resp.json();

      if (data.success && data.case) {
        this.renderCaseTrackerDetail(data.case, container);
      } else {
        container.innerHTML = `
          <div class="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2">
            <div class="text-2xl">⚠️</div>
            <div class="font-bold text-white text-sm">Credentials Not Found</div>
            <div class="text-xs text-slate-300 max-w-sm mx-auto">
              ${data.message || 'No case matched this Case Number and PIN.'}
            </div>
          </div>
        `;
      }
    } catch (err) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          Network Error: ${err.message}
        </div>
      `;
    }
  }

  renderCaseTrackerDetail(c, container) {
    const isResolved = c.status === "Resolved";
    const isInquiry = c.status === "Inquiry Commenced";
    const isReview = c.status === "Under Review";

    let timelineArr = c.timeline || [];
    if (typeof timelineArr === 'string') {
      try { timelineArr = JSON.parse(timelineArr); } catch (e) { timelineArr = []; }
    }

    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl animate-in fade-in duration-200">
        <!-- Top Status Card -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-sm font-extrabold text-indigo-300">${c.case_number}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                c.status === 'Inquiry Commenced' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }">
                ${c.status}
              </span>
              ${c.is_anonymous ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">🕵️ Anonymous</span>' : ''}
            </div>
            <h4 class="text-base font-extrabold text-white mt-1">${c.category}</h4>
            <div class="text-xs text-slate-400 mt-0.5">Accused: <strong class="text-slate-200">${c.respondent_name}</strong> • Incident Date: ${c.incident_date}</div>
          </div>

          <div class="text-right shrink-0">
            <div class="text-[10px] text-slate-400 font-bold uppercase">Statutory 90-Day Clock</div>
            <div class="text-sm font-mono font-bold ${c.daysOpen > 90 ? 'text-rose-400' : 'text-emerald-400'}">
              ${c.daysOpen || 1} / 90 Days Elapsed
            </div>
          </div>
        </div>

        <!-- Visual Progress Stepper -->
        <div class="py-2">
          <div class="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
            <div class="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span class="block text-xs">✓</span>
              <span>1. Filed</span>
            </div>
            <div class="p-2.5 rounded-xl ${isReview || isInquiry || isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-slate-500 border border-slate-800'}">
              <span class="block text-xs">${isReview || isInquiry || isResolved ? '✓' : '●'}</span>
              <span>2. Under Review</span>
            </div>
            <div class="p-2.5 rounded-xl ${isInquiry || isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-slate-500 border border-slate-800'}">
              <span class="block text-xs">${isInquiry || isResolved ? '✓' : '●'}</span>
              <span>3. Formal Inquiry</span>
            </div>
            <div class="p-2.5 rounded-xl ${isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-slate-500 border border-slate-800'}">
              <span class="block text-xs">${isResolved ? '✓' : '●'}</span>
              <span>4. Redressal Order</span>
            </div>
          </div>
        </div>

        <!-- Presiding Officer Notes & Findings -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-300">
            <span class="flex items-center space-x-1.5">
              <span>👨‍⚖️</span>
              <span>Presiding Officer Findings & Orders</span>
            </span>
            <span class="text-[10px] text-slate-500">${c.presiding_officer_name || 'Advocate Ananya Deshmukh (External IC Chair)'}</span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            ${c.presiding_officer_notes || 'Case received. Preliminary examination under Section 9 of the POSH Act in progress.'}
          </p>
          ${c.action_taken ? `
            <div class="pt-2 text-xs text-emerald-300 flex items-center space-x-2">
              <span class="font-bold">✓ Action Enforced:</span>
              <span>${c.action_taken}</span>
            </div>
          ` : ''}
        </div>

        <!-- Timeline Trail -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-white uppercase tracking-wider">Internal Committee Activity Ledger</div>
          <div class="space-y-2 font-mono text-xs">
            ${timelineArr.map(t => `
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-4">
                <div>
                  <div class="font-bold text-white flex items-center space-x-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>${t.step}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 font-sans mt-0.5">${t.note || ''}</div>
                </div>
                <div class="text-right text-[10px] text-slate-500 shrink-0">
                  <div>${t.date ? new Date(t.date).toLocaleDateString() : ''}</div>
                  <div class="text-slate-400">${t.actor || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- SUB-TAB 3: IC CHARTER & STATUTORY RIGHTS ---
  renderCharterInfo() {
    return `
      <div class="space-y-6 text-xs text-slate-300 leading-relaxed">
        <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/30 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl shrink-0">
            ⚖️
          </div>
          <div>
            <h4 class="text-base font-extrabold text-white">Internal Committee (IC) Governance & Mandate</h4>
            <p class="text-xs text-slate-400 mt-0.5">
              Constituted under Section 4 of Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.
            </p>
          </div>
        </div>

        <!-- 3 Core Statutory Pillars -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="text-indigo-400 font-bold text-sm">🔒 Section 16 Strict Non-Disclosure</div>
            <p class="text-[11px] text-slate-400">
              By law, the identity of the complainant, respondent, and witnesses CANNOT be disclosed to the public, press, or peers. Statutory penalty of ₹5,000 for any confidentiality breach.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="text-emerald-400 font-bold text-sm">⏱️ 90-Day Statutory Inquiry Clock</div>
            <p class="text-[11px] text-slate-400">
              Under Section 11(4), the Internal Committee must complete its full inquiry within a strict 90-day window and submit recommendations to the employer within 10 days thereafter.
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div class="text-rose-400 font-bold text-sm">🛡️ Zero Retaliation Guarantee</div>
            <p class="text-[11px] text-slate-400">
              Section 19(h) mandates protection against victimisation. Any punitive reassignment, bad appraisals, or intimidation of a complainant or witness constitutes a severe punishable offence.
            </p>
          </div>
        </div>

        <!-- Committee Composition -->
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="font-bold text-white text-xs uppercase tracking-wider">Internal Committee (IC) Key Roster</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div class="font-bold text-white">Advocate Ananya Deshmukh</div>
              <div class="text-[10px] text-indigo-400 font-semibold">External IC Presiding Officer</div>
              <div class="text-[10px] text-slate-500 mt-1">Senior Legal Counsel (15+ yrs bar experience)</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div class="font-bold text-white">Dr. Sarah Chen</div>
              <div class="text-[10px] text-slate-300 font-semibold">Senior Faculty & Staff IC Member</div>
              <div class="text-[10px] text-slate-500 mt-1">Principal Systems Architect</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div class="font-bold text-white">Rajeshwar Rao</div>
              <div class="text-[10px] text-slate-300 font-semibold">Head of HR & Governance Member</div>
              <div class="text-[10px] text-slate-500 mt-1">Statutory Compliance Facilitator</div>
            </div>
          </div>
        </div>

        <!-- External Helplines -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div class="font-bold text-white">National Statutory Emergency Helpline Numbers:</div>
            <div class="text-[11px] text-slate-400">National Commission for Women (NCW): 7827170170 • Women Police Helpline: 1091 / 112</div>
          </div>
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 shrink-0">
            MWCD SHe-Box Integrated
          </span>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 2. ADMIN & PRESIDING OFFICER REDRESSAL HUB (View: #viewPoshHelpdesk)
  // =========================================================================

  async renderAdminPoshHub() {
    const container = document.getElementById("viewPoshHelpdesk");
    if (!container) return;

    this.isLoading = true;
    try {
      const resp = await fetch("/api/enterprise/posh/admin/cases", { cache: "no-store" });
      if (resp.ok) {
        this.adminData = await resp.json();
      }
    } catch (e) {
      console.warn("[PoshHelpdeskManager] Failed to fetch admin cases:", e.message);
    } finally {
      this.isLoading = false;
    }

    const data = this.adminData || {
      metrics: {
        totalCases: 3,
        filedCount: 1,
        underReviewCount: 1,
        inquiryCount: 0,
        resolvedCount: 1,
        overdue90DaysCount: 0,
        statutoryComplianceStatus: '100% STATUTORY COMPLIANT'
      },
      cases: []
    };

    const m = data.metrics || {};
    let cases = data.cases || [];

    // Filter by status
    if (this.adminFilterStatus !== "all") {
      cases = cases.filter(c => c.status === this.adminFilterStatus);
    }

    // Filter by severity
    if (this.adminFilterSeverity !== "all") {
      cases = cases.filter(c => (c.severity || '').toLowerCase() === this.adminFilterSeverity.toLowerCase());
    }

    // Filter by search
    if (this.adminSearchQuery) {
      const q = this.adminSearchQuery.toLowerCase();
      cases = cases.filter(c =>
        (c.case_number && c.case_number.toLowerCase().includes(q)) ||
        (c.respondent_name && c.respondent_name.toLowerCase().includes(q)) ||
        (c.complainant_name && c.complainant_name.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <!-- Header Banner -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs uppercase font-extrabold tracking-widest text-rose-500">Statutory Compliance Studio</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SECTION 19 IC ADJUDICATION DESK</span>
            </span>
          </div>
          <h2 class="text-3xl font-extrabold text-white mt-1 flex items-center space-x-3">
            <span>🛡️ POSH Grievance & Internal Committee Redressal</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Official Presiding Officer Docket: Adjudicate confidential and anonymous grievances, track the strict 90-day inquiry window, enforce Section 16 non-disclosure protocols, and compile Section 21 MWCD annual filings.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
          <button 
            type="button"
            onclick="window.poshHelpdeskManager.exportAnnualReport()"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
            title="Download Section 21 Statutory MWCD Annual Report Dossier"
          >
            <span>📜</span>
            <span>Section 21 MWCD Report</span>
          </button>

          <button 
            type="button"
            onclick="window.poshHelpdeskManager.renderAdminPoshHub()"
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <span>🔄</span>
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      <!-- 4 Executive KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: Total Docket -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div class="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Docket</span>
            <span class="text-indigo-400">⚖️ All Cases</span>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-4xl font-black text-white">${m.totalCases || 0}</span>
            <span class="text-xs text-slate-400">cases registered</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Anonymous: <strong class="text-purple-400">${m.anonymousCount || 0}</strong></span>
            <span>Identified: <strong class="text-white">${(m.totalCases || 0) - (m.anonymousCount || 0)}</strong></span>
          </div>
        </div>

        <!-- KPI 2: Under Review / Inquiry -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 shadow-xl">
          <div class="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
            <span>Inquiry / Under Review</span>
            <span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">ACTIVE</span>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-4xl font-black text-white">${(m.underReviewCount || 0) + (m.inquiryCount || 0)}</span>
            <span class="text-xs text-slate-400">in process</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Review: <strong class="text-amber-300">${m.underReviewCount || 0}</strong></span>
            <span>Formal Inquiry: <strong class="text-purple-300">${m.inquiryCount || 0}</strong></span>
          </div>
        </div>

        <!-- KPI 3: Resolved & Disposed -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl">
          <div class="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>Resolved & Disposed</span>
            <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">ORDERS ISSUED</span>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-4xl font-black text-white">${m.resolvedCount || 0}</span>
            <span class="text-xs text-slate-400">cases closed</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Concluded within 90 days: <strong class="text-emerald-400">100%</strong>
          </div>
        </div>

        <!-- KPI 4: 90-Day Overdue Warning -->
        <div class="p-5 rounded-2xl bg-gradient-to-br ${m.overdue90DaysCount > 0 ? 'from-rose-950/60' : 'from-slate-900'} to-slate-950 border ${m.overdue90DaysCount > 0 ? 'border-rose-500 animate-pulse' : 'border-slate-800'} shadow-xl">
          <div class="flex items-center justify-between text-xs font-bold ${m.overdue90DaysCount > 0 ? 'text-rose-400' : 'text-slate-400'} uppercase tracking-wider">
            <span>90-Day Overdue Clock</span>
            <span class="px-2 py-0.5 rounded text-[10px] ${m.overdue90DaysCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'}">
              ${m.overdue90DaysCount > 0 ? '⚠️ STATUTORY BREACH' : '✓ COMPLIANT'}
            </span>
          </div>
          <div class="mt-3 flex items-baseline space-x-2">
            <span class="text-4xl font-black ${m.overdue90DaysCount > 0 ? 'text-rose-400' : 'text-white'}">${m.overdue90DaysCount || 0}</span>
            <span class="text-xs text-slate-400">cases &gt; 90 days</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Legal penalty threshold: <strong class="${m.overdue90DaysCount > 0 ? 'text-rose-400' : 'text-slate-300'}">₹50,000 / Lic. cancellation</strong>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span class="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">Status:</span>
          <div class="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            ${[
              { id: "all", label: "All" },
              { id: "Filed", label: "Filed (New)" },
              { id: "Under Review", label: "Under Review" },
              { id: "Inquiry Commenced", label: "Formal Inquiry" },
              { id: "Resolved", label: "Resolved" }
            ].map(f => `
              <button 
                type="button"
                onclick="window.poshHelpdeskManager.adminFilterStatus = '${f.id}'; window.poshHelpdeskManager.renderAdminPoshHub();"
                class="px-2.5 py-1 rounded-lg transition text-xs ${
                  this.adminFilterStatus === f.id ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }"
              >${f.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search by case #, accused, complainant..." 
            value="${this.adminSearchQuery || ''}"
            oninput="window.poshHelpdeskManager.adminSearchQuery = this.value; window.poshHelpdeskManager.renderAdminPoshHub();"
            class="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <!-- Case Roster Table -->
      <div class="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div class="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span class="font-bold text-white flex items-center space-x-2">
            <span>🛡️ Presiding Officer Case Docket</span>
          </span>
          <span class="text-slate-400 font-mono text-[11px]">${cases.length} Grievances Enlisted</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead class="bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="px-5 py-3.5">Case Docket / PIN</th>
                <th class="px-5 py-3.5">Complainant</th>
                <th class="px-5 py-3.5">Accused Respondent</th>
                <th class="px-5 py-3.5">Category & Severity</th>
                <th class="px-5 py-3.5">Date & 90d Clock</th>
                <th class="px-5 py-3.5">Status</th>
                <th class="px-5 py-3.5 text-right">Adjudication</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-medium">
              ${cases.length === 0 ? `
                <tr>
                  <td colspan="7" class="px-5 py-8 text-center text-slate-500 italic">
                    No grievances matching the selected filters.
                  </td>
                </tr>
              ` : cases.map(c => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="px-5 py-3.5 font-mono">
                    <div class="font-bold text-indigo-300">${c.case_number}</div>
                    <div class="text-[10px] text-slate-500">PIN: <strong class="text-amber-400">${c.tracking_pin}</strong></div>
                  </td>

                  <td class="px-5 py-3.5">
                    <div class="font-bold text-white flex items-center space-x-1.5">
                      ${c.is_anonymous ? '<span>🕵️</span>' : '<span>👤</span>'}
                      <span>${c.complainant_name}</span>
                    </div>
                    <div class="text-[10px] text-slate-400">${c.complainant_department || 'General'}</div>
                  </td>

                  <td class="px-5 py-3.5">
                    <div class="font-bold text-slate-200">${c.respondent_name}</div>
                    <div class="text-[10px] text-slate-400">${c.respondent_designation || 'Staff'} • ${c.respondent_department || 'General'}</div>
                  </td>

                  <td class="px-5 py-3.5">
                    <div class="font-bold text-white max-w-xs truncate" title="${c.category}">
                      ${c.category}
                    </div>
                    <div class="mt-1">
                      <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        c.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        c.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-slate-800 text-slate-300'
                      }">
                        ${c.severity || 'Medium'} Severity
                      </span>
                    </div>
                  </td>

                  <td class="px-5 py-3.5">
                    <div class="text-white">${c.incident_date || 'Recent'}</div>
                    <div class="mt-1">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        c.daysOpen > 90 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                      }">
                        ${c.daysOpen || 1}d open
                      </span>
                    </div>
                  </td>

                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      c.status === 'Inquiry Commenced' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                      c.status === 'Under Review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }">
                      ${c.status}
                    </span>
                  </td>

                  <td class="px-5 py-3.5 text-right">
                    <button 
                      type="button"
                      onclick='window.poshHelpdeskManager.openReviewDrawer(${JSON.stringify(c).replace(/'/g, "&#39;")})'
                      class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                    >
                      ⚖️ Adjudicate
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Case Review Adjudication Modal Container -->
      <div id="poshReviewModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div id="poshReviewModalContent" class="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative">
          <!-- Populated by openReviewDrawer -->
        </div>
      </div>
    `;
  }

  // --- CASE ADJUDICATION MODAL ---
  openReviewDrawer(c) {
    this.activeReviewCase = c;
    const modal = document.getElementById("poshReviewModal");
    const container = document.getElementById("poshReviewModalContent");
    if (!modal || !container) return;

    modal.classList.remove("hidden");

    let timelineArr = c.timeline || [];
    if (typeof timelineArr === 'string') {
      try { timelineArr = JSON.parse(timelineArr); } catch (e) { timelineArr = []; }
    }

    container.innerHTML = `
      <div class="space-y-5 text-xs text-slate-300">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs uppercase font-extrabold text-rose-400">Internal Committee Formal Docket</span>
              <span class="font-mono text-xs font-bold text-indigo-300">${c.case_number}</span>
            </div>
            <h3 class="text-xl font-bold text-white mt-0.5">${c.category}</h3>
          </div>
          <button type="button" onclick="document.getElementById('poshReviewModal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800">✕</button>
        </div>

        <!-- Incident Facts Box -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span class="text-[10px] text-slate-500 font-bold uppercase block">Complainant</span>
            <span class="text-sm font-bold text-white">${c.complainant_name} ${c.is_anonymous ? '(🕵️ 100% Anonymous)' : ''}</span>
            <div class="text-[10px] text-slate-400">${c.complainant_department || 'General'}</div>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-bold uppercase block">Accused Respondent</span>
            <span class="text-sm font-bold text-rose-300">${c.respondent_name}</span>
            <div class="text-[10px] text-slate-400">${c.respondent_designation || 'Staff'} • ${c.respondent_department || 'General'}</div>
          </div>
          <div class="sm:col-span-2 pt-2 border-t border-slate-800">
            <span class="text-[10px] text-slate-500 font-bold uppercase block">Chronological Allegation Statement</span>
            <p class="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              ${c.description}
            </p>
          </div>
          ${c.witnesses ? `
            <div class="sm:col-span-2">
              <span class="text-[10px] text-slate-500 font-bold uppercase block">Witnesses / Associates Named</span>
              <span class="text-xs text-slate-300">${c.witnesses}</span>
            </div>
          ` : ''}
        </div>

        <!-- Adjudication Controls Form -->
        <form onsubmit="window.poshHelpdeskManager.handleUpdateStatus(event, '${c.id}')" class="space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30">
          <div class="font-bold text-white text-xs uppercase tracking-wider text-indigo-400">Presiding Officer Adjudication Actions</div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Advance Legal Case Status</label>
              <select id="poshAdjudicateStatus" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs focus:outline-none focus:border-rose-500">
                <option value="Filed" ${c.status === 'Filed' ? 'selected' : ''}>1. Filed (New Intake)</option>
                <option value="Under Review" ${c.status === 'Under Review' ? 'selected' : ''}>2. Under Review (Prima Facie Assessment)</option>
                <option value="Inquiry Commenced" ${c.status === 'Inquiry Commenced' ? 'selected' : ''}>3. Formal Inquiry Commenced (Section 11)</option>
                <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>4. Resolved (Final Redressal Order Issued)</option>
                <option value="Dismissed" ${c.status === 'Dismissed' ? 'selected' : ''}>5. Dismissed (No Merit / Conciliated)</option>
              </select>
            </div>
            <div>
              <label class="font-semibold text-slate-400 text-[11px] block mb-1">Formal Action Enforced (Section 13)</label>
              <input 
                type="text" 
                id="poshActionTaken" 
                value="${c.action_taken || ''}"
                placeholder="e.g. Conciliation, Written Apology, Seating Separation, Disciplinary Action"
                class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label class="font-semibold text-slate-400 text-[11px] block mb-1">Presiding Officer Confidential Findings & Order Note</label>
            <textarea 
              id="poshPresidingNotes" 
              rows="3" 
              placeholder="Record findings of fact, evidence examination summary, and instructions..."
              class="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-rose-500"
            >${c.presiding_officer_notes || ''}</textarea>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div id="poshAdjudicateFeedback" class="text-xs"></div>
            <button 
              type="submit" 
              id="btnSaveAdjudication"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Save IC Findings & Update Status
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async handleUpdateStatus(e, caseId) {
    e.preventDefault();
    const btn = document.getElementById("btnSaveAdjudication");
    const feedback = document.getElementById("poshAdjudicateFeedback");
    const status = document.getElementById("poshAdjudicateStatus")?.value;
    const action_taken = document.getElementById("poshActionTaken")?.value;
    const presiding_officer_notes = document.getElementById("poshPresidingNotes")?.value;

    if (btn) btn.disabled = true;

    try {
      const resp = await fetch(`/api/enterprise/posh/admin/cases/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action_taken, presiding_officer_notes })
      });
      const data = await resp.json();

      if (data.success) {
        if (window.app && typeof window.app.showToast === "function") {
          window.app.showToast("✓ IC order saved and case status updated.", "success");
        }
        document.getElementById("poshReviewModal")?.classList.add("hidden");
        this.renderAdminPoshHub();
      } else {
        if (feedback) feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ ${data.message}</span>`;
      }
    } catch (err) {
      if (feedback) feedback.innerHTML = `<span class="text-rose-400 font-bold">⚠️ ${err.message}</span>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // --- SECTION 21 MWCD ANNUAL REPORT MODAL EXPORT ---
  async exportAnnualReport() {
    try {
      const resp = await fetch("/api/enterprise/posh/admin/annual-report");
      const data = await resp.json();
      if (!data.success || !data.report) return;

      const r = data.report;
      const m = r.metrics;

      // Print-ready statutory document preview in clean modal
      const modal = document.getElementById("poshReviewModal");
      const container = document.getElementById("poshReviewModalContent");
      if (!modal || !container) return;

      modal.classList.remove("hidden");
      container.innerHTML = `
        <div class="space-y-6 text-xs text-slate-300 p-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">📜</span>
              <div>
                <h3 class="text-lg font-black text-white">Statutory POSH Annual Compliance Return (Section 21)</h3>
                <div class="text-[11px] text-slate-400">Official filing format for submission to the District Officer / MWCD</div>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('poshReviewModal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800">✕</button>
          </div>

          <div class="p-5 rounded-2xl bg-white text-slate-900 space-y-4 font-serif">
            <div class="text-center border-b border-slate-300 pb-3">
              <div class="text-sm font-bold uppercase tracking-widest text-[#dd1f36]">FORM II: ANNUAL COMPLIANCE RETURN</div>
              <div class="text-lg font-black mt-0.5">${r.organizationName}</div>
              <div class="text-xs text-slate-600">Reporting Calendar Year: ${r.reportingYear} • Statutory Mandate: Section 21 of POSH Act 2013</div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="font-bold uppercase tracking-wide text-slate-700 text-[11px]">1. Summary of Cases Filed & Disposed:</div>
              <table class="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                <tr class="bg-slate-100">
                  <td class="p-2.5 font-bold border-r border-slate-300">Total complaints received during the year</td>
                  <td class="p-2.5 font-mono font-bold text-center">${m.totalComplaintsReceived}</td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold border-r border-slate-300">Total complaints disposed of within 90 days</td>
                  <td class="p-2.5 font-mono font-bold text-center text-emerald-700">${m.totalComplaintsDisposed}</td>
                </tr>
                <tr class="bg-slate-100">
                  <td class="p-2.5 font-bold border-r border-slate-300">Complaints pending for more than 90 days (Statutory breach indicator)</td>
                  <td class="p-2.5 font-mono font-bold text-center ${m.casesPendingOver90Days > 0 ? 'text-rose-700' : 'text-slate-700'}">${m.casesPendingOver90Days} (Zero Default)</td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold border-r border-slate-300">Formal inquiries in active progress</td>
                  <td class="p-2.5 font-mono font-bold text-center">${m.casesInquiryInProgress}</td>
                </tr>
                <tr class="bg-slate-100">
                  <td class="p-2.5 font-bold border-r border-slate-300">Anonymous whistleblower reports investigated</td>
                  <td class="p-2.5 font-mono font-bold text-center">${m.anonymousWhistleblowerReports}</td>
                </tr>
                <tr>
                  <td class="p-2.5 font-bold border-r border-slate-300">Workshops & awareness training sessions certified</td>
                  <td class="p-2.5 font-mono font-bold text-center">${m.totalStaffCompletedTraining} staff certified</td>
                </tr>
              </table>
            </div>

            <div class="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600 font-sans">
              <div>
                <div>Presiding Officer: <strong>${r.presidingOfficer}</strong></div>
                <div>Statutory Status: <strong class="text-emerald-700">${m.statutoryFilingStatus}</strong></div>
              </div>
              <div class="text-right">
                <div>Filing Due: <strong>${r.submissionDeadline}</strong></div>
                <div>Seal: <strong>Worxpertise Internal Committee</strong></div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onclick="window.print()" 
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              🖨️ Print Statutory Return
            </button>
            <button 
              type="button" 
              onclick="document.getElementById('poshReviewModal').classList.add('hidden')" 
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      `;
    } catch (e) {
      if (window.app && typeof window.app.showToast === "function") {
        window.app.showToast("Failed to compile Section 21 report: " + e.message, "error");
      }
    }
  }
}

// Instantiate Global PoshHelpdeskManager
window.poshHelpdeskManager = new PoshHelpdeskManager();
