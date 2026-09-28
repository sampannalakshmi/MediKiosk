// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — AI Service (Server-side only)
//
// GEMINI_API_KEY is used exclusively server-side.
// This module must NEVER be imported in client components.
// ─────────────────────────────────────────────────────────────────────────────

import type { Language } from '@/types/clinical';

export interface AIExtractionRequest {
  questionId: string;
  questionText: string;
  patientResponse: string;
  language: Language;
  targetFields: string[];
}

export interface AIExtractionResponse {
  extracted: Array<{
    field: string;
    value: unknown;
    status: 'present' | 'denied' | 'uncertain';
    confidence: number;
    reasoning?: string;
  }>;
  needsClarification: boolean;
  clarificationPrompt?: string;
}

export interface AIQuestionPhrasingRequest {
  questionId: string;
  basePrompt: string;
  language: Language;
  contextSummary: string;
}

export interface AISummaryRequest {
  language: Language;
  chiefComplaint: string;
  extractedHistory: Record<string, unknown>;
  redFlagCategories: string[];
}

export interface AIService {
  extractAnswer(req: AIExtractionRequest): Promise<AIExtractionResponse>;
  phraseQuestion(req: AIQuestionPhrasingRequest): Promise<string>;
  generateSummary(req: AISummaryRequest): Promise<string>;
}

// ── Mock implementation ───────────────────────────────────────────────────────

class MockAIService implements AIService {
  async extractAnswer(req: AIExtractionRequest): Promise<AIExtractionResponse> {
    const raw = req.patientResponse.toLowerCase();
    const extracted: AIExtractionResponse['extracted'] = [];

    for (const field of req.targetFields) {
      if (['nausea','vomiting','fever','diarrhoea','constipation','bloodInStool',
           'jaundice','anorexia','weightLoss','dysuria','urinaryFrequency',
           'alcoholUse','smokingUse','similarEpisodesBefore','previousAbdominalSurgery'].includes(field)) {
        const yes = /\b(yes|haan|avunu|undi|hai)\b/i.test(raw);
        const no  = /\b(no|nahi|kaadu|ledu|nope)\b/i.test(raw);
        if (yes || no) extracted.push({ field, value: yes, status: yes ? 'present' : 'denied', confidence: 0.75 });
        continue;
      }
      if (field === 'severity') {
        const m = raw.match(/\b(10|[0-9])\b/);
        if (m) extracted.push({ field, value: parseInt(m[1]), status: 'present', confidence: 0.9 });
        continue;
      }
      if (field === 'onset') {
        if (/sudden|abrupt|achanak|ek dam/i.test(raw))
          extracted.push({ field, value: 'sudden', status: 'present', confidence: 0.8 });
        else if (/gradual|slow|dhire|melle/i.test(raw))
          extracted.push({ field, value: 'gradual', status: 'present', confidence: 0.8 });
        continue;
      }
      if (field === 'character') {
        const map: [RegExp, string][] = [
          [/sharp|knife|stabbing/, 'sharp'], [/dull|ach/, 'dull'],
          [/burn/, 'burning'], [/cramp|colic/, 'crampy'], [/pressure|squeeze/, 'pressure'],
        ];
        for (const [re, v] of map) {
          if (re.test(raw)) { extracted.push({ field, value: v, status: 'present', confidence: 0.75 }); break; }
        }
        continue;
      }
      if (field === 'site') {
        if (/upper right|liver|gallbladder/.test(raw))     extracted.push({ field, value: 'upper_right', status: 'present', confidence: 0.7 });
        else if (/lower right|appendix/.test(raw))         extracted.push({ field, value: 'lower_right', status: 'present', confidence: 0.7 });
        else if (/lower|pelv|pelvic/.test(raw))            extracted.push({ field, value: 'lower_central', status: 'present', confidence: 0.65 });
        else if (/upper|epigastric|chest/.test(raw))       extracted.push({ field, value: 'upper_central', status: 'present', confidence: 0.65 });
        else if (/all over|diffuse|everywhere/.test(raw))  extracted.push({ field, value: 'diffuse', status: 'present', confidence: 0.7 });
        continue;
      }
      if (field === 'onsetDuration') {
        const patterns: [RegExp, string][] = [
          [/(\d+)\s*(hour|ghante)/, '$1 hour(s)'], [/(yesterday|kal se)/, '1 day'],
          [/(\d+)\s*(day|din)/, '$1 day(s)'],      [/(\d+)\s*(week|hafte)/, '$1 week(s)'],
        ];
        for (const [re, tpl] of patterns) {
          const m = raw.match(re);
          if (m) { extracted.push({ field, value: tpl.replace('$1', m[1] ?? ''), status: 'present', confidence: 0.8 }); break; }
        }
        continue;
      }
    }

    const needsClarification = extracted.length === 0;
    return { extracted, needsClarification, clarificationPrompt: needsClarification ? 'Could you tell me a bit more about that?' : undefined };
  }

  async phraseQuestion(req: AIQuestionPhrasingRequest): Promise<string> {
    return req.basePrompt;
  }

  async generateSummary(req: AISummaryRequest): Promise<string> {
    const h = req.extractedHistory;
    const lines = [
      'PRELIMINARY CLINICAL HISTORY SUMMARY (AI-assisted — for physician review only)',
      `Chief Complaint: ${req.chiefComplaint}`,
      '',
      '--- SOCRATES ---',
    ];
    if (h.site)      lines.push(`Site: ${h.site}`);
    if (h.onset)     lines.push(`Onset: ${h.onset}${h.onsetDuration ? ` (${h.onsetDuration})` : ''}`);
    if (h.character) lines.push(`Character: ${h.character}`);
    if (h.severity !== undefined) lines.push(`Severity: ${h.severity}/10`);
    if (h.timeCourse) lines.push(`Time course: ${h.timeCourse}`);
    const assoc = ['nausea','vomiting','fever','diarrhoea','constipation','bloodInStool','jaundice']
      .filter(k => h[k]).map(k => k.charAt(0).toUpperCase() + k.slice(1));
    if (assoc.length) lines.push(`Associated: ${assoc.join(', ')}`);
    if (req.redFlagCategories.length) { lines.push(''); lines.push(`⚠ RED FLAGS: ${req.redFlagCategories.join(', ')}`); }
    lines.push(''); lines.push('Physician review and clinical examination required before any diagnosis or management decision.');
    return lines.join('\n');
  }
}

// ── Gemini implementation ─────────────────────────────────────────────────────

class GeminiAIService implements AIService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;
  private modelId: string;

  constructor(apiKey: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleGenAI } = require('@google/genai');
    this.client = new GoogleGenAI({ apiKey });
    this.modelId = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  }

  private async generate(system: string, user: string): Promise<string> {
    const res = await this.client.models.generateContent({
      model: this.modelId,
      config: { systemInstruction: system },
      contents: [{ role: 'user', parts: [{ text: user }] }],
    });
    return res.text ?? '';
  }

  async extractAnswer(req: AIExtractionRequest): Promise<AIExtractionResponse> {
    const system = `You are a clinical data extraction assistant for MediKiosk (India).
Extract ONLY what the patient explicitly stated. Never diagnose. Never invent.
Fields to extract: ${req.targetFields.join(', ')}.
Question asked: "${req.questionText}". Patient language: ${req.language}.
Return ONLY valid JSON:
{"extracted":[{"field":"...","value":...,"status":"present|denied|uncertain","confidence":0.0-1.0,"reasoning":"..."}],"needsClarification":true|false,"clarificationPrompt":"...or null"}`;
    try {
      const raw = await this.generate(system, `Patient response: "${req.patientResponse}"`);
      const json = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      return JSON.parse(json) as AIExtractionResponse;
    } catch {
      return new MockAIService().extractAnswer(req);
    }
  }

  async phraseQuestion(req: AIQuestionPhrasingRequest): Promise<string> {
    const system = `You are a compassionate, culturally sensitive clinical assistant at a busy Indian hospital.
Rephrase the given clinical question naturally in ${req.language}.
Use simple language, no jargon. Be warm. 1–3 sentences max.
Context (already known): ${req.contextSummary}
Return ONLY the rephrased question. No explanation.`;
    try { return await this.generate(system, req.basePrompt); }
    catch { return req.basePrompt; }
  }

  async generateSummary(req: AISummaryRequest): Promise<string> {
    const system = `You are a clinical documentation assistant generating a preliminary history summary for a physician.
RULES: No diagnosis. No treatment recommendation. Use "reportedly" for uncertain findings.
Write in professional medical English. Use bullet points per SOCRATES section.
End with: "Physician review and clinical examination required before any diagnosis or management decision."`;
    const content = `Chief Complaint: ${req.chiefComplaint}\nHistory: ${JSON.stringify(req.extractedHistory,null,2)}\nRed Flags: ${req.redFlagCategories.join(', ')||'None'}`;
    try { return await this.generate(system, content); }
    catch { return new MockAIService().generateSummary(req); }
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _service: AIService | null = null;
export function getAIService(): AIService {
  if (_service) return _service;
  const key = process.env.GEMINI_API_KEY;
  const mock = process.env.USE_MOCK_AI === 'true';
  if (!mock && key && key.trim()) {
    try { _service = new GeminiAIService(key); return _service; }
    catch { console.warn('[MediKiosk] Gemini init failed — using mock'); }
  }
  _service = new MockAIService();
  return _service;
}
