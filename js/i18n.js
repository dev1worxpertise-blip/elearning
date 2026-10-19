/**
 * LearnPulse / Worxpertise Enterprise LMS
 * Vernacular Multi-Language Engine (English ↔ Hindi ↔ Hinglish)
 * 
 * Statutory & Operational Purpose:
 * In Indian enterprises, frontline employees (factory staff, logistics, customer care, ground operations)
 * often struggle with complex English legal terms (e.g. Quid Pro Quo, Bystander Intervention, Extended Workplace).
 * This module enables seamless 1-click toggling between:
 * - 'en': Corporate English (Default)
 * - 'hi': हिंदी (Formal Devanagari Hindi)
 * - 'hinglish': Hinglish (Romanized Hindi - universally spoken across Indian frontline teams)
 */

class I18nManager {
  constructor() {
    this.languages = [
      { code: 'en', label: 'English', native: 'English', icon: '🇬🇧', flag: 'EN' },
      { code: 'hi', label: 'हिंदी', native: 'हिन्दी (Devanagari)', icon: '🇮🇳', flag: 'HI' },
      { code: 'hinglish', label: 'Hinglish', native: 'Hinglish (Frontline)', icon: '🇮🇳', flag: 'HING' }
    ];

    // Read stored language or default to English
    const saved = localStorage.getItem('learnpulse_lang');
    this.currentLang = (saved && ['en', 'hi', 'hinglish'].includes(saved)) ? saved : 'en';

    this.translations = {
      en: {
        // Navigation & Header
        nav_catalog: "Programs",
        nav_mylearning: "My Learning",
        nav_certificates: "Certificates",
        nav_instructor: "Instructor Studio",
        nav_admin_hub: "Admin Hub",
        nav_dashboard: "Live Operations",
        nav_reports: "Compliance Reports",
        nav_users: "User Directory",
        nav_docs: "Architecture & VAPT",
        nav_monitoring: "Live Radar",
        nav_posh: "POSH IC Redressal",
        verify_credential: "Verify Credential",
        posh_helpdesk: "POSH IC Helpdesk",

        // Catalog & Filters
        catalog_badge: "Enterprise Enablement",
        catalog_title: "Master In-Demand Enterprise Curricula",
        catalog_subtitle: "Industry-accredited video programs, tamper-proof assessments, and verifiable corporate credentials.",
        search_placeholder: "Search programs, topics, or competencies...",
        filter_all: "All Programs",
        filter_compliance: "Corporate Compliance",
        filter_tech: "Technology & Web",
        filter_ai: "AI & Data Science",
        filter_security: "Cybersecurity",

        // Course Cards & Details
        card_modules: "Modules",
        card_pass: "Pass",
        card_certified: "Certified",
        card_progress: "Your Progress",
        btn_enroll_free: "Enroll in Program (Free)",
        btn_resume: "Resume Learning",
        btn_review: "Review Modules",
        btn_view_cert: "View Certificate",
        btn_start_quiz: "Start Certified Assessment",
        btn_take_quiz: "Take Assessment",
        btn_watch_video: "Watch Lesson",

        // Learning & Video Player
        lesson_syllabus: "Course Syllabus & Progress",
        lesson_resources: "Study Materials & Downloads",
        lesson_notes: "Personal Notes & Bookmarks",
        lesson_discussion: "Learner Community Q&A",
        lesson_watch_gate: "Watch 100% of the video lesson to unlock the certified post-video assessment.",
        lesson_unlocked_quiz: "Video completed! Assessment unlocked below.",

        // Quiz & Proctoring
        quiz_header_badge: "Certified Assessment & Exam",
        quiz_pass_threshold: "Pass Threshold",
        quiz_question_of: "Question",
        quiz_of: "of",
        quiz_proctoring_active: "Proctoring Active",
        quiz_strikes: "Strikes",
        quiz_fullscreen_lock: "Fullscreen Lock",
        quiz_time_remaining: "Time Remaining",
        btn_next_question: "Next Question",
        btn_prev_question: "Previous",
        btn_submit_exam: "Submit Assessment",
        quiz_passed_title: "Congratulations! Assessment Passed",
        quiz_failed_title: "Assessment Not Cleared",
        quiz_passed_msg: "You have successfully demonstrated mastery of this module's statutory concepts.",
        quiz_failed_msg: "You did not achieve the mandatory passing threshold. Please review explanations and retry.",
        btn_retry_quiz: "Retry Assessment",
        btn_continue_next: "Continue to Next Lesson",
        btn_view_credential: "Claim Official Certificate",

        // POSH Redressal
        posh_modal_title: "Internal Committee (IC) Confidential Grievance Desk",
        posh_modal_desc: "Strict Section 16 Non-Disclosure Protocol • Anonymous filing enabled with tamper-proof tracking PIN.",
        posh_tab_lodge: "Lodge Confidential Grievance",
        posh_tab_track: "Track Docket & IC Findings",
        posh_tab_charter: "IC Charter & Legal Rights",
        posh_anonymous_toggle: "Anonymous Whistleblower Mode",
        posh_anonymous_hint: "Identity is 100% shielded. No name, email, or user account will be logged.",
        posh_category_label: "Allegation Category",
        posh_severity_label: "Severity Classification",
        posh_description_label: "Incident Statement & Chronology",
        posh_respondent_label: "Respondent Details",
        btn_submit_grievance: "Submit Grievance to IC",

        // Switcher & General
        lang_switch_title: "Language / भाषा",
        lang_toast: "Platform language updated to"
      },

      hi: {
        // Navigation & Header
        nav_catalog: "प्रोग्राम",
        nav_mylearning: "मेरा प्रशिक्षण",
        nav_certificates: "प्रमाण पत्र",
        nav_instructor: "प्रशिक्षक स्टूडियो",
        nav_admin_hub: "प्रशासन केंद्र",
        nav_dashboard: "कार्यकारी डैशबोर्ड",
        nav_reports: "अनुपालन रिपोर्ट",
        nav_users: "कर्मचारी निर्देशिका",
        nav_docs: "वास्तुकला एवं VAPT",
        nav_monitoring: "लाइव रडार",
        nav_posh: "पॉश आंतरिक समिति",
        verify_credential: "सत्यापित करें",
        posh_helpdesk: "पॉश सहायता केंद्र",

        // Catalog & Filters
        catalog_badge: "कॉर्पोरेट सक्षमता केंद्र",
        catalog_title: "उद्योग-मान्यता प्राप्त कॉर्पोरेट प्रशिक्षण",
        catalog_subtitle: "मान्यता प्राप्त वीडियो कार्यक्रम, धोखाधड़ी-मुक्त मूल्यांकन और आधिकारिक डिजिटल प्रमाण पत्र।",
        search_placeholder: "कोर्स, विषय या कौशल खोजें...",
        filter_all: "सभी कार्यक्रम",
        filter_compliance: "कॉर्पोरेट अनुपालन",
        filter_tech: "तकनीकी एवं वेब",
        filter_ai: "आर्टिफिशियल इंटेलिजेंस",
        filter_security: "साइबर सुरक्षा",

        // Course Cards & Details
        card_modules: "मॉड्यूल",
        card_pass: "उत्तीर्ण अंक",
        card_certified: "प्रमाणित",
        card_progress: "आपकी प्रगति",
        btn_enroll_free: "निःशुल्क नामांकन करें",
        btn_resume: "प्रशिक्षण जारी रखें",
        btn_review: "मॉड्यूल की समीक्षा करें",
        btn_view_cert: "प्रमाण पत्र देखें",
        btn_start_quiz: "प्रमाणित मूल्यांकन शुरू करें",
        btn_take_quiz: "मूल्यांकन दें",
        btn_watch_video: "पाठ देखें",

        // Learning & Video Player
        lesson_syllabus: "पाठ्यक्रम एवं प्रगति",
        lesson_resources: "अध्ययन सामग्री एवं डाउनलोड",
        lesson_notes: "व्यक्तिगत नोट्स",
        lesson_discussion: "शिक्षार्थी प्रश्नोत्तर मंच",
        lesson_watch_gate: "प्रमाणित मूल्यांकन अनलॉक करने के लिए वीडियो को 100% पूरा देखना अनिवार्य है।",
        lesson_unlocked_quiz: "वीडियो पूर्ण हुआ! नीचे दिया गया मूल्यांकन अब खुला है।",

        // Quiz & Proctoring
        quiz_header_badge: "प्रमाणित परीक्षा एवं मूल्यांकन",
        quiz_pass_threshold: "न्यूनतम उत्तीर्ण अंक",
        quiz_question_of: "प्रश्न",
        quiz_of: "का",
        quiz_proctoring_active: "निगरानी (Proctoring) सक्रिय",
        quiz_strikes: "चेतावनी (Strikes)",
        quiz_fullscreen_lock: "फुलस्क्रीन लॉक",
        quiz_time_remaining: "शेष समय",
        btn_next_question: "अगला प्रश्न",
        btn_prev_question: "पिछला प्रश्न",
        btn_submit_exam: "मूल्यांकन जमा करें",
        quiz_passed_title: "बधाई हो! आप उत्तीर्ण हुए",
        quiz_failed_title: "मूल्यांकन उत्तीर्ण नहीं हुआ",
        quiz_passed_msg: "आपने इस मॉड्यूल के वैधानिक मानकों में कुशलता सफलतापूर्वक सिद्ध की है।",
        quiz_failed_msg: "आपने न्यूनतम उत्तीर्ण अंक प्राप्त नहीं किए। कृपया व्याख्या पढ़ें और पुनः प्रयास करें।",
        btn_retry_quiz: "पुनः प्रयास करें",
        btn_continue_next: "अगले पाठ पर आगे बढ़ें",
        btn_view_credential: "प्रमाण पत्र प्राप्त करें",

        // POSH Redressal
        posh_modal_title: "आंतरिक समिति (IC) गोपनीय शिकायत प्रकोष्ठ",
        posh_modal_desc: "सख्त धारा 16 गोपनीयता नियम • ट्रैकिंग पिन के साथ 100% अनाम शिकायत दर्ज करने की सुविधा।",
        posh_tab_lodge: "गोपनीय शिकायत दर्ज करें",
        posh_tab_track: "केस स्थिति एवं समिति निष्कर्ष",
        posh_tab_charter: "समिति संरचना एवं कानूनी अधिकार",
        posh_anonymous_toggle: "अनाम व्हिसलब्लोअर मोड",
        posh_anonymous_hint: "पहचान पूरी तरह सुरक्षित है। कोई भी नाम, ईमेल या उपयोगकर्ता डेटाबेस में नहीं रखा जाएगा।",
        posh_category_label: "शिकायत की श्रेणी",
        posh_severity_label: "गंभीरता वर्गीकरण",
        posh_description_label: "घटना का संपूर्ण विवरण एवं समय",
        posh_respondent_label: "आरोपी व्यक्ति का विवरण",
        btn_submit_grievance: "समिति को शिकायत जमा करें",

        // Switcher & General
        lang_switch_title: "भाषा चुनें",
        lang_toast: "प्लेटफ़ॉर्म की भाषा बदलकर कर दी गई है:"
      },

      hinglish: {
        // Navigation & Header
        nav_catalog: "Programs",
        nav_mylearning: "Mera Learning",
        nav_certificates: "Certificates",
        nav_instructor: "Instructor Studio",
        nav_admin_hub: "Admin Hub",
        nav_dashboard: "Live Operations",
        nav_reports: "Compliance Reports",
        nav_users: "Team Directory",
        nav_docs: "Architecture & VAPT",
        nav_monitoring: "Live Radar",
        nav_posh: "POSH IC Redressal",
        verify_credential: "Verify Karein",
        posh_helpdesk: "POSH IC Helpdesk",

        // Catalog & Filters
        catalog_badge: "Enterprise Training Hub",
        catalog_title: "Corporate Verified Skills & Certifications",
        catalog_subtitle: "Industry video programs, cheat-proof assessments, aur instant verifiable digital certificates.",
        search_placeholder: "Course, topic ya skill search karein...",
        filter_all: "Sabhi Programs",
        filter_compliance: "Corporate Compliance",
        filter_tech: "Tech & Coding",
        filter_ai: "AI & Machine Learning",
        filter_security: "Cybersecurity",

        // Course Cards & Details
        card_modules: "Modules",
        card_pass: "Pass Marks",
        card_certified: "Certified",
        card_progress: "Aapki Progress",
        btn_enroll_free: "Free me Enroll Karein",
        btn_resume: "Learning Resume Karein",
        btn_review: "Modules Review Karein",
        btn_view_cert: "Certificate Dekhein",
        btn_start_quiz: "Assessment Start Karein",
        btn_take_quiz: "Quiz Dein",
        btn_watch_video: "Video Dekhein",

        // Learning & Video Player
        lesson_syllabus: "Course Syllabus & Progress",
        lesson_resources: "Study Material & Notes",
        lesson_notes: "Mere Personal Notes",
        lesson_discussion: "Team Discussion & Q&A",
        lesson_watch_gate: "Exam unlock karne ke liye poora 100% video dekhna compulsory hai.",
        lesson_unlocked_quiz: "Video complete ho gaya! Niche assessment unlock ho chuka hai.",

        // Quiz & Proctoring
        quiz_header_badge: "Certified Exam & Quiz",
        quiz_pass_threshold: "Passing Marks Threshold",
        quiz_question_of: "Question",
        quiz_of: "of",
        quiz_proctoring_active: "Proctoring Active Hai",
        quiz_strikes: "Strikes",
        quiz_fullscreen_lock: "Fullscreen Lock",
        quiz_time_remaining: "Remaining Time",
        btn_next_question: "Next Question",
        btn_prev_question: "Previous",
        btn_submit_exam: "Quiz Submit Karein",
        quiz_passed_title: "Badhai Ho! Aap Pass Ho Gaye 🎉",
        quiz_failed_title: "Assessment Clear Nahi Hua",
        quiz_passed_msg: "Aapne is module ke legal aur compliance concepts ko successfully samajh liya hai.",
        quiz_failed_msg: "Passing percentage achieve nahi hua. Explanation padhein aur dubara try karein.",
        btn_retry_quiz: "Phir Se Try Karein",
        btn_continue_next: "Next Lesson par Jayein",
        btn_view_credential: "Apna Certificate Claim Karein",

        // POSH Redressal
        posh_modal_title: "Internal Committee (IC) Confidential Grievance Desk",
        posh_modal_desc: "Section 16 Non-Disclosure Protocol • 100% Anonymous complaint submit karne ki suvidha with secret PIN.",
        posh_tab_lodge: "Confidential Complaint Lodge Karein",
        posh_tab_track: "Case Status & Committee Action Track Karein",
        posh_tab_charter: "IC Committee Members & Kanooni Adhikar",
        posh_anonymous_toggle: "Anonymous Whistleblower Mode",
        posh_anonymous_hint: "Identity 100% hidden rahegi. Database me koi bhi naam, email ya account store nahi hoga.",
        posh_category_label: "Harassment Category",
        posh_severity_label: "Severity Level",
        posh_description_label: "Incident ka Poora Statement & Time",
        posh_respondent_label: "Aaropi (Respondent) ka Name & Role",
        btn_submit_grievance: "Internal Committee ko Submit Karein",

        // Switcher & General
        lang_switch_title: "Language Select Karein",
        lang_toast: "Platform language switch ho gayi:"
      }
    };

    // Deep Vernacular Course Data Overrides (Course titles, Taglines, Module titles & Quizzes)
    this.coursesData = {
      "prog-posh-compliance": {
        hi: {
          title: "पॉश: कार्यस्थल पर महिलाओं का यौन उत्पीड़न रोकथाम (कॉर्पोरेट अनुपालन)",
          tagline: "पॉश अधिनियम 2013, कर्मचारी अधिकार, कार्यस्थल उत्पीड़न की पहचान, मूकदर्शक हस्तक्षेप (4Ds), और आंतरिक समिति (IC) शिकायत निवारण नियमों को कवर करने वाला आधिकारिक कॉर्पोरेट कार्यक्रम।",
          category: "कॉर्पोरेट अनुपालन",
          level: "सभी कर्मचारियों के लिए",
          skills: ["पॉश अधिनियम 2013", "कार्यस्थल संवेदनशीलता", "अमित्र कार्य वातावरण रोकथाम", "मूकदर्शक हस्तक्षेप (4D)", "आंतरिक समिति (IC) न्याय"],
          modules: {
            "mod-posh-1": {
              title: "पॉश अधिनियम 2013 की रूपरेखा एवं उत्पीड़न की कानूनी परिभाषा",
              description: "कार्यस्थल पर महिलाओं के यौन उत्पीड़न (रोकथाम, निषेध एवं निवारण) अधिनियम, 2013 का आवश्यक परिचय। उत्पीड़न की कानूनी परिभाषा, 'विस्तारित कार्यस्थल' (वर्क-फ्रॉम-होम, आधिकारिक यात्रा) और क्विड प्रो क्वो बनाम अमित्र वातावरण के अंतर को समझें।"
            },
            "mod-posh-2": {
              title: "कार्यस्थल दुर्व्यवहार की पहचान एवं मूकदर्शक हस्तक्षेप (4D रणनीति)",
              description: "अवांछित व्यवहार, डिजिटल अनुचित टिप्पणियों, और प्रत्यक्ष हस्तक्षेप के 4D सिद्धांतों (Direct, Distract, Delegate, Delay) की व्यावहारिक समझ।"
            },
            "mod-posh-3": {
              title: "आंतरिक समिति (IC) शिकायत निवारण एवं प्रतिशोध-विरोधी सुरक्षा",
              description: "शिकायत दर्ज करने की प्रक्रिया, धारा 11 के तहत 90-दिवसीय जांच समयसीमा, धारा 16 के तहत पूर्ण गोपनीयता, और पीड़ित कर्मचारी के लिए अंतरिम राहत प्रावधान।"
            }
          },
          quizzes: {
            "mod-posh-1": {
              title: "पॉश अधिनियम मूल बातें एवं व्यवहार जागरूकता परीक्षा",
              questions: [
                {
                  id: "q1",
                  question: "पॉश अधिनियम 2013 के तहत, निम्नलिखित में से किसे कानूनी रूप से 'कार्यस्थल' (Workplace) माना जाता है?",
                  options: [
                    "कार्यालय समय के दौरान केवल अपनी डेस्क या वर्कस्टेशन",
                    "रोजगार के दौरान या काम के सिलसिले में कर्मचारी द्वारा दौरा किया गया कोई भी स्थान, जिसमें आधिकारिक कैब, क्लाइंट मीटिंग और वर्क-फ्रॉम-होम शामिल है",
                    "केवल वे स्थान जहाँ कंपनी के बोर्ड डायरेक्टर शारीरिक रूप से उपस्थित हों",
                    "केवल रजिस्टर्ड मुख्य कॉर्पोरेट मुख्यालय"
                  ],
                  explanation: "अधिनियम 'विस्तारित कार्यस्थल' (Extended Workplace) सिद्धांत को अपनाता है: रोजगार के दौरान दौरा किया गया कोई भी स्थान, नियोक्ता द्वारा प्रदान किया गया परिवहन, और वर्चुअल प्लेटफ़ॉर्म (Slack, Teams, Zoom) कानूनी रूप से कार्यस्थल हैं।"
                },
                {
                  id: "q2",
                  question: "एक मैनेजर किसी जूनियर कर्मचारी को व्यक्तिगत अनुग्रह के बदले में उच्च रेटिंग या पदोन्नति का वादा करता है। यह यौन उत्पीड़न का कौन सा रूप है?",
                  options: [
                    "अनौपचारिक मैत्रीपूर्ण मार्गदर्शन",
                    "क्विड प्रो क्वो (बदले में लाभ का उत्पीड़न)",
                    "केवल अमित्र कार्य वातावरण",
                    "सामान्य कार्यालयी मज़ाक"
                  ],
                  explanation: "'क्विड प्रो क्वो' (Quid Pro Quo - कुछ के बदले कुछ) तब होता है जब पदोन्नति, मूल्यांकन, या करियर के अवसर अवांछित व्यक्तिगत या यौन अनुग्रह पर आधारित किए जाते हैं।"
                },
                {
                  id: "q3",
                  question: "पॉश नियमों के तहत यौन उत्पीड़न के आरोप की जांच करते समय, 'इरादा बनाम प्रभाव' (Intent vs Impact) के संबंध में कानूनी मानक क्या है?",
                  options: [
                    "यदि प्रेषक ने दावा किया कि 'यह केवल एक मज़ाक था', तो इसे उत्पीड़न नहीं माना जा सकता",
                    "केवल शारीरिक कृत्य ही मान्य हैं; मौखिक टिप्पणियों की कोई सुनवाई नहीं होती",
                    "पीड़ित व्यक्ति पर पड़ा वास्तविक प्रभाव प्राथमिक है; दुर्भावनापूर्ण इरादे की कमी अवांछित व्यवहार को सही नहीं ठहराती",
                    "उत्पीड़न केवल तभी साबित होता है जब कम से कम तीन पुरुष गवाह इसकी पुष्टि करें"
                  ],
                  explanation: "पॉश न्यायशास्त्र के अनुसार, पीड़ित पर पड़े प्रभाव को प्राथमिकता दी जाती है। भले ही किसी का इरादा 'मज़ाक' करने का रहा हो, अवांछित व्यवहार कानूनी रूप से प्रतिबंधित है।"
                },
                {
                  id: "q4",
                  question: "कॉर्पोरेट मैसेजिंग (Slack, Teams, Email, WhatsApp) में कौन सा डिजिटल कृत्य पॉश का उल्लंघन करता है?",
                  options: [
                    "कार्य समय के दौरान स्प्रिंट टिकट और मीटिंग लिंक साझा करना",
                    "बिना सहमति के यौन संकेत वाले मीम्स, अश्लील चुटकुले भेजना, या किसी के शरीर/पहनावे पर अनुचित व्यक्तिगत टिप्पणियां करना",
                    "ऑफिस समय के बाद किसी सहकर्मी को गिटहब कोड समीक्षा में टैग करना",
                    "आधिकारिक ईमेल के माध्यम से कार्य रिपोर्ट मांगना"
                  ],
                  explanation: "सहकर्मी की सहमति के बिना आपत्तिजनक चुटकुले, तस्वीरें, या व्यक्तिगत टिप्पणियां भेजना पॉश और कॉर्पोरेट आईटी नीति दोनों का गंभीर उल्लंघन है।"
                }
              ]
            }
          }
        },

        hinglish: {
          title: "POSH: Workplace par Sexual Harassment ki Roktham (Corporate Compliance)",
          tagline: "POSH Act 2013, employee rights, harassment ki pehchan, bystander intervention (4Ds), aur Internal Committee (IC) complaint rules par based complete corporate training program.",
          category: "Corporate Compliance",
          level: "Har Employee ke Liye",
          skills: ["POSH Act 2013", "Workplace Sensitivity", "Hostile Work Environment Rokna", "Bystander Intervention (4D)", "Internal Committee (IC) Redressal"],
          modules: {
            "mod-posh-1": {
              title: "POSH Act 2013 Framework & Harassment ki Legal Definition",
              description: "POSH Act 2013 ka essential introduction. Harassment ki legal definition, 'Extended Workplace' doctrine (remote work, client travel, virtual calls), aur Quid Pro Quo vs Hostile Work Environment ka difference seekhein."
            },
            "mod-posh-2": {
              title: "Workplace Misconduct ki Pehchan aur Bystander Intervention (4D Strategy)",
              description: "Unwelcome behavior, inappropriate digital comments, aur bystander intervention ke 4D framework (Direct, Distract, Delegate, Delay) ki practical understanding."
            },
            "mod-posh-3": {
              title: "Internal Committee (IC) Complaint Filing & Retaliation-Se-Suraksha",
              description: "IC me complaint lodge karne ka safe tarika, Section 11 ke 90-day inquiry rules, Section 16 non-disclosure confidentiality, aur interim safety transfers."
            }
          },
          quizzes: {
            "mod-posh-1": {
              title: "POSH Act Fundamentals aur Behavioral Awareness Quiz",
              questions: [
                {
                  id: "q1",
                  question: "POSH Act 2013 ke tehat, kanooni roop se kis jagah ko 'Workplace' maana jata hai?",
                  options: [
                    "Sirf office hours ke dauran apni physical office desk ya cubicle",
                    "Employment ke silsile me visit ki gayi koi bhi jagah, including office cab/travel, client dinner, aur Work-From-Home / Slack / WhatsApp",
                    "Sirf wahi location jahan company ke top directors baithe hon",
                    "Sirf company ka registered main headquarter"
                  ],
                  explanation: "POSH Act 'Extended Workplace' doctrine ko follow karta hai: job ke connection me employee jahan bhi jaye (office cab, client meetings, official dinner, virtual platforms), wo sab legally workplace hai."
                },
                {
                  id: "q2",
                  question: "Ek manager kisi junior colleague ko romantic favors ke badle high appraisal rating ya promotion ka promise karta hai. Yeh harassment ka kaun sa form hai?",
                  options: [
                    "Friendly informal mentorship",
                    "Quid Pro Quo harassment (Fayde ke badle favor demand karna)",
                    "Sirf normal hostile environment",
                    "Casual office banter"
                  ],
                  explanation: "'Quid Pro Quo' (Latin: this for that) ka matlab hai jab appraisal, promotion ya project assignment ko kisi unwelcome romantic/sexual favor se link kiya jaye."
                },
                {
                  id: "q3",
                  question: "POSH complaint me 'Intent vs Impact' (irada vs prabhav) ka kanooni niyam kya hai?",
                  options: [
                    "Agar sender ne bola 'mera to sirf mazaak tha', to harassment nahi maana jayega",
                    "Sirf physical action count hota hai, baaton ka koi matlab nahi",
                    "Victim par padne wala prabhav (impact) primary hota hai; 'sirf mazaak tha' bolne se unwelcome behavior lawful nahi ban jata",
                    "Harassment tabhi mana jata hai jab 3 male witnesses confirm karein"
                  ],
                  explanation: "POSH law me victim par kya impact pada wo sabse important hai. Kisi ka kehna ki 'mera irada galat nahi tha' ya 'it was just a joke' unacceptable unwelcome behavior ko excuse nahi karta."
                },
                {
                  id: "q4",
                  question: "Corporate messaging (Slack, MS Teams, Email, WhatsApp) me kaun sa action POSH rules ka violation karta hai?",
                  options: [
                    "Office hours me sprint tickets aur meeting links share karna",
                    "Unsolicited suggestive memes bhejna, adult jokes forward karna, ya colleague ke body/clothes par unsolicited personal comments karna",
                    "Late night kisi colleague ko code review ke liye GitHub PR par tag karna",
                    "Official email par project deliverables ki progress update maangna"
                  ],
                  explanation: "Bina consent ke kisi colleague ko suggestive messages, memes ya appearance par inappropriate remarks bhejna POSH Act aur IT governance dono ka severe violation hai."
                }
              ]
            }
          }
        }
      },

      "prog-fullstack": {
        hi: {
          title: "फुल-स्टैक वेब डेवलपमेंट बूटकैंप",
          tagline: "आधुनिक रिएक्ट, नोड.जेएस, पोस्टग्रेएसक्यूएल और उत्पादन-ग्रेड क्लाउड एपीआई के साथ पूर्ण-स्टैक वेब एप्लिकेशन बनाना सीखें।",
          category: "तकनीकी एवं वेब",
          level: "शुरुआती से इंटरमीडिएट"
        },
        hinglish: {
          title: "Full-Stack Web Development Bootcamp",
          tagline: "Modern React, Node.js, PostgreSQL aur production cloud APIs ke saath real-world web applications banana seekhein.",
          category: "Tech & Web",
          level: "Beginner se Intermediate"
        }
      },

      "prog-ai-ml": {
        hi: {
          title: "व्यावहारिक एआई एवं मशीन लर्निंग इंजीनियरिंग",
          tagline: "पायथन, पांडास, स्किकिट-लर्न और आधुनिक न्यूरल नेटवर्क के साथ मशीन लर्निंग और जनरेटिव एआई मॉडल विकसित करें।",
          category: "आर्टिफिशियल इंटेलिजेंस",
          level: "इंटरमीडिएट"
        },
        hinglish: {
          title: "Practical AI & Machine Learning Engineering",
          tagline: "Python, Pandas, Scikit-Learn aur modern Neural Networks ke saath production ML models build karein.",
          category: "AI & Data Science",
          level: "Intermediate"
        }
      },

      "prog-cybersecurity": {
        hi: {
          title: "एंटरप्राइज साइबर सुरक्षा एवं खतरा रक्षा",
          tagline: "OWASP टॉप 10, नेटवर्क सुरक्षा, प्रवेश परीक्षण और क्लाउड सुरक्षा सर्वोत्तम प्रथाओं के साथ कॉर्पोरेट नेटवर्क की सुरक्षा करें।",
          category: "साइबर सुरक्षा",
          level: "उन्नत"
        },
        hinglish: {
          title: "Enterprise Cybersecurity & Threat Defense",
          tagline: "OWASP Top 10, Network Penetration Testing aur Cloud Infrastructure ko cyber attacks se secure karna seekhein.",
          category: "Cybersecurity",
          level: "Advanced"
        }
      }
    };
  }

  // Get current active language code ('en' | 'hi' | 'hinglish')
  getLanguage() {
    return this.currentLang;
  }

  // Simple string translator
  t(key, fallback = "") {
    const langDict = this.translations[this.currentLang] || this.translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English
    if (this.translations.en && this.translations.en[key] !== undefined) {
      return this.translations.en[key];
    }
    return fallback || key;
  }

  // Switch language and trigger instant reactive UI update
  setLanguage(langCode) {
    if (!['en', 'hi', 'hinglish'].includes(langCode)) return;
    this.currentLang = langCode;
    localStorage.setItem('learnpulse_lang', langCode);

    // Save to AppState user preferences if available
    if (window.appState && window.appState.user) {
      window.appState.user.language = langCode;
      if (typeof window.appState.save === 'function') window.appState.save();
    }

    // Update HTML root lang attribute
    document.documentElement.lang = (langCode === 'hi') ? 'hi' : 'en';

    // Update top bar labels & checkmarks
    this.updateHeaderDropdown();

    // Translate all static data-i18n DOM elements
    this.translateDomElements();

    // Re-render current application view (Catalog, Learning, Dashboard, etc.)
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }

    // If Quiz is currently open, dynamically update question text and options
    if (window.quizController && typeof window.quizController.renderCurrentQuestion === 'function') {
      const modal = document.getElementById("quizModal");
      if (modal && !modal.classList.contains("hidden")) {
        window.quizController.renderCurrentQuestion();
      }
    }

    // If POSH Helpdesk is open, refresh modal
    if (window.poshHelpdeskManager && typeof window.poshHelpdeskManager.renderModal === 'function') {
      const pModal = document.getElementById("poshHelpdeskModal");
      if (pModal && !pModal.classList.contains("hidden")) {
        window.poshHelpdeskManager.renderModal();
      }
    }

    // Show toast feedback
    const langMeta = this.languages.find(l => l.code === langCode);
    const toastPrefix = this.t('lang_toast', 'Platform language updated to:');
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(`🌐 ${toastPrefix} ${langMeta ? langMeta.label : langCode.toUpperCase()}`, "success");
    }

    // Dispatch global event for custom components
    window.dispatchEvent(new CustomEvent('app:language-changed', {
      detail: { language: langCode }
    }));
  }

  toggleDropdown() {
    const menu = document.getElementById("langSwitcherMenu");
    if (menu) {
      menu.classList.toggle("hidden");
    }
  }

  closeDropdown() {
    const menu = document.getElementById("langSwitcherMenu");
    if (menu) {
      menu.classList.add("hidden");
    }
  }

  updateHeaderDropdown() {
    const label = document.getElementById("currentLangLabel");
    if (label) {
      const activeObj = this.languages.find(l => l.code === this.currentLang) || this.languages[0];
      label.textContent = activeObj.flag;
    }

    // Update checkmark indicators in dropdown
    document.querySelectorAll("[data-lang-option]").forEach(el => {
      const code = el.getAttribute("data-lang-option");
      const check = el.querySelector(".lang-check-icon");
      if (check) {
        if (code === this.currentLang) {
          check.classList.remove("hidden");
          el.classList.add("bg-[#dd1f36]/15", "text-[#dd1f36]", "font-bold");
        } else {
          check.classList.add("hidden");
          el.classList.remove("bg-[#dd1f36]/15", "text-[#dd1f36]", "font-bold");
        }
      }
    });
  }

  translateDomElements() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translated = this.t(key);
      if (translated) {
        el.textContent = translated;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translated = this.t(key);
      if (translated) {
        el.placeholder = translated;
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const translated = this.t(key);
      if (translated) {
        el.title = translated;
      }
    });
  }

  // =========================================================================
  // VERNACULAR CURRICULUM & QUIZ ACCESSORS
  // =========================================================================

  getProgramTitle(program) {
    if (!program) return "";
    if (this.currentLang === 'en') return program.title;
    const pOverride = this.coursesData[program.id];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].title) {
      return pOverride[this.currentLang].title;
    }
    return program.title;
  }

  getProgramTagline(program) {
    if (!program) return "";
    if (this.currentLang === 'en') return program.tagline;
    const pOverride = this.coursesData[program.id];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].tagline) {
      return pOverride[this.currentLang].tagline;
    }
    return program.tagline;
  }

  getProgramSkills(program) {
    if (!program || !Array.isArray(program.skills)) return [];
    if (this.currentLang === 'en') return program.skills;
    const pOverride = this.coursesData[program.id];
    if (pOverride && pOverride[this.currentLang] && Array.isArray(pOverride[this.currentLang].skills)) {
      return pOverride[this.currentLang].skills;
    }
    return program.skills;
  }

  getModuleTitle(programId, module) {
    if (!module) return "";
    if (this.currentLang === 'en') return module.title;
    const pOverride = this.coursesData[programId];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].modules) {
      const mData = pOverride[this.currentLang].modules[module.id];
      if (mData && mData.title) return mData.title;
    }
    return module.title;
  }

  getModuleDescription(programId, module) {
    if (!module) return "";
    if (this.currentLang === 'en') return module.description;
    const pOverride = this.coursesData[programId];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].modules) {
      const mData = pOverride[this.currentLang].modules[module.id];
      if (mData && mData.description) return mData.description;
    }
    return module.description;
  }

  getQuizTitle(programId, moduleId, defaultTitle) {
    if (this.currentLang === 'en') return defaultTitle;
    const pOverride = this.coursesData[programId];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].quizzes) {
      const qData = pOverride[this.currentLang].quizzes[moduleId];
      if (qData && qData.title) return qData.title;
    }
    return defaultTitle;
  }

  // Deep question and option translation
  getLocalizedQuestion(programId, moduleId, question) {
    if (!question) return question;
    if (this.currentLang === 'en') return question;

    const pOverride = this.coursesData[programId];
    if (pOverride && pOverride[this.currentLang] && pOverride[this.currentLang].quizzes) {
      const qData = pOverride[this.currentLang].quizzes[moduleId];
      if (qData && Array.isArray(qData.questions)) {
        const found = qData.questions.find(q => q.id === question.id);
        if (found) {
          // Merge translated question text, options, and explanation while retaining original indices
          return {
            ...question,
            question: found.question || question.question,
            explanation: found.explanation || question.explanation,
            // Map original option texts if translated options provided
            shuffledOptions: (question.shuffledOptions || []).map(opt => ({
              ...opt,
              text: (found.options && found.options[opt.originalIndex] !== undefined)
                ? found.options[opt.originalIndex]
                : opt.text
            }))
          };
        }
      }
    }
    return question;
  }
}

// Global initialization
window.i18n = new I18nManager();

// Dismiss language switcher when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("#langSwitcherDropdown")) {
    window.i18n.closeDropdown();
  }
});
