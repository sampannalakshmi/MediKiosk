// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Abdominal Pain Question Engine (Phase 2)
//
// Defines the full question tree for abdominal pain interview.
// The LLM handles NLU + phrasing; this engine owns clinical logic & branching.
// ─────────────────────────────────────────────────────────────────────────────

import type { Language } from '@/types/clinical';
import type { ClinicalInterviewState, TouchOption } from '@/types/interviewState';

export type ResponseType = 'text' | 'binary' | 'scale' | 'multiselect' | 'touch_options';

export interface ClinicalQuestion {
  id: string;
  /** Which SOCRATESAbdominalHistory fields this question primarily populates */
  fields: string[];
  category: string;
  /** Base prompt used by AI to phrase the question naturally */
  basePrompt: Record<Language, string>;
  responseType: ResponseType;
  options?: TouchOption[];
  /** If this field is already known (any status ≠ 'unknown'), skip this question */
  skipIfKnown?: string[];
  /** Question IDs that must have been asked before this one */
  prerequisites?: string[];
  /** Function determining if this question is applicable given current state */
  applicableWhen?: (state: ClinicalInterviewState) => boolean;
  /** Max times to attempt clarification before marking uncertain */
  maxClarifications?: number;
}

// ── Question Definitions ─────────────────────────────────────────────────────

export const ABDOMINAL_QUESTIONS: ClinicalQuestion[] = [
  // ── S — Site ───────────────────────────────────────────────────────────────
  {
    id: 'site',
    fields: ['site'],
    category: 'SOCRATES-Site',
    basePrompt: {
      en: 'Can you point to where exactly the pain is? Is it in the upper abdomen, lower abdomen, or all over?',
      te: 'నొప్పి సరిగ్గా ఎక్కడ ఉందో చూపించగలరా? పైభాగంలో, కింది భాగంలో, లేదా అంతటా ఉందా?',
      hi: 'क्या आप बता सकते हैं कि दर्द ठीक कहाँ है? ऊपरी पेट में, नीचले पेट में, या पूरे पेट में?',
    },
    responseType: 'touch_options',
    options: [
      { value: 'upper_right', label: 'Upper right (liver/gallbladder area)' },
      { value: 'upper_left', label: 'Upper left (stomach area)' },
      { value: 'upper_central', label: 'Upper centre (epigastric)' },
      { value: 'central', label: 'Around the navel' },
      { value: 'lower_right', label: 'Lower right' },
      { value: 'lower_left', label: 'Lower left' },
      { value: 'lower_central', label: 'Lower centre (pelvic)' },
      { value: 'diffuse', label: 'All over / difficult to pin down' },
      { value: 'flank', label: 'Side / flank / loin' },
    ],
    maxClarifications: 2,
  },

  // ── S — Radiation ──────────────────────────────────────────────────────────
  {
    id: 'radiation',
    fields: ['siteRadiation', 'radiation'],
    category: 'SOCRATES-Site',
    basePrompt: {
      en: 'Does the pain spread or radiate to any other part of your body, such as your back, shoulder, or groin?',
      te: 'నొప్పి మీ శరీరంలో మరే భాగానికైనా వ్యాపిస్తుందా — వీపు, భుజం, లేదా తొడల్లోకి?',
      hi: 'क्या दर्द शरीर के किसी अन्य हिस्से में भी फैलता है, जैसे पीठ, कंधे या कमर में?',
    },
    responseType: 'binary',
    prerequisites: ['site'],
    maxClarifications: 1,
  },

  // ── O — Onset ─────────────────────────────────────────────────────────────
  {
    id: 'onset',
    fields: ['onset', 'onsetContext'],
    category: 'SOCRATES-Onset',
    basePrompt: {
      en: 'How did the pain start — did it come on suddenly or gradually? Was there anything that brought it on, like eating, movement, or stress?',
      te: 'నొప్పి ఎలా మొదలైంది — అకస్మాత్తుగా వచ్చిందా లేదా నెమ్మదిగా వచ్చిందా? తినడం, కదలిక, లేదా ఒత్తిడి వంటి ఏదైనా దారితీసిందా?',
      hi: 'दर्द कैसे शुरू हुआ — अचानक आया या धीरे-धीरे? क्या खाने, हिलने-डुलने या तनाव से यह शुरू हुआ?',
    },
    responseType: 'touch_options',
    options: [
      { value: 'sudden', label: 'Sudden / came out of nowhere' },
      { value: 'gradual', label: 'Gradual / built up slowly' },
      { value: 'after_eating', label: 'After eating' },
      { value: 'after_movement', label: 'After physical activity' },
    ],
    maxClarifications: 2,
  },

  // ── O — Duration ──────────────────────────────────────────────────────────
  {
    id: 'duration',
    fields: ['onsetDuration'],
    category: 'SOCRATES-Onset',
    basePrompt: {
      en: 'How long have you had this pain? For example, a few hours, since yesterday, a few days, or longer?',
      te: 'ఈ నొప్పి ఎంత కాలం నుండి ఉంది? ఉదాహరణకు, కొన్ని గంటలు, నిన్నటి నుండి, కొన్ని రోజులు, లేదా అంతకంటే ఎక్కువ?',
      hi: 'यह दर्द कितने समय से है? जैसे कुछ घंटे, कल से, कुछ दिनों से, या उससे भी ज़्यादा?',
    },
    responseType: 'touch_options',
    prerequisites: ['onset'],
    options: [
      { value: 'less_1h', label: 'Less than 1 hour' },
      { value: '1_6h', label: '1–6 hours' },
      { value: '6_24h', label: '6–24 hours' },
      { value: '1_3d', label: '1–3 days' },
      { value: '3_7d', label: '3–7 days' },
      { value: '1_4w', label: '1–4 weeks' },
      { value: 'months', label: 'More than a month' },
    ],
    maxClarifications: 1,
  },

  // ── C — Character ─────────────────────────────────────────────────────────
  {
    id: 'character',
    fields: ['character'],
    category: 'SOCRATES-Character',
    basePrompt: {
      en: 'How would you describe the pain? For example — is it sharp, dull, burning, crampy, or like a pressure?',
      te: 'నొప్పిని ఎలా వర్ణిస్తారు? ఉదాహరణకు — పదునుగా, మందంగా, మండినట్టుగా, తిప్పినట్టుగా, లేదా ఒత్తిడిలా?',
      hi: 'दर्द को कैसे वर्णित करेंगे? जैसे — तेज़, हल्का, जलन वाला, ऐंठन वाला, या दबाव जैसा?',
    },
    responseType: 'touch_options',
    options: [
      { value: 'sharp', label: 'Sharp / stabbing' },
      { value: 'dull', label: 'Dull / aching' },
      { value: 'burning', label: 'Burning' },
      { value: 'crampy', label: 'Crampy / colicky' },
      { value: 'pressure', label: 'Pressure / squeezing' },
      { value: 'throbbing', label: 'Throbbing / pulsating' },
    ],
    maxClarifications: 2,
  },

  // ── T — Time course ───────────────────────────────────────────────────────
  {
    id: 'timecourse',
    fields: ['timeCourse', 'progressionTrend'],
    category: 'SOCRATES-Time',
    basePrompt: {
      en: 'Is the pain constant (always there) or does it come and go? And has it been getting worse, better, or staying the same?',
      te: 'నొప్పి నిరంతరంగా ఉంటుందా లేదా వస్తూ పోతుందా? అది మరింత తీవ్రమవుతుందా, తగ్గుతుందా, లేదా అదే విధంగా ఉంటుందా?',
      hi: 'क्या दर्द हमेशा रहता है या आता-जाता है? और क्या यह बढ़ रहा है, घट रहा है, या वैसा ही है?',
    },
    responseType: 'touch_options',
    prerequisites: ['onset'],
    options: [
      { value: 'constant', label: 'Constant — always there' },
      { value: 'intermittent', label: 'Intermittent — comes and goes' },
      { value: 'colicky', label: 'Colicky — comes in waves' },
    ],
    maxClarifications: 1,
  },

  // ── E — Severity ──────────────────────────────────────────────────────────
  {
    id: 'severity',
    fields: ['severity'],
    category: 'SOCRATES-Severity',
    basePrompt: {
      en: 'On a scale of 0 to 10, where 0 is no pain at all and 10 is the worst pain you can imagine — how would you rate your pain right now?',
      te: '0 నుండి 10 స్కేల్‌పై, 0 అంటే నొప్పి లేదు మరియు 10 అంటే మీరు ఊహించగలిగే అత్యంత తీవ్రమైన నొప్పి — ఇప్పుడు మీ నొప్పిని ఎలా రేట్ చేస్తారు?',
      hi: '0 से 10 के पैमाने पर, जहाँ 0 मतलब बिल्कुल दर्द नहीं और 10 मतलब सबसे असहनीय दर्द — अभी आपका दर्द कितना है?',
    },
    responseType: 'scale',
    maxClarifications: 1,
  },

  // ── A — Nausea / Vomiting ─────────────────────────────────────────────────
  {
    id: 'nausea_vomiting',
    fields: ['nausea', 'vomiting', 'vomitingFrequency', 'vomitingContent'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Have you had any nausea or vomiting along with the pain?',
      te: 'నొప్పితో పాటు వికారం లేదా వాంతులు వచ్చాయా?',
      hi: 'क्या दर्द के साथ जी मिचलाना या उल्टी भी हुई?',
    },
    responseType: 'binary',
    maxClarifications: 2,
  },

  // ── A — Blood in vomit ────────────────────────────────────────────────────
  {
    id: 'haematemesis',
    fields: ['vomitingContent'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Did you notice any blood in the vomit, or did it look like coffee grounds?',
      te: 'వాంతిలో రక్తం కనిపించిందా, లేదా కాఫీ గ్రౌండ్స్ లాగా కనిపించిందా?',
      hi: 'क्या उल्टी में खून आया, या वह कॉफी ग्राउंड जैसी दिखी?',
    },
    responseType: 'binary',
    prerequisites: ['nausea_vomiting'],
    applicableWhen: (s) => s.fields['vomiting']?.value === true,
    maxClarifications: 1,
  },

  // ── A — Fever ─────────────────────────────────────────────────────────────
  {
    id: 'fever',
    fields: ['fever', 'feverDegree'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Have you had a fever? If yes, have you measured your temperature?',
      te: 'జ్వరం వచ్చిందా? అవునైతే, మీరు ఉష్ణోగ్రత కొలిచారా?',
      hi: 'क्या आपको बुखार आया? अगर हाँ, तो क्या आपने तापमान मापा?',
    },
    responseType: 'binary',
    maxClarifications: 1,
  },

  // ── A — Bowel changes ─────────────────────────────────────────────────────
  {
    id: 'bowel',
    fields: ['diarrhoea', 'constipation', 'bloodInStool'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Have you noticed any change in your bowels? For example, diarrhoea, constipation, or any blood in the stool?',
      te: 'మీ మలవిసర్జనలో ఏదైనా మార్పు గమనించారా? ఉదాహరణకు, అతిసారం, మలబద్ధకం, లేదా మలంలో రక్తం?',
      hi: 'क्या आपके मल में कोई बदलाव आया है? जैसे दस्त, कब्ज़, या मल में खून?',
    },
    responseType: 'touch_options',
    options: [
      { value: 'diarrhoea', label: 'Diarrhoea / loose stools' },
      { value: 'constipation', label: 'Constipation / no bowel movement' },
      { value: 'blood_stool', label: 'Blood in stool' },
      { value: 'normal', label: 'No change — normal' },
    ],
    maxClarifications: 1,
  },

  // ── A — Jaundice / Anorexia ───────────────────────────────────────────────
  {
    id: 'jaundice_anorexia',
    fields: ['jaundice', 'anorexia', 'weightLoss'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Have you noticed any yellowing of your eyes or skin? Have you lost your appetite or lost weight recently?',
      te: 'మీ కళ్ళు లేదా చర్మం పచ్చగా మారాయా? ఇటీవల ఆకలి తగ్గిందా లేదా బరువు తగ్గిందా?',
      hi: 'क्या आपकी आँखें या त्वचा पीली पड़ी है? क्या हाल ही में भूख कम हुई है या वज़न घटा है?',
    },
    responseType: 'binary',
    maxClarifications: 1,
  },

  // ── A — Urinary symptoms ──────────────────────────────────────────────────
  {
    id: 'urinary',
    fields: ['dysuria', 'urinaryFrequency'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'Do you have any pain or burning when passing urine, or are you going more frequently than usual?',
      te: 'మూత్రవిసర్జన చేసేటప్పుడు నొప్పి లేదా మంట ఉంటుందా, లేదా సాధారణం కంటే ఎక్కువ సార్లు వెళ్తున్నారా?',
      hi: 'पेशाब करते समय दर्द या जलन होती है, या सामान्य से अधिक बार जा रहे हैं?',
    },
    responseType: 'binary',
    maxClarifications: 1,
  },

  // ── A — Gynaecological (female) ───────────────────────────────────────────
  {
    id: 'gynaecological',
    fields: ['vaginalDischarge', 'lastMenstrualPeriod', 'pregnancyStatus'],
    category: 'SOCRATES-Associated',
    basePrompt: {
      en: 'When was your last menstrual period? Have you noticed any unusual vaginal discharge? Is there any possibility you could be pregnant?',
      te: 'మీ చివరి మాసిక ధర్మం ఎప్పుడు? ఏదైనా అసాధారణ యోని స్రావం గమనించారా? మీరు గర్భవతి అయ్యే అవకాశం ఉందా?',
      hi: 'आपका आखिरी मासिक धर्म कब था? कोई असामान्य योनि स्राव दिखा? क्या गर्भवती होने की संभावना है?',
    },
    responseType: 'text',
    applicableWhen: () => {
      // Always ask — gender is captured at patient registration level
      return true;
    },
    maxClarifications: 1,
  },

  // ── E — Exacerbating / Relieving ──────────────────────────────────────────
  {
    id: 'exacerbating',
    fields: ['exacerbatingFactors', 'relievingFactors', 'relationToFood', 'relationToPosture'],
    category: 'SOCRATES-Exacerbating',
    basePrompt: {
      en: 'What makes the pain worse? And what, if anything, helps relieve it — for example, eating, lying down, sitting forward, or taking any medication?',
      te: 'నొప్పిని ఏది తీవ్రతరం చేస్తుంది? ఏది తగ్గిస్తుంది — ఉదాహరణకు, తినడం, పడుకోవడం, ముందుకు వంగి కూర్చోవడం, లేదా ఏదైనా మందు తీసుకోవడం?',
      hi: 'दर्द किससे बढ़ता है? और क्या किससे राहत मिलती है — जैसे खाना, लेटना, आगे झुककर बैठना, या कोई दवाई?',
    },
    responseType: 'text',
    prerequisites: ['severity'],
    maxClarifications: 1,
  },

  // ── Past history ──────────────────────────────────────────────────────────
  {
    id: 'past_history',
    fields: ['similarEpisodesBefore', 'previousAbdominalSurgery'],
    category: 'Background',
    basePrompt: {
      en: 'Have you ever had similar pain before? Have you had any abdominal surgeries in the past?',
      te: 'ఇంతకు ముందు ఇలాంటి నొప్పి వచ్చిందా? గతంలో ఏదైనా పొట్ట ఆపరేషన్ జరిగిందా?',
      hi: 'क्या पहले कभी ऐसा दर्द हुआ है? क्या पेट की कोई सर्जरी हुई है?',
    },
    responseType: 'binary',
    maxClarifications: 1,
  },

  // ── Medications & Allergies ───────────────────────────────────────────────
  {
    id: 'medications',
    fields: ['relevantMedications', 'allergies'],
    category: 'Background',
    basePrompt: {
      en: 'Are you currently taking any medications, including pain killers or antacids? Do you have any known allergies?',
      te: 'మీరు ప్రస్తుతం ఏదైనా మందులు తీసుకుంటున్నారా — నొప్పి మందులు లేదా యాంటాసిడ్లతో సహా? మీకు తెలిసిన అలెర్జీలు ఏమైనా ఉన్నాయా?',
      hi: 'क्या आप अभी कोई दवाई ले रहे हैं — दर्दनाशक या एंटासिड सहित? क्या आपको कोई ज्ञात एलर्जी है?',
    },
    responseType: 'text',
    maxClarifications: 1,
  },

  // ── Alcohol / Smoking ─────────────────────────────────────────────────────
  {
    id: 'habits',
    fields: ['alcoholUse', 'smokingUse'],
    category: 'Background',
    basePrompt: {
      en: 'Do you drink alcohol or smoke? If yes, how much and how often?',
      te: 'మీరు మద్యం తాగుతారా లేదా పొగ తాగుతారా? అవునైతే, ఎంత మరియు ఎంత తరచుగా?',
      hi: 'क्या आप शराब पीते हैं या धूम्रपान करते हैं? अगर हाँ, तो कितना और कितनी बार?',
    },
    responseType: 'binary',
    maxClarifications: 1,
  },
];

// ── Question Engine ──────────────────────────────────────────────────────────

/** Returns the first unanswered, applicable question given current state */
export function getNextQuestion(
  state: ClinicalInterviewState
): ClinicalQuestion | null {
  for (const q of ABDOMINAL_QUESTIONS) {
    // Already asked
    if (state.askedQuestions.includes(q.id)) continue;
    // Skipped
    if (state.skippedQuestions.includes(q.id)) continue;

    // Check prerequisites: all must have been asked
    if (q.prerequisites) {
      const prereqsMet = q.prerequisites.every((prereqId) =>
        state.askedQuestions.includes(prereqId) ||
        state.skippedQuestions.includes(prereqId)
      );
      if (!prereqsMet) continue;
    }

    // Check skipIfKnown: if any listed field is not 'unknown', skip
    if (q.skipIfKnown) {
      const alreadyKnown = q.skipIfKnown.some(
        (f) => (state.fields[f]?.status ?? 'unknown') !== 'unknown'
      );
      if (alreadyKnown) continue;
    }

    // Check applicableWhen predicate
    if (q.applicableWhen && !q.applicableWhen(state)) continue;

    return q;
  }
  return null;
}

/** Returns true when no more applicable questions remain */
export function isInterviewComplete(state: ClinicalInterviewState): boolean {
  return getNextQuestion(state) === null;
}

/** Compute interview progress percentage */
export function interviewProgress(state: ClinicalInterviewState): number {
  const total = ABDOMINAL_QUESTIONS.length;
  const done = state.askedQuestions.length + state.skippedQuestions.length;
  return Math.min(100, Math.round((done / total) * 100));
}

export { ABDOMINAL_QUESTIONS as ABDOMINAL_PAIN_QUESTIONS };
