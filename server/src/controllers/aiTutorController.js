/**
 * LearnPulse / Worxpertise Enterprise LMS
 * Contextual AI Course Companion & Doubt Resolver Controller
 * 
 * Provides instant 2-line contextual answers, citations, and suggested follow-ups
 * in English, Hindi, and Hinglish for ALL courses:
 * - Academy Global Guide (When on Home/Catalog page)
 * - Full-Stack Web Development (React, Node, DB)
 * - Artificial Intelligence & LLMs (Transformers, RAG, Fine-Tuning)
 * - Enterprise Cybersecurity & Threat Defense (OWASP, Zero Trust)
 * - POSH Workplace Compliance (Strictly isolated to POSH program)
 * - Dynamic support for ANY new custom course created by instructors/admin
 */

const KNOWLEDGE_BASE = {
  // =========================================================================
  // 0. Worxpertise Academy Global Guide (Catalog / Home View)
  // =========================================================================
  "catalog": [
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

  // =========================================================================
  // 1. Full-Stack Web Development Mastery (prog-fullstack)
  // =========================================================================
  "prog-fullstack": [
    {
      keywords: ["state", "props", "react", "farak", "difference", "antar"],
      en: {
        answer: "Props are read-only inputs passed down from parent to child components, whereas State is local, mutable memory managed via useState that triggers UI re-renders on update.",
        takeaway: "Props flow downwards (unidirectional); state is private and managed within the component.",
        source: "React 18 Architecture • State & Props Management"
      },
      hi: {
        answer: "Props पैरेंट घटक से चाइल्ड को भेजा जाने वाला केवल-पठनीय (read-only) डेटा है, जबकि State घटक की अपनी आंतरिक मेमोरी है जो useState के जरिए अपडेट होने पर UI को पुनः रेंडर करती है।",
        takeaway: "Props बाहर से प्राप्त होते हैं; State घटक के अंदर निजी तौर पर प्रबंधित होती है।",
        source: "रिएक्ट 18 आर्किटेक्चर • स्टेट और प्रॉप्स प्रबंधन"
      },
      hinglish: {
        answer: "Props parent component se child ko pass hone wala read-only data hai, jabki State component ka apna internal data hota hai jo useState se update hone par UI ko re-render karta hai.",
        takeaway: "Props bahar se aate hain, state component ke andar manage hoti hai.",
        source: "React 18 Architecture • State Management"
      }
    },
    {
      keywords: ["useeffect", "lifecycle", "cleanup", "dependency", "mount", "unmount"],
      en: {
        answer: "useEffect handles side effects (API calls, event listeners) after DOM rendering. The dependency array specifies when to re-run, and a returned callback handles cleanup on unmount.",
        takeaway: "Passing [] runs once on mount; omitting the array runs after every render.",
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
      keywords: ["sql", "nosql", "postgres", "mongodb", "relational", "database", "farak", "difference"],
      en: {
        answer: "SQL databases (like PostgreSQL) use structured relational schemas with ACID guarantees, ideal for transactional data. NoSQL (like MongoDB) offers flexible, schemaless documents suited for rapid schema iteration.",
        takeaway: "Use SQL for structured financial/enterprise data and NoSQL for rapid, unstructured prototyping.",
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
    },
    {
      keywords: ["event loop", "node", "async", "single thread", "non blocking"],
      en: {
        answer: "Node.js runs on a single-threaded Event Loop that offloads I/O operations (file, network, DB) to the OS kernel or libuv thread pool, enabling high concurrency without thread blocking.",
        takeaway: "CPU-heavy tasks block the Event Loop; offload them to Worker Threads.",
        source: "Node.js Runtime Architecture • Libuv Event Loop"
      },
      hi: {
        answer: "Node.js एक सिंगल-थ्रेडेड इवेंट लूप पर चलता है जो I/O कार्यों (नेटवर्क, फ़ाइल) को libuv थ्रेड पूल को सौंपता है, जिससे बिना थ्रेड ब्लॉक किए हज़ारों अनुरोध संभाले जा सकते हैं।",
        takeaway: "CPU-गहन कार्यों के लिए वर्कर थ्रेड्स का उपयोग करें ताकि मुख्य लूप ब्लॉक न हो।",
        source: "Node.js रनटाइम आर्किटेक्चर • इवेंट लूप"
      },
      hinglish: {
        answer: "Node.js single-threaded Event Loop par kaam karta hai jo heavy I/O operations ko background libuv worker pool ko de deta hai, jisse non-blocking asynchronous concurrency milti hai.",
        takeaway: "Asynchronous I/O se single thread par bhi lakhon requests handle hoti hain.",
        source: "Node.js Runtime Architecture • Event Loop"
      }
    }
  ],

  // =========================================================================
  // 2. Mastering Artificial Intelligence & LLMs (prog-ai-ml)
  // =========================================================================
  "prog-ai-ml": [
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
      keywords: ["embedding", "vector", "cosine", "similarity", "chroma", "pinecone"],
      en: {
        answer: "An embedding maps text tokens into dense high-dimensional vectors where semantically similar concepts are clustered close together in vector space based on cosine similarity.",
        takeaway: "Vector search matches underlying conceptual meaning rather than brittle keyword matching.",
        source: "Vector Embeddings & Semantic Search Specifications"
      },
      hi: {
        answer: "एम्बेडिंग पाठ को सघन उच्च-आयामी गणितीय वैक्टर में बदलती है, जहाँ समान अर्थ वाले शब्द वेक्टर स्पेस में कोसाइन समानता के आधार पर एक-दूसरे के करीब स्थित होते हैं।",
        takeaway: "वेक्टर सर्च केवल कीवर्ड मिलाने के बजाय वाक्य के मूल अर्थ को खोजती है।",
        source: "वेक्टर एम्बेडिंग एवं सिमेंटिक सर्च"
      },
      hinglish: {
        answer: "Embedding text ko high-dimensional numbers (vectors) me convert karti hai. Jo words meaning me similar hote hain, wo vector space me ek dusre ke paas cluster ho jate hain.",
        takeaway: "Exact keyword match na hone par bhi concept match ho jata hai.",
        source: "Vector Embeddings & Semantic Search"
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

  // =========================================================================
  // 3. Enterprise Cybersecurity & Threat Defense (prog-cybersecurity)
  // =========================================================================
  "prog-cybersecurity": [
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
    },
    {
      keywords: ["xss", "cross site scripting", "csp", "sanitize", "innerhtml"],
      en: {
        answer: "Cross-Site Scripting (XSS) occurs when malicious JavaScript is injected into web pages viewed by other users. Mitigation requires context-aware HTML escaping, DOM sanitization, and Content Security Policy (CSP).",
        takeaway: "Avoid innerHTML; use textContent or framework data-binding with strict CSP headers.",
        source: "OWASP Top 10 • Cross-Site Scripting Mitigation"
      },
      hi: {
        answer: "XSS हमले में दुर्भावनापूर्ण जावास्क्रिप्ट अन्य उपयोगकर्ताओं के ब्राउज़र में निष्पादित हो जाती है। इसे संदर्भ-जागरूक HTML एन्कोडिंग और कंटेंट सिक्योरिटी पॉलिसी (CSP) से रोका जाता है।",
        takeaway: "innerHTML के प्रयोग से बचें और प्रतिक्रिया में सख्त CSP हेडर भेजें।",
        source: "OWASP टॉप 10 • XSS सुरक्षा मानक"
      },
      hinglish: {
        answer: "XSS me attacker browser me unwanted script chala kar user ke cookies aur tokens chura sakta hai. Isko rokne ke liye inputs sanitize karein aur Content Security Policy (CSP) headers implement karein.",
        takeaway: "Dynamic HTML render karte waqt context escaping aur CSP headers zaroor lagayein.",
        source: "OWASP Top 10 • XSS Prevention"
      }
    },
    {
      keywords: ["password", "hashing", "bcrypt", "salt", "md5", "sha"],
      en: {
        answer: "Passwords must never be stored in plaintext or fast algorithms like MD5/SHA256. Use slow, adaptive hashing algorithms (bcrypt, Argon2) with cryptographic salts to prevent rainbow table attacks.",
        takeaway: "Adaptive work factors protect credentials against brute-force GPU cracking.",
        source: "NIST Special Publication 800-63B • Password Storage"
      },
      hi: {
        answer: "पासवर्ड कभी भी प्लेनटेक्स्ट या MD5 में सुरक्षित न रखें। रेनबो टेबल हमलों से बचने के लिए क्रिप्टोग्राफ़िक साल्ट के साथ bcrypt या Argon2 जैसे अनुकूली हैशिंग का उपयोग करें।",
        takeaway: "bcrypt और साल्ट पासवर्ड को क्रूर-बल (brute force) हमलों से सुरक्षित रखते हैं।",
        source: "NIST SP 800-63B • पासवर्ड सुरक्षा मानक"
      },
      hinglish: {
        answer: "Passwords ko plaintext ya fast hash (MD5, SHA1) me store karna dangerous hai. bcrypt ya Argon2 algorithms use karein jo automatic salt add karke GPU brute force attack ko block karte hain.",
        takeaway: "Always use bcrypt with salt rounds of 10+ for enterprise user security.",
        source: "NIST SP 800-63B • Password Security"
      }
    }
  ],

  // =========================================================================
  // 4. POSH Workplace Compliance (prog-posh-compliance) - Strictly Isolated
  // =========================================================================
  "prog-posh-compliance": [
    {
      keywords: ["quid pro quo", "hostile", "farak", "difference", "antar", "sexual favor", "promotion"],
      en: {
        answer: "Quid Pro Quo ('this for that') occurs when career advancement or appraisals are conditioned on sexual favors. A Hostile Work Environment refers to pervasive unwelcome conduct (jokes, suggestive remarks) creating an intimidating workplace.",
        takeaway: "Quid Pro Quo involves direct career leverage, while Hostile Environment compromises the overall workplace atmosphere.",
        source: "POSH Act 2013 • Section 3(2)(i)-(v)"
      },
      hi: {
        answer: "क्विड प्रो क्वो (Quid Pro Quo) में पदोन्नति या मूल्यांकन के बदले व्यक्तिगत अनुचित लाभ मांगा जाता है। जबकि अमित्र कार्य वातावरण (Hostile Work Environment) में अवांछित चुटकुलों या टिप्पणियों से असहज माहौल बनता है।",
        takeaway: "क्विड प्रो क्वो में करियर का सीधा दबाव होता है, जबकि अमित्र वातावरण पूरे कार्यस्थल को विषाक्त बनाता है।",
        source: "पॉश अधिनियम 2013 • धारा 3(2)"
      },
      hinglish: {
        answer: "Quid Pro Quo ka matlab hai jab promotion ya appraisal ke badle romantic/sexual favors demand kiye jayein. Jabki Hostile Work Environment me unwelcome baatein ya jokes se poora workplace uncomfortable ho jata hai.",
        takeaway: "Quid Pro Quo me direct career leverage hota hai, aur Hostile Environment me kaam ka mahaul toxic banta hai.",
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
      keywords: ["bystander", "4d", "direct", "distract", "delegate", "delay", "mookdarshak", "witness"],
      en: {
        answer: "The 4D Bystander framework provides safe intervention tactics: Direct (address conduct immediately), Distract (interrupt the situation), Delegate (alert HR/Security), and Delay (check in on colleague afterwards).",
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
      keywords: ["ic", "internal committee", "complaint", "file", "90 days", "time limit", "shikayat", "deadline"],
      en: {
        answer: "A formal complaint must be submitted to the Internal Committee within 3 months (90 days) of the incident. Under Section 11(4), the IC is legally mandated to complete its inquiry within 90 days.",
        takeaway: "Section 16 strictly guarantees identity confidentiality under penalty of statutory fines.",
        source: "POSH Act 2013 • Sections 9, 11 & 16"
      },
      hi: {
        answer: "घटना के 3 महीने (90 दिन) के भीतर आंतरिक समिति (IC) को औपचारिक शिकायत दर्ज करनी होती है। धारा 11(4) के तहत समिति को 90 दिनों के भीतर जांच पूरी करना अनिवार्य है।",
        takeaway: "धारा 16 शिकायतकर्ता और गवाहों की पूर्ण गोपनीयता की कानूनी गारंटी देती है।",
        source: "पॉश अधिनियम 2013 • धारा 9, 11 एवं 16"
      },
      hinglish: {
        answer: "POSH complaint incident ke 3 months (90 days) ke andar file honi chahiye. Internal Committee ko apni enquiry 90 days ke andar complete karni hoti hai aur report 10 din me submit karni padti hai.",
        takeaway: "Section 16 identity disclosure ko completely ban karta hai taaki whistleblower safe rahe.",
        source: "POSH Act 2013 • Section 9, 11 & 16"
      }
    }
  ]
};

// General fallback responses when question is conceptual but not keyword-matched
const GENERAL_FALLBACK = {
  en: {
    answer: "Worxpertise Academy empowers your career with certified enterprise programs. Explore courses in Full-Stack Web Development, AI & LLMs, Cybersecurity, and Corporate Compliance.",
    takeaway: "Complete 100% video modules and score 80%+ on assessments to unlock your credentials.",
    source: "Worxpertise Academy • Enterprise Learning Guide"
  },
  hi: {
    answer: "वर्क्सपर्टीज़ अकादमी प्रमाणित उद्योग पाठ्यक्रमों के माध्यम से आपके करियर को सशक्त बनाती है। फुल-स्टैक वेब डेवलपमेंट, AI और LLMs, साइबर सुरक्षा और कम्प्लायंस में पाठ्यक्रम खोजें।",
    takeaway: "प्रमाणपत्र अनलॉक करने के लिए वीडियो को 100% देखें और मूल्यांकन में 80%+ अंक प्राप्त करें।",
    source: "वर्क्सपर्टीज़ अकादमी • एंटरप्राइज लर्निंग गाइड"
  },
  hinglish: {
    answer: "Worxpertise Academy aapke career ko industry-accredited certifications ke saath boost karti hai. Full-Stack Web Dev, AI & LLMs, Cybersecurity aur Compliance courses explore karein.",
    takeaway: "Certificates unlock karne ke liye 100% videos complete karein aur quizzes me 80%+ score karein.",
    source: "Worxpertise Academy • Enterprise Learning Guide"
  }
};

/**
 * Detect language from prompt or requested param
 */
function detectLanguage(prompt, requestedLang) {
  if (['hi', 'hinglish', 'en'].includes(requestedLang)) return requestedLang;
  if (!prompt) return 'en';

  const devalog = /[\u0900-\u097F]/;
  if (devalog.test(prompt)) return 'hi';

  const hinglishWords = /\b(kya|kaise|kyu|farak|hota|karein|hai|aur|nahi|ke|liye|baad|se|me|par|kisko|bhi)\b/i;
  if (hinglishWords.test(prompt)) return 'hinglish';

  return 'en';
}

/**
 * Handle POST /api/enterprise/ai/ask
 */
exports.askAiTutor = async (req, res) => {
  try {
    const { question, programId, moduleId, language } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question prompt is required.'
      });
    }

    const cleanPrompt = question.trim().toLowerCase();
    const effectiveLang = detectLanguage(cleanPrompt, language);
    const effectiveProg = (programId && programId !== 'catalog' && programId !== 'null') ? programId : 'catalog';

    // 1. Search knowledge base strictly for the current program/catalog
    const courseRules = KNOWLEDGE_BASE[effectiveProg] || KNOWLEDGE_BASE["catalog"] || [];
    let matchedItem = null;

    for (const item of courseRules) {
      const match = item.keywords.some(kw => cleanPrompt.includes(kw.toLowerCase()));
      if (match) {
        matchedItem = item;
        break;
      }
    }

    let resultPayload = null;
    if (matchedItem) {
      const langPack = matchedItem[effectiveLang] || matchedItem.hinglish || matchedItem.en;
      resultPayload = {
        answer: langPack.answer,
        takeaway: langPack.takeaway,
        source: langPack.source
      };
    } else {
      // General synthesis
      const fb = GENERAL_FALLBACK[effectiveLang] || GENERAL_FALLBACK.en;
      resultPayload = {
        answer: fb.answer,
        takeaway: fb.takeaway,
        source: fb.source
      };
    }

    // Dynamic suggested follow-ups based strictly on the course
    const followupsMap = {
      "catalog": [
        "What are the prerequisites for Full-Stack Web Development?",
        "How is the AI & LLMs certificate verified?",
        "What is the passing score for certification?"
      ],
      "prog-posh-compliance": [
        effectiveLang === 'hi' ? "क्विड प्रो क्वो और अमित्र वातावरण में क्या अंतर है?" : effectiveLang === 'hinglish' ? "Quid Pro Quo vs Hostile Environment me kya farak hai?" : "What is Quid Pro Quo vs Hostile Work Environment?",
        effectiveLang === 'hi' ? "विस्तारित कार्यस्थल (Extended Workplace) क्या है?" : effectiveLang === 'hinglish' ? "Extended Workplace doctrine kya hai?" : "What is the Extended Workplace doctrine?",
        effectiveLang === 'hi' ? "मूकदर्शक हस्तक्षेप का 4D नियम क्या है?" : effectiveLang === 'hinglish' ? "Bystander Intervention ka 4D rule kya hai?" : "Explain the Bystander 4D rule."
      ],
      "prog-fullstack": [
        effectiveLang === 'hi' ? "रिएक्ट में Props और State में क्या अंतर है?" : effectiveLang === 'hinglish' ? "React me Props aur State me kya farak hai?" : "What is the difference between Props and State in React?",
        effectiveLang === 'hi' ? "useEffect में क्लीनअप फंक्शन कैसे काम करता है?" : effectiveLang === 'hinglish' ? "useEffect cleanup function kab execute hota hai?" : "How does useEffect cleanup work on component unmount?",
        effectiveLang === 'hi' ? "SQL और NoSQL डेटाबेस में क्या फर्क है?" : effectiveLang === 'hinglish' ? "SQL vs NoSQL: kab kaunsa database use karein?" : "When should I choose SQL vs NoSQL?"
      ],
      "prog-ai-ml": [
        effectiveLang === 'hi' ? "Fine-tuning और RAG में क्या मुख्य अंतर है?" : effectiveLang === 'hinglish' ? "Fine-tuning aur RAG me kya farak hai?" : "What is the difference between Fine-tuning and RAG?",
        effectiveLang === 'hi' ? "ट्रांसफॉर्मर में Self-Attention कैसे काम करता है?" : effectiveLang === 'hinglish' ? "Transformers me Self-Attention mechanism kaise kaam karta hai?" : "How does Self-Attention work in Transformers?",
        effectiveLang === 'hi' ? "AI मॉडल में Hallucination कैसे कम करें?" : effectiveLang === 'hinglish' ? "LLM hallucination ko kaise control karein?" : "How to mitigate LLM hallucinations?"
      ],
      "prog-cybersecurity": [
        effectiveLang === 'hi' ? "SQL इंजेक्शन से बचाव के लिए क्या करें?" : effectiveLang === 'hinglish' ? "Parameterized queries se SQL Injection kaise prevent hota hai?" : "How do Parameterized Queries prevent SQL Injection?",
        effectiveLang === 'hi' ? "Zero Trust सुरक्षा आर्किटेक्चर क्या है?" : effectiveLang === 'hinglish' ? "Zero Trust Architecture ka matlab kya hai?" : "What is Zero Trust Architecture ('Never Trust, Always Verify')?",
        effectiveLang === 'hi' ? "XSS हमलों को कैसे रोका जाए?" : effectiveLang === 'hinglish' ? "XSS attacks se web app ko kaise bachayein?" : "How do Content Security Policies (CSP) mitigate XSS?"
      ]
    };

    const followups = followupsMap[effectiveProg] || followupsMap.catalog;

    res.json({
      success: true,
      question: question.trim(),
      answer: resultPayload.answer,
      takeaway: resultPayload.takeaway,
      source: resultPayload.source,
      detectedLanguage: effectiveLang,
      programId: effectiveProg,
      moduleId: moduleId || 'mod-1',
      suggestedFollowups: followups
    });

  } catch (err) {
    console.error('[AI Tutor Controller] Error resolving question:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve doubt. Please try again.',
      error: err.message
    });
  }
};

/**
 * Handle GET /api/enterprise/ai/prompts/:moduleId
 * Dynamically tailored to the active course and language
 */
exports.getSuggestedPrompts = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lang, programId } = req.query;
    const effectiveLang = lang || 'en';
    const effectiveProg = (programId && programId !== 'catalog' && programId !== 'null') ? programId : 'catalog';

    const coursePromptsMap = {
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

    const progData = coursePromptsMap[effectiveProg] || coursePromptsMap["catalog"];
    const prompts = progData[effectiveLang] || progData.en;

    res.json({
      success: true,
      moduleId,
      programId: effectiveProg,
      prompts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
