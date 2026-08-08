// ============================================================
// CONTENT TRANSLATIONS
// Translates the shorter, high-visibility fields from content.js / physicians.js:
// service names + short descriptions, symptom names + descriptions, physician
// titles, FAQ questions + answers, "why choose us" cards, and career titles.
//
// NOTE: Long clinical text (full service descriptions, physician bios, the
// about-us story, and CHARM Clinic details) is intentionally NOT translated
// here. Machine-translating dense medical paragraphs into 8 languages without
// a native clinical reviewer checking each one is a real accuracy risk for a
// healthcare site. Those fields automatically display in English via the
// fallback helper below until a reviewed translation is added — nothing
// breaks, it just shows English there. Recommend a native-speaking staff
// member or professional medical translator review these before replacing
// the English fallback.
// ============================================================

// tc(lang, category, key, field, fallback)
// Looks up a translated content field; falls back to the English value
// (passed in from the component) if no translation exists for that language.
export function tc(
  lang: string,
  category: string,
  key: string | number,
  field: string,
  fallback: string
): string {
  return (
    (CONTENT_TRANSLATIONS[lang] &&
      CONTENT_TRANSLATIONS[lang][category] &&
      CONTENT_TRANSLATIONS[lang][category][key] &&
      CONTENT_TRANSLATIONS[lang][category][key][field]) ||
    fallback
  );
}

export const CONTENT_TRANSLATIONS: Record<string, any> = {
  hi: {
    services: {
      "cardiology-consultation": { name: "कार्डियोलॉजी परामर्श", short: "हमारी कार्डियोलॉजी टीम द्वारा व्यापक हृदय स्वास्थ्य मूल्यांकन।", long: "हृदय संबंधी परामर्श सफल कार्डियक देखभाल की पहली सीढ़ी है और चिकित्सा उपचार का सबसे महत्वपूर्ण पहलू है। यह मरीजों के लिए अपनी हृदय संबंधी समस्याओं और वर्तमान शिकायतों पर चर्चा करने, जोखिमों और जटिलताओं को समझने, और जोखिम कारकों को संशोधित करने में मदद के लिए सुझावों के साथ एक संपूर्ण जोखिम मूल्यांकन प्राप्त करने का अवसर है।" },
      "exercise-stress-echo": { name: "एक्सरसाइज स्ट्रेस इकोकार्डियोग्राम", short: "अल्बर्टा का पहला ऑनसाइट एक्सरसाइज स्ट्रेस इको प्रोग्राम।", long: "एक्सरसाइज स्ट्रेस इको टेस्ट में ट्रेडमिल पर व्यायाम करना शामिल है जबकि आपकी बारीकी से निगरानी की जाती है। यह निर्धारित करने में मदद करता है कि आपका हृदय गतिविधि को कितनी अच्छी तरह सहन करता है और हृदय कार्य का मूल्यांकन करता है। यह विधि थैलियम स्ट्रेस टेस्ट से अधिक विशिष्ट है, विकिरण जोखिम के बिना। कृपया आरामदायक कपड़े और रनिंग शूज़ पहनें, और परीक्षा के दिन अपनी छाती पर कोई क्रीम, लोशन, या तेल न लगाएं।" },
      "internal-medicine": { name: "इंटरनल मेडिसिन", short: "जटिल और पुरानी स्थितियों के लिए संपूर्ण व्यक्ति देखभाल।", long: "हमारी इंटरनल मेडिसिन टीम जटिल, पुरानी, और मल्टी-सिस्टम स्थितियों के लिए समन्वित देखभाल प्रदान करती है, कार्डियोलॉजी और एंडोक्राइनोलॉजी के साथ मिलकर काम करते हुए यह सुनिश्चित करती है कि आपकी सेहत के हर पहलू पर विचार किया जाए।" },
      "endocrinology": { name: "एंडोक्राइनोलॉजी", short: "मधुमेह, थायरॉइड, और हार्मोनल स्वास्थ्य।", long: "जटिल डायबिटीज़, यंग टाइप 2 डायबिटीज़, हाइपोथायरॉइडिज़्म, हाइपरथायरॉइडिज़्म, हाइपरपैराथायरॉइडिज़्म, PCOS, एमेनोरिया, हिर्सुटिज़्म, एड्रेनल रोग, और पिट्यूटरी विकारों का प्रबंधन हमारे एंडोक्राइनोलॉजी विशेषज्ञों द्वारा किया जाता है।" },
      "ecg": { name: "इलेक्ट्रोकार्डियोग्राम (ECG)", short: "आपके हृदय की विद्युत गतिविधि को रिकॉर्ड करता है।", long: "ECG हृदय की विद्युत गतिविधि को रिकॉर्ड करता है। हृदय छोटे विद्युत आवेग उत्पन्न करता है जो हृदय की मांसपेशी में फैलते हैं और इसे संकुचित करते हैं; इन आवेगों को ECG मशीन द्वारा पता लगाया जा सकता है। धड़कन या सीने में दर्द जैसे लक्षणों का कारण खोजने में मदद के लिए आपका ECG किया जा सकता है।" },
      "holter-monitoring": { name: "होल्टर मॉनिटरिंग", short: "24-घंटे+ हृदय ताल निगरानी।", long: "होल्टर मॉनिटरिंग का उपयोग हृदय ताल गड़बड़ी का निदान करने के लिए किया जाता है, विशेष रूप से धड़कन या चक्कर आने के कारण का पता लगाने के लिए। आप अपनी छाती पर इलेक्ट्रोड से जुड़ा एक छोटा रिकॉर्डिंग डिवाइस पहनते हैं ताकि 24 घंटे या उससे अधिक समय तक आपकी हृदय गति और ताल की रीडिंग प्राप्त की जा सके, जिसका बाद में विश्लेषण करके किसी भी अतालता का कारण निर्धारित किया जाता है।" },
      "echocardiography": { name: "इकोकार्डियोग्राफी", short: "हृदय की संरचना और कार्य की अल्ट्रासाउंड इमेजिंग।", long: "इकोकार्डियोग्राफी का उपयोग कुछ हृदय रोगों के निदान के लिए किया जाता है। यह हृदय रोग के लिए सबसे व्यापक रूप से उपयोग किए जाने वाले डायग्नोस्टिक टेस्ट में से एक है — एक इकोकार्डियोग्राम आपके हृदय की विद्युत गतिविधि को ग्राफ पेपर पर रिकॉर्ड कर सकता है।" },
      "carotid-ultrasound": { name: "कैरोटिड अल्ट्रासाउंड", short: "स्ट्रोक जोखिम मूल्यांकन के लिए कैरोटिड धमनियों की इमेजिंग।", long: "कैरोटिड अल्ट्रासाउंड इमेजिंग गर्दन में कैरोटिड धमनियों के माध्यम से रक्त प्रवाह का आकलन करती है, जो प्लाक निर्माण और स्ट्रोक जोखिम कारकों की पहचान में मदद करती है।" },
      "myocardial-perfusion-imaging": { name: "मायोकार्डियल परफ्यूज़न इमेजिंग", short: "हृदय की मांसपेशी में रक्त प्रवाह की विस्तृत इमेजिंग।", long: "मायोकार्डियल परफ्यूज़न इमेजिंग हृदय की मांसपेशी में रक्त प्रवाह का मूल्यांकन करती है, जो कम रक्त संचार से प्रभावित क्षेत्रों की पहचान में मदद करती है।" },
      "ambulatory-bp-monitoring": { name: "24-घंटे एम्बुलेटरी बीपी मॉनिटरिंग", short: "आपके सामान्य दिन के दौरान मापा गया रक्तचाप।", long: "एम्बुलेटरी ब्लड प्रेशर मॉनिटरिंग तब होती है जब आपका रक्तचाप आपके सामान्य दैनिक जीवन के दौरान चलते-फिरते मापा जाता है। यह हृदय जोखिम मूल्यांकन का एक सामान्य और नियमित हिस्सा है।" },
    },
    symptoms: {
      "Chest Pain": { name: "सीने में दर्द", desc: "एक सामान्य लक्षण जो हृदय की कई स्थितियों का संकेत दे सकता है।" },
      "Shortness of Breath": { name: "सांस फूलना", desc: "गतिविधि के दौरान या आराम के समय सांस लेने में कठिनाई हृदय या फेफड़ों की स्थिति का संकेत हो सकती है।" },
      "Palpitations": { name: "धड़कन", desc: "तेज़, फड़फड़ाहट, या 'धड़कन' महसूस होना।" },
      "Dizziness / Lightheadedness": { name: "चक्कर आना / हल्कापन", desc: "हृदय ताल गड़बड़ी या रक्तचाप में बदलाव से संबंधित हो सकता है।" },
      "Fatigue": { name: "थकान", desc: "अस्पष्ट या लगातार थकान कभी-कभी हृदय कारणों की ओर इशारा कर सकती है।" },
      "Swelling (Edema)": { name: "सूजन (एडिमा)", desc: "पैरों या टखनों में तरल पदार्थ जमा होना हृदय कार्य समस्याओं का संकेत हो सकता है।" },
    },
    whyChoose: {
      "A Regional First": { title: "क्षेत्रीय प्रथम", desc: "अल्बर्टा में ऑनसाइट एक्सरसाइज स्ट्रेस इकोकार्डियोग्राम प्रदान करने वाला पहला क्लिनिक।" },
      "Multilingual Care": { title: "बहुभाषी देखभाल", desc: "हमारी टीम अंग्रेज़ी, पंजाबी, हिंदी, उर्दू, पोलिश, यूक्रेनी, और अधिक बोलती है।" },
      "Complete Diagnostics": { title: "संपूर्ण डायग्नोस्टिक्स", desc: "एक ही यात्रा में परामर्श और परीक्षण — कोई अलग इमेजिंग केंद्र नहीं।" },
      "Coordinated Team": { title: "समन्वित टीम", desc: "कार्डियोलॉजी, इंटरनल मेडिसिन, और एंडोक्राइनोलॉजी एक साझा रिकॉर्ड पर।" },
    },
    careers: {
      "Cardiologist": { title: "कार्डियोलॉजिस्ट" },
      "Internal Medicine Physician": { title: "इंटरनल मेडिसिन चिकित्सक" },
      "Endocrinologist": { title: "एंडोक्राइनोलॉजिस्ट" },
      "Sonographer": { title: "सोनोग्राफर" },
      "Heart Failure Nurse / LPN": { title: "हार्ट फेलियर नर्स / LPN" },
    },
    physicians: {
      "anmol-kapoor": { title: "संस्थापक — कार्डियोलॉजी और इंटरनल मेडिसिन", bio: "प्रैक्टिस के संस्थापक और अल्बर्टा कार्डियोलॉजी में एक अग्रणी आवाज़, डॉ. कपूर ने क्षेत्र का पहला ऑनसाइट एक्सरसाइज स्ट्रेस इकोकार्डियोग्राम प्रोग्राम स्थापित किया।" },
      "ravi-varshney": { title: "कार्डियोलॉजी और इंटरनल मेडिसिन", bio: "डॉ. वर्षनेय व्यापक कार्डियोलॉजी और इंटरनल मेडिसिन परामर्श प्रदान करते हैं, समन्वित, संपूर्ण-रोगी देखभाल पर ध्यान केंद्रित करते हुए।" },
      "ali-debek": { title: "इंटर्निस्ट / कार्डियोलॉजिस्ट", bio: "डॉ. डेबेक हृदय संबंधी समस्याओं और बीमारियों का निदान और उपचार करते हैं, रोगी परीक्षाओं और चल रहे थेरेपी व रोग प्रबंधन कार्यक्रमों को विकसित करने में व्यापक अनुभव के साथ। मुख्य देखभाल क्षेत्र: हार्ट फेलियर, सीने में दर्द/एंजाइना, हाइपरटेंशन, कोरोनरी आर्टरी डिजीज़, अतालता, और स्ट्रेस टेस्टिंग।" },
      "lovpreet-mangat": { title: "इंटरनल मेडिसिन", bio: "डॉ. मंगत इंटरनल मेडिसिन परामर्श और जटिल तथा पुरानी स्थितियों का समन्वित प्रबंधन प्रदान करते हैं।" },
      "anwar-jelani": { title: "इंटरनल मेडिसिन और कार्डियोलॉजी", bio: "डॉ. जेलानी हमारे मीडो माइल्स स्थान पर इंटरनल मेडिसिन और कार्डियोलॉजी परामर्श प्रदान करते हैं।" },
      "muhammed-dhalla": { title: "पीडियाट्रिक्स और रुमेटोलॉजी", bio: "डॉ. ढल्ला हमारे मीडो माइल्स स्थान पर पीडियाट्रिक और रुमेटोलॉजी परामर्श प्रदान करते हैं।" },
      "faisal-hasan": { title: "एंडोक्राइनोलॉजी और मेटाबॉलिज्म", bio: "डॉ. हसन ने यूके में अपनी ट्रेनिंग पूरी की, बाद में रॉयल यूनाइटेड हॉस्पिटल बाथ में एंडोक्राइनोलॉजी के लीड और ब्रिस्टल में न्यूरोएंडोक्राइनोलॉजी के लीड के रूप में कार्य किया। उन्हें जटिल डायबिटीज़, एड्रेनल व पिट्यूटरी विकारों, और PCOS के प्रबंधन में व्यापक अनुभव है, युवा-आयु टाइप 2 डायबिटीज़ में विशेष रुचि के साथ। उन्होंने यूरोपियन जर्नल ऑफ एंडोक्राइनोलॉजी में प्रकाशित किया है और कई एंडोक्राइन व मेडिकल जर्नलों के संपादक और पीयर रिव्यूअर हैं।" },
      "prafull-parekh": { title: "इंटरनल मेडिसिन", bio: "डॉ. परेख दशकों के नैदानिक अनुभव के साथ इंटरनल मेडिसिन परामर्श प्रदान करते हैं।" },
    },
    locations: {
      "North East": { tag: "नॉर्थ ईस्ट", name: "नॉर्थ ईस्ट क्लिनिक" },
      "Meadow Miles": { tag: "मीडो माइल्स", name: "मीडो माइल्स क्लिनिक" },
    },
    concerns: {
      "general-cardiology": { label: "सामान्य कार्डियोलॉजी" },
      "arrhythmia": { label: "अतालता / हृदय ताल" },
      "stress-testing": { label: "स्ट्रेस टेस्टिंग / सीने में दर्द" },
      "internal-medicine": { label: "सामान्य इंटरनल मेडिसिन" },
      "endocrinology": { label: "एंडोक्राइनोलॉजी / डायबिटीज़ / थायरॉइड" },
      "rheumatology": { label: "रुमेटोलॉजी" },
      "pediatrics": { label: "पीडियाट्रिक्स" },
    },
    charmClinic: {
      info: {
        intro: "CHARM क्लिनिक अल्बर्टा का एकमात्र समुदाय-आधारित, आउटपेशेंट क्लिनिक है जो DIL Walk फाउंडेशन और ANRA Health के समर्थन और दान से एक धर्मार्थ आधार पर चलाया जाता है। क्लिनिक चिकित्सक-निर्देशित है, लेकिन रोगी देखभाल एक नर्स द्वारा प्रबंधित की जाती है। CHARM क्लिनिक टीम में हार्ट फेलियर और हार्ट ट्रांसप्लांट विशेषज्ञ, कार्डियोलॉजिस्ट, इंटरनल मेडिसिन चिकित्सक, एक हार्ट फंक्शन नर्स, एक रेस्पिरेटरी थेरेपिस्ट, और इकोकार्डियोग्राम व स्ट्रेस टेस्ट तकनीशियन शामिल हैं।",
        howItWorks: "CHARM क्लिनिक का लक्ष्य मरीजों को समुदाय में रखना और अस्पताल से दूर रखना है। जब हार्ट फेलियर का संदेह हो, तो आपका पारिवारिक चिकित्सक सीधे CHARM क्लिनिक को रेफर कर सकता है। आपको एक कार्डियोलॉजिस्ट द्वारा देखा जाएगा — निदान की पुष्टि होने के बाद, आपको स्व-प्रबंधन सहायता, रोगी शिक्षा, और दवा सहायता के लिए हार्ट फेलियर नर्स के साथ दूसरी अपॉइंटमेंट दी जाती है। दवाओं को अनुकूलित करने और अस्पताल में भर्ती होने से बचने के लिए आपको हार्ट फेलियर विशेषज्ञ द्वारा भी फॉलो किया जाएगा।",
        selfCare: "CHARM क्लिनिक में, मरीजों को एक नर्स के साथ 1:1 सेशन के माध्यम से स्व-देखभाल सिखाई जाती है, जो दैनिक वजन, तरल/सोडियम प्रतिबंध, और हार्ट फेलियर बिगड़ने के चेतावनी संकेतों को कवर करती है। मरीजों को अपनी अगली विज़िट तक ध्यान केंद्रित करने के लिए हैंडआउट्स और आपसी सहमति वाले लक्ष्य भी मिलते हैं।",
        research: "CHARM क्लिनिक अनुसंधान परीक्षणों में भी शामिल है, जिसमें एट्रियल फिब्रिलेशन मरीजों के लिए एक चल रहा परीक्षण (BRAIN-AF) और GOAL अध्ययन शामिल हैं। हम वर्तमान में दोनों परीक्षणों के लिए मरीजों की भर्ती कर रहे हैं।",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health, Advanced Cardiology Consultants and Diagnostics के काम को जारी रखता है — पश्चिमी कनाडा में एक अनूठा क्लिनिक जो एक ही छत के नीचे संपूर्ण कार्डियोपल्मोनरी जांच प्रदान करता है, जिसकी स्थापना डॉ. अनमोल एस. कपूर के मार्गदर्शन में हुई।\n\nहम अल्बर्टा में ऑनसाइट एक्सरसाइज स्ट्रेस इकोकार्डियोग्राम प्रदान करने वाला पहला क्लिनिक थे — थैलियम स्ट्रेस टेस्ट से अधिक विशिष्ट, विकिरण जोखिम के बिना। हमारी बहुभाषी टीम अंग्रेज़ी, पंजाबी, हिंदी, उर्दू, पोलिश, स्वाहिली, तागालोग, यूक्रेनी, गुजराती, और रूसी में संवाद करती है।" },
    },
    faqs: {
      0: { q: "मुझे अपनी पहली अपॉइंटमेंट में क्या लाना चाहिए?", a: "यह मददगार होगा यदि आप अपना अल्बर्टा हेल्थ कार्ड, फोटो आईडी, और अपनी वर्तमान दवाओं की सूची लाएं।" },
      1: { q: "मेरी पहली विज़िट के दौरान क्या होता है?", a: "आपके वाइटल साइन लिए जाएंगे — रक्तचाप, हृदय गति, ऊंचाई, और वज़न। चिकित्सक एक साक्षात्कार और शारीरिक परीक्षण पूरा करेंगे।" },
      2: { q: "आपके क्लिनिक के घंटे क्या हैं?", a: "हमारे नियमित क्लिनिक घंटे सोमवार से शुक्रवार सुबह 7:30 से शाम 5 बजे तक हैं।" },
      3: { q: "होल्टर मॉनिटर टेस्ट के लिए मैं कैसे तैयारी करूं?", a: "परीक्षा से 24 घंटे पहले आपको कैफीन-मुक्त रहने की आवश्यकता होगी — इसमें कॉफी, सोडा, चाय और चॉकलेट शामिल हैं।" },
    },
  },

  pa: {
    services: {
      "cardiology-consultation": { name: "ਕਾਰਡੀਓਲੋਜੀ ਸਲਾਹ", short: "ਸਾਡੀ ਕਾਰਡੀਓਲੋਜੀ ਟੀਮ ਦੁਆਰਾ ਵਿਆਪਕ ਦਿਲ ਸਿਹਤ ਮੁਲਾਂਕਣ।", long: "ਦਿਲ ਸੰਬੰਧੀ ਸਲਾਹ ਸਫਲ ਕਾਰਡੀਅਕ ਦੇਖਭਾਲ ਦਾ ਪਹਿਲਾ ਕਦਮ ਹੈ ਅਤੇ ਮੈਡੀਕਲ ਇਲਾਜ ਦਾ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਪਹਿਲੂ ਹੈ। ਇਹ ਮਰੀਜ਼ਾਂ ਲਈ ਆਪਣੀਆਂ ਦਿਲ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ 'ਤੇ ਚਰਚਾ ਕਰਨ, ਜੋਖਮਾਂ ਨੂੰ ਸਮਝਣ, ਅਤੇ ਜੋਖਮ ਕਾਰਕਾਂ ਨੂੰ ਸੋਧਣ ਲਈ ਸੁਝਾਵਾਂ ਨਾਲ ਇੱਕ ਪੂਰਾ ਜੋਖਮ ਮੁਲਾਂਕਣ ਪ੍ਰਾਪਤ ਕਰਨ ਦਾ ਮੌਕਾ ਹੈ।" },
      "exercise-stress-echo": { name: "ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋਕਾਰਡੀਓਗਰਾਮ", short: "ਅਲਬਰਟਾ ਦਾ ਪਹਿਲਾ ਆਨਸਾਈਟ ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋ ਪ੍ਰੋਗਰਾਮ।", long: "ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋ ਟੈਸਟ ਵਿੱਚ ਟ੍ਰੈਡਮਿਲ 'ਤੇ ਕਸਰਤ ਕਰਨਾ ਸ਼ਾਮਲ ਹੈ ਜਦੋਂ ਤੁਹਾਡੀ ਨੇੜਿਓਂ ਨਿਗਰਾਨੀ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਇਹ ਢੰਗ ਥੈਲੀਅਮ ਸਟਰੈੱਸ ਟੈਸਟ ਨਾਲੋਂ ਵਧੇਰੇ ਖਾਸ ਹੈ, ਰੇਡੀਏਸ਼ਨ ਐਕਸਪੋਜ਼ਰ ਤੋਂ ਬਿਨਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਰਾਮਦਾਇਕ ਕੱਪੜੇ ਅਤੇ ਰਨਿੰਗ ਸ਼ੂਜ਼ ਪਹਿਨੋ।" },
      "internal-medicine": { name: "ਇੰਟਰਨਲ ਮੈਡੀਸਨ", short: "ਗੁੰਝਲਦਾਰ ਅਤੇ ਪੁਰਾਣੀਆਂ ਸਥਿਤੀਆਂ ਲਈ ਪੂਰੀ ਵਿਅਕਤੀ ਦੇਖਭਾਲ।", long: "ਸਾਡੀ ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਟੀਮ ਗੁੰਝਲਦਾਰ, ਪੁਰਾਣੀਆਂ, ਅਤੇ ਮਲਟੀ-ਸਿਸਟਮ ਸਥਿਤੀਆਂ ਲਈ ਤਾਲਮੇਲ ਵਾਲੀ ਦੇਖਭਾਲ ਪ੍ਰਦਾਨ ਕਰਦੀ ਹੈ, ਕਾਰਡੀਓਲੋਜੀ ਅਤੇ ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ ਨਾਲ ਮਿਲ ਕੇ ਕੰਮ ਕਰਦੇ ਹੋਏ।" },
      "endocrinology": { name: "ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ", short: "ਡਾਇਬਟੀਜ਼, ਥਾਇਰਾਇਡ, ਅਤੇ ਹਾਰਮੋਨਲ ਸਿਹਤ।", long: "ਗੁੰਝਲਦਾਰ ਡਾਇਬਟੀਜ਼, ਯੰਗ ਟਾਈਪ 2 ਡਾਇਬਟੀਜ਼, ਹਾਈਪੋਥਾਇਰਾਇਡਿਜ਼ਮ, ਹਾਈਪਰਥਾਇਰਾਇਡਿਜ਼ਮ, PCOS, ਐਡਰੀਨਲ ਰੋਗ, ਅਤੇ ਪਿਟਿਊਟਰੀ ਵਿਕਾਰਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਸਾਡੇ ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ ਮਾਹਿਰਾਂ ਦੁਆਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।" },
      "ecg": { name: "ਇਲੈਕਟਰੋਕਾਰਡੀਓਗਰਾਮ (ECG)", short: "ਤੁਹਾਡੇ ਦਿਲ ਦੀ ਬਿਜਲਈ ਗਤੀਵਿਧੀ ਰਿਕਾਰਡ ਕਰਦਾ ਹੈ।", long: "ECG ਦਿਲ ਦੀ ਬਿਜਲਈ ਗਤੀਵਿਧੀ ਰਿਕਾਰਡ ਕਰਦਾ ਹੈ। ਦਿਲ ਛੋਟੇ ਬਿਜਲਈ ਆਵੇਗ ਪੈਦਾ ਕਰਦਾ ਹੈ ਜੋ ਦਿਲ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਵਿੱਚ ਫੈਲਦੇ ਹਨ; ਇਹਨਾਂ ਦਾ ਪਤਾ ECG ਮਸ਼ੀਨ ਦੁਆਰਾ ਲਗਾਇਆ ਜਾ ਸਕਦਾ ਹੈ।" },
      "holter-monitoring": { name: "ਹੋਲਟਰ ਮਾਨੀਟਰਿੰਗ", short: "24-ਘੰਟੇ+ ਦਿਲ ਦੀ ਤਾਲ ਦੀ ਨਿਗਰਾਨੀ।", long: "ਹੋਲਟਰ ਮਾਨੀਟਰਿੰਗ ਦੀ ਵਰਤੋਂ ਦਿਲ ਦੀ ਤਾਲ ਦੀਆਂ ਗੜਬੜੀਆਂ ਦਾ ਨਿਦਾਨ ਕਰਨ ਲਈ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਤੁਸੀਂ ਆਪਣੀ ਛਾਤੀ 'ਤੇ ਇਲੈਕਟ੍ਰੋਡਸ ਨਾਲ ਜੁੜਿਆ ਇੱਕ ਛੋਟਾ ਰਿਕਾਰਡਿੰਗ ਯੰਤਰ ਪਹਿਨਦੇ ਹੋ ਤਾਂ ਜੋ 24 ਘੰਟੇ ਜਾਂ ਵੱਧ ਸਮੇਂ ਤੱਕ ਰੀਡਿੰਗ ਪ੍ਰਾਪਤ ਕੀਤੀ ਜਾ ਸਕੇ।" },
      "echocardiography": { name: "ਈਕੋਕਾਰਡੀਓਗ੍ਰਾਫੀ", short: "ਦਿਲ ਦੀ ਬਣਤਰ ਅਤੇ ਕਾਰਜ ਦੀ ਅਲਟਰਾਸਾਊਂਡ ਇਮੇਜਿੰਗ।", long: "ਈਕੋਕਾਰਡੀਓਗ੍ਰਾਫੀ ਦੀ ਵਰਤੋਂ ਕੁਝ ਦਿਲ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦੇ ਨਿਦਾਨ ਲਈ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਇਹ ਦਿਲ ਦੀ ਬਿਮਾਰੀ ਲਈ ਸਭ ਤੋਂ ਵੱਧ ਵਰਤੇ ਜਾਣ ਵਾਲੇ ਡਾਇਗਨੌਸਟਿਕ ਟੈਸਟਾਂ ਵਿੱਚੋਂ ਇੱਕ ਹੈ।" },
      "carotid-ultrasound": { name: "ਕੈਰੋਟਿਡ ਅਲਟਰਾਸਾਊਂਡ", short: "ਸਟ੍ਰੋਕ ਜੋਖਮ ਮੁਲਾਂਕਣ ਲਈ ਕੈਰੋਟਿਡ ਧਮਨੀਆਂ ਦੀ ਇਮੇਜਿੰਗ।", long: "ਕੈਰੋਟਿਡ ਅਲਟਰਾਸਾਊਂਡ ਇਮੇਜਿੰਗ ਗਰਦਨ ਵਿੱਚ ਕੈਰੋਟਿਡ ਧਮਨੀਆਂ ਰਾਹੀਂ ਖੂਨ ਦੇ ਪ੍ਰਵਾਹ ਦਾ ਮੁਲਾਂਕਣ ਕਰਦੀ ਹੈ, ਜੋ ਪਲੇਕ ਬਿਲਡਅੱਪ ਅਤੇ ਸਟ੍ਰੋਕ ਜੋਖਮ ਕਾਰਕਾਂ ਦੀ ਪਛਾਣ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ।" },
      "myocardial-perfusion-imaging": { name: "ਮਾਇਓਕਾਰਡੀਅਲ ਪਰਫਿਊਜ਼ਨ ਇਮੇਜਿੰਗ", short: "ਦਿਲ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਵਿੱਚ ਖੂਨ ਦੇ ਪ੍ਰਵਾਹ ਦੀ ਵਿਸਤ੍ਰਿਤ ਇਮੇਜਿੰਗ।", long: "ਮਾਇਓਕਾਰਡੀਅਲ ਪਰਫਿਊਜ਼ਨ ਇਮੇਜਿੰਗ ਦਿਲ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਵਿੱਚ ਖੂਨ ਦੇ ਪ੍ਰਵਾਹ ਦਾ ਮੁਲਾਂਕਣ ਕਰਦੀ ਹੈ, ਜੋ ਘਟੇ ਹੋਏ ਸਰਕੂਲੇਸ਼ਨ ਤੋਂ ਪ੍ਰਭਾਵਿਤ ਖੇਤਰਾਂ ਦੀ ਪਛਾਣ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ।" },
      "ambulatory-bp-monitoring": { name: "24-ਘੰਟੇ ਐਂਬੂਲੇਟਰੀ ਬੀਪੀ ਮਾਨੀਟਰਿੰਗ", short: "ਤੁਹਾਡੇ ਆਮ ਦਿਨ ਦੌਰਾਨ ਮਾਪਿਆ ਗਿਆ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ।", long: "ਐਂਬੂਲੇਟਰੀ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਮਾਨੀਟਰਿੰਗ ਉਦੋਂ ਹੁੰਦੀ ਹੈ ਜਦੋਂ ਤੁਹਾਡਾ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਤੁਹਾਡੇ ਆਮ ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਦੌਰਾਨ ਮਾਪਿਆ ਜਾਂਦਾ ਹੈ। ਇਹ ਦਿਲ ਦੇ ਜੋਖਮ ਮੁਲਾਂਕਣ ਦਾ ਇੱਕ ਆਮ ਹਿੱਸਾ ਹੈ।" },
    },
    symptoms: {
      "Chest Pain": { name: "ਛਾਤੀ ਵਿੱਚ ਦਰਦ", desc: "ਇੱਕ ਆਮ ਲੱਛਣ ਜੋ ਦਿਲ ਦੀਆਂ ਕਈ ਸਥਿਤੀਆਂ ਦਾ ਸੰਕੇਤ ਦੇ ਸਕਦਾ ਹੈ।" },
      "Shortness of Breath": { name: "ਸਾਹ ਦੀ ਤੰਗੀ", desc: "ਗਤੀਵਿਧੀ ਦੌਰਾਨ ਜਾਂ ਆਰਾਮ ਦੇ ਸਮੇਂ ਸਾਹ ਲੈਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਦਿਲ ਜਾਂ ਫੇਫੜਿਆਂ ਦੀ ਸਥਿਤੀ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦੀ ਹੈ।" },
      "Palpitations": { name: "ਧੜਕਣ", desc: "ਤੇਜ਼, ਫੜਫੜਾਹਟ, ਜਾਂ 'ਧੜਕਣ' ਮਹਿਸੂਸ ਹੋਣਾ।" },
      "Dizziness / Lightheadedness": { name: "ਚੱਕਰ ਆਉਣਾ / ਹਲਕਾਪਨ", desc: "ਦਿਲ ਦੀ ਤਾਲ ਵਿੱਚ ਗੜਬੜੀ ਜਾਂ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਵਿੱਚ ਤਬਦੀਲੀ ਨਾਲ ਸਬੰਧਤ ਹੋ ਸਕਦਾ ਹੈ।" },
      "Fatigue": { name: "ਥਕਾਵਟ", desc: "ਅਸਪਸ਼ਟ ਜਾਂ ਲਗਾਤਾਰ ਥਕਾਵਟ ਕਈ ਵਾਰ ਦਿਲ ਦੇ ਕਾਰਨਾਂ ਵੱਲ ਇਸ਼ਾਰਾ ਕਰ ਸਕਦੀ ਹੈ।" },
      "Swelling (Edema)": { name: "ਸੋਜ (ਐਡੀਮਾ)", desc: "ਲੱਤਾਂ ਜਾਂ ਗਿੱਟਿਆਂ ਵਿੱਚ ਤਰਲ ਇਕੱਠਾ ਹੋਣਾ ਦਿਲ ਦੇ ਕੰਮ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਦਾ ਸੰਕੇਤ ਹੋ ਸਕਦਾ ਹੈ।" },
    },
    whyChoose: {
      "A Regional First": { title: "ਖੇਤਰੀ ਪਹਿਲਾ", desc: "ਅਲਬਰਟਾ ਵਿੱਚ ਆਨਸਾਈਟ ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋਕਾਰਡੀਓਗਰਾਮ ਦੀ ਪੇਸ਼ਕਸ਼ ਕਰਨ ਵਾਲਾ ਪਹਿਲਾ ਕਲੀਨਿਕ।" },
      "Multilingual Care": { title: "ਬਹੁਭਾਸ਼ੀ ਦੇਖਭਾਲ", desc: "ਸਾਡੀ ਟੀਮ ਅੰਗਰੇਜ਼ੀ, ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਉਰਦੂ, ਪੋਲਿਸ਼, ਯੂਕਰੇਨੀ, ਅਤੇ ਹੋਰ ਬੋਲਦੀ ਹੈ।" },
      "Complete Diagnostics": { title: "ਪੂਰੀ ਡਾਇਗਨੌਸਟਿਕਸ", desc: "ਇੱਕ ਹੀ ਦੌਰੇ ਵਿੱਚ ਸਲਾਹ ਅਤੇ ਟੈਸਟਿੰਗ — ਕੋਈ ਵੱਖਰਾ ਇਮੇਜਿੰਗ ਸੈਂਟਰ ਨਹੀਂ।" },
      "Coordinated Team": { title: "ਤਾਲਮੇਲ ਵਾਲੀ ਟੀਮ", desc: "ਕਾਰਡੀਓਲੋਜੀ, ਇੰਟਰਨਲ ਮੈਡੀਸਨ, ਅਤੇ ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ ਇੱਕ ਸਾਂਝੇ ਰਿਕਾਰਡ 'ਤੇ।" },
    },
    careers: {
      "Cardiologist": { title: "ਕਾਰਡੀਓਲੋਜਿਸਟ" },
      "Internal Medicine Physician": { title: "ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਡਾਕਟਰ" },
      "Endocrinologist": { title: "ਐਂਡੋਕਰਾਈਨੋਲੋਜਿਸਟ" },
      "Sonographer": { title: "ਸੋਨੋਗ੍ਰਾਫਰ" },
      "Heart Failure Nurse / LPN": { title: "ਹਾਰਟ ਫੇਲੀਅਰ ਨਰਸ / LPN" },
    },
    physicians: {
      "anmol-kapoor": { title: "ਸੰਸਥਾਪਕ — ਕਾਰਡੀਓਲੋਜੀ ਅਤੇ ਇੰਟਰਨਲ ਮੈਡੀਸਨ", bio: "ਪ੍ਰੈਕਟਿਸ ਦੇ ਸੰਸਥਾਪਕ ਅਤੇ ਅਲਬਰਟਾ ਕਾਰਡੀਓਲੋਜੀ ਵਿੱਚ ਇੱਕ ਪ੍ਰਮੁੱਖ ਆਵਾਜ਼, ਡਾ. ਕਪੂਰ ਨੇ ਖੇਤਰ ਦਾ ਪਹਿਲਾ ਆਨਸਾਈਟ ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋਕਾਰਡੀਓਗਰਾਮ ਪ੍ਰੋਗਰਾਮ ਸਥਾਪਿਤ ਕੀਤਾ।" },
      "ravi-varshney": { title: "ਕਾਰਡੀਓਲੋਜੀ ਅਤੇ ਇੰਟਰਨਲ ਮੈਡੀਸਨ", bio: "ਡਾ. ਵਰਸ਼ਨੇ ਵਿਆਪਕ ਕਾਰਡੀਓਲੋਜੀ ਅਤੇ ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ, ਤਾਲਮੇਲ ਵਾਲੀ, ਸੰਪੂਰਨ-ਮਰੀਜ਼ ਦੇਖਭਾਲ 'ਤੇ ਧਿਆਨ ਕੇਂਦਰਿਤ ਕਰਦੇ ਹੋਏ।" },
      "ali-debek": { title: "ਇੰਟਰਨਿਸਟ / ਕਾਰਡੀਓਲੋਜਿਸਟ", bio: "ਡਾ. ਡੇਬੇਕ ਦਿਲ ਸੰਬੰਧੀ ਸਮੱਸਿਆਵਾਂ ਅਤੇ ਬਿਮਾਰੀਆਂ ਦੀ ਜਾਂਚ ਅਤੇ ਇਲਾਜ ਕਰਦੇ ਹਨ। ਮੁੱਖ ਦੇਖਭਾਲ ਖੇਤਰ: ਹਾਰਟ ਫੇਲੀਅਰ, ਛਾਤੀ ਵਿੱਚ ਦਰਦ/ਐਂਜਾਈਨਾ, ਹਾਈਪਰਟੈਨਸ਼ਨ, ਕੋਰੋਨਰੀ ਆਰਟਰੀ ਡਿਜ਼ੀਜ਼, ਅਰੀਥਮੀਆ, ਅਤੇ ਸਟਰੈੱਸ ਟੈਸਟਿੰਗ।" },
      "lovpreet-mangat": { title: "ਇੰਟਰਨਲ ਮੈਡੀਸਨ", bio: "ਡਾ. ਮੰਗਟ ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਸਲਾਹ ਅਤੇ ਗੁੰਝਲਦਾਰ ਅਤੇ ਪੁਰਾਣੀਆਂ ਸਥਿਤੀਆਂ ਦਾ ਤਾਲਮੇਲ ਵਾਲਾ ਪ੍ਰਬੰਧਨ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।" },
      "anwar-jelani": { title: "ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਅਤੇ ਕਾਰਡੀਓਲੋਜੀ", bio: "ਡਾ. ਜੇਲਾਨੀ ਸਾਡੇ ਮੀਡੋ ਮਾਈਲਸ ਸਥਾਨ 'ਤੇ ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਅਤੇ ਕਾਰਡੀਓਲੋਜੀ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।" },
      "muhammed-dhalla": { title: "ਪੀਡੀਆਟ੍ਰਿਕਸ ਅਤੇ ਰਾਇਮੈਟੋਲੋਜੀ", bio: "ਡਾ. ਢੱਲਾ ਸਾਡੇ ਮੀਡੋ ਮਾਈਲਸ ਸਥਾਨ 'ਤੇ ਪੀਡੀਆਟ੍ਰਿਕ ਅਤੇ ਰਾਇਮੈਟੋਲੋਜੀ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।" },
      "faisal-hasan": { title: "ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ ਅਤੇ ਮੈਟਾਬੋਲਿਜ਼ਮ", bio: "ਡਾ. ਹਸਨ ਨੇ ਯੂਕੇ ਵਿੱਚ ਆਪਣੀ ਸਿਖਲਾਈ ਪੂਰੀ ਕੀਤੀ, ਬਾਅਦ ਵਿੱਚ ਰਾਇਲ ਯੂਨਾਈਟਿਡ ਹਸਪਤਾਲ ਬਾਥ ਵਿੱਚ ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ ਦੇ ਲੀਡ ਵਜੋਂ ਸੇਵਾ ਕੀਤੀ। ਉਹਨਾਂ ਨੂੰ ਗੁੰਝਲਦਾਰ ਡਾਇਬਟੀਜ਼, ਐਡਰੀਨਲ ਅਤੇ ਪਿਟਿਊਟਰੀ ਵਿਕਾਰਾਂ, ਅਤੇ PCOS ਦੇ ਪ੍ਰਬੰਧਨ ਵਿੱਚ ਵਿਆਪਕ ਤਜਰਬਾ ਹੈ।" },
      "prafull-parekh": { title: "ਇੰਟਰਨਲ ਮੈਡੀਸਨ", bio: "ਡਾ. ਪਾਰੇਖ ਦਹਾਕਿਆਂ ਦੇ ਕਲੀਨਿਕਲ ਤਜਰਬੇ ਨਾਲ ਇੰਟਰਨਲ ਮੈਡੀਸਨ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।" },
    },
    locations: {
      "North East": { tag: "ਨਾਰਥ ਈਸਟ", name: "ਨਾਰਥ ਈਸਟ ਕਲੀਨਿਕ" },
      "Meadow Miles": { tag: "ਮੀਡੋ ਮਾਈਲਸ", name: "ਮੀਡੋ ਮਾਈਲਸ ਕਲੀਨਿਕ" },
    },
    concerns: {
      "general-cardiology": { label: "ਆਮ ਕਾਰਡੀਓਲੋਜੀ" },
      "arrhythmia": { label: "ਅਰੀਥਮੀਆ / ਦਿਲ ਦੀ ਤਾਲ" },
      "stress-testing": { label: "ਸਟਰੈੱਸ ਟੈਸਟਿੰਗ / ਛਾਤੀ ਦਾ ਦਰਦ" },
      "internal-medicine": { label: "ਆਮ ਇੰਟਰਨਲ ਮੈਡੀਸਨ" },
      "endocrinology": { label: "ਐਂਡੋਕਰਾਈਨੋਲੋਜੀ / ਡਾਇਬਟੀਜ਼ / ਥਾਇਰਾਇਡ" },
      "rheumatology": { label: "ਰਾਇਮੈਟੋਲੋਜੀ" },
      "pediatrics": { label: "ਪੀਡੀਆਟ੍ਰਿਕਸ" },
    },
    charmClinic: {
      info: {
        intro: "CHARM ਕਲੀਨਿਕ ਅਲਬਰਟਾ ਦਾ ਇਕਲੌਤਾ ਕਮਿਊਨਿਟੀ-ਅਧਾਰਿਤ, ਆਊਟਪੇਸ਼ੈਂਟ ਕਲੀਨਿਕ ਹੈ ਜੋ DIL Walk ਫਾਊਂਡੇਸ਼ਨ ਅਤੇ ANRA Health ਦੇ ਸਮਰਥਨ ਨਾਲ ਦਾਨੀ ਆਧਾਰ 'ਤੇ ਚਲਾਇਆ ਜਾਂਦਾ ਹੈ। ਕਲੀਨਿਕ ਡਾਕਟਰ-ਨਿਰਦੇਸ਼ਿਤ ਹੈ, ਪਰ ਮਰੀਜ਼ ਦੀ ਦੇਖਭਾਲ ਇੱਕ ਨਰਸ ਦੁਆਰਾ ਪ੍ਰਬੰਧਿਤ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
        howItWorks: "CHARM ਕਲੀਨਿਕ ਦਾ ਟੀਚਾ ਮਰੀਜ਼ਾਂ ਨੂੰ ਕਮਿਊਨਿਟੀ ਵਿੱਚ ਰੱਖਣਾ ਅਤੇ ਹਸਪਤਾਲ ਤੋਂ ਦੂਰ ਰੱਖਣਾ ਹੈ। ਤੁਹਾਡਾ ਪਰਿਵਾਰਕ ਡਾਕਟਰ ਸਿੱਧਾ CHARM ਕਲੀਨਿਕ ਨੂੰ ਰੈਫਰ ਕਰ ਸਕਦਾ ਹੈ। ਤੁਹਾਨੂੰ ਇੱਕ ਕਾਰਡੀਓਲੋਜਿਸਟ ਦੁਆਰਾ ਦੇਖਿਆ ਜਾਵੇਗਾ, ਫਿਰ ਹਾਰਟ ਫੇਲੀਅਰ ਨਰਸ ਨਾਲ ਦੂਜੀ ਅਪੌਇੰਟਮੈਂਟ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।",
        selfCare: "CHARM ਕਲੀਨਿਕ ਵਿੱਚ, ਮਰੀਜ਼ਾਂ ਨੂੰ ਇੱਕ ਨਰਸ ਨਾਲ 1:1 ਸੈਸ਼ਨ ਰਾਹੀਂ ਸਵੈ-ਦੇਖਭਾਲ ਸਿਖਾਈ ਜਾਂਦੀ ਹੈ, ਜੋ ਰੋਜ਼ਾਨਾ ਭਾਰ, ਤਰਲ/ਸੋਡੀਅਮ ਪਾਬੰਦੀਆਂ, ਅਤੇ ਚੇਤਾਵਨੀ ਸੰਕੇਤਾਂ ਨੂੰ ਕਵਰ ਕਰਦੀ ਹੈ।",
        research: "CHARM ਕਲੀਨਿਕ ਖੋਜ ਟਰਾਇਲਾਂ ਵਿੱਚ ਵੀ ਸ਼ਾਮਲ ਹੈ, ਜਿਸ ਵਿੱਚ ਐਟਰੀਅਲ ਫਾਈਬ੍ਰੀਲੇਸ਼ਨ ਮਰੀਜ਼ਾਂ ਲਈ ਇੱਕ ਚੱਲ ਰਿਹਾ ਟਰਾਇਲ (BRAIN-AF) ਅਤੇ GOAL ਅਧਿਐਨ ਸ਼ਾਮਲ ਹੈ। ਅਸੀਂ ਵਰਤਮਾਨ ਵਿੱਚ ਦੋਵਾਂ ਟਰਾਇਲਾਂ ਲਈ ਮਰੀਜ਼ਾਂ ਦੀ ਭਰਤੀ ਕਰ ਰਹੇ ਹਾਂ।",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health, Advanced Cardiology Consultants and Diagnostics ਦੇ ਕੰਮ ਨੂੰ ਜਾਰੀ ਰੱਖਦਾ ਹੈ — ਪੱਛਮੀ ਕੈਨੇਡਾ ਵਿੱਚ ਇੱਕ ਵਿਲੱਖਣ ਕਲੀਨਿਕ ਜੋ ਇੱਕ ਹੀ ਛੱਤ ਹੇਠ ਪੂਰੀ ਕਾਰਡੀਓਪਲਮੋਨਰੀ ਜਾਂਚ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ, ਜਿਸਦੀ ਸਥਾਪਨਾ ਡਾ. ਅਨਮੋਲ ਐਸ. ਕਪੂਰ ਦੀ ਅਗਵਾਈ ਹੇਠ ਹੋਈ।\n\nਅਸੀਂ ਅਲਬਰਟਾ ਵਿੱਚ ਆਨਸਾਈਟ ਐਕਸਰਸਾਈਜ਼ ਸਟਰੈੱਸ ਈਕੋਕਾਰਡੀਓਗਰਾਮ ਪ੍ਰਦਾਨ ਕਰਨ ਵਾਲਾ ਪਹਿਲਾ ਕਲੀਨਿਕ ਸੀ। ਸਾਡੀ ਬਹੁਭਾਸ਼ੀ ਟੀਮ ਅੰਗਰੇਜ਼ੀ, ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਉਰਦੂ, ਪੋਲਿਸ਼, ਸਵਾਹਿਲੀ, ਤਾਗਾਲੋਗ, ਯੂਕਰੇਨੀ, ਗੁਜਰਾਤੀ, ਅਤੇ ਰੂਸੀ ਵਿੱਚ ਗੱਲਬਾਤ ਕਰਦੀ ਹੈ।" },
    },
    faqs: {
      0: { q: "ਮੈਨੂੰ ਆਪਣੀ ਪਹਿਲੀ ਅਪੌਇੰਟਮੈਂਟ ਵਿੱਚ ਕੀ ਲਿਆਉਣਾ ਚਾਹੀਦਾ ਹੈ?", a: "ਇਹ ਮਦਦਗਾਰ ਹੋਵੇਗਾ ਜੇ ਤੁਸੀਂ ਆਪਣਾ ਅਲਬਰਟਾ ਹੈਲਥ ਕਾਰਡ, ਫੋਟੋ ਆਈਡੀ, ਅਤੇ ਆਪਣੀਆਂ ਮੌਜੂਦਾ ਦਵਾਈਆਂ ਦੀ ਸੂਚੀ ਲਿਆਓ।" },
      1: { q: "ਮੇਰੀ ਪਹਿਲੀ ਫੇਰੀ ਦੌਰਾਨ ਕੀ ਹੁੰਦਾ ਹੈ?", a: "ਤੁਹਾਡੇ ਵਾਈਟਲ ਸਾਈਨ ਲਏ ਜਾਣਗੇ — ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ, ਦਿਲ ਦੀ ਧੜਕਣ, ਕੱਦ, ਅਤੇ ਭਾਰ।" },
      2: { q: "ਤੁਹਾਡੇ ਕਲੀਨਿਕ ਦੇ ਘੰਟੇ ਕੀ ਹਨ?", a: "ਸਾਡੇ ਨਿਯਮਤ ਕਲੀਨਿਕ ਘੰਟੇ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ੁੱਕਰਵਾਰ ਸਵੇਰੇ 7:30 ਤੋਂ ਸ਼ਾਮ 5 ਵਜੇ ਤੱਕ ਹਨ।" },
      3: { q: "ਹੋਲਟਰ ਮਾਨੀਟਰ ਟੈਸਟ ਲਈ ਮੈਂ ਕਿਵੇਂ ਤਿਆਰੀ ਕਰਾਂ?", a: "ਪ੍ਰੀਖਿਆ ਤੋਂ 24 ਘੰਟੇ ਪਹਿਲਾਂ ਤੁਹਾਨੂੰ ਕੈਫੀਨ-ਮੁਕਤ ਰਹਿਣ ਦੀ ਲੋੜ ਹੋਵੇਗੀ।" },
    },
  },

  ar: {
    services: {
      "cardiology-consultation": { name: "استشارة أمراض القلب", short: "تقييمات شاملة لصحة القلب يقودها فريق أمراض القلب لدينا.", long: "استشارة القلب والأوعية الدموية هي الخطوة الأولى نحو رعاية قلبية ناجحة وأهم جانب من جوانب العلاج الطبي. إنها فرصة للمرضى لمناقشة مشاكلهم القلبية وشكاواهم الحالية، وفهم المخاطر والمضاعفات، والحصول على تقييم شامل للمخاطر مع اقتراحات للمساعدة في تعديل عوامل الخطر." },
      "exercise-stress-echo": { name: "تخطيط صدى القلب أثناء الجهد", short: "أول برنامج في ألبرتا لتخطيط صدى القلب أثناء الجهد في الموقع.", long: "يتضمن اختبار تخطيط صدى القلب أثناء الجهد ممارسة الرياضة على جهاز المشي أثناء مراقبتك عن كثب. تساعد هذه الطريقة في تحديد مدى تحمل قلبك للنشاط وتقييم وظيفة القلب. هذه الطريقة أكثر دقة من اختبار الإجهاد بالثاليوم، دون التعرض للإشعاع. يرجى ارتداء ملابس مريحة وأحذية رياضية، وعدم وضع أي كريمات أو زيوت على صدرك يوم الفحص." },
      "internal-medicine": { name: "الطب الباطني", short: "رعاية شاملة للحالات المعقدة والمزمنة.", long: "يقدم فريق الطب الباطني لدينا رعاية منسقة للحالات المعقدة والمزمنة ومتعددة الأنظمة، بالتعاون مع أمراض القلب والغدد الصماء لضمان مراعاة كل جانب من جوانب صحتك." },
      "endocrinology": { name: "الغدد الصماء", short: "السكري والغدة الدرقية والصحة الهرمونية.", long: "يدير أخصائيو الغدد الصماء لدينا داء السكري المعقد، وداء السكري من النوع الثاني المبكر، وقصور الغدة الدرقية، وفرط نشاط الغدة الدرقية، ومتلازمة تكيس المبايض، واضطرابات الغدة الكظرية والنخامية." },
      "ecg": { name: "تخطيط القلب الكهربائي (ECG)", short: "يسجل النشاط الكهربائي لقلبك.", long: "يسجل تخطيط القلب الكهربائي النشاط الكهربائي للقلب. ينتج القلب نبضات كهربائية صغيرة تنتشر عبر عضلة القلب لجعلها تنقبض؛ يمكن اكتشاف هذه النبضات بواسطة جهاز تخطيط القلب." },
      "holter-monitoring": { name: "مراقبة هولتر", short: "مراقبة إيقاع القلب لأكثر من 24 ساعة.", long: "تستخدم مراقبة هولتر لتشخيص اضطرابات إيقاع القلب، وتحديداً لإيجاد سبب الخفقان أو الدوخة. ترتدي جهاز تسجيل صغير متصل بأقطاب كهربائية على صدرك للحصول على قراءة معدل ضربات قلبك وإيقاعه لمدة 24 ساعة أو أكثر." },
      "echocardiography": { name: "تخطيط صدى القلب", short: "تصوير بالموجات فوق الصوتية لبنية القلب ووظيفته.", long: "يستخدم تخطيط صدى القلب لتشخيص أمراض القلب والأوعية الدموية. إنه أحد أكثر الاختبارات التشخيصية استخداماً لأمراض القلب." },
      "carotid-ultrasound": { name: "الموجات فوق الصوتية للشريان السباتي", short: "تصوير الشرايين السباتية لتقييم خطر السكتة الدماغية.", long: "يقيّم تصوير الشريان السباتي بالموجات فوق الصوتية تدفق الدم عبر الشرايين السباتية في الرقبة، مما يساعد في تحديد تراكم الترسبات وعوامل خطر السكتة الدماغية." },
      "myocardial-perfusion-imaging": { name: "تصوير تروية عضلة القلب", short: "تصوير مفصل لتدفق الدم إلى عضلة القلب.", long: "يقيّم تصوير تروية عضلة القلب تدفق الدم إلى عضلة القلب، مما يساعد في تحديد المناطق المتأثرة بانخفاض الدورة الدموية." },
      "ambulatory-bp-monitoring": { name: "مراقبة ضغط الدم لمدة 24 ساعة", short: "قياس ضغط الدم أثناء يومك الطبيعي.", long: "مراقبة ضغط الدم المتنقلة هي عندما يُقاس ضغط دمك أثناء تحركك في حياتك اليومية الطبيعية. إنها جزء عادي وروتيني من تقييم مخاطر القلب." },
    },
    symptoms: {
      "Chest Pain": { name: "ألم في الصدر", desc: "عرض شائع قد يشير إلى مجموعة من حالات القلب ويستدعي دائماً التقييم." },
      "Shortness of Breath": { name: "ضيق التنفس", desc: "صعوبة التنفس أثناء النشاط أو الراحة قد تكون علامة على حالة في القلب أو الرئة." },
      "Palpitations": { name: "خفقان القلب", desc: "الشعور بضربات قلب سريعة أو خافقة." },
      "Dizziness / Lightheadedness": { name: "الدوخة / الدوار", desc: "قد يكون مرتبطاً باضطرابات إيقاع القلب أو تغيرات ضغط الدم." },
      "Fatigue": { name: "التعب", desc: "التعب المستمر غير المبرر قد يشير أحياناً إلى أسباب قلبية." },
      "Swelling (Edema)": { name: "التورم (الوذمة)", desc: "احتباس السوائل في الساقين أو الكاحلين قد يكون علامة على مشاكل في وظيفة القلب." },
    },
    whyChoose: {
      "A Regional First": { title: "الأول إقليمياً", desc: "أول عيادة في ألبرتا تقدم تخطيط صدى القلب أثناء الجهد في الموقع." },
      "Multilingual Care": { title: "رعاية متعددة اللغات", desc: "يتحدث فريقنا الإنجليزية والبنجابية والهندية والأردية والبولندية والأوكرانية والمزيد." },
      "Complete Diagnostics": { title: "تشخيص كامل", desc: "استشارة وفحص في زيارة واحدة — بدون مركز تصوير منفصل." },
      "Coordinated Team": { title: "فريق منسق", desc: "أمراض القلب والطب الباطني والغدد الصماء في سجل مشترك واحد." },
    },
    careers: {
      "Cardiologist": { title: "طبيب أمراض قلب" },
      "Internal Medicine Physician": { title: "طبيب باطني" },
      "Endocrinologist": { title: "طبيب غدد صماء" },
      "Sonographer": { title: "فني تصوير بالموجات فوق الصوتية" },
      "Heart Failure Nurse / LPN": { title: "ممرضة فشل القلب" },
    },
    physicians: {
      "anmol-kapoor": { title: "المؤسس — أمراض القلب والطب الباطني", bio: "مؤسس الممارسة وصوت رائد في طب القلب في ألبرتا، أسس الدكتور كابور أول برنامج في المنطقة لتخطيط صدى القلب أثناء الجهد في الموقع." },
      "ravi-varshney": { title: "أمراض القلب والطب الباطني", bio: "يقدم الدكتور فارشني استشارات شاملة في أمراض القلب والطب الباطني، مع التركيز على رعاية منسقة وشاملة للمريض." },
      "ali-debek": { title: "طبيب باطني / أمراض قلب", bio: "يشخص الدكتور ديبك ويعالج مشاكل وأمراض القلب والأوعية الدموية. أبرز مجالات الرعاية: فشل القلب، ألم الصدر/الذبحة الصدرية، ارتفاع ضغط الدم، مرض الشريان التاجي، عدم انتظام ضربات القلب، واختبار الإجهاد." },
      "lovpreet-mangat": { title: "الطب الباطني", bio: "يقدم الدكتور مانجات استشارات الطب الباطني والإدارة المنسقة للحالات المعقدة والمزمنة." },
      "anwar-jelani": { title: "الطب الباطني وأمراض القلب", bio: "يقدم الدكتور جيلاني استشارات الطب الباطني وأمراض القلب في موقع ميدو مايلز." },
      "muhammed-dhalla": { title: "طب الأطفال وأمراض الروماتيزم", bio: "يقدم الدكتور دالا استشارات طب الأطفال وأمراض الروماتيزم في موقع ميدو مايلز." },
      "faisal-hasan": { title: "الغدد الصماء والتمثيل الغذائي", bio: "أكمل الدكتور حسن تدريبه في المملكة المتحدة، وشغل لاحقاً منصب رئيس الغدد الصماء في مستشفى رويال يونايتد باث. لديه خبرة واسعة في إدارة مرض السكري المعقد واضطرابات الغدة الكظرية والنخامية ومتلازمة تكيس المبايض." },
      "prafull-parekh": { title: "الطب الباطني", bio: "يقدم الدكتور باريخ استشارات الطب الباطني بخبرة سريرية تمتد لعقود." },
    },
    locations: {
      "North East": { tag: "نورث إيست", name: "عيادة نورث إيست" },
      "Meadow Miles": { tag: "ميدو مايلز", name: "عيادة ميدو مايلز" },
    },
    concerns: {
      "general-cardiology": { label: "أمراض القلب العامة" },
      "arrhythmia": { label: "عدم انتظام ضربات القلب" },
      "stress-testing": { label: "اختبار الإجهاد / ألم الصدر" },
      "internal-medicine": { label: "الطب الباطني العام" },
      "endocrinology": { label: "الغدد الصماء / السكري / الغدة الدرقية" },
      "rheumatology": { label: "أمراض الروماتيزم" },
      "pediatrics": { label: "طب الأطفال" },
    },
    charmClinic: {
      info: {
        intro: "عيادة CHARM هي العيادة الوحيدة المجتمعية للمرضى الخارجيين في ألبرتا، تُدار على أساس خيري بدعم وتبرعات من مؤسسة DIL Walk و ANRA Health. العيادة موجهة من قبل الأطباء، لكن رعاية المرضى تُدار من قبل ممرضة. يتكون فريق عيادة CHARM من أخصائيي فشل القلب وزراعة القلب، وأطباء القلب، وأطباء الطب الباطني، وممرضة وظائف القلب، وأخصائي جهاز تنفسي، وفنيي تخطيط صدى القلب واختبار الإجهاد.",
        howItWorks: "هدف عيادة CHARM هو مساعدة المرضى على البقاء في المجتمع وخارج المستشفى. يمكن لطبيبك العائلي الإحالة مباشرة إلى عيادة CHARM عند الاشتباه بفشل القلب. سيتم رؤيتك من قبل طبيب قلب — بعد تأكيد التشخيص، ستحصل على موعد ثانٍ مع ممرضة فشل القلب.",
        selfCare: "في عيادة CHARM، يتم تعليم المرضى الرعاية الذاتية من خلال جلسة فردية مع ممرضة، تغطي الوزن اليومي، وقيود السوائل/الصوديوم، وعلامات التحذير من تفاقم فشل القلب.",
        research: "تشارك عيادة CHARM أيضاً في التجارب البحثية، بما في ذلك تجربة جارية لمرضى الرجفان الأذيني (BRAIN-AF) ودراسة GOAL. نحن حالياً نجند مرضى لكلا التجربتين.",
      },
    },
    misc: {
      aboutStory: { text: "تواصل ANRA Health عمل Advanced Cardiology Consultants and Diagnostics — عيادة فريدة من نوعها في غرب كندا تقدم فحوصات قلبية رئوية كاملة تحت سقف واحد، تأسست تحت إشراف الدكتور أنمول إس. كابور.\n\nكنا أول عيادة في ألبرتا تقدم تخطيط صدى القلب أثناء الجهد في الموقع — أكثر دقة من اختبار الإجهاد بالثاليوم، دون التعرض للإشعاع. يتواصل فريقنا متعدد اللغات بالإنجليزية والبنجابية والهندية والأردية والبولندية والسواحيلية والتاغالوغية والأوكرانية والغوجاراتية والروسية." },
    },
    faqs: {
      0: { q: "ماذا يجب أن أحضر لموعدي الأول؟", a: "سيكون من المفيد إحضار بطاقة صحة ألبرتا الخاصة بك، هوية بصورة، وقائمة بأدويتك الحالية." },
      1: { q: "ماذا يحدث خلال زيارتي الأولى؟", a: "سيتم أخذ علاماتك الحيوية — ضغط الدم، معدل ضربات القلب، الطول، والوزن." },
      2: { q: "ما هي ساعات عمل عيادتكم؟", a: "ساعات عملنا المعتادة من 7:30 صباحاً حتى 5 مساءً، من الاثنين إلى الجمعة." },
      3: { q: "كيف أستعد لفحص جهاز هولتر؟", a: "ستحتاج إلى الامتناع عن الكافيين لمدة 24 ساعة قبل الفحص." },
    },
  },

  fr: {
    services: {
      "cardiology-consultation": { name: "Consultation en cardiologie", short: "Évaluations complètes de la santé cardiaque menées par notre équipe de cardiologie.", long: "La consultation cardiovasculaire est la première étape vers des soins cardiaques réussis et l'aspect le plus important du traitement médical. C'est l'occasion pour les patients de discuter de leurs problèmes cardiaques, de comprendre les risques et de recevoir une évaluation complète des risques avec des suggestions pour aider à modifier les facteurs de risque." },
      "exercise-stress-echo": { name: "Échocardiogramme d'effort", short: "Premier programme d'échocardiogramme d'effort sur site de l'Alberta.", long: "Le test d'échocardiogramme d'effort consiste à faire de l'exercice sur un tapis roulant pendant que vous êtes étroitement surveillé. Cette modalité est plus spécifique qu'un test d'effort au thallium, sans exposition aux radiations. Veuillez porter des vêtements confortables et des chaussures de course." },
      "internal-medicine": { name: "Médecine interne", short: "Soins globaux pour les affections complexes et chroniques.", long: "Notre équipe de médecine interne fournit des soins coordonnés pour les affections complexes, chroniques et multi-systémiques, en collaboration avec la cardiologie et l'endocrinologie." },
      "endocrinology": { name: "Endocrinologie", short: "Diabète, thyroïde, et santé hormonale.", long: "Le diabète complexe, le diabète de type 2 à début précoce, l'hypothyroïdie, l'hyperthyroïdie, le SOPK, et les troubles surrénaliens et hypophysaires sont pris en charge par nos spécialistes en endocrinologie." },
      "ecg": { name: "Électrocardiogramme (ECG)", short: "Enregistre l'activité électrique de votre cœur.", long: "Un ECG enregistre l'activité électrique du cœur. Le cœur produit de minuscules impulsions électriques qui se propagent dans le muscle cardiaque pour le faire se contracter; ces impulsions peuvent être détectées par la machine ECG." },
      "holter-monitoring": { name: "Surveillance Holter", short: "Surveillance du rythme cardiaque sur 24 heures ou plus.", long: "La surveillance Holter est utilisée pour diagnostiquer les troubles du rythme cardiaque, en particulier pour trouver la cause des palpitations ou des étourdissements. Vous portez un petit appareil d'enregistrement connecté à des électrodes sur votre poitrine pendant 24 heures ou plus." },
      "echocardiography": { name: "Échocardiographie", short: "Imagerie par ultrasons de la structure et de la fonction du cœur.", long: "L'échocardiographie est utilisée pour diagnostiquer certaines maladies cardiovasculaires. C'est l'un des tests diagnostiques les plus largement utilisés pour les maladies cardiaques." },
      "carotid-ultrasound": { name: "Échographie carotidienne", short: "Imagerie des artères carotides pour évaluer le risque d'AVC.", long: "L'imagerie par échographie carotidienne évalue le flux sanguin à travers les artères carotides du cou, aidant à identifier l'accumulation de plaque et les facteurs de risque d'AVC." },
      "myocardial-perfusion-imaging": { name: "Imagerie de perfusion myocardique", short: "Imagerie détaillée du flux sanguin vers le muscle cardiaque.", long: "L'imagerie de perfusion myocardique évalue le flux sanguin vers le muscle cardiaque, aidant à identifier les zones touchées par une circulation réduite." },
      "ambulatory-bp-monitoring": { name: "Surveillance ambulatoire de la TA sur 24h", short: "Tension artérielle mesurée pendant votre journée normale.", long: "La surveillance ambulatoire de la tension artérielle consiste à mesurer votre tension artérielle pendant que vous vaquez à vos activités quotidiennes normales. C'est une partie normale et routinière de l'évaluation du risque cardiaque." },
    },
    symptoms: {
      "Chest Pain": { name: "Douleur thoracique", desc: "Un symptôme courant pouvant indiquer diverses affections cardiaques et nécessitant toujours une évaluation." },
      "Shortness of Breath": { name: "Essoufflement", desc: "Difficulté à respirer pendant l'activité ou au repos peut être un signe d'une affection cardiaque ou pulmonaire sous-jacente." },
      "Palpitations": { name: "Palpitations", desc: "La sensation d'un battement de cœur rapide, palpitant, ou 'cognant'." },
      "Dizziness / Lightheadedness": { name: "Étourdissements / Vertiges", desc: "Peut être lié à des troubles du rythme cardiaque ou des changements de tension artérielle." },
      "Fatigue": { name: "Fatigue", desc: "Une fatigue inexpliquée ou persistante peut parfois indiquer des causes cardiaques." },
      "Swelling (Edema)": { name: "Enflure (Œdème)", desc: "La rétention de liquide dans les jambes ou les chevilles peut être un signe de problèmes de fonction cardiaque." },
    },
    whyChoose: {
      "A Regional First": { title: "Une première régionale", desc: "Première clinique en Alberta à offrir des échocardiogrammes d'effort sur site." },
      "Multilingual Care": { title: "Soins multilingues", desc: "Notre équipe parle anglais, pendjabi, hindi, ourdou, polonais, ukrainien, et plus encore." },
      "Complete Diagnostics": { title: "Diagnostics complets", desc: "Consultation et tests en une seule visite — pas de centre d'imagerie séparé." },
      "Coordinated Team": { title: "Équipe coordonnée", desc: "Cardiologie, médecine interne, et endocrinologie sur un dossier partagé." },
    },
    careers: {
      "Cardiologist": { title: "Cardiologue" },
      "Internal Medicine Physician": { title: "Médecin en médecine interne" },
      "Endocrinologist": { title: "Endocrinologue" },
      "Sonographer": { title: "Échographiste" },
      "Heart Failure Nurse / LPN": { title: "Infirmière en insuffisance cardiaque" },
    },
    physicians: {
      "anmol-kapoor": { title: "Fondateur — Cardiologie et Médecine interne", bio: "Fondateur du cabinet et une voix de premier plan en cardiologie en Alberta, le Dr Kapoor a créé le premier programme régional d'échocardiogramme d'effort sur site." },
      "ravi-varshney": { title: "Cardiologie et Médecine interne", bio: "Le Dr Varshney offre des consultations complètes en cardiologie et médecine interne, avec un accent sur des soins coordonnés et centrés sur le patient." },
      "ali-debek": { title: "Interniste / Cardiologue", bio: "Le Dr Debek diagnostique et traite les problèmes cardiovasculaires. Principaux domaines de soins : insuffisance cardiaque, douleur thoracique/angine, hypertension, maladie coronarienne, arythmies et tests d'effort." },
      "lovpreet-mangat": { title: "Médecine interne", bio: "Le Dr Mangat offre des consultations de médecine interne et une gestion coordonnée des affections complexes et chroniques." },
      "anwar-jelani": { title: "Médecine interne et Cardiologie", bio: "Le Dr Jelani offre des consultations de médecine interne et de cardiologie à notre emplacement de Meadow Miles." },
      "muhammed-dhalla": { title: "Pédiatrie et Rhumatologie", bio: "Le Dr Dhalla offre des consultations de pédiatrie et de rhumatologie à notre emplacement de Meadow Miles." },
      "faisal-hasan": { title: "Endocrinologie et Métabolisme", bio: "Le Dr Hasan a terminé sa formation au Royaume-Uni, où il a ensuite dirigé le service d'endocrinologie au Royal United Hospital Bath. Il possède une vaste expérience dans la gestion du diabète complexe et des troubles surrénaliens et hypophysaires." },
      "prafull-parekh": { title: "Médecine interne", bio: "Le Dr Parekh offre des consultations de médecine interne avec des décennies d'expérience clinique." },
    },
    locations: {
      "North East": { tag: "North East", name: "Clinique North East" },
      "Meadow Miles": { tag: "Meadow Miles", name: "Clinique Meadow Miles" },
    },
    concerns: {
      "general-cardiology": { label: "Cardiologie générale" },
      "arrhythmia": { label: "Arythmie / Rythme cardiaque" },
      "stress-testing": { label: "Test d'effort / Douleur thoracique" },
      "internal-medicine": { label: "Médecine interne générale" },
      "endocrinology": { label: "Endocrinologie / Diabète / Thyroïde" },
      "rheumatology": { label: "Rhumatologie" },
      "pediatrics": { label: "Pédiatrie" },
    },
    charmClinic: {
      info: {
        intro: "La clinique CHARM est la seule clinique communautaire ambulatoire de l'Alberta, gérée sur une base caritative avec le soutien de la Fondation DIL Walk et d'ANRA Health. La clinique est dirigée par des médecins, mais les soins aux patients sont gérés par une infirmière. L'équipe de la clinique CHARM comprend des spécialistes de l'insuffisance cardiaque et de la transplantation cardiaque, des cardiologues, des internistes, une infirmière spécialisée en fonction cardiaque, un thérapeute respiratoire, et des techniciens en échocardiogramme et tests d'effort.",
        howItWorks: "L'objectif de la clinique CHARM est d'aider les patients à rester dans la communauté et hors de l'hôpital. Votre médecin de famille peut vous référer directement à la clinique CHARM en cas de suspicion d'insuffisance cardiaque. Vous serez vu par un cardiologue, puis vous aurez un deuxième rendez-vous avec l'infirmière spécialisée en insuffisance cardiaque.",
        selfCare: "À la clinique CHARM, les patients apprennent l'autosoins lors d'une session individuelle avec une infirmière, couvrant les pesées quotidiennes, les restrictions liquidiennes/sodiques, et les signes avant-coureurs d'aggravation.",
        research: "La clinique CHARM participe également à des essais de recherche, notamment un essai en cours pour les patients atteints de fibrillation auriculaire (BRAIN-AF) et l'étude GOAL. Nous recrutons actuellement des patients pour ces deux essais.",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health poursuit le travail d'Advanced Cardiology Consultants and Diagnostics — une clinique unique en son genre dans l'Ouest canadien offrant des examens cardiopulmonaires complets sous un même toit, fondée sous la direction du Dr Anmol S. Kapoor.\n\nNous avons été la première clinique de l'Alberta à offrir des échocardiogrammes d'effort sur site — plus précis qu'un test d'effort au thallium, sans exposition aux radiations. Notre équipe multilingue communique en anglais, pendjabi, hindi, ourdou, polonais, swahili, tagalog, ukrainien, gujarati et russe." },
    },
    faqs: {
      0: { q: "Que dois-je apporter à mon premier rendez-vous ?", a: "Il sera utile d'apporter votre carte Alberta Health, une pièce d'identité avec photo, et une liste de vos médicaments actuels." },
      1: { q: "Que se passe-t-il lors de ma première visite ?", a: "Vos signes vitaux seront pris — tension artérielle, fréquence cardiaque, taille et poids." },
      2: { q: "Quelles sont vos heures d'ouverture ?", a: "Nos heures régulières sont de 7h30 à 17h, du lundi au vendredi." },
      3: { q: "Comment me préparer pour un test Holter ?", a: "Vous devrez éviter la caféine pendant 24 heures avant l'examen." },
    },
  },

  sw: {
    services: {
      "cardiology-consultation": { name: "Ushauri wa Magonjwa ya Moyo", short: "Tathmini kamili za afya ya moyo zinazoongozwa na timu yetu ya magonjwa ya moyo.", long: "Ushauri wa moyo na mishipa ya damu ni hatua ya kwanza kuelekea huduma bora ya moyo na kipengele muhimu zaidi cha matibabu. Ni fursa kwa wagonjwa kujadili matatizo yao ya moyo, kuelewa hatari, na kupokea tathmini kamili ya hatari na mapendekezo ya kubadilisha sababu za hatari." },
      "exercise-stress-echo": { name: "Echocardiogram ya Mazoezi", short: "Programu ya kwanza ya Alberta ya Echocardiogram ya mazoezi papo hapo.", long: "Kipimo cha Echocardiogram ya mazoezi kinahusisha kufanya mazoezi kwenye treadmill wakati unafuatiliwa kwa karibu. Njia hii ni sahihi zaidi kuliko kipimo cha stress cha thallium, bila mionzi. Tafadhali vaa nguo za starehe na viatu vya kukimbia." },
      "internal-medicine": { name: "Dawa za Ndani", short: "Huduma kamili kwa hali ngumu na sugu.", long: "Timu yetu ya dawa za ndani inatoa huduma iliyoratibiwa kwa hali ngumu, sugu, na za mifumo mingi, ikifanya kazi pamoja na magonjwa ya moyo na endocrinology." },
      "endocrinology": { name: "Endocrinology", short: "Kisukari, tezi, na afya ya homoni.", long: "Kisukari changamano, kisukari cha aina ya 2 cha mapema, hypothyroidism, hyperthyroidism, PCOS, na matatizo ya tezi za adrenal na pituitary yanasimamiwa na wataalamu wetu wa endocrinology." },
      "ecg": { name: "Electrocardiogram (ECG)", short: "Inarekodi shughuli za umeme za moyo wako.", long: "ECG inarekodi shughuli za umeme za moyo. Moyo huzalisha misukumo midogo ya umeme inayoenea kwenye misuli ya moyo kuifanya isinyae; misukumo hii inaweza kugunduliwa na mashine ya ECG." },
      "holter-monitoring": { name: "Ufuatiliaji wa Holter", short: "Ufuatiliaji wa mdundo wa moyo kwa masaa 24+.", long: "Ufuatiliaji wa Holter unatumika kutambua matatizo ya mdundo wa moyo, hasa kutafuta sababu ya mapigo ya moyo ya haraka au kizunguzungu. Unavaa kifaa kidogo cha kurekodi kilichounganishwa na elektrodi kwenye kifua chako kwa masaa 24 au zaidi." },
      "echocardiography": { name: "Echocardiography", short: "Upigaji picha wa ultrasound wa muundo na kazi ya moyo.", long: "Echocardiography inatumika kutambua magonjwa fulani ya moyo. Ni mojawapo ya vipimo vinavyotumika sana kwa magonjwa ya moyo." },
      "carotid-ultrasound": { name: "Ultrasound ya Carotid", short: "Upigaji picha wa mishipa ya carotid kwa tathmini ya hatari ya kiharusi.", long: "Upigaji picha wa Carotid Ultrasound unatathmini mtiririko wa damu kupitia mishipa ya carotid shingoni, kusaidia kutambua mkusanyiko wa plaque na hatari za kiharusi." },
      "myocardial-perfusion-imaging": { name: "Myocardial Perfusion Imaging", short: "Upigaji picha wa kina wa mtiririko wa damu kwenye misuli ya moyo.", long: "Myocardial Perfusion Imaging inatathmini mtiririko wa damu kwenye misuli ya moyo, kusaidia kutambua maeneo yaliyoathiriwa na mzunguko mdogo wa damu." },
      "ambulatory-bp-monitoring": { name: "Ufuatiliaji wa Shinikizo la Damu wa Masaa 24", short: "Shinikizo la damu linalopimwa unapoendelea na siku yako ya kawaida.", long: "Ufuatiliaji wa Shinikizo la Damu wa Ambulatory ni pale shinikizo la damu yako linapopimwa unapoendelea na maisha yako ya kawaida ya kila siku. Ni sehemu ya kawaida ya tathmini ya hatari ya moyo." },
    },
    symptoms: {
      "Chest Pain": { name: "Maumivu ya Kifua", desc: "Dalili ya kawaida inayoweza kuonyesha hali mbalimbali za moyo na daima inahitaji tathmini." },
      "Shortness of Breath": { name: "Upungufu wa Pumzi", desc: "Ugumu wa kupumua wakati wa shughuli au wakati wa kupumzika unaweza kuwa ishara ya hali ya moyo au mapafu." },
      "Palpitations": { name: "Mapigo ya Moyo ya Haraka", desc: "Hisia ya mapigo ya moyo ya haraka, yanayopepea, au 'yanayogonga'." },
      "Dizziness / Lightheadedness": { name: "Kizunguzungu", desc: "Inaweza kuhusiana na matatizo ya mdundo wa moyo au mabadiliko ya shinikizo la damu." },
      "Fatigue": { name: "Uchovu", desc: "Uchovu usioelezeka au wa kudumu wakati mwingine unaweza kuonyesha sababu za moyo." },
      "Swelling (Edema)": { name: "Uvimbe (Edema)", desc: "Kubaki kwa maji kwenye miguu au vifundo vya miguu kunaweza kuwa ishara ya matatizo ya kazi ya moyo." },
    },
    whyChoose: {
      "A Regional First": { title: "Ya Kwanza Kikanda", desc: "Kliniki ya kwanza Alberta kutoa Echocardiogram za mazoezi papo hapo." },
      "Multilingual Care": { title: "Huduma za Lugha Nyingi", desc: "Timu yetu inazungumza Kiingereza, Kipunjabi, Kihindi, Kiurdu, Kipolishi, Kiukreni, na zaidi." },
      "Complete Diagnostics": { title: "Uchunguzi Kamili", desc: "Ushauri na vipimo katika ziara moja — hakuna kituo tofauti cha upigaji picha." },
      "Coordinated Team": { title: "Timu Iliyoratibiwa", desc: "Magonjwa ya moyo, dawa za ndani, na endocrinology kwenye rekodi moja iliyoshirikiwa." },
    },
    careers: {
      "Cardiologist": { title: "Daktari wa Moyo" },
      "Internal Medicine Physician": { title: "Daktari wa Dawa za Ndani" },
      "Endocrinologist": { title: "Daktari wa Endocrinology" },
      "Sonographer": { title: "Fundi wa Sonografia" },
      "Heart Failure Nurse / LPN": { title: "Muuguzi wa Kushindwa kwa Moyo" },
    },
    physicians: {
      "anmol-kapoor": { title: "Mwanzilishi — Magonjwa ya Moyo na Dawa za Ndani", bio: "Mwanzilishi wa mazoezi na sauti kuu katika magonjwa ya moyo Alberta, Dk. Kapoor alianzisha programu ya kwanza ya kikanda ya Echocardiogram ya mazoezi papo hapo." },
      "ravi-varshney": { title: "Magonjwa ya Moyo na Dawa za Ndani", bio: "Dk. Varshney anatoa ushauri kamili wa magonjwa ya moyo na dawa za ndani, akizingatia huduma iliyoratibiwa na kamili ya mgonjwa." },
      "ali-debek": { title: "Daktari wa Ndani / Moyo", bio: "Dk. Debek anachunguza na kutibu matatizo ya moyo na mishipa ya damu. Maeneo makuu ya huduma: kushindwa kwa moyo, maumivu ya kifua, shinikizo la damu, ugonjwa wa ateri ya moyo, na upimaji wa stress." },
      "lovpreet-mangat": { title: "Dawa za Ndani", bio: "Dk. Mangat anatoa ushauri wa dawa za ndani na usimamizi ulioratibiwa wa hali ngumu na sugu." },
      "anwar-jelani": { title: "Dawa za Ndani na Magonjwa ya Moyo", bio: "Dk. Jelani anatoa ushauri wa dawa za ndani na magonjwa ya moyo katika eneo letu la Meadow Miles." },
      "muhammed-dhalla": { title: "Watoto na Rheumatology", bio: "Dk. Dhalla anatoa ushauri wa watoto na rheumatology katika eneo letu la Meadow Miles." },
      "faisal-hasan": { title: "Endocrinology na Metaboli", bio: "Dk. Hasan alimaliza mafunzo yake nchini Uingereza, baadaye akiwa Kiongozi wa Endocrinology katika Hospitali ya Royal United Bath. Ana uzoefu mkubwa katika usimamizi wa kisukari changamano na matatizo ya tezi za adrenal na pituitary." },
      "prafull-parekh": { title: "Dawa za Ndani", bio: "Dk. Parekh anatoa ushauri wa dawa za ndani na uzoefu wa miongo kadhaa wa kliniki." },
    },
    locations: {
      "North East": { tag: "North East", name: "Kliniki ya North East" },
      "Meadow Miles": { tag: "Meadow Miles", name: "Kliniki ya Meadow Miles" },
    },
    concerns: {
      "general-cardiology": { label: "Magonjwa ya Moyo ya Jumla" },
      "arrhythmia": { label: "Arrhythmia / Mdundo wa Moyo" },
      "stress-testing": { label: "Upimaji wa Stress / Maumivu ya Kifua" },
      "internal-medicine": { label: "Dawa za Ndani za Jumla" },
      "endocrinology": { label: "Endocrinology / Kisukari / Tezi" },
      "rheumatology": { label: "Rheumatology" },
      "pediatrics": { label: "Watoto" },
    },
    charmClinic: {
      info: {
        intro: "Kliniki ya CHARM ni kliniki pekee ya jamii ya wagonjwa wa nje Alberta, inayoendeshwa kwa msingi wa hisani kwa msaada wa DIL Walk Foundation na ANRA Health. Kliniki inaongozwa na madaktari, lakini huduma ya mgonjwa inasimamiwa na muuguzi. Timu ya CHARM inajumuisha wataalamu wa kushindwa kwa moyo na upandikizaji wa moyo, madaktari wa moyo, madaktari wa dawa za ndani, muuguzi wa kazi za moyo, mtaalamu wa kupumua, na mafundi wa echocardiogram na stress test.",
        howItWorks: "Lengo la Kliniki ya CHARM ni kusaidia wagonjwa kubaki katika jamii na nje ya hospitali. Daktari wako wa familia anaweza kupeleka moja kwa moja kwa Kliniki ya CHARM wakati kushindwa kwa moyo kunashukiwa. Utaonwa na daktari wa moyo, kisha utapewa miadi ya pili na muuguzi wa kushindwa kwa moyo.",
        selfCare: "Katika Kliniki ya CHARM, wagonjwa wanafundishwa kujitunza kupitia kikao cha mtu mmoja na muuguzi, kinachojumuisha uzito wa kila siku, vikwazo vya maji/sodiamu, na dalili za onyo.",
        research: "Kliniki ya CHARM pia inashiriki katika majaribio ya utafiti, ikiwa ni pamoja na jaribio linaloendelea kwa wagonjwa wa Atrial Fibrillation (BRAIN-AF) na utafiti wa GOAL. Kwa sasa tunaajiri wagonjwa kwa majaribio yote mawili.",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health inaendeleza kazi ya Advanced Cardiology Consultants and Diagnostics — kliniki ya kipekee Magharibi mwa Kanada inayotoa uchunguzi kamili wa moyo na mapafu chini ya paa moja, iliyoanzishwa chini ya uongozi wa Dk. Anmol S. Kapoor.\n\nTulikuwa kliniki ya kwanza Alberta kutoa Echocardiogram za mazoezi papo hapo — sahihi zaidi kuliko kipimo cha stress cha thallium, bila mionzi. Timu yetu ya lugha nyingi inawasiliana kwa Kiingereza, Kipunjabi, Kihindi, Kiurdu, Kipolishi, Kiswahili, Kitagalogi, Kiukreni, Kigujarati, na Kirusi." },
    },
    faqs: {
      0: { q: "Nilete nini kwenye miadi yangu ya kwanza?", a: "Itasaidia ukileta Kadi yako ya Afya ya Alberta, kitambulisho chenye picha, na orodha ya dawa zako za sasa." },
      1: { q: "Ni nini kinachotokea wakati wa ziara yangu ya kwanza?", a: "Alama zako muhimu zitachukuliwa — shinikizo la damu, mapigo ya moyo, urefu, na uzito." },
      2: { q: "Masaa ya kliniki yenu ni yapi?", a: "Masaa yetu ya kawaida ya kliniki ni 7:30 asubuhi hadi 5 jioni, Jumatatu hadi Ijumaa." },
      3: { q: "Nitajiandaaje kwa kipimo cha Holter monitor?", a: "Utahitaji kuepuka kafeini kwa masaa 24 kabla ya uchunguzi." },
    },
  },

  ur: {
    services: {
      "cardiology-consultation": { name: "کارڈیالوجی مشاورت", short: "ہماری کارڈیالوجی ٹیم کی طرف سے جامع دل کی صحت کی تشخیص۔", long: "قلبی مشاورت کامیاب کارڈیک دیکھ بھال کا پہلا قدم ہے اور طبی علاج کا سب سے اہم پہلو ہے۔ یہ مریضوں کے لیے اپنے دل کے مسائل پر بات کرنے، خطرات کو سمجھنے، اور خطرے کے عوامل کو تبدیل کرنے میں مدد کے لیے تجاویز کے ساتھ مکمل تشخیص حاصل کرنے کا موقع ہے۔" },
      "exercise-stress-echo": { name: "ایکسرسائز سٹریس ایکوکارڈیوگرام", short: "البرٹا کا پہلا آن سائٹ ایکسرسائز سٹریس ایکو پروگرام۔", long: "ایکسرسائز سٹریس ایکو ٹیسٹ میں ٹریڈمل پر ورزش کرنا شامل ہے جبکہ آپ کی قریب سے نگرانی کی جاتی ہے۔ یہ طریقہ تھیلیم سٹریس ٹیسٹ سے زیادہ درست ہے، تابکاری کی نمائش کے بغیر۔ براہ کرم آرام دہ کپڑے اور دوڑنے کے جوتے پہنیں۔" },
      "internal-medicine": { name: "انٹرنل میڈیسن", short: "پیچیدہ اور دائمی حالات کے لیے مکمل شخص کی دیکھ بھال۔", long: "ہماری انٹرنل میڈیسن ٹیم پیچیدہ، دائمی، اور کثیر نظامی حالات کے لیے مربوط دیکھ بھال فراہم کرتی ہے، کارڈیالوجی اور اینڈوکرائنولوجی کے ساتھ مل کر کام کرتے ہوئے۔" },
      "endocrinology": { name: "اینڈوکرائنولوجی", short: "ذیابیطس، تھائیرائیڈ، اور ہارمونل صحت۔", long: "پیچیدہ ذیابیطس، نوجوان ٹائپ 2 ذیابیطس، ہائپوتھائیرائیڈزم، ہائپرتھائیرائیڈزم، PCOS، اور ایڈرینل و پٹیوٹری امراض کا انتظام ہمارے اینڈوکرائنولوجی ماہرین کرتے ہیں۔" },
      "ecg": { name: "الیکٹروکارڈیوگرام (ECG)", short: "آپ کے دل کی برقی سرگرمی ریکارڈ کرتا ہے۔", long: "ECG دل کی برقی سرگرمی ریکارڈ کرتا ہے۔ دل چھوٹے برقی امپلس پیدا کرتا ہے جو دل کے پٹھوں میں پھیلتے ہیں؛ یہ امپلس ECG مشین کے ذریعے پتہ چل سکتے ہیں۔" },
      "holter-monitoring": { name: "ہولٹر مانیٹرنگ", short: "24 گھنٹے+ دل کی تال کی نگرانی۔", long: "ہولٹر مانیٹرنگ دل کی تال کی خرابیوں کی تشخیص کے لیے استعمال ہوتی ہے۔ آپ اپنے سینے پر الیکٹروڈز سے منسلک ایک چھوٹا ریکارڈنگ آلہ پہنتے ہیں تاکہ 24 گھنٹے یا اس سے زیادہ کے لیے ریڈنگ حاصل ہو۔" },
      "echocardiography": { name: "ایکوکارڈیوگرافی", short: "دل کی ساخت اور فعل کی الٹراساؤنڈ امیجنگ۔", long: "ایکوکارڈیوگرافی بعض دل کی بیماریوں کی تشخیص کے لیے استعمال ہوتی ہے۔ یہ دل کی بیماری کے لیے سب سے زیادہ استعمال ہونے والے تشخیصی ٹیسٹوں میں سے ایک ہے۔" },
      "carotid-ultrasound": { name: "کیروٹڈ الٹراساؤنڈ", short: "فالج کے خطرے کی تشخیص کے لیے کیروٹڈ شریانوں کی امیجنگ۔", long: "کیروٹڈ الٹراساؤنڈ امیجنگ گردن میں کیروٹڈ شریانوں کے ذریعے خون کے بہاؤ کا جائزہ لیتی ہے، جو تختی کے جمع ہونے اور فالج کے خطرے کے عوامل کی نشاندہی میں مدد کرتی ہے۔" },
      "myocardial-perfusion-imaging": { name: "مایوکارڈیل پرفیوژن امیجنگ", short: "دل کے پٹھوں میں خون کے بہاؤ کی تفصیلی امیجنگ۔", long: "مایوکارڈیل پرفیوژن امیجنگ دل کے پٹھوں میں خون کے بہاؤ کا جائزہ لیتی ہے، جو کم گردش سے متاثرہ علاقوں کی نشاندہی میں مدد کرتی ہے۔" },
      "ambulatory-bp-monitoring": { name: "24 گھنٹے ایمبولیٹری بی پی مانیٹرنگ", short: "آپ کے معمول کے دن کے دوران بلڈ پریشر کی پیمائش۔", long: "ایمبولیٹری بلڈ پریشر مانیٹرنگ وہ ہے جب آپ کا بلڈ پریشر آپ کے معمول کے روزمرہ کے دوران ماپا جاتا ہے۔ یہ دل کے خطرے کی تشخیص کا ایک عام حصہ ہے۔" },
    },
    symptoms: {
      "Chest Pain": { name: "سینے میں درد", desc: "ایک عام علامت جو دل کی مختلف حالتوں کی نشاندہی کر سکتی ہے۔" },
      "Shortness of Breath": { name: "سانس کی تکلیف", desc: "سرگرمی کے دوران یا آرام کے وقت سانس لینے میں دشواری دل یا پھیپھڑوں کی حالت کی علامت ہو سکتی ہے۔" },
      "Palpitations": { name: "دھڑکن", desc: "تیز، پھڑپھڑاتی، یا 'دھڑکتی' دل کی دھڑکن کا احساس۔" },
      "Dizziness / Lightheadedness": { name: "چکر آنا", desc: "دل کی تال کی خرابی یا بلڈ پریشر میں تبدیلی سے متعلق ہو سکتا ہے۔" },
      "Fatigue": { name: "تھکاوٹ", desc: "غیر واضح یا مسلسل تھکاوٹ کبھی کبھی دل کے اسباب کی طرف اشارہ کر سکتی ہے۔" },
      "Swelling (Edema)": { name: "سوجن (ورم)", desc: "ٹانگوں یا ٹخنوں میں سیال کا جمع ہونا دل کے کام کی خرابی کی علامت ہو سکتا ہے۔" },
    },
    whyChoose: {
      "A Regional First": { title: "علاقائی پہلا", desc: "البرٹا میں آن سائٹ ایکسرسائز سٹریس ایکوکارڈیوگرام پیش کرنے والا پہلا کلینک۔" },
      "Multilingual Care": { title: "کثیر لسانی دیکھ بھال", desc: "ہماری ٹیم انگریزی، پنجابی، ہندی، اردو، پولش، یوکرینی، اور مزید بولتی ہے۔" },
      "Complete Diagnostics": { title: "مکمل تشخیص", desc: "ایک ہی وزٹ میں مشاورت اور ٹیسٹنگ — کوئی الگ امیجنگ سینٹر نہیں۔" },
      "Coordinated Team": { title: "مربوط ٹیم", desc: "کارڈیالوجی، انٹرنل میڈیسن، اور اینڈوکرائنولوجی ایک مشترکہ ریکارڈ پر۔" },
    },
    careers: {
      "Cardiologist": { title: "امراض قلب کے ماہر" },
      "Internal Medicine Physician": { title: "انٹرنل میڈیسن معالج" },
      "Endocrinologist": { title: "اینڈوکرائنولوجسٹ" },
      "Sonographer": { title: "سونوگرافر" },
      "Heart Failure Nurse / LPN": { title: "ہارٹ فیلیئر نرس" },
    },
    physicians: {
      "anmol-kapoor": { title: "بانی — کارڈیالوجی اور انٹرنل میڈیسن", bio: "پریکٹس کے بانی اور البرٹا کارڈیالوجی میں ایک سرکردہ آواز، ڈاکٹر کپور نے خطے کا پہلا آن سائٹ ایکسرسائز سٹریس ایکوکارڈیوگرام پروگرام قائم کیا۔" },
      "ravi-varshney": { title: "کارڈیالوجی اور انٹرنل میڈیسن", bio: "ڈاکٹر ورشنی جامع کارڈیالوجی اور انٹرنل میڈیسن مشاورت فراہم کرتے ہیں، مربوط اور مکمل مریض کی دیکھ بھال پر توجہ کے ساتھ۔" },
      "ali-debek": { title: "انٹرنسٹ / کارڈیالوجسٹ", bio: "ڈاکٹر دیبک دل کے مسائل اور بیماریوں کی تشخیص اور علاج کرتے ہیں۔ دیکھ بھال کے اہم شعبے: ہارٹ فیلیئر، سینے میں درد/انجائنا، ہائی بلڈ پریشر، کورونری آرٹری بیماری، اریتھمیا، اور سٹریس ٹیسٹنگ۔" },
      "lovpreet-mangat": { title: "انٹرنل میڈیسن", bio: "ڈاکٹر منگت انٹرنل میڈیسن مشاورت اور پیچیدہ و دائمی حالات کا مربوط انتظام فراہم کرتے ہیں۔" },
      "anwar-jelani": { title: "انٹرنل میڈیسن اور کارڈیالوجی", bio: "ڈاکٹر جیلانی ہمارے میڈو مائلز مقام پر انٹرنل میڈیسن اور کارڈیالوجی مشاورت فراہم کرتے ہیں۔" },
      "muhammed-dhalla": { title: "اطفال اور ریومیٹولوجی", bio: "ڈاکٹر دھالا ہمارے میڈو مائلز مقام پر اطفال اور ریومیٹولوجی مشاورت فراہم کرتے ہیں۔" },
      "faisal-hasan": { title: "اینڈوکرائنولوجی اور میٹابولزم", bio: "ڈاکٹر حسن نے برطانیہ میں اپنی تربیت مکمل کی، بعد میں رائل یونائیٹڈ ہسپتال باتھ میں اینڈوکرائنولوجی کے لیڈ کے طور پر خدمات انجام دیں۔ انہیں پیچیدہ ذیابیطس اور ایڈرینل و پٹیوٹری امراض کے انتظام میں وسیع تجربہ ہے۔" },
      "prafull-parekh": { title: "انٹرنل میڈیسن", bio: "ڈاکٹر پاریکھ دہائیوں کے طبی تجربے کے ساتھ انٹرنل میڈیسن مشاورت فراہم کرتے ہیں۔" },
    },
    locations: {
      "North East": { tag: "نارتھ ایسٹ", name: "نارتھ ایسٹ کلینک" },
      "Meadow Miles": { tag: "میڈو مائلز", name: "میڈو مائلز کلینک" },
    },
    concerns: {
      "general-cardiology": { label: "عام امراض قلب" },
      "arrhythmia": { label: "اریتھمیا / دل کی تال" },
      "stress-testing": { label: "سٹریس ٹیسٹنگ / سینے میں درد" },
      "internal-medicine": { label: "عام انٹرنل میڈیسن" },
      "endocrinology": { label: "اینڈوکرائنولوجی / ذیابیطس / تھائیرائیڈ" },
      "rheumatology": { label: "ریومیٹولوجی" },
      "pediatrics": { label: "اطفال" },
    },
    charmClinic: {
      info: {
        intro: "CHARM کلینک البرٹا کا واحد کمیونٹی پر مبنی، آؤٹ پیشنٹ کلینک ہے جو DIL Walk فاؤنڈیشن اور ANRA Health کی مدد سے خیراتی بنیادوں پر چلایا جاتا ہے۔ کلینک ڈاکٹر کی رہنمائی میں ہے، لیکن مریض کی دیکھ بھال نرس کے ذریعے کی جاتی ہے۔ CHARM کلینک ٹیم میں ہارٹ فیلیئر اور ہارٹ ٹرانسپلانٹ ماہرین، کارڈیالوجسٹ، انٹرنل میڈیسن ڈاکٹرز، ایک ہارٹ فنکشن نرس، ایک ریسپائریٹری تھراپسٹ، اور ایکوکارڈیوگرام و سٹریس ٹیسٹ ٹیکنیشن شامل ہیں۔",
        howItWorks: "CHARM کلینک کا مقصد مریضوں کو کمیونٹی میں رکھنا اور ہسپتال سے دور رکھنا ہے۔ آپ کا فیملی ڈاکٹر براہ راست CHARM کلینک کو ریفر کر سکتا ہے۔ آپ کو ایک کارڈیالوجسٹ دیکھے گا، پھر ہارٹ فیلیئر نرس کے ساتھ دوسری اپائنٹمنٹ دی جائے گی۔",
        selfCare: "CHARM کلینک میں، مریضوں کو نرس کے ساتھ ون آن ون سیشن کے ذریعے خود نگہداشت سکھائی جاتی ہے، جو روزانہ وزن، سیال/سوڈیم کی پابندیوں، اور انتباہی علامات کا احاطہ کرتی ہے۔",
        research: "CHARM کلینک تحقیقی ٹرائلز میں بھی حصہ لیتا ہے، بشمول ایٹریل فبریلیشن مریضوں کے لیے جاری ٹرائل (BRAIN-AF) اور GOAL مطالعہ۔ ہم فی الحال دونوں ٹرائلز کے لیے مریضوں کو بھرتی کر رہے ہیں۔",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health، Advanced Cardiology Consultants and Diagnostics کے کام کو جاری رکھتا ہے — مغربی کینیڈا میں ایک منفرد کلینک جو ایک ہی چھت کے نیچے مکمل کارڈیو پلمونری تحقیقات فراہم کرتا ہے، جو ڈاکٹر انمول ایس کپور کی رہنمائی میں قائم ہوا۔\n\nہم البرٹا میں آن سائٹ ایکسرسائز سٹریس ایکوکارڈیوگرام پیش کرنے والا پہلا کلینک تھے۔ ہماری کثیر لسانی ٹیم انگریزی، پنجابی، ہندی، اردو، پولش، سواحلی، تاگالوگ، یوکرینی، گجراتی، اور روسی میں بات چیت کرتی ہے۔" },
    },
    faqs: {
      0: { q: "مجھے اپنی پہلی اپائنٹمنٹ پر کیا لانا چاہیے؟", a: "یہ مددگار ہوگا اگر آپ اپنا البرٹا ہیلتھ کارڈ، فوٹو آئی ڈی، اور موجودہ ادویات کی فہرست لائیں۔" },
      1: { q: "میری پہلی ملاقات کے دوران کیا ہوتا ہے؟", a: "آپ کے وائٹل سائنز لیے جائیں گے — بلڈ پریشر، دل کی دھڑکن، قد، اور وزن۔" },
      2: { q: "آپ کے کلینک کے اوقات کیا ہیں؟", a: "ہمارے باقاعدہ کلینک کے اوقات صبح 7:30 سے شام 5 بجے تک، پیر سے جمعہ ہیں۔" },
      3: { q: "میں ہولٹر مانیٹر ٹیسٹ کے لیے کیسے تیاری کروں؟", a: "امتحان سے 24 گھنٹے پہلے آپ کو کیفین سے پرہیز کرنا ہوگا۔" },
    },
  },

  uk: {
    services: {
      "cardiology-consultation": { name: "Кардіологічна консультація", short: "Комплексна оцінка стану серця нашою кардіологічною командою.", long: "Кардіологічна консультація — це перший крок до успішного лікування серця та найважливіший аспект медичного лікування. Це можливість для пацієнтів обговорити свої серцеві проблеми, зрозуміти ризики та отримати повну оцінку ризику з рекомендаціями щодо їх зниження." },
      "exercise-stress-echo": { name: "Стрес-ехокардіографія з навантаженням", short: "Перша в Альберті програма стрес-ехокардіографії на місці.", long: "Тест стрес-ехокардіографії з навантаженням передбачає виконання вправ на біговій доріжці під ретельним наглядом. Цей метод точніший за талієвий стрес-тест, без опромінення. Будь ласка, вдягніть зручний одяг та кросівки." },
      "internal-medicine": { name: "Внутрішня медицина", short: "Цілісний догляд при складних та хронічних станах.", long: "Наша команда внутрішньої медицини забезпечує скоординований догляд при складних, хронічних та багатосистемних станах, працюючи разом з кардіологією та ендокринологією." },
      "endocrinology": { name: "Ендокринологія", short: "Діабет, щитоподібна залоза, та гормональне здоров'я.", long: "Складний діабет, ранній діабет 2 типу, гіпотиреоз, гіпертиреоз, СПКЯ, а також розлади надниркових і гіпофізарних залоз лікуються нашими фахівцями з ендокринології." },
      "ecg": { name: "Електрокардіограма (ЕКГ)", short: "Записує електричну активність вашого серця.", long: "ЕКГ записує електричну активність серця. Серце виробляє крихітні електричні імпульси, які поширюються через серцевий м'яз, змушуючи його скорочуватися; ці імпульси можна виявити за допомогою апарата ЕКГ." },
      "holter-monitoring": { name: "Холтерівський моніторинг", short: "Моніторинг серцевого ритму протягом 24+ годин.", long: "Холтерівський моніторинг використовується для діагностики порушень серцевого ритму, зокрема для виявлення причини серцебиття або запаморочення. Ви носите невеликий записуючий пристрій, підключений до електродів на грудях, протягом 24 годин або довше." },
      "echocardiography": { name: "Ехокардіографія", short: "Ультразвукове дослідження структури та функції серця.", long: "Ехокардіографія використовується для діагностики певних серцево-судинних захворювань. Це один із найпоширеніших діагностичних тестів для захворювань серця." },
      "carotid-ultrasound": { name: "УЗД сонних артерій", short: "Візуалізація сонних артерій для оцінки ризику інсульту.", long: "УЗД сонних артерій оцінює кровотік через сонні артерії на шиї, допомагаючи виявити накопичення бляшок та фактори ризику інсульту." },
      "myocardial-perfusion-imaging": { name: "Перфузійна сцинтиграфія міокарда", short: "Детальна візуалізація кровотоку до серцевого м'яза.", long: "Перфузійна сцинтиграфія міокарда оцінює кровотік до серцевого м'яза, допомагаючи виявити ділянки, уражені зниженим кровообігом." },
      "ambulatory-bp-monitoring": { name: "24-годинний амбулаторний моніторинг АТ", short: "Артеріальний тиск вимірюється протягом вашого звичайного дня.", long: "Амбулаторний моніторинг артеріального тиску — це коли ваш тиск вимірюється, поки ви ведете звичайне повсякденне життя. Це звичайна і рутинна частина оцінки серцевого ризику." },
    },
    symptoms: {
      "Chest Pain": { name: "Біль у грудях", desc: "Поширений симптом, який може вказувати на різні серцеві стани і завжди потребує оцінки." },
      "Shortness of Breath": { name: "Задишка", desc: "Утруднене дихання під час активності або в спокої може бути ознакою основного захворювання серця чи легенів." },
      "Palpitations": { name: "Серцебиття", desc: "Відчуття швидкого, тріпотливого, або 'калатаючого' серцебиття." },
      "Dizziness / Lightheadedness": { name: "Запаморочення", desc: "Може бути пов'язано з порушеннями серцевого ритму або змінами артеріального тиску." },
      "Fatigue": { name: "Втома", desc: "Незрозуміла або постійна втома іноді може вказувати на серцеві причини." },
      "Swelling (Edema)": { name: "Набряк", desc: "Затримка рідини в ногах або щиколотках може бути ознакою проблем із функцією серця." },
    },
    whyChoose: {
      "A Regional First": { title: "Перші в регіоні", desc: "Перша клініка в Альберті, що пропонує стрес-ехокардіографію на місці." },
      "Multilingual Care": { title: "Багатомовна допомога", desc: "Наша команда розмовляє англійською, панджабі, гінді, урду, польською, українською та іншими мовами." },
      "Complete Diagnostics": { title: "Повна діагностика", desc: "Консультація та тестування за один візит — без окремого діагностичного центру." },
      "Coordinated Team": { title: "Скоординована команда", desc: "Кардіологія, внутрішня медицина, та ендокринологія в одній спільній картці." },
    },
    careers: {
      "Cardiologist": { title: "Кардіолог" },
      "Internal Medicine Physician": { title: "Лікар внутрішньої медицини" },
      "Endocrinologist": { title: "Ендокринолог" },
      "Sonographer": { title: "Сонографіст" },
      "Heart Failure Nurse / LPN": { title: "Медсестра з серцевої недостатності" },
    },
    physicians: {
      "anmol-kapoor": { title: "Засновник — Кардіологія та Внутрішня медицина", bio: "Засновник практики та провідний голос у кардіології Альберти, доктор Капур заснував першу в регіоні програму стрес-ехокардіографії на місці." },
      "ravi-varshney": { title: "Кардіологія та Внутрішня медицина", bio: "Доктор Варшні надає комплексні консультації з кардіології та внутрішньої медицини, зосереджуючись на скоординованому, цілісному догляді за пацієнтом." },
      "ali-debek": { title: "Терапевт / Кардіолог", bio: "Доктор Дебек діагностує та лікує серцево-судинні проблеми. Основні напрямки допомоги: серцева недостатність, біль у грудях/стенокардія, гіпертонія, ішемічна хвороба серця, аритмії та стрес-тестування." },
      "lovpreet-mangat": { title: "Внутрішня медицина", bio: "Доктор Мангат надає консультації з внутрішньої медицини та скоординоване лікування складних і хронічних станів." },
      "anwar-jelani": { title: "Внутрішня медицина та Кардіологія", bio: "Доктор Джелані надає консультації з внутрішньої медицини та кардіології в нашому відділенні Meadow Miles." },
      "muhammed-dhalla": { title: "Педіатрія та Ревматологія", bio: "Доктор Далла надає педіатричні та ревматологічні консультації в нашому відділенні Meadow Miles." },
      "faisal-hasan": { title: "Ендокринологія та Метаболізм", bio: "Доктор Хасан завершив навчання у Великобританії, пізніше очолюючи відділ ендокринології в Royal United Hospital Bath. Має великий досвід лікування складного діабету та розладів надниркових і гіпофізарних залоз." },
      "prafull-parekh": { title: "Внутрішня медицина", bio: "Доктор Парех надає консультації з внутрішньої медицини з багаторічним клінічним досвідом." },
    },
    locations: {
      "North East": { tag: "Норт-Іст", name: "Клініка Норт-Іст" },
      "Meadow Miles": { tag: "Медоу-Майлз", name: "Клініка Медоу-Майлз" },
    },
    concerns: {
      "general-cardiology": { label: "Загальна кардіологія" },
      "arrhythmia": { label: "Аритмія / Серцевий ритм" },
      "stress-testing": { label: "Стрес-тест / Біль у грудях" },
      "internal-medicine": { label: "Загальна внутрішня медицина" },
      "endocrinology": { label: "Ендокринологія / Діабет / Щитоподібна залоза" },
      "rheumatology": { label: "Ревматологія" },
      "pediatrics": { label: "Педіатрія" },
    },
    charmClinic: {
      info: {
        intro: "Клініка CHARM — єдина громадська амбулаторна клініка в Альберті, що працює на благодійній основі за підтримки DIL Walk Foundation та ANRA Health. Клінікою керують лікарі, але догляд за пацієнтами здійснює медсестра. Команда CHARM включає фахівців із серцевої недостатності та трансплантації серця, кардіологів, терапевтів, медсестру з функції серця, респіраторного терапевта та техніків ехокардіографії.",
        howItWorks: "Мета клініки CHARM — допомогти пацієнтам залишатися в громаді та поза лікарнею. Ваш сімейний лікар може направити безпосередньо до клініки CHARM. Вас огляне кардіолог, потім призначать другий прийом з медсестрою із серцевої недостатності.",
        selfCare: "У клініці CHARM пацієнтів навчають самообслуговуванню під час індивідуальної сесії з медсестрою, яка охоплює щоденне зважування, обмеження рідини/натрію та попереджувальні ознаки.",
        research: "Клініка CHARM також бере участь у дослідницьких випробуваннях, включаючи триваюче випробування для пацієнтів з фібриляцією передсердь (BRAIN-AF) та дослідження GOAL. Наразі ми набираємо пацієнтів для обох випробувань.",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health продовжує роботу Advanced Cardiology Consultants and Diagnostics — унікальної клініки в Західній Канаді, яка пропонує повне кардіопульмональне обстеження під одним дахом, заснованої під керівництвом доктора Анмола С. Капура.\n\nМи були першою клінікою в Альберті, яка запропонувала стрес-ехокардіографію на місці — точнішу за талієвий стрес-тест, без опромінення. Наша багатомовна команда спілкується англійською, панджабі, гінді, урду, польською, суахілі, тагальською, українською, гуджараті та російською." },
    },
    faqs: {
      0: { q: "Що мені взяти на перший прийом?", a: "Буде корисно взяти вашу картку Alberta Health, посвідчення особи з фото, та список поточних ліків." },
      1: { q: "Що відбувається під час першого візиту?", a: "У вас виміряють життєві показники — артеріальний тиск, пульс, зріст та вагу." },
      2: { q: "Який графік роботи вашої клініки?", a: "Наш звичайний графік роботи з 7:30 до 17:00, з понеділка по п'ятницю." },
      3: { q: "Як підготуватися до тесту з Холтер-монітором?", a: "Вам потрібно буде уникати кофеїну протягом 24 годин перед обстеженням." },
    },
  },

  gu: {
    services: {
      "cardiology-consultation": { name: "કાર્ડિયોલોજી પરામર્શ", short: "અમારી કાર્ડિયોલોજી ટીમ દ્વારા વ્યાપક હૃદય આરોગ્ય મૂલ્યાંકન.", long: "કાર્ડિયોવાસ્ક્યુલર પરામર્શ સફળ કાર્ડિયાક સંભાળનું પ્રથમ પગલું છે અને તબીબી સારવારનું સૌથી મહત્વપૂર્ણ પાસું છે. તે દર્દીઓ માટે તેમની હૃદય સંબંધિત સમસ્યાઓની ચર્ચા કરવાની, જોખમોને સમજવાની, અને જોખમ પરિબળોમાં ફેરફાર કરવામાં મદદ માટે સૂચનો સાથે સંપૂર્ણ જોખમ મૂલ્યાંકન મેળવવાની તક છે." },
      "exercise-stress-echo": { name: "એક્સરસાઇઝ સ્ટ્રેસ ઇકોકાર્ડિયોગ્રામ", short: "આલ્બર્ટાનો પ્રથમ ઓનસાઇટ એક્સરસાઇઝ સ્ટ્રેસ ઇકો પ્રોગ્રામ.", long: "એક્સરસાઇઝ સ્ટ્રેસ ઇકો ટેસ્ટમાં તમારું નજીકથી નિરીક્ષણ કરતી વખતે ટ્રેડમિલ પર કસરત કરવાનો સમાવેશ થાય છે. આ પદ્ધતિ થેલિયમ સ્ટ્રેસ ટેસ્ટ કરતાં વધુ ચોક્કસ છે, રેડિયેશન એક્સપોઝર વિના. કૃપા કરી આરામદાયક કપડાં અને દોડવાના જૂતા પહેરો." },
      "internal-medicine": { name: "ઇન્ટરનલ મેડિસિન", short: "જટિલ અને ક્રોનિક સ્થિતિઓ માટે સંપૂર્ણ વ્યક્તિ સંભાળ.", long: "અમારી ઇન્ટરનલ મેડિસિન ટીમ જટિલ, ક્રોનિક, અને મલ્ટી-સિસ્ટમ સ્થિતિઓ માટે સંકલિત સંભાળ પ્રદાન કરે છે, કાર્ડિયોલોજી અને એન્ડોક્રિનોલોજી સાથે મળીને કામ કરીને." },
      "endocrinology": { name: "એન્ડોક્રિનોલોજી", short: "ડાયાબિટીસ, થાઇરોઇડ, અને હોર્મોનલ આરોગ્ય.", long: "જટિલ ડાયાબિટીસ, યુવા ટાઇપ 2 ડાયાબિટીસ, હાઇપોથાઇરોડિઝમ, હાઇપરથાઇરોડિઝમ, PCOS, અને એડ્રિનલ તથા પિટ્યુટરી ડિસઓર્ડર્સનું સંચાલન અમારા એન્ડોક્રિનોલોજી નિષ્ણાતો દ્વારા કરવામાં આવે છે." },
      "ecg": { name: "ઇલેક્ટ્રોકાર્ડિયોગ્રામ (ECG)", short: "તમારા હૃદયની વિદ્યુત પ્રવૃત્તિ રેકોર્ડ કરે છે.", long: "ECG હૃદયની વિદ્યુત પ્રવૃત્તિ રેકોર્ડ કરે છે. હૃદય નાના વિદ્યુત આવેગો ઉત્પન્ન કરે છે જે હૃદયના સ્નાયુમાં ફેલાય છે; આ આવેગો ECG મશીન દ્વારા શોધી શકાય છે." },
      "holter-monitoring": { name: "હોલ્ટર મોનિટરિંગ", short: "24-કલાક+ હૃદય લય મોનિટરિંગ.", long: "હોલ્ટર મોનિટરિંગનો ઉપયોગ હૃદય લયની ખલેલનું નિદાન કરવા માટે થાય છે. તમે તમારી છાતી પર ઇલેક્ટ્રોડ્સ સાથે જોડાયેલ એક નાનું રેકોર્ડિંગ ડિવાઇસ પહેરો છો જેથી 24 કલાક કે તેથી વધુ સમય માટે રીડિંગ મળે." },
      "echocardiography": { name: "ઇકોકાર્ડિયોગ્રાફી", short: "હૃદયની રચના અને કાર્યની અલ્ટ્રાસાઉન્ડ ઇમેજિંગ.", long: "ઇકોકાર્ડિયોગ્રાફીનો ઉપયોગ ચોક્કસ હૃદય રોગોના નિદાન માટે થાય છે. તે હૃદય રોગ માટે સૌથી વધુ ઉપયોગમાં લેવાતા નિદાન પરીક્ષણોમાંનું એક છે." },
      "carotid-ultrasound": { name: "કેરોટિડ અલ્ટ્રાસાઉન્ડ", short: "સ્ટ્રોક જોખમ મૂલ્યાંકન માટે કેરોટિડ ધમનીઓની ઇમેજિંગ.", long: "કેરોટિડ અલ્ટ્રાસાઉન્ડ ઇમેજિંગ ગરદનમાં કેરોટિડ ધમનીઓ દ્વારા લોહીના પ્રવાહનું મૂલ્યાંકન કરે છે, જે પ્લેક બિલ્ડઅપ અને સ્ટ્રોક જોખમ પરિબળોને ઓળખવામાં મદદ કરે છે." },
      "myocardial-perfusion-imaging": { name: "માયોકાર્ડિયલ પરફ્યુઝન ઇમેજિંગ", short: "હૃદયના સ્નાયુમાં લોહીના પ્રવાહની વિગતવાર ઇમેજિંગ.", long: "માયોકાર્ડિયલ પરફ્યુઝન ઇમેજિંગ હૃદયના સ્નાયુમાં લોહીના પ્રવાહનું મૂલ્યાંકન કરે છે, જે ઘટેલા પરિભ્રમણથી અસરગ્રસ્ત વિસ્તારોને ઓળખવામાં મદદ કરે છે." },
      "ambulatory-bp-monitoring": { name: "24-કલાક એમ્બ્યુલેટરી બીપી મોનિટરિંગ", short: "તમારા સામાન્ય દિવસ દરમિયાન માપવામાં આવેલ બ્લડ પ્રેશર.", long: "એમ્બ્યુલેટરી બ્લડ પ્રેશર મોનિટરિંગ ત્યારે થાય છે જ્યારે તમારું બ્લડ પ્રેશર તમારા સામાન્ય રોજિંદા જીવન દરમિયાન માપવામાં આવે છે. તે હૃદય જોખમ મૂલ્યાંકનનો સામાન્ય ભાગ છે." },
    },
    symptoms: {
      "Chest Pain": { name: "છાતીમાં દુખાવો", desc: "એક સામાન્ય લક્ષણ જે હૃદયની વિવિધ સ્થિતિઓ સૂચવી શકે છે." },
      "Shortness of Breath": { name: "શ્વાસ ફૂલવો", desc: "પ્રવૃત્તિ દરમિયાન અથવા આરામ સમયે શ્વાસ લેવામાં તકલીફ હૃદય અથવા ફેફસાની સ્થિતિની નિશાની હોઈ શકે છે." },
      "Palpitations": { name: "ધબકારા", desc: "ઝડપી, ફફડતા, અથવા 'ધબકતા' ધબકારાની અનુભૂતિ." },
      "Dizziness / Lightheadedness": { name: "ચક્કર આવવા", desc: "હૃદય લયની ખલેલ અથવા બ્લડ પ્રેશરમાં ફેરફાર સાથે સંબંધિત હોઈ શકે છે." },
      "Fatigue": { name: "થાક", desc: "અસ્પષ્ટ અથવા સતત થાક ક્યારેક હૃદયના કારણો તરફ ઈશારો કરી શકે છે." },
      "Swelling (Edema)": { name: "સોજો (એડીમા)", desc: "પગ અથવા પગની ઘૂંટીઓમાં પ્રવાહી જમા થવું હૃદય કાર્યની સમસ્યાઓની નિશાની હોઈ શકે છે." },
    },
    whyChoose: {
      "A Regional First": { title: "પ્રાદેશિક પ્રથમ", desc: "આલ્બર્ટામાં ઓનસાઇટ એક્સરસાઇઝ સ્ટ્રેસ ઇકોકાર્ડિયોગ્રામ ઓફર કરનાર પ્રથમ ક્લિનિક." },
      "Multilingual Care": { title: "બહુભાષી સંભાળ", desc: "અમારી ટીમ અંગ્રેજી, પંજાબી, હિન્દી, ઉર્દુ, પોલિશ, યુક્રેનિયન, અને વધુ બોલે છે." },
      "Complete Diagnostics": { title: "સંપૂર્ણ નિદાન", desc: "એક જ મુલાકાતમાં પરામર્શ અને ટેસ્ટિંગ — કોઈ અલગ ઇમેજિંગ સેન્ટર નહીં." },
      "Coordinated Team": { title: "સંકલિત ટીમ", desc: "કાર્ડિયોલોજી, ઇન્ટરનલ મેડિસિન, અને એન્ડોક્રિનોલોજી એક શેર કરેલા રેકોર્ડ પર." },
    },
    careers: {
      "Cardiologist": { title: "કાર્ડિયોલોજિસ્ટ" },
      "Internal Medicine Physician": { title: "ઇન્ટરનલ મેડિસિન ડોક્ટર" },
      "Endocrinologist": { title: "એન્ડોક્રિનોલોજિસ્ટ" },
      "Sonographer": { title: "સોનોગ્રાફર" },
      "Heart Failure Nurse / LPN": { title: "હાર્ટ ફેલ્યોર નર્સ" },
    },
    physicians: {
      "anmol-kapoor": { title: "સ્થાપક — કાર્ડિયોલોજી અને ઇન્ટરનલ મેડિસિન", bio: "પ્રેક્ટિસના સ્થાપક અને આલ્બર્ટા કાર્ડિયોલોજીમાં અગ્રણી અવાજ, ડૉ. કપૂરે પ્રદેશનો પ્રથમ ઓનસાઇટ એક્સરસાઇઝ સ્ટ્રેસ ઇકોકાર્ડિયોગ્રામ પ્રોગ્રામ સ્થાપ્યો." },
      "ravi-varshney": { title: "કાર્ડિયોલોજી અને ઇન્ટરનલ મેડિસિન", bio: "ડૉ. વર્ષની વ્યાપક કાર્ડિયોલોજી અને ઇન્ટરનલ મેડિસિન પરામર્શ પ્રદાન કરે છે, સંકલિત, સંપૂર્ણ-દર્દી સંભાળ પર ધ્યાન કેન્દ્રિત કરીને." },
      "ali-debek": { title: "ઇન્ટર્નિસ્ટ / કાર્ડિયોલોજિસ્ટ", bio: "ડૉ. ડેબેક હૃદય સંબંધિત સમસ્યાઓ અને બીમારીઓનું નિદાન અને સારવાર કરે છે. મુખ્ય સંભાળ ક્ષેત્રો: હાર્ટ ફેલ્યોર, છાતીમાં દુખાવો/એન્જાઇના, હાયપરટેન્શન, કોરોનરી આર્ટરી ડિસીઝ, એરિધમિયા, અને સ્ટ્રેસ ટેસ્ટિંગ." },
      "lovpreet-mangat": { title: "ઇન્ટરનલ મેડિસિન", bio: "ડૉ. મંગત ઇન્ટરનલ મેડિસિન પરામર્શ અને જટિલ તથા ક્રોનિક સ્થિતિઓનું સંકલિત સંચાલન પ્રદાન કરે છે." },
      "anwar-jelani": { title: "ઇન્ટરનલ મેડિસિન અને કાર્ડિયોલોજી", bio: "ડૉ. જેલાની અમારા મીડો માઈલ્સ સ્થાન પર ઇન્ટરનલ મેડિસિન અને કાર્ડિયોલોજી પરામર્શ પ્રદાન કરે છે." },
      "muhammed-dhalla": { title: "પીડિયાટ્રિક્સ અને ર્યુમેટોલોજી", bio: "ડૉ. ધલ્લા અમારા મીડો માઈલ્સ સ્થાન પર બાળરોગ અને ર્યુમેટોલોજી પરામર્શ પ્રદાન કરે છે." },
      "faisal-hasan": { title: "એન્ડોક્રિનોલોજી અને મેટાબોલિઝમ", bio: "ડૉ. હસને યુકેમાં તેમની તાલીમ પૂર્ણ કરી, બાદમાં રોયલ યુનાઇટેડ હોસ્પિટલ બાથ ખાતે એન્ડોક્રિનોલોજીના લીડ તરીકે સેવા આપી. તેમને જટિલ ડાયાબિટીસ અને એડ્રિનલ તથા પિટ્યુટરી ડિસઓર્ડર્સના સંચાલનમાં વ્યાપક અનુભવ છે." },
      "prafull-parekh": { title: "ઇન્ટરનલ મેડિસિન", bio: "ડૉ. પારેખ દાયકાઓના ક્લિનિકલ અનુભવ સાથે ઇન્ટરનલ મેડિસિન પરામર્શ પ્રદાન કરે છે." },
    },
    locations: {
      "North East": { tag: "નોર્થ ઈસ્ટ", name: "નોર્થ ઈસ્ટ ક્લિનિક" },
      "Meadow Miles": { tag: "મીડો માઈલ્સ", name: "મીડો માઈલ્સ ક્લિનિક" },
    },
    concerns: {
      "general-cardiology": { label: "સામાન્ય કાર્ડિયોલોજી" },
      "arrhythmia": { label: "એરિધમિયા / હૃદય લય" },
      "stress-testing": { label: "સ્ટ્રેસ ટેસ્ટિંગ / છાતીમાં દુખાવો" },
      "internal-medicine": { label: "સામાન્ય ઇન્ટરનલ મેડિસિન" },
      "endocrinology": { label: "એન્ડોક્રિનોલોજી / ડાયાબિટીસ / થાઇરોઇડ" },
      "rheumatology": { label: "ર્યુમેટોલોજી" },
      "pediatrics": { label: "બાળરોગ" },
    },
    charmClinic: {
      info: {
        intro: "CHARM ક્લિનિક આલ્બર્ટાનું એકમાત્ર સમુદાય-આધારિત, આઉટપેશન્ટ ક્લિનિક છે જે DIL Walk ફાઉન્ડેશન અને ANRA Health ના સમર્થનથી ચેરિટેબલ ધોરણે ચલાવવામાં આવે છે. ક્લિનિક ડોક્ટર-નિર્દેશિત છે, પરંતુ દર્દીની સંભાળ નર્સ દ્વારા સંચાલિત થાય છે. CHARM ટીમમાં હાર્ટ ફેલ્યોર અને હાર્ટ ટ્રાન્સપ્લાન્ટ નિષ્ણાતો, કાર્ડિયોલોજિસ્ટ્સ, ઇન્ટરનલ મેડિસિન ડોક્ટરો, હાર્ટ ફંક્શન નર્સ, રેસ્પિરેટરી થેરાપિસ્ટ, અને ઇકોકાર્ડિયોગ્રામ ટેકનિશિયનનો સમાવેશ થાય છે.",
        howItWorks: "CHARM ક્લિનિકનો ધ્યેય દર્દીઓને સમુદાયમાં રાખવાનો અને હોસ્પિટલથી દૂર રાખવાનો છે. તમારા ફેમિલી ડોક્ટર સીધા CHARM ક્લિનિકને રિફર કરી શકે છે. તમને કાર્ડિયોલોજિસ્ટ દ્વારા જોવામાં આવશે, પછી હાર્ટ ફેલ્યોર નર્સ સાથે બીજી એપોઇન્ટમેન્ટ આપવામાં આવશે.",
        selfCare: "CHARM ક્લિનિકમાં, દર્દીઓને નર્સ સાથે 1:1 સેશન દ્વારા સ્વ-સંભાળ શીખવવામાં આવે છે, જે દૈનિક વજન, પ્રવાહી/સોડિયમ પ્રતિબંધો, અને ચેતવણી સંકેતોને આવરી લે છે.",
        research: "CHARM ક્લિનિક સંશોધન ટ્રાયલ્સમાં પણ ભાગ લે છે, જેમાં એટ્રિયલ ફાઇબ્રિલેશન દર્દીઓ માટે ચાલુ ટ્રાયલ (BRAIN-AF) અને GOAL અભ્યાસનો સમાવેશ થાય છે. અમે હાલમાં બંને ટ્રાયલ્સ માટે દર્દીઓની ભરતી કરી રહ્યા છીએ.",
      },
    },
    misc: {
      aboutStory: { text: "ANRA Health, Advanced Cardiology Consultants and Diagnostics ના કાર્યને ચાલુ રાખે છે — પશ્ચિમ કેનેડામાં એક અનોખું ક્લિનિક જે એક જ છત નીચે સંપૂર્ણ કાર્ડિયોપલ્મોનરી તપાસ પ્રદાન કરે છે, જેની સ્થાપના ડૉ. અનમોલ એસ. કપૂરના માર્ગદર્શન હેઠળ થઈ.\n\nઅમે આલ્બર્ટામાં ઓનસાઇટ એક્સરસાઇઝ સ્ટ્રેસ ઇકોકાર્ડિયોગ્રામ ઓફર કરનાર પ્રથમ ક્લિનિક હતા. અમારી બહુભાષી ટીમ અંગ્રેજી, પંજાબી, હિન્દી, ઉર્દુ, પોલિશ, સ્વાહિલી, તાગાલોગ, યુક્રેનિયન, ગુજરાતી, અને રશિયનમાં વાતચીત કરે છે." },
    },
    faqs: {
      0: { q: "મારે મારી પ્રથમ એપોઇન્ટમેન્ટમાં શું લાવવું જોઈએ?", a: "તમે તમારું આલ્બર્ટા હેલ્થ કાર્ડ, ફોટો આઈડી, અને વર્તમાન દવાઓની યાદી લાવો તે મદદરૂપ થશે." },
      1: { q: "મારી પ્રથમ મુલાકાત દરમિયાન શું થાય છે?", a: "તમારા વાઇટલ સાઇન લેવામાં આવશે — બ્લડ પ્રેશર, હૃદય દર, ઊંચાઈ, અને વજન." },
      2: { q: "તમારા ક્લિનિકના કલાકો શું છે?", a: "અમારા નિયમિત ક્લિનિક કલાકો સોમવારથી શુક્રવાર સવારે 7:30 થી સાંજે 5 વાગ્યા સુધી છે." },
      3: { q: "હોલ્ટર મોનિટર ટેસ્ટ માટે હું કેવી રીતે તૈયારી કરું?", a: "પરીક્ષાના 24 કલાક પહેલા તમારે કેફીન-મુક્ત રહેવાની જરૂર પડશે." },
    },
  },
};