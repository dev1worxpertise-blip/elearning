/**
 * LearnPulse / Worxpertise Enterprise LMS
 * AI Course Companion & Contextual Doubt Resolver (aiTutor.js)
 * 
 * Multi-Course aware contextual explanations for:
 * 1. Academy Global Guide (When on Home / Catalog view - answers about all courses)
 * 2. Full-Stack Web Development (React, Node, DB)
 * 3. Artificial Intelligence & LLMs (Transformers, RAG, Embeddings)
 * 4. Enterprise Cybersecurity & Threat Defense (OWASP, Zero Trust)
 * 5. POSH Workplace Compliance (Strictly isolated to POSH program)
 * 6. Dynamic support for any new course added from backend
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

    // Multi-course client-side fallback knowledge base
    this.fallbackKnowledge = {
      // 0. Catalog / Home / General Academy Guide
      catalog: [
        {
          keywords: ["course", "programs", "available", "kaunse", "offer", "list", "kya hai", "options"],
          en: {
            answer: "Worxpertise Academy offers four accredited career tracks: Full-Stack Web Development, Artificial Intelligence & LLMs, Enterprise Cybersecurity, and Corporate Compliance (POSH).",
            takeaway: "All programs feature interactive video lessons, anti-skip verification gates, and verifiable corporate certifications.",
            source: "Worxpertise Academy • Enterprise Catalog Directory"
          },
          hi: {
            answer: "वर्क्सपर्टीज़ अकादमी में चार प्रमाणित करियर ट्रैक हैं: फुल-स्टैक वेब डेवलपमेंट, आर्टिफिशियल इंटेलिजेंस और LLMs, एंटरप्राइज साइबर सुरक्षा, और कॉर्पोरेट पॉश कम्प्लायंस।",
            takeaway: "सभी पाठ्यक्रमों में इंटरैक्टिव वीडियो, एंटी-स्किप गेटिंग और डिजिटल रूप से सत्यापित प्रमाणपत्र शामिल हैं।",
            source: "वर्क्सपर्टीज़ अकादमी • एंटरप्राइज कैटलॉग डायरेक्टरी"
          },
          hinglish: {
            answer: "Worxpertise Academy me 4 certified career programs hain: Full-Stack Web Development, Artificial Intelligence & LLMs, Enterprise Cybersecurity, aur Corporate Compliance (POSH).",
            takeaway: "Har program me video lessons, anti-skip verification, aur tamper-proof certificates milte hain.",
            source: "Worxpertise Academy • Enterprise Catalog Directory"
          }
        },
        {
          keywords: ["certificate", "pass", "benchmark", "score", "unlock", "pramanpatra", "validity"],
          en: {
            answer: "To earn an accredited certificate, watch 100% of the video modules to satisfy the anti-skip verification gate, then score 80% or higher on the proctored post-video assessment.",
            takeaway: "Digital certificates feature instant public verification with cryptographic serial hashes.",
            source: "Worxpertise Academy • Credentialing & Verification Policy"
          },
          hi: {
            answer: "प्रमाणपत्र प्राप्त करने के लिए वीडियो को 100% पूरा देखना अनिवार्य है, जिसके बाद मॉड्यूल परीक्षा में 80% या अधिक अंक प्राप्त करने पर डिजिटल सर्टिफिकेट तुरंत अनलॉक हो जाता है।",
            takeaway: "डिजिटल प्रमाणपत्रों को अद्वितीय सीरियल कोड और QR द्वारा सार्वजनिक रूप से सत्यापित किया जा सकता है।",
            source: "वर्क्सपर्टीज़ अकादमी • प्रमाणन नीति"
          },
          hinglish: {
            answer: "Certificate unlock karne ke liye 100% video attendance compulsory hai, jiske baad unlocked quiz me 80% ya usse zyada score karna hota hai.",
            takeaway: "Certificate me unique serial hash hota hai jise 'Verify Credential' portal par koi bhi check kar sakta hai.",
            source: "Worxpertise Academy • Credentialing Policy"
          }
        },
        {
          keywords: ["web dev", "fullstack", "react", "node", "coding", "web development"],
          en: {
            answer: "The Full-Stack Web Development program trains learners in modern React 18 component architecture, Node.js asynchronous backend services, PostgreSQL database schemas, and REST APIs.",
            takeaway: "Graduates are equipped to design and scale enterprise-grade web applications.",
            source: "Full-Stack Web Development Mastery • Curriculum Guide"
          },
          hi: {
            answer: "फुल-स्टैक वेब डेवलपमेंट कोर्स में React 18, Node.js बैकएंड, PostgreSQL रिलेशनल डेटाबेस और सुरक्षित RESTful API आर्किटेक्चर का संपूर्ण व्यावहारिक ज्ञान दिया जाता है।",
            takeaway: "यह कोर्स शिक्षार्थियों को आधुनिक उद्यम-स्तरीय वेब एप्लिकेशन बनाने के लिए तैयार करता है।",
            source: "फुल-स्टैक वेब डेवलपमेंट • पाठ्यक्रम गाइड"
          },
          hinglish: {
            answer: "Full-Stack Web Development program me React 18, Node.js backend runtime, PostgreSQL database design aur REST APIs sikhaye jaate hain.",
            takeaway: "Enterprise-grade web apps build aur deploy karne ke liye ye complete roadmap hai.",
            source: "Full-Stack Web Development Mastery • Curriculum Guide"
          }
        },
        {
          keywords: ["ai", "llm", "machine learning", "artificial intelligence", "rag"],
          en: {
            answer: "Mastering AI & LLMs covers Transformer self-attention architecture, Retrieval-Augmented Generation (RAG) with vector databases, embeddings, and prompt engineering guardrails.",
            takeaway: "Empowers engineers to build production-ready Generative AI systems.",
            source: "Mastering Artificial Intelligence & LLMs • Syllabus"
          },
          hi: {
            answer: "AI और LLM कोर्स में ट्रांसफॉर्मर आर्किटेक्चर, वेक्टर डेटाबेस के साथ RAG पाइपलाइन, एम्बेडिंग और जेनेरेटिव AI सिस्टम बनाना सिखाया जाता है।",
            takeaway: "इंजीनियरों को प्रोडक्शन-ग्रेड AI समाधान विकसित करने में सक्षम बनाता है।",
            source: "मास्टरिंग आर्टिफिशियल इंटेलिजेंस • पाठ्यक्रम"
          },
          hinglish: {
            answer: "AI & LLMs program me Transformers, Retrieval-Augmented Generation (RAG), Vector Embeddings aur Generative AI applications sikhaye jaate hain.",
            takeaway: "Production-ready Generative AI apps develop karne ke liye ye practical training hai.",
            source: "Mastering Artificial Intelligence & LLMs • Syllabus"
          }
        }
      ],

      // 1. Full-Stack Web Development
      fullstack: [
        {
          keywords: ["state", "props", "react", "farak", "difference", "antar"],
          en: {
            answer: "Props are read-only parameters passed down from parent to child components, whereas State is internal, mutable component memory managed via useState that triggers re-rendering on update.",
            takeaway: "Props flow downwards (unidirectional); state is private and managed locally inside the component.",
            source: "React 18 Architecture • State & Props"
          },
          hi: {
            answer: "Props पैरेंट घटक से चाइल्ड को भेजा जाने वाला केवल-पठनीय डेटा है, जबकि State घटक की अपनी आंतरिक मेमोरी है जो useState के जरिए बदलने पर UI को दोबारा रेंडर करती है।",
            takeaway: "Props बाहर से आते हैं; State घटक के अंदर निजी तौर पर प्रबंधित होती है।",
            source: "रिएक्ट 18 आर्किटेक्चर • स्टेट और प्रॉप्स प्रबंधन"
          },
          hinglish: {
            answer: "Props parent component se child ko pass hone wala read-only data hai, jabki State component ka apna internal data hota hai jo useState se update hone par UI ko re-render karta hai.",
            takeaway: "Props bahar se aate hain, state component ke andar manage hoti hai.",
            source: "React 18 Architecture • State Management"
          }
        },
        {
          keywords: ["useeffect", "lifecycle", "cleanup", "dependency", "mount"],
          en: {
            answer: "useEffect executes side effects (data fetching, subscriptions) after rendering. The dependency array controls when it re-runs, and a returned function handles cleanup on component unmount.",
            takeaway: "An empty array [] runs once on mount; omitting the array runs on every single render.",
            source: "React 18 Hooks Specifications • useEffect"
          },
          hi: {
            answer: "useEffect रेंडरिंग के बाद साइड इफेक्ट्स (API कॉल, इवेंट लिसनर) निष्पादित करता है। निर्भरता ऐरे तय करता है कि प्रभाव कब दोबारा चलेगा, और रिटर्न फ़ंक्शन अनमाउंट पर सफाई करता है।",
            takeaway: "खाली ऐरे [] केवल माउंट पर एक बार चलता है; ऐरे न देने पर यह हर रेंडर के बाद चलता है।",
            source: "रिएक्ट 18 हुक विनिर्देश • useEffect"
          },
          hinglish: {
            answer: "useEffect render ke baad side effects (API calls, subscriptions) run karta hai. Dependency array batata hai kab rerun hoga, aur cleanup function unmount par clean karta hai.",
            takeaway: "Empty array [] sirf ek baar mount par chalta hai.",
            source: "React 18 Hooks Specifications • useEffect"
          }
        },
        {
          keywords: ["sql", "nosql", "postgres", "mongodb", "relational", "database"],
          en: {
            answer: "SQL databases (like PostgreSQL) use relational tables with strict ACID consistency, ideal for transactional data. NoSQL (like MongoDB) offers flexible, document-based schemas suitable for rapid schema evolution.",
            takeaway: "Use SQL for structured business transactions and NoSQL for polymorphic, unstructured data.",
            source: "Database Engineering • Relational vs Document Stores"
          },
          hi: {
            answer: "SQL डेटाबेस (जैसे PostgreSQL) ACID नियमों के साथ संरचित तालिकाओं का उपयोग करते हैं, जो लेनदेन के लिए सर्वोत्तम हैं। NoSQL (जैसे MongoDB) लचीले, बिना स्कीमा वाले दस्तावेज़ प्रदान करता है।",
            takeaway: "वित्तीय व उद्यम डेटा के लिए SQL और अनसंरचित डेटा के लिए NoSQL चुनें।",
            source: "डेटाबेस इंजीनियरिंग • रिलेशनल बनाम डॉक्युमेंट डेटाबेस"
          },
          hinglish: {
            answer: "SQL database (jaise PostgreSQL) strict relational tables aur ACID transactions deta hai, jabki NoSQL (jaise MongoDB) flexible document-based structure deta hai jo rapid scaling ke liye suitable hai.",
            takeaway: "Structured aur financial data ke liye SQL use karein, dynamic JSON data ke liye NoSQL.",
            source: "Database Engineering • SQL vs NoSQL"
          }
        }
      ],

      // 2. Artificial Intelligence & LLMs
      ai_ml: [
        {
          keywords: ["fine tuning", "rag", "retrieval", "farak", "difference", "vector"],
          en: {
            answer: "RAG retrieves external factual knowledge from a vector database at query time to ground answers, whereas Fine-Tuning updates the model's neural network weights to learn specific styles, formats, or domain tasks.",
            takeaway: "Use RAG for dynamic, private enterprise documents; use Fine-Tuning for specialized vocabulary or formatting.",
            source: "Generative AI Systems Architecture • RAG vs Fine-Tuning"
          },
          hi: {
            answer: "RAG (Retrieval-Augmented Generation) वास्तविक समय में वेक्टर डेटाबेस से कंपनी के दस्तावेज़ खोजकर सटीक उत्तर देता है, जबकि Fine-Tuning में मॉडल के न्यूरल वेट्स को नए डेटा पर प्रशिक्षित किया जाता है।",
            takeaway: "निजी व लगातार बदलने वाले डेटा के लिए RAG और विशिष्ट स्टाइल या व्याकरण के लिए Fine-Tuning चुनें।",
            source: "जेनेरेटिव AI आर्किटेक्चर • RAG बनाम फाइन-ट्यूनिंग"
          },
          hinglish: {
            answer: "RAG query ke time vector database se relevant company documents retrieve karke accurate answer deta hai, jabki Fine-Tuning me model ke internal weights ko update karke specific style ya domain sikhaya jaata hai.",
            takeaway: "Knowledge update ke liye RAG best hai, behavior aur formatting sikhane ke liye Fine-Tuning.",
            source: "Generative AI Systems Architecture • RAG vs Fine-Tuning"
          }
        },
        {
          keywords: ["transformer", "attention", "self attention", "bert", "gpt"],
          en: {
            answer: "The Transformer architecture replaces sequential RNN recurrence with Multi-Head Self-Attention, computing how every word in a sequence relates to all other words simultaneously in parallel.",
            takeaway: "Self-attention enables parallel training and captures long-range context across entire documents.",
            source: "Attention Is All You Need • Vaswani et al."
          },
          hi: {
            answer: "ट्रांसफॉर्मर आर्किटेक्चर पुराने RNN के बजाय सेल्फ-अटेंशन का उपयोग करता है, जिससे वाक्य का प्रत्येक शब्द अन्य सभी शब्दों के साथ एक साथ समानांतर (parallel) रूप से संदर्भ स्थापित करता है।",
            takeaway: "सेल्फ-अटेंशन लंबी दूरी के संदर्भ को तुरंत समझता है और तेज़ प्रशिक्षण सक्षम करता है।",
            source: "ट्रांसफॉर्मर न्यूरल नेटवर्क विनिर्देश"
          },
          hinglish: {
            answer: "Transformer architecture Multi-Head Self-Attention ka use karta hai, jisme sentence ke saare words ek sath parallel process hote hain aur unka aapas me relationship calculate hota hai.",
            takeaway: "Self-attention se model lambe paragraphs ka contextual meaning perfectly samajhta hai.",
            source: "Vaswani et al. • Transformer Architecture"
          }
        },
        {
          keywords: ["hallucination", "hallucinate", "temperature", "factual", "grounding"],
          en: {
            answer: "LLM Hallucination occurs when a model generates plausible-sounding but factually incorrect statements. Mitigation requires RAG grounding, lowering temperature (e.g. 0.0 - 0.2), and system prompt guardrails.",
            takeaway: "Ground LLMs with authoritative context to eliminate hallucinations in production.",
            source: "Enterprise LLM Reliability & Guardrails"
          },
          hi: {
            answer: "AI मॉडल में Hallucination तब होता है जब मॉडल सुनने में सही लगने वाले लेकिन पूरी तरह काल्पनिक या गलत तथ्य पेश करता है। इसे RAG, कम तापमान (Temperature) और सख्त प्रॉम्प्ट से रोका जाता है।",
            takeaway: "विश्वसनीय संदर्भ और निम्न टेम्परेचर उत्पादन में मतिभ्रम को शून्य करते हैं।",
            source: "उद्यम LLM विश्वसनीयता एवं सुरक्षा नियम"
          },
          hinglish: {
            answer: "LLM Hallucination ka matlab hai jab AI confidently galat ya fake facts generate kar deta hai. Isko rokne ke liye RAG context grounding, low temperature aur guardrails use kiye jaate hain.",
            takeaway: "Verified documents ke context ke sath prompt dene se hallucination eliminate hota hai.",
            source: "Enterprise LLM Reliability & Guardrails"
          }
        }
      ],

      // 3. Enterprise Cybersecurity & Threat Defense
      cybersecurity: [
        {
          keywords: ["sql injection", "sqli", "prepared statement", "parameterized", "injection"],
          en: {
            answer: "SQL Injection occurs when untrusted user input is directly concatenated into SQL queries. Defense requires using Parameterized Queries (Prepared Statements) where input is treated strictly as data, never code.",
            takeaway: "Never concatenate raw strings into SQL queries; always bind parameters ($1, $2).",
            source: "OWASP Top 10 • A03:2021-Injection Defense"
          },
          hi: {
            answer: "SQL इंजेक्शन तब होता है जब उपयोगकर्ता के इनपुट को सीधे डेटाबेस क्वेरी में जोड़ दिया जाता है। इससे बचाव के लिए पैरामीटरयुक्त प्रश्नों (Prepared Statements) का उपयोग अनिवार्य है।",
            takeaway: "SQL स्ट्रिंग में कच्चा इनपुट कभी न जोड़ें; हमेशा $1, $2 जैसे पैरामीटर बाइंड करें।",
            source: "OWASP टॉप 10 • इंजेक्शन रोकथाम दिशानिर्देश"
          },
          hinglish: {
            answer: "SQL Injection tab hota hai jab attacker input field me malicious SQL code daal kar database hack karta hai. Iska 100% defense Parameterized Queries (Prepared Statements) use karna hai.",
            takeaway: "Kabhie bhi user input ko SQL string ke sath direct jodna (+ ya concat) nahi chahiye.",
            source: "OWASP Top 10 • A03 Injection Defense"
          }
        },
        {
          keywords: ["zero trust", "never trust", "verify", "perimeter"],
          en: {
            answer: "Zero Trust operates on the principle of 'Never Trust, Always Verify'. It assumes threats exist both outside and inside the corporate perimeter, requiring strict least-privilege access and continuous authentication.",
            takeaway: "Network location (inside VPN) no longer implies automatic trust; verify identity and device health continuously.",
            source: "NIST SP 800-207 • Zero Trust Architecture"
          },
          hi: {
            answer: "जीरो ट्रस्ट 'कभी भरोसा न करें, हमेशा सत्यापित करें' के सिद्धांत पर काम करता है। यह मानता है कि खतरा नेटवर्क के अंदर और बाहर दोनों जगह मौजूद है, इसलिए न्यूनतम विशेषाधिकार अनिवार्य हैं।",
            takeaway: "VPN के अंदर होना भरोसे की गारंटी नहीं है; प्रत्येक अनुरोध पर पहचान सत्यापित करें।",
            source: "NIST SP 800-207 • जीरो ट्रस्ट सुरक्षा रूपरेखा"
          },
          hinglish: {
            answer: "Zero Trust ka core rule hai 'Never Trust, Always Verify'. Ye assume karta hai ki network ke andar bhi threat ho sakta hai, isliye har request par multi-factor authentication aur least-privilege access compulsory hota hai.",
            takeaway: "Office network ya VPN par hone ka matlab ye nahi ki sab allow ho; identity verification har step par hoti hai.",
            source: "NIST SP 800-207 • Zero Trust Architecture"
          }
        }
      ],

      // 4. POSH Workplace Compliance (Strictly Isolated to POSH course)
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
          keywords: ["extended workplace", "workplace", "boundary", "remote", "zoom", "slack", "wfh", "cab"],
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
          keywords: ["bystander", "intervention", "4d", "mookdarshak", "witness"],
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

    console.log("🤖 AI Course Companion & Doubt Resolver Initialized (Multi-Course Aware)");
  }

  getCurrentLanguage() {
    if (window.i18n && typeof window.i18n.getLanguage === 'function') {
      return window.i18n.getLanguage();
    }
    return localStorage.getItem('learnpulse_language') || 'en';
  }

  getCurrentProgramId() {
    if (window.app && window.app.currentView === 'learning' && window.app.activeProgram) {
      return window.app.activeProgram.id;
    }
    return 'catalog';
  }

  getCurrentModuleId() {
    if (window.app && window.app.activeModule) {
      return window.app.activeModule.id;
    }
    return 'mod-1';
  }

  onViewOrCourseChanged() {
    this.updateContextInfo();
    this.loadSuggestedPrompts();
    if (this.isOpen) {
      this.renderSuggestedChips();
    }
    if (window.app && window.app.activeClassroomTab === 'ai') {
      this.renderClassroomView();
    }
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
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold">WORXPERTISE AI</span>
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
            <span id="aiDrawerCourseName" class="font-medium truncate">Worxpertise Academy (All Programs)</span>
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
              <span>Need learning guidance or concept help?</span>
            </div>
            <p class="text-slate-300 text-[12px] leading-relaxed">
              Ask any doubt about our courses, certifications, or specific technical lessons. I'll provide a <strong>crisp 2-line explanation</strong> with exact syllabus citations.
            </p>
          </div>

          <!-- Suggested Quick Prompts Container -->
          <div class="space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Suggested Questions:</span>
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
              placeholder="Ask about Web Dev, AI/ML, Cyber, or current lesson..." 
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
      const isLearning = window.app && window.app.currentView === 'learning' && window.app.activeProgram;
      courseEl.textContent = isLearning ? window.app.activeProgram.title : "Worxpertise Academy (All Programs)";
    }

    if (langBadge) {
      langBadge.textContent = lang.toUpperCase();
    }
  }

  async loadSuggestedPrompts() {
    const lang = this.getCurrentLanguage();
    const moduleId = this.getCurrentModuleId();
    const programId = this.getCurrentProgramId();

    const fallbackPromptsMap = {
      "catalog": {
        en: [
          "What courses and certifications are offered in this academy?",
          "Which course should I take for Full-Stack Web Development?",
          "What topics are covered in Artificial Intelligence & LLMs?",
          "What are the passing criteria and certification validity?"
        ],
        hi: [
          "इस अकादमी में कौन-कौन से कोर्स और सर्टिफिकेशन उपलब्ध हैं?",
          "फुल-स्टैक वेब डेवलपमेंट सीखने के लिए क्या रोडमैप है?",
          "आर्टिफिशियल इंटेलिजेंस और LLMs कोर्स में क्या सिखाया जाता है?",
          "सर्टिफिकेशन परीक्षा के पासिंग मार्क्स और नियम क्या हैं?"
        ],
        hinglish: [
          "Is academy me kaun-kaun se courses aur certifications available hain?",
          "Full-Stack Web Development sikhne ke liye kya roadmap hai?",
          "AI & LLMs curriculum me kya-kya topics cover hote hain?",
          "Certificate unlock karne ke liye kitna pass percentage chahiye?"
        ]
      },
      "prog-fullstack": {
        en: [
          "What is the difference between Props and State in React?",
          "How does useEffect cleanup work on component unmount?",
          "When should I choose SQL vs NoSQL databases?",
          "How does Node.js handle async non-blocking I/O?"
        ],
        hi: [
          "रिएक्ट में Props और State में क्या अंतर है?",
          "useEffect में क्लीनअप फ़ंक्शन कैसे काम करता है?",
          "SQL और NoSQL डेटाबेस में क्या मुख्य फर्क है?",
          "Node.js में Async ऑपरेशन कैसे काम करते हैं?"
        ],
        hinglish: [
          "React me Props aur State me kya farak hai?",
          "useEffect me dependency array kaise kaam karta hai?",
          "SQL vs NoSQL: kab kaunsa database use karein?",
          "Node.js event loop non-blocking I/O kaise handle karta hai?"
        ]
      },
      "prog-ai-ml": {
        en: [
          "What is the difference between Fine-tuning and RAG?",
          "How does Self-Attention work in Transformers?",
          "What are Vector Embeddings and Semantic Search?",
          "How to mitigate Large Language Model hallucinations?"
        ],
        hi: [
          "Fine-tuning और RAG में क्या मुख्य अंतर है?",
          "ट्रांसफॉर्मर में Self-Attention कैसे काम करता है?",
          "वेक्टर एम्बेडिंग और सिमेंटिक सर्च क्या है?",
          "AI मॉडल में Hallucination कैसे कम करें?"
        ],
        hinglish: [
          "Fine-tuning aur RAG me kya farak hai?",
          "Transformers me Self-Attention mechanism kaise kaam karta hai?",
          "Vector Embeddings aur Semantic Search kya hota hai?",
          "LLM hallucination ko kaise control karein?"
        ]
      },
      "prog-cybersecurity": {
        en: [
          "How do Parameterized Queries prevent SQL Injection?",
          "What is Zero Trust Architecture ('Never Trust, Always Verify')?",
          "How do Content Security Policies (CSP) mitigate XSS?",
          "Why is bcrypt hashing required for passwords?"
        ],
        hi: [
          "SQL इंजेक्शन से बचाव के लिए क्या करें?",
          "Zero Trust सुरक्षा आर्किटेक्चर क्या है?",
          "XSS हमलों को कैसे रोका जाए?",
          "पासवर्ड के लिए bcrypt हैशिंग क्यों आवश्यक है?"
        ],
        hinglish: [
          "Parameterized queries se SQL Injection kaise prevent hota hai?",
          "Zero Trust Architecture ka matlab kya hai?",
          "XSS attacks se web app ko kaise bachayein?",
          "Passwords ke liye bcrypt hashing kyu compulsory hai?"
        ]
      },
      "prog-posh-compliance": {
        en: [
          "What is the difference between Quid Pro Quo and Hostile Work Environment?",
          "What is legally included in the Extended Workplace doctrine?",
          "Does intent matter if behavior is unwelcome?",
          "How do I use the 4D Bystander Intervention framework?"
        ],
        hi: [
          "क्विड प्रो क्वो और अमित्र कार्य वातावरण में क्या अंतर है?",
          "विस्तारित कार्यस्थल (Extended Workplace) में कानूनी रूप से क्या शामिल है?",
          "यदि व्यवहार अवांछित है, तो क्या इरादा मायने रखता है?",
          "मूकदर्शक हस्तक्षेप के 4D नियम का उपयोग कैसे करें?"
        ],
        hinglish: [
          "Quid Pro Quo aur Hostile Work Environment me kya farak hai?",
          "Extended Workplace doctrine me kanooni roop se kya cover hota hai?",
          "Agar behavior unwelcome hai, to kya 'it was just a joke' bol sakte hain?",
          "Bystander Intervention ke 4D framework ko kaise apply karein?"
        ]
      }
    };

    const effectiveProg = programId || "catalog";
    const progData = fallbackPromptsMap[effectiveProg] || fallbackPromptsMap["catalog"];
    let prompts = progData[lang] || progData.en;

    // Try backend if online
    if (window.apiService && window.apiService.isBackendOnline) {
      try {
        const res = await window.apiService.getAiPrompts(moduleId, lang, effectiveProg);
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
    const programId = this.getCurrentProgramId();

    // Route knowledge category strictly according to active program/view
    let category = 'catalog';
    if (programId === 'prog-posh-compliance') category = 'posh';
    else if (programId === 'prog-ai-ml') category = 'ai_ml';
    else if (programId === 'prog-cybersecurity') category = 'cybersecurity';
    else if (programId === 'prog-fullstack') category = 'fullstack';
    else category = 'catalog';

    const items = this.fallbackKnowledge[category] || this.fallbackKnowledge.catalog;
    let matched = items.find(item => item.keywords.some(k => q.includes(k)));

    if (!matched) {
      matched = items[0];
    }

    const content = matched[lang] || matched.hinglish || matched.en;

    const followupsMap = {
      catalog: [
        "What are the prerequisites for Full-Stack Web Development?",
        "How is the AI & LLMs certificate verified?",
        "What is the passing score for certification?"
      ],
      posh: [
        lang === 'hi' ? "विस्तारित कार्यस्थल (Extended Workplace) क्या है?" : "What is the Extended Workplace doctrine?",
        lang === 'hi' ? "मूकदर्शक हस्तक्षेप का 4D नियम क्या है?" : "Explain the 4D Bystander Intervention framework."
      ],
      fullstack: [
        lang === 'hi' ? "रिएक्ट में Props और State में क्या अंतर है?" : "What is the difference between Props and State in React?",
        lang === 'hi' ? "SQL और NoSQL में क्या फर्क है?" : "When should I choose SQL vs NoSQL?"
      ],
      ai_ml: [
        lang === 'hi' ? "Fine-tuning और RAG में क्या अंतर है?" : "What is the difference between Fine-tuning and RAG?",
        lang === 'hi' ? "ट्रांसफॉर्मर में Self-Attention कैसे काम करता है?" : "How does Self-Attention work in Transformers?"
      ],
      cybersecurity: [
        lang === 'hi' ? "SQL इंजेक्शन से बचाव के लिए क्या करें?" : "How do Parameterized Queries prevent SQL Injection?",
        lang === 'hi' ? "Zero Trust आर्किटेक्चर क्या है?" : "What is Zero Trust Architecture ('Never Trust, Always Verify')?"
      ]
    };

    return {
      success: true,
      question,
      answer: content.answer,
      takeaway: content.takeaway,
      source: content.source,
      suggestedFollowups: followupsMap[category] || followupsMap.catalog
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
            <span class="font-bold text-indigo-300">AI Tutor is analyzing curriculum context...</span>
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
                  <span>${this.escapeHtml(msg.source || 'Curriculum Standards')}</span>
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

    const prog = (window.app && window.app.activeProgram) || (window.appState && window.appState.activeProgram) || { title: "Course Curriculum" };
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
              <span>1-Click Suggested Questions for this Lesson:</span>
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
                placeholder="Ask any doubt about this lesson (e.g. 'Explain this concept in 2 lines')..." 
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
