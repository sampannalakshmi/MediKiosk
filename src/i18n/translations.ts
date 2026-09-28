// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — i18n Translations
// Covers all UI strings for English, Telugu, Hindi
// ─────────────────────────────────────────────────────────────────────────────

import type { Language } from '@/types/clinical';

export type TranslationKey =
  | 'appName'
  | 'welcome'
  | 'welcomeSubtitle'
  | 'selectLanguage'
  | 'consentTitle'
  | 'consentBody'
  | 'iConsent'
  | 'enterPatientId'
  | 'patientIdLabel'
  | 'continueAsGuest'
  | 'selectMode'
  | 'voiceMode'
  | 'textMode'
  | 'touchMode'
  | 'chiefComplaint'
  | 'chiefComplaintPlaceholder'
  | 'startInterview'
  | 'speakNow'
  | 'typeYourAnswer'
  | 'submit'
  | 'next'
  | 'back'
  | 'skip'
  | 'correct'
  | 'interviewComplete'
  | 'uploadDocuments'
  | 'processing'
  | 'reviewSummary'
  | 'submitting'
  | 'submitted'
  | 'doctorWillReview'
  | 'redFlagAlert'
  | 'severity'
  | 'yes'
  | 'no'
  | 'notSure'
  | 'tapToSpeak'
  | 'listening'
  | 'recordingError'
  | 'fieldPresent'
  | 'fieldDenied'
  | 'fieldUnknown'
  | 'fieldUncertain'
  | 'correctionMode'
  | 'correctionInstruction'
  // Phase 3 additions:
  | 'addDocumentsTitle'
  | 'addDocumentsSubtitle'
  | 'takePhoto'
  | 'uploadImage'
  | 'uploadPdf'
  | 'useDemoDocument'
  | 'readyToProcess'
  | 'readingDocument'
  | 'findingMedicalInfo'
  | 'preparingHistory'
  | 'readyForReview'
  | 'reviewExtractedTitle'
  | 'confirmAction'
  | 'editAction'
  | 'tryAgain'
  | 'continueWithoutDoc'
  | 'unreadableDocError'
  | 'processDocument';

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appName: 'MediKiosk',
    welcome: 'Welcome to MediKiosk',
    welcomeSubtitle: 'AI-assisted clinical history — helping your doctor help you',
    selectLanguage: 'Please select your preferred language',
    consentTitle: 'Your Privacy & Consent',
    consentBody:
      'This system collects your medical history to help prepare for your consultation. Your information is shared only with your treating doctor. This system does not diagnose you or prescribe treatment.',
    iConsent: 'I understand and consent to proceed',
    enterPatientId: 'Enter Patient ID (optional)',
    patientIdLabel: 'Patient ID / ABHA Number',
    continueAsGuest: 'Continue as Guest',
    selectMode: 'How would you like to answer questions?',
    voiceMode: 'Voice — Speak your answers',
    textMode: 'Type — Type your answers',
    touchMode: 'Touch — Select from options',
    chiefComplaint: 'What is your main problem today?',
    chiefComplaintPlaceholder: 'e.g. stomach pain, headache, fever...',
    startInterview: 'Start Interview',
    speakNow: 'Speak now...',
    typeYourAnswer: 'Type your answer here...',
    submit: 'Submit',
    next: 'Next',
    back: 'Back',
    skip: 'Skip this question',
    correct: 'Correct this answer',
    interviewComplete: 'Interview Complete',
    uploadDocuments: 'Upload Previous Documents (Optional)',
    processing: 'Processing your information...',
    reviewSummary: 'Review Your Summary',
    submitting: 'Submitting to doctor queue...',
    submitted: 'Submitted Successfully',
    doctorWillReview: 'Your doctor will review this before your consultation.',
    redFlagAlert: '⚠ Alert — Urgent Attention Required',
    severity: 'Severity',
    yes: 'Yes',
    no: 'No',
    notSure: 'Not sure',
    tapToSpeak: 'Tap to Speak',
    listening: 'Listening...',
    recordingError: 'Could not capture audio. Please type your answer.',
    fieldPresent: 'Yes',
    fieldDenied: 'No',
    fieldUnknown: 'Not asked yet',
    fieldUncertain: 'Uncertain',
    correctionMode: 'Correction Mode',
    correctionInstruction: 'Select a field below to correct your answer.',

    // Phase 3
    addDocumentsTitle: 'Add Medical Documents',
    addDocumentsSubtitle: 'You can upload prescriptions, lab reports, scan reports, discharge summaries, or other medical records.',
    takePhoto: 'Take Photo',
    uploadImage: 'Upload Image',
    uploadPdf: 'Upload PDF',
    useDemoDocument: 'Use Demo Document',
    readyToProcess: 'Ready to process',
    readingDocument: 'Reading your document...',
    findingMedicalInfo: 'Finding relevant medical information...',
    preparingHistory: 'Preparing your medical history...',
    readyForReview: 'Ready for review',
    reviewExtractedTitle: 'Review Extracted Information',
    confirmAction: 'Confirm',
    editAction: 'Edit',
    tryAgain: 'Try again',
    continueWithoutDoc: 'Continue without this document',
    unreadableDocError: "We couldn't reliably read this document.",
    processDocument: 'Process Document',
  },

  te: {
    appName: 'మెడికియోస్క్',
    welcome: 'మెడికియోస్క్‌కు స్వాగతం',
    welcomeSubtitle: 'AI సహాయంతో వైద్య చరిత్ర — మీ వైద్యుడికి మీకు సహాయం చేయడంలో',
    selectLanguage: 'దయచేసి మీ భాషను ఎంచుకోండి',
    consentTitle: 'మీ గోప్యత & సమ్మతి',
    consentBody:
      'ఈ వ్యవస్థ మీ సంప్రదింపు కోసం సిద్ధం చేయడానికి మీ వైద్య చరిత్రను సేకరిస్తుంది. మీ సమాచారం మీ చికిత్స వైద్యుడితో మాత్రమే పంచుకోబడుతుంది.',
    iConsent: 'నేను అర్థం చేసుకున్నాను మరియు కొనసాగడానికి అంగీకరిస్తున్నాను',
    enterPatientId: 'రోగి ID నమోదు చేయండి (ఐచ్ఛికం)',
    patientIdLabel: 'రోగి ID / ABHA నంబర్',
    continueAsGuest: 'అతిథిగా కొనసాగించండి',
    selectMode: 'మీరు ప్రశ్నలకు ఎలా జవాబు ఇవ్వాలనుకుంటున్నారు?',
    voiceMode: 'వాయిస్ — మీ జవాబులు చెప్పండి',
    textMode: 'టైప్ — మీ జవాబులు టైప్ చేయండి',
    touchMode: 'టచ్ — ఎంపికల నుండి ఎంచుకోండి',
    chiefComplaint: 'ఈరోజు మీ ప్రధాన సమస్య ఏమిటి?',
    chiefComplaintPlaceholder: 'ఉదా. కడుపు నొప్పి, తలనొప్పి, జ్వరం...',
    startInterview: 'ఇంటర్వ్యూ ప్రారంభించండి',
    speakNow: 'ఇప్పుడు మాట్లాడండి...',
    typeYourAnswer: 'మీ జవాబు ఇక్కడ టైప్ చేయండి...',
    submit: 'సమర్పించండి',
    next: 'తర్వాత',
    back: 'వెనుకకు',
    skip: 'ఈ ప్రశ్న దాటవేయండి',
    correct: 'ఈ జవాబు సరిచేయండి',
    interviewComplete: 'ఇంటర్వ్యూ పూర్తయింది',
    uploadDocuments: 'మునుపటి పత్రాలు అప్‌లోడ్ చేయండి (ఐచ్ఛికం)',
    processing: 'మీ సమాచారం ప్రాసెస్ అవుతోంది...',
    reviewSummary: 'మీ సారాంశాన్ని సమీక్షించండి',
    submitting: 'వైద్యుడి క్యూకు సమర్పిస్తోంది...',
    submitted: 'విజయవంతంగా సమర్పించబడింది',
    doctorWillReview: 'మీ సంప్రదింపుకు ముందు మీ వైద్యుడు దీన్ని సమీక్షిస్తారు.',
    redFlagAlert: '⚠ హెచ్చరిక — తక్షణ శ్రద్ధ అవసరం',
    severity: 'తీవ్రత',
    yes: 'అవును',
    no: 'కాదు',
    notSure: 'ఖచ్చితంగా తెలియదు',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటున్నాను...',
    recordingError: 'ఆడియో క్యాప్చర్ చేయలేకపోయాం. దయచేసి మీ జవాబు టైప్ చేయండి.',
    fieldPresent: 'అవును',
    fieldDenied: 'కాదు',
    fieldUnknown: 'ఇంకా అడగలేదు',
    fieldUncertain: 'అనిశ్చితం',
    correctionMode: 'దిద్దుబాటు మోడ్',
    correctionInstruction: 'మీ జవాబు సరిచేయడానికి దిగువ ఫీల్డ్ ఎంచుకోండి.',

    // Phase 3
    addDocumentsTitle: 'వైద్య పత్రాలను జోడించండి',
    addDocumentsSubtitle: 'మీరు ప్రిస్క్రిప్షన్‌లు, ల్యాబ్ నివేదికలు, స్కాన్ రిపోర్టులు లేదా డిశ్చార్జ్ సారాంశాలను అప్‌లోడ్ చేయవచ్చు.',
    takePhoto: 'ఫోటో తీయండి',
    uploadImage: 'చిత్రాన్ని అప్‌లోడ్ చేయండి',
    uploadPdf: 'PDF అప్‌లోడ్ చేయండి',
    useDemoDocument: 'డెమో పత్రాన్ని ఉపయోగించండి',
    readyToProcess: 'ప్రాసెస్ చేయడానికి సిద్ధంగా ఉంది',
    readingDocument: 'మీ పత్రాన్ని చదువుతున్నాము...',
    findingMedicalInfo: 'వైద్య సమాచారాన్ని గుర్తిస్తున్నాము...',
    preparingHistory: 'మీ వైద్య చరిత్రను సిద్ధం చేస్తున్నాము...',
    readyForReview: 'సమీక్షించడానికి సిద్ధంగా ఉంది',
    reviewExtractedTitle: 'గుర్తించిన సమాచారాన్ని సమీక్షించండి',
    confirmAction: 'ధృవీకరించండి',
    editAction: 'సవరించండి',
    tryAgain: 'మళ్లీ ప్రయత్నించండి',
    continueWithoutDoc: 'ఈ పత్రం లేకుండా కొనసాగండి',
    unreadableDocError: 'మేము ఈ పత్రాన్ని సరిగ్గా చదవలేకపోయాము.',
    processDocument: 'పత్రాన్ని ప్రాసెస్ చేయండి',
  },

  hi: {
    appName: 'मेडीकियोस्क',
    welcome: 'मेडीकियोस्क में आपका स्वागत है',
    welcomeSubtitle: 'AI सहायता से चिकित्सा इतिहास — आपके डॉक्टर की मदद के लिए',
    selectLanguage: 'कृपया अपनी भाषा चुनें',
    consentTitle: 'आपकी गोपनीयता और सहमति',
    consentBody:
      'यह प्रणाली आपके परामर्श की तैयारी के लिए आपका चिकित्सा इतिहास एकत्र करती है। आपकी जानकारी केवल आपके उपचार करने वाले डॉक्टर के साथ साझा की जाती है।',
    iConsent: 'मैं समझता/समझती हूँ और आगे बढ़ने की सहमति देता/देती हूँ',
    enterPatientId: 'रोगी ID दर्ज करें (वैकल्पिक)',
    patientIdLabel: 'रोगी ID / ABHA नंबर',
    continueAsGuest: 'अतिथि के रूप में जारी रखें',
    selectMode: 'आप प्रश्नों का उत्तर कैसे देना चाहते हैं?',
    voiceMode: 'आवाज़ — अपने उत्तर बोलें',
    textMode: 'टाइप — अपने उत्तर टाइप करें',
    touchMode: 'टच — विकल्पों में से चुनें',
    chiefComplaint: 'आज आपकी मुख्य समस्या क्या है?',
    chiefComplaintPlaceholder: 'जैसे पेट दर्द, सिरदर्द, बुखार...',
    startInterview: 'साक्षात्कार शुरू करें',
    speakNow: 'अभी बोलें...',
    typeYourAnswer: 'यहाँ अपना उत्तर टाइप करें...',
    submit: 'जमा करें',
    next: 'आगे',
    back: 'पीछे',
    skip: 'यह प्रश्न छोड़ें',
    correct: 'यह उत्तर सुधारें',
    interviewComplete: 'साक्षात्कार पूर्ण',
    uploadDocuments: 'पिछले दस्तावेज़ अपलोड करें (वैकल्पिक)',
    processing: 'आपकी जानकारी प्रोसेस हो रही है...',
    reviewSummary: 'अपना सारांश देखें',
    submitting: 'डॉक्टर की क्यू में भेजा जा रहा है...',
    submitted: 'सफलतापूर्वक जमा किया गया',
    doctorWillReview: 'आपके परामर्श से पहले आपके डॉक्टर इसकी समीक्षा करेंगे।',
    redFlagAlert: '⚠ चेतावनी — तत्काल ध्यान आवश्यक',
    severity: 'गंभीरता',
    yes: 'हाँ',
    no: 'नहीं',
    notSure: 'निश्चित नहीं',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा हूँ...',
    recordingError: 'ऑडियो कैप्चर नहीं हो सका। कृपया अपना उत्तर टाइप करें।',
    fieldPresent: 'हाँ',
    fieldDenied: 'नहीं',
    fieldUnknown: 'अभी नहीं पूछा',
    fieldUncertain: 'अनिश्चित',
    correctionMode: 'सुधार मोड',
    correctionInstruction: 'अपना उत्तर सुधारने के लिए नीचे फ़ील्ड चुनें।',

    // Phase 3
    addDocumentsTitle: 'चिकित्सा दस्तावेज़ जोड़ें',
    addDocumentsSubtitle: 'आप नुस्खे (पर्चे), लैब रिपोर्ट, स्कैन रिपोर्ट, या डिस्चार्ज सारांश अपलोड कर सकते हैं।',
    takePhoto: 'फोटो लें',
    uploadImage: 'छवि अपलोड करें',
    uploadPdf: 'PDF अपलोड करें',
    useDemoDocument: 'डेमो दस्तावेज़ उपयोग करें',
    readyToProcess: 'प्रोसेस करने के लिए तैयार',
    readingDocument: 'आपके दस्तावेज़ को पढ़ा जा रहा है...',
    findingMedicalInfo: 'चिकित्सा जानकारी खोजी जा रही है...',
    preparingHistory: 'आपका चिकित्सा इतिहास तैयार किया जा रहा है...',
    readyForReview: 'समीक्षा के लिए तैयार',
    reviewExtractedTitle: 'निकाली गई जानकारी की समीक्षा करें',
    confirmAction: 'पुष्टि करें',
    editAction: 'संशोधित करें',
    tryAgain: 'पुनः प्रयास करें',
    continueWithoutDoc: 'इस दस्तावेज़ के बिना आगे बढ़ें',
    unreadableDocError: 'हम इस दस्तावेज़ को ठीक से नहीं पढ़ सके।',
    processDocument: 'दस्तावेज़ प्रोसेस करें',
  },
};

export function t(lang: Language, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
}
