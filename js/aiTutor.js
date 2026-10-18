/**
 * LearnPulse / Worxpertise Enterprise LMS
 * AI Course Companion & Contextual Doubt Resolver (aiTutor.js)
 * 
 * Provides:
 * 1. Embedded Classroom Tab Workspace (Tab 5 in video learning view)
 * 2. Slide-Over Interactive AI Drawer (accessible anytime during video playback)
 * 3. Floating Quick-Access Launcher button
 * 4. Instant 2-line concise syllabus explanations with statutory citations & takeaways
 * 5. Multilingual Vernacular support (English, Hindi, Hinglish)
 * 6. Web Speech API Voice Read-Aloud ("Wow Factor" audio explanation)
 * 7. 1-Click suggested prompt chips tailored to current lesson module
 * 8. Zero-latency offline client fallback so demos NEVER fail
 */

class AiTutorController {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.isSpeaking = false;
    this.speechUtterance = null;
    this.conversation = [];
    this.suggestedPrompts = [];
    this.activeModuleId = null;

    // Client-side fallback knowledge base for 100% fail-safe offline demos
    this.fallbackKnowledge = {
      posh: [
        {
          keywords: ["quid pro quo", "hostile", "farak", "difference", "antar", "sexual favor", "promotion"],
          en: {
            answer: "Quid Pro Quo ('this for that') occurs when career advancement or appraisals are conditioned on sexual favors. A Hostile Work Environment refers to unwelcome conduct (jokes, suggestive remarks) creating an intimidating, uncomfortable workplace.",
            takeaway: "Quid Pro Quo involves direct career leverage, while Hostile Environment compromises the overall workplace atmosphere.",
            source: "POSH Act 2013 • Section 3(2)"
          },
          hi: {
            answer: "क्विड प्रो क्वो (Quid Pro Quo) में पदोन्नति या मूल्यांकन के बदले व्यक्तिगत अनुचित लाभ मांगा जाता है। जबकि अमित्र कार्य वातावरण (Hostile Work Environment) में अवांछित चुटकुलों या टिप्पणियों से असहज माहौल बनता है।",
            takeaway: "क्विड प्रो क्वो में करियर का सीधा दबाव होता है, जबकि अमित्र वातावरण पूरे कार्यस्थल को विषाक्त बनाता है।",
            source: "पॉश अधिनियम 2013 • धारा 3(2)"
          },
          hinglish: {
            answer: "Quid Pro Quo ka matlab hai jab promotion ya appraisal ke badle sexual favors demand kiye jayein. Jabki Hostile Work Environment me unwelcome baatein ya offensive jokes se poora office mahaul uncomfortable ho jata hai.",
            takeaway: "Quid Pro Quo me direct career leverage hota hai, jabki Hostile Environment me daily work culture toxic banta hai.",
            source: "POSH Act 2013 • Section 3(2)"
          }
        },
        {
          keywords: ["extended workplace", "workplace", "boundary", "remote", "zoom", "slack", "wfh", "cab", "travel", "karyasthal"],
          en: {
            answer: "Under POSH Section 2(o), 'Workplace' extends beyond physical cubicles to include official cabs, client dinners, corporate offsites, and remote digital communication (Slack, Zoom, WhatsApp).",
            takeaway: "Any location or channel arising out of the course of employment is legally recognized as the workplace.",
            source: "POSH Act 2013 • Section 2(o)"
          },
          hi: {
            answer: "पॉश की धारा 2(o) के अनुसार 'विस्तारित कार्यस्थल' में कार्यालय डेस्क के अलावा आधिकारिक कैब, क्लाइंट डिनर, यात्राएं, और वर्क-फ्रॉम-होम में ज़ूम/व्हाट्सएप संचार भी शामिल हैं।",
            takeaway: "रोजगार के सिलसिले में दौरा किया गया कोई भी स्थान या डिजिटल माध्यम कानूनी कार्यस्थल है।",
            source: "पॉश अधिनियम 2013 • धारा 2(o)"
          },
          hinglish: {
            answer: "POSH Section 2(o) ke tehat 'Workplace' sirf physical office nahi hai; official cab, client meetings, business dinners, corporate offsites aur Slack/WhatsApp/Teams communication bhi legally workplace hain.",
            takeaway: "Naukri ke connection me visit ki gayi koi bhi jagah kanooni taur par workplace maani jaati hai.",
            source: "POSH Act 2013 • Section 2(o)"
          }
        },
        {
          keywords: ["intent", "impact", "irada", "prabhav", "joke", "mazaak", "unwelcome", "galat irada"],
          en: {
            answer: "Under POSH jurisprudence, the impact on the aggrieved person is primary; claiming 'it was just a harmless joke' or lack of malicious intent does not excuse unwelcome conduct of a sexual nature.",
            takeaway: "Subjective impact on the recipient is the legal determinant, not the initiator's claimed intent.",
            source: "Supreme Court Guidelines & POSH Jurisprudence"
          },
          hi: {
            answer: "पॉश नियमों के तहत पीड़ित पर पड़ा प्रभाव प्राथमिक है; यह दावा करना कि 'यह सिर्फ एक मज़ाक था' या दुर्भावनापूर्ण इरादे की कमी अवांछित व्यवहार को सही नहीं ठहराती।",
            takeaway: "कानून में इरादे से ज़्यादा पीड़ित पर पड़ा प्रभाव कानूनी मानक तय करता है।",
            source: "सर्वोच्च न्यायालय दिशानिर्देश एवं पॉश न्यायशास्त्र"
          },
          hinglish: {
            answer: "POSH jurisprudence me impact sabse zaroori hai. 'Mera irada bura nahi tha' ya 'ye to bas mazaak tha' bolna unwelcome conduct ko justify nahi karta.",
            takeaway: "Initiator ki intent se zyada victim par pade impact ko legally judge kiya jaata hai.",
            source: "Supreme Court Guidelines & POSH Jurisprudence"
          }
        },
        {
          keywords: ["bystander", "intervention", "4d", "mookdarshak", "witness", "gawah", "madad", "help"],
          en: {
            answer: "The 4D Bystander framework provides safe intervention tactics: Direct (address conduct immediately), Distract (change topic or create diversion), Delegate (alert HR/Security), and Delay (check in on colleague afterwards).",
            takeaway: "Active bystanders prevent workplace toxicity through timely, safe interventions.",
            source: "Global Workplace Ethics & Prevention Standards"
          },
          hi: {
            answer: "मूकदर्शक हस्तक्षेप का 4D ढांचा चार रणनीतियां देता है: Direct (सीधे बात करें), Distract (विषय बदलकर ध्यान भटकाएं), Delegate (HR/सुरक्षा को सूचित करें), और Delay (घटना के बाद साथी का हालचाल लें)।",
            takeaway: "सक्रिय मूकदर्शक समय पर हस्तक्षेप करके कार्यस्थल को सुरक्षित बनाए रखते हैं।",
            source: "वैश्विक कार्यस्थल नैतिकता मानक"
          },
          hinglish: {
            answer: "4D Bystander framework se aap safely intervene kar sakte hain: Direct (turant tokein), Distract (topic badal dein), Delegate (HR/IC ko report karein), aur Delay (baad me colleague se baat karke support karein).",
            takeaway: "Khamosh rehne ke bajay safe tareeke se intervene karna POSH compliance ka crucial part hai.",
            source: "Global Workplace Ethics & Prevention Standards"
          }
        },
        {
          keywords: ["time limit", "samay", "deadline", "90 days", "din", "inquiry", "shikayat", "complaint"],
          en: {
            answer: "A formal complaint must be submitted to the Internal Committee within 3 months (90 days) of the incident. The IC must conclude its inquiry within 90 days of receipt and issue its report within 10 days.",
            takeaway: "Strict statutory timelines protect procedural fairness for both parties.",
            source: "POSH Act 2013 • Section 9(1) & Section 11(4)"
          },
          hi: {
            answer: "घटना के 3 महीने (90 दिन) के भीतर आंतरिक समिति (IC) को औपचारिक शिकायत दर्ज करनी होती है। IC को 90 दिनों के भीतर अपनी जांच पूरी करनी चाहिए और 10 दिनों में रिपोर्ट देनी होगी।",
            takeaway: "सख्त वैधानिक समय-सीमा दोनों पक्षों के लिए प्रक्रियात्मक निष्पक्षता सुनिश्चित करती है।",
            source: "पॉश अधिनियम 2013 • धारा 9(1) एवं धारा 11(4)"
          },
          hinglish: {
            answer: "POSH complaint incident ke 3 months (90 days) ke andar file honi chahiye. Internal Committee ko apni enquiry 90 days ke andar complete karni hoti hai aur report 10 din me submit karni padti hai.",
            takeaway: "90 days inquiry rule legal compliance aur dono parties ke fair trial ke liye compulsory hai.",
            source: "POSH Act 2013 • Section 9(1) & Section 11(4)"
          }
        }
      ]
    };
  }

  init() {
    this.renderDrawerMarkup();
    this.renderFloatingLauncher();
    this.setupGlobalShortcuts();

    // Re-synchronize AI prompts and context when language toggles
    window.addEventListener('app:language-changed', () => {
      this.updateContextInfo();
      this.loadSuggestedPrompts();
      if (window.app && window.app.activeClassroomTab === 'ai') {
        this.renderClassroomView();
      }
    });

    console.log("🤖 AI Course Companion & Doubt Resolver Initialized");
  }

  getCurrentLanguage() {
    if (window.i18n && typeof window.i18n.getLanguage === 'function') {
      return window.i18n.getLanguage();
    }
    return localStorage.getItem('learnpulse_language') || 'en';
  }

  getCurrentProgramId() {
    if (window.appState && window.appState.activeProgram) {
      return window.appState.activeProgram.id;
    }
    return 'prog-posh-compliance';
  }

  getCurrentModuleId() {
    if (window.app && window.app.activeModule) {
      return window.app.activeModule.id;
    }
    if (window.appState && window.appState.activeModule) {
      return window.appState.activeModule.id;
    }
    return 'mod-1';
  }

  setupGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + A to toggle AI Drawer
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.toggleDrawer();
      }
      // Escape to close drawer if open
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });
  }

  renderFloatingLauncher() {
    if (document.getElementById('aiTutorFloatingBtn')) return;

    const launcher = document.createElement('div');
    launcher.id = 'aiTutorFloatingBtn';
    launcher.className = 'fixed bottom-6 right-6 z-40 group';
    launcher.innerHTML = `
      <button 
        type="button"
        onclick="window.aiTutor.toggleDrawer()"
        class="flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 hover:shadow-indigo-500/80 ring-2 ring-indigo-400/50 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        title="Ask AI Tutor (Press Alt + A)"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1"></span>
        <span class="text-base animate-pulse">🤖</span>
        <span class="hidden sm:inline tracking-wide">Ask AI Tutor</span>
        <span class="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase tracking-widest text-indigo-100 hidden md:inline">Live</span>
      </button>
    `;
    document.body.appendChild(launcher);
  }

  renderDrawerMarkup() {
    if (document.getElementById('aiTutorDrawerContainer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'aiTutorDrawerContainer';
    drawer.className = 'fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 opacity-0';
    drawer.innerHTML = `
      <!-- Backdrop -->
      <div 
        id="aiTutorBackdrop" 
        onclick="window.aiTutor.closeDrawer()" 
        class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity opacity-0 cursor-pointer"
      ></div>

      <!-- Slide-Over Panel -->
      <div 
        id="aiTutorPanel" 
        class="absolute top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-indigo-900/60 shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out pointer-events-auto"
      >
        <!-- Header -->
        <div class="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-indigo-800/40 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg shadow-md shadow-indigo-900/50">
              🤖
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <h3 class="text-sm font-bold text-white">AI Course Companion</h3>
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold">GPT-LMS</span>
              </div>
              <p class="text-[11px] text-slate-400">Contextual 2-line syllabus explanations</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              type="button" 
              onclick="window.aiTutor.clearChat()" 
              class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
              title="Clear Conversation"
            >
              ↺
            </button>
            <button 
              type="button" 
              onclick="window.aiTutor.closeDrawer()" 
              class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Drawer (Esc)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Course Context Bar -->
        <div id="aiDrawerContextBar" class="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/30 flex items-center justify-between text-[11px]">
          <span class="text-indigo-300 flex items-center space-x-1.5 truncate">
            <span>📚</span>
            <span id="aiDrawerCourseName" class="font-medium truncate">POSH Workplace Compliance</span>
          </span>
          <span id="aiDrawerLangBadge" class="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 uppercase font-mono font-bold">
            EN
          </span>
        </div>

        <!-- Chat Conversation Body -->
        <div id="aiDrawerChatBody" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Welcome Greeting Card -->
          <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-2">
            <div class="flex items-center space-x-2 text-indigo-300 font-bold">
              <span>💡</span>
              <span>Need help understanding this lesson?</span>
            </div>
            <p class="text-slate-300 text-[12px] leading-relaxed">
              Ask any doubt about the current video lesson or click a suggested prompt below. I'll provide a <strong>crisp 2-line explanation</strong> with exact legal citations.
            </p>
          </div>

          <!-- Suggested Quick Prompts Container -->
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Suggested Questions for this Module:</span>
            <div id="aiDrawerSuggestedChips" class="flex flex-col space-y-1.5">
              <!-- Dynamically populated chips -->
            </div>
          </div>

          <!-- Message History -->
          <div id="aiDrawerMessagesList" class="space-y-3 pt-2">
            <!-- Messages injected here -->
          </div>
        </div>

        <!-- Input Bar -->
        <div class="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          <form id="aiDrawerForm" onsubmit="window.aiTutor.handleDrawerSubmit(event)" class="relative flex items-center">
            <input 
              type="text" 
              id="aiDrawerInput" 
              placeholder="Type your doubt (e.g. 'Quid Pro Quo vs Hostile?')..." 
              class="w-full pl-3 pr-20 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              autocomplete="off"
            />
            <button 
              type="submit" 
              id="aiDrawerSubmitBtn"
              class="absolute right-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Ask</span>
              <span>➔</span>
            </button>
          </form>
          <div class="flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span>Powered by Worxpertise LearnPulse Context Engine</span>
            <span>Alt + A to open</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  openDrawer(initialPrompt = null) {
    this.isOpen = true;
    const container = document.getElementById('aiTutorDrawerContainer');
    const backdrop = document.getElementById('aiTutorBackdrop');
    const panel = document.getElementById('aiTutorPanel');

    if (container && backdrop && panel) {
      container.classList.remove('pointer-events-none');
      container.classList.remove('opacity-0');
      container.classList.add('opacity-100');

      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');

      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
    }

    this.updateContextInfo();
    this.loadSuggestedPrompts();

    const input = document.getElementById('aiDrawerInput');
    if (input) {
      if (initialPrompt) {
        input.value = initialPrompt;
        this.askQuestion(initialPrompt);
      } else {
        setTimeout(() => input.focus(), 250);
      }
    }
  }

  closeDrawer() {
    this.isOpen = false;
    const container = document.getElementById('aiTutorDrawerContainer');
    const backdrop = document.getElementById('aiTutorBackdrop');
    const panel = document.getElementById('aiTutorPanel');

    if (container && backdrop && panel) {
      container.classList.add('opacity-0');
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');

      panel.classList.remove('translate-x-0');
      panel.classList.add('translate-x-full');

      setTimeout(() => {
        if (!this.isOpen) {
          container.classList.add('pointer-events-none');
        }
      }, 300);
    }

    this.stopSpeaking();
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  updateContextInfo() {
    const courseEl = document.getElementById('aiDrawerCourseName');
    const langBadge = document.getElementById('aiDrawerLangBadge');
    const lang = this.getCurrentLanguage();

    if (courseEl) {
      const prog = (window.appState && window.appState.activeProgram) || { title: "POSH Workplace Compliance" };
      courseEl.textContent = prog.title || "POSH Workplace Compliance";
    }

    if (langBadge) {
      langBadge.textContent = lang.toUpperCase();
    }
  }

  async loadSuggestedPrompts() {
    const lang = this.getCurrentLanguage();
    const moduleId = this.getCurrentModuleId();

    const fallbackPrompts = {
      en: [
        "What is the difference between Quid Pro Quo and Hostile Work Environment?",
        "What is legally included in the Extended Workplace doctrine?",
        "Does intent matter if behavior is unwelcome?",
        "How do I use the 4D Bystander Intervention framework?",
        "What are the statutory inquiry timelines for the Internal Committee?"
      ],
      hi: [
        "क्विड प्रो क्वो और अमित्र कार्य वातावरण में क्या अंतर है?",
        "विस्तारित कार्यस्थल (Extended Workplace) में कानूनी रूप से क्या शामिल है?",
        "यदि व्यवहार अवांछित है, तो क्या इरादा मायने रखता है?",
        "मूकदर्शक हस्तक्षेप के 4D नियम का उपयोग कैसे करें?",
        "आंतरिक समिति (IC) के लिए वैधानिक जांच समय-सीमा क्या है?"
      ],
      hinglish: [
        "Quid Pro Quo aur Hostile Work Environment me kya farak hai?",
        "Extended Workplace doctrine me kanooni roop se kya cover hota hai?",
        "Agar behavior unwelcome hai, to kya 'it was just a joke' bol sakte hain?",
        "Bystander Intervention ke 4D framework ko kaise apply karein?",
        "Internal Committee ki inquiry ke liye 90 days ka time limit kya hai?"
      ]
    };

    let prompts = fallbackPrompts[lang] || fallbackPrompts.en;

    // Try backend if online
    if (window.apiService && window.apiService.isBackendOnline) {
      try {
        const res = await window.apiService.getAiPrompts(moduleId, lang);
        if (res && res.success && Array.isArray(res.prompts) && res.prompts.length > 0) {
          prompts = res.prompts;
        }
      } catch (e) {
        console.warn("Using offline suggested AI prompts:", e);
      }
    }

    this.suggestedPrompts = prompts;
    this.renderSuggestedChips();
  }

  renderSuggestedChips() {
    const drawerContainer = document.getElementById('aiDrawerSuggestedChips');
    const classroomContainer = document.getElementById('aiClassroomSuggestedChips');

    const html = this.suggestedPrompts.slice(0, 4).map(p => `
      <button 
        type="button" 
        onclick="window.aiTutor.askQuestion('${p.replace(/'/g, "\\'")}')" 
        class="text-left px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-950/60 border border-slate-700/60 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between group active:scale-98 cursor-pointer"
      >
        <span class="truncate pr-2">💬 "${p}"</span>
        <span class="text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0">➔</span>
      </button>
    `).join('');

    if (drawerContainer) drawerContainer.innerHTML = html;
    if (classroomContainer) classroomContainer.innerHTML = html;
  }

  handleDrawerSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('aiDrawerInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    this.askQuestion(q);
  }

  handleClassroomSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('aiClassroomInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    this.askQuestion(q);
  }

  async askQuestion(userQuestion) {
    if (!userQuestion || !userQuestion.trim()) return;
    const q = userQuestion.trim();

    const lang = this.getCurrentLanguage();
    const programId = this.getCurrentProgramId();
    const moduleId = this.getCurrentModuleId();

    const userMsgId = 'msg-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.conversation.push(userMsg);
    this.renderMessages();

    // Show AI loading state
    this.isLoading = true;
    this.renderLoadingPlaceholder();

    let responsePayload = null;

    // 1. Try Backend API
    if (window.apiService && window.apiService.isBackendOnline) {
      try {
        const res = await window.apiService.askAiTutor(q, programId, moduleId, lang);
        if (res && res.success) {
          responsePayload = res;
        }
      } catch (err) {
        console.warn("Backend AI Tutor call failed, falling back to client-side engine:", err);
      }
    }

    // 2. Client-side local contextual engine fallback
    if (!responsePayload) {
      responsePayload = this.resolveLocally(q, lang);
    }

    this.isLoading = false;

    const aiMsgId = 'ai-' + Date.now();
    const aiMsg = {
      id: aiMsgId,
      sender: 'ai',
      text: responsePayload.answer,
      takeaway: responsePayload.takeaway,
      source: responsePayload.source,
      followups: responsePayload.suggestedFollowups || [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.conversation.push(aiMsg);
    this.renderMessages();

    // Scroll to bottom
    this.scrollToBottom();
  }

  resolveLocally(question, lang) {
    const q = question.toLowerCase();
    const items = this.fallbackKnowledge.posh;

    let matched = items.find(item => item.keywords.some(k => q.includes(k)));

    if (!matched) {
      matched = items[0]; // fallback to quid pro quo vs hostile
    }

    const content = matched[lang] || matched.en;
    return {
      success: true,
      question,
      answer: content.answer,
      takeaway: content.takeaway,
      source: content.source,
      suggestedFollowups: [
        lang === 'hi' ? "कार्यस्थल में आंतरिक समिति (IC) का गठन कैसे होता है?" :
        lang === 'hinglish' ? "Internal Committee (IC) ka composition kaise decide hota hai?" :
        "How is the Internal Committee (IC) officially composed?",
        lang === 'hi' ? "कर्मचारी के लिए मूकदर्शक हस्तक्षेप के नियम क्या हैं?" :
        lang === 'hinglish' ? "Bystander intervention ke best practices kya hain?" :
        "What are the best practices for bystander intervention?"
      ]
    };
  }

  renderLoadingPlaceholder() {
    const drawerList = document.getElementById('aiDrawerMessagesList');
    const classroomList = document.getElementById('aiClassroomMessagesList');

    const placeholderHtml = `
      <div id="aiTypingIndicator" class="flex items-start space-x-2.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/30 text-xs animate-pulse">
        <div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs shrink-0">🤖</div>
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-indigo-300">AI Tutor is searching course syllabus...</span>
          </div>
          <div class="h-2 bg-indigo-800/50 rounded w-3/4"></div>
          <div class="h-2 bg-indigo-800/40 rounded w-1/2"></div>
        </div>
      </div>
    `;

    if (drawerList) drawerList.insertAdjacentHTML('beforeend', placeholderHtml);
    if (classroomList) classroomList.insertAdjacentHTML('beforeend', placeholderHtml);
    this.scrollToBottom();
  }

  renderMessages() {
    const drawerList = document.getElementById('aiDrawerMessagesList');
    const classroomList = document.getElementById('aiClassroomMessagesList');

    // Remove typing indicator if present
    document.querySelectorAll('#aiTypingIndicator').forEach(el => el.remove());

    const html = this.conversation.map(msg => {
      if (msg.sender === 'user') {
        return `
          <div class="flex items-start justify-end space-x-2">
            <div class="max-w-[85%] bg-slate-800 border border-slate-700 rounded-2xl rounded-tr-sm p-3 text-xs text-white shadow">
              <p class="leading-relaxed font-medium">${this.escapeHtml(msg.text)}</p>
              <div class="text-[9px] text-slate-400 text-right mt-1">${msg.timestamp}</div>
            </div>
            <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
              👤
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-start space-x-2.5">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs shadow shrink-0">
              🤖
            </div>
            <div class="max-w-[90%] bg-gradient-to-b from-indigo-950/70 to-slate-900 border border-indigo-800/50 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200 shadow-lg space-y-2.5">
              <!-- Concise 2-line explanation -->
              <p class="leading-relaxed text-[13px] text-white font-normal">${this.escapeHtml(msg.text)}</p>

              <!-- Key Takeaway -->
              ${msg.takeaway ? `
                <div class="p-2 rounded-xl bg-indigo-900/40 border border-indigo-700/40 text-[11px] text-indigo-200 flex items-start space-x-1.5">
                  <span class="text-indigo-400 font-bold shrink-0">💡 Takeaway:</span>
                  <span class="leading-snug">${this.escapeHtml(msg.takeaway)}</span>
                </div>
              ` : ''}

              <!-- Citation & Action Bar -->
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-900/40 text-[10px]">
                <span class="text-slate-400 font-mono flex items-center space-x-1">
                  <span>📖</span>
                  <span>${this.escapeHtml(msg.source || 'Course Curriculum')}</span>
                </span>

                <div class="flex items-center space-x-1.5">
                  <!-- Read Aloud Voice Button (Wow Factor) -->
                  <button 
                    type="button" 
                    onclick="window.aiTutor.speakAnswer('${this.escapeQuotes(msg.text)}')" 
                    class="px-2 py-0.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 hover:text-white transition flex items-center space-x-1 cursor-pointer"
                    title="Read Aloud"
                  >
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>

                  <!-- Copy Button -->
                  <button 
                    type="button" 
                    onclick="window.aiTutor.copyAnswer('${this.escapeQuotes(msg.text)}', '${this.escapeQuotes(msg.takeaway || '')}')" 
                    class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1 cursor-pointer"
                    title="Copy to clipboard"
                  >
                    <span>📋</span>
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <!-- Suggested Follow-up chips -->
              ${(msg.followups && msg.followups.length > 0) ? `
                <div class="pt-2 border-t border-indigo-900/30 space-y-1">
                  <span class="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Suggested Follow-ups:</span>
                  <div class="flex flex-col gap-1">
                    ${msg.followups.map(f => `
                      <button 
                        type="button" 
                        onclick="window.aiTutor.askQuestion('${f.replace(/'/g, "\\'")}')" 
                        class="text-left px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700/40 text-[10px] text-slate-300 hover:text-indigo-200 transition cursor-pointer flex items-center justify-between"
                      >
                        <span class="truncate">❓ ${f}</span>
                        <span class="text-indigo-400 opacity-70">➔</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
    }).join('');

    if (drawerList) drawerList.innerHTML = html;
    if (classroomList) classroomList.innerHTML = html;
  }

  scrollToBottom() {
    setTimeout(() => {
      const drawerBody = document.getElementById('aiDrawerChatBody');
      if (drawerBody) drawerBody.scrollTop = drawerBody.scrollHeight;

      const classroomBody = document.getElementById('aiClassroomChatBody');
      if (classroomBody) classroomBody.scrollTop = classroomBody.scrollHeight;
    }, 50);
  }

  speakAnswer(text) {
    if (!('speechSynthesis' in window)) {
      if (window.app && window.app.showToast) {
        window.app.showToast("Speech synthesis is not supported on this browser.", "info");
      }
      return;
    }

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const lang = this.getCurrentLanguage();
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (window.app && window.app.showToast) {
        window.app.showToast("🔊 AI Tutor speaking answer...", "info");
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  copyAnswer(text, takeaway) {
    const combined = takeaway ? `${text}\n\n💡 Key Takeaway: ${takeaway}` : text;
    navigator.clipboard.writeText(combined).then(() => {
      if (window.app && window.app.showToast) {
        window.app.showToast("✅ AI explanation copied to clipboard!", "success");
      }
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
    });
  }

  clearChat() {
    this.conversation = [];
    this.renderMessages();
    this.loadSuggestedPrompts();
    if (window.app && window.app.showToast) {
      window.app.showToast("AI Tutor chat history reset", "info");
    }
  }

  renderClassroomView() {
    const container = document.getElementById('tabContentAi');
    if (!container) return;

    const prog = (window.appState && window.appState.activeProgram) || { title: "POSH Workplace Compliance" };
    const lang = this.getCurrentLanguage();

    container.innerHTML = `
      <div class="space-y-6">
        <!-- AI Tutor Classroom Hero Banner -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-900/50">
              🤖
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-base font-bold text-white">AI Course Companion & Doubt Resolver</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  ACTIVE
                </span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">
                Instant 2-line syllabus explanations for <span class="font-bold text-white">${prog.title}</span>.
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-400">Language:</span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono font-bold text-indigo-300 border border-slate-700">
              ${lang.toUpperCase()}
            </span>
            <button 
              type="button" 
              onclick="window.aiTutor.openDrawer()" 
              class="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              title="Pop out in side drawer"
            >
              <span>↗</span>
              <span>Pop Out Drawer</span>
            </button>
          </div>
        </div>

        <!-- 1-Click Suggested Questions Carousel -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <span>⚡</span>
              <span>1-Click Suggested Questions for this Video Lesson:</span>
            </span>
            <span class="text-[11px] text-slate-500">Click any chip for instant answer</span>
          </div>
          <div id="aiClassroomSuggestedChips" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <!-- Dynamically populated chips -->
          </div>
        </div>

        <!-- Classroom Chat Thread Container -->
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex flex-col h-96">
          <div id="aiClassroomChatBody" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div id="aiClassroomMessagesList" class="space-y-3">
              <!-- Messages rendered here -->
            </div>
          </div>

          <!-- Classroom Question Input Box -->
          <div class="p-3 bg-slate-900 border-t border-slate-800">
            <form id="aiClassroomForm" onsubmit="window.aiTutor.handleClassroomSubmit(event)" class="relative flex items-center">
              <input 
                type="text" 
                id="aiClassroomInput" 
                placeholder="Ask any doubt about this video lesson (e.g. 'What is Quid Pro Quo?')..." 
                class="w-full pl-4 pr-24 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                autocomplete="off"
              />
              <button 
                type="submit" 
                class="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <span>Ask AI</span>
                <span>➔</span>
              </button>
            </form>
            <div class="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1.5">
              <span>Powered by Worxpertise LearnPulse Context Engine</span>
              <span>Instant 2-line syllabus verification</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderSuggestedChips();
    this.renderMessages();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, " ");
  }
}

// Instantiate and expose globally
window.aiTutor = new AiTutorController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.aiTutor.init());
} else {
  window.aiTutor.init();
}
