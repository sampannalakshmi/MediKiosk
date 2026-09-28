// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Red Flag Rules (deterministic, no LLM)
// Called server-side after every patient answer update.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RedFlagAlert,
  RedFlagCategory,
  SOCRATESAbdominalHistory,
} from '@/types/clinical';

function makeFlag(
  category: RedFlagCategory,
  severity: RedFlagAlert['severity'],
  label: string,
  description: string,
  triggeredBy: string[],
  recommendedAction: string
): RedFlagAlert {
  return {
    category,
    severity,
    label,
    description,
    triggeredBy,
    recommendedAction,
    timestamp: new Date().toISOString(),
  };
}

export function evaluateAbdominalRedFlags(
  history: Partial<SOCRATESAbdominalHistory>,
  rawInputs: string[] = []
): RedFlagAlert[] {
  const flags: RedFlagAlert[] = [];
  const raw = rawInputs.join(' ').toLowerCase();

  // ── HEMODYNAMIC_SHOCK ─────────────────────────────────────────────────────
  if ((history.severity ?? 0) >= 9 && history.onset === 'sudden') {
    flags.push(
      makeFlag(
        'HEMODYNAMIC_SHOCK',
        'CRITICAL',
        'Haemodynamic Instability — Possible Shock',
        'Severity ≥9 with sudden onset suggests possible haemodynamic compromise.',
        ['severity >= 9', 'onset = sudden'],
        'Immediate clinical assessment. IV access. Monitor BP and HR. Urgent surgical/medical review.'
      )
    );
  }

  // ── ACUTE_PERITONITIS ─────────────────────────────────────────────────────
  if (
    history.fever === true &&
    history.severity !== undefined &&
    history.severity >= 7 &&
    raw.includes('board') || // board-like rigidity mentioned
    (history.character === 'sharp' && history.fever === true && (history.severity ?? 0) >= 8)
  ) {
    flags.push(
      makeFlag(
        'ACUTE_PERITONITIS',
        'CRITICAL',
        'Possible Acute Peritonitis',
        'High severity sharp pain with fever may indicate peritoneal irritation.',
        ['fever = true', 'severity >= 8', 'character = sharp'],
        'Urgent surgical evaluation. Keep nil by mouth. IV access. Imaging required.'
      )
    );
  }

  // ── GI_BLEED ──────────────────────────────────────────────────────────────
  if (history.bloodInStool === true || history.vomitingContent?.toLowerCase().includes('blood')) {
    flags.push(
      makeFlag(
        'GI_BLEED',
        'CRITICAL',
        'Possible GI Bleed',
        'Blood in stool or haematemesis reported.',
        ['bloodInStool = true OR haematemesis'],
        'Urgent gastroenterology/surgical review. IV access. Cross-match blood. Keep nil by mouth.'
      )
    );
  }
  if (raw.includes('coffee ground') || raw.includes('melaena') || raw.includes('melena')) {
    flags.push(
      makeFlag(
        'GI_BLEED',
        'CRITICAL',
        'Possible Upper GI Bleed — Haematemesis',
        'Patient reports coffee-ground vomit or melaena, suggesting upper GI haemorrhage.',
        ['vomiting_content mentions coffee grounds / melaena'],
        'Urgent upper GI endoscopy. IV PPI. Cross-match. Nil by mouth.'
      )
    );
  }

  // ── SEPSIS ────────────────────────────────────────────────────────────────
  if (history.fever === true && (history.severity ?? 0) >= 7 && history.onset === 'sudden') {
    flags.push(
      makeFlag(
        'SEPSIS',
        'HIGH',
        'Possible Sepsis',
        'Fever with high-severity sudden onset pain may represent septic source.',
        ['fever = true', 'severity >= 7', 'onset = sudden'],
        'Sepsis bundle: blood cultures, IV antibiotics, IV fluids, lactate. Urgent review.'
      )
    );
  }

  // ── PREGNANCY_ACUTE ───────────────────────────────────────────────────────
  if (
    history.pregnancyStatus &&
    history.pregnancyStatus !== 'not_pregnant' &&
    (history.severity ?? 0) >= 7
  ) {
    flags.push(
      makeFlag(
        'PREGNANCY_ACUTE',
        'CRITICAL',
        'Acute Abdominal Pain in Pregnancy',
        'High-severity pain in a patient with possible/confirmed pregnancy requires urgent assessment.',
        ['pregnancyStatus ≠ not_pregnant', 'severity >= 7'],
        'Immediate obstetric review. Rule out ectopic pregnancy. Urine hCG if not confirmed. Ultrasound.'
      )
    );
  }
  // Female of reproductive age with severe lower abdominal pain
  if (
    history.site?.toLowerCase().includes('lower') &&
    (history.severity ?? 0) >= 8 &&
    raw.includes('period')
  ) {
    flags.push(
      makeFlag(
        'PREGNANCY_ACUTE',
        'HIGH',
        'Possible Ectopic / Gynaecological Emergency',
        'Severe lower abdominal pain with menstrual history mentioned.',
        ['site = lower abdomen', 'severity >= 8', 'menstrual history mentioned'],
        'Urine pregnancy test. Urgent gynaecological review. Pelvic ultrasound.'
      )
    );
  }

  // ── INTRACTABLE_VOMITING ──────────────────────────────────────────────────
  if (
    history.vomiting === true &&
    history.vomitingFrequency &&
    (raw.includes('10') || raw.includes('many') || raw.includes('cannot keep'))
  ) {
    flags.push(
      makeFlag(
        'INTRACTABLE_VOMITING',
        'HIGH',
        'Intractable Vomiting — Dehydration Risk',
        'Frequent vomiting with inability to keep fluids down.',
        ['vomiting = true', 'vomitingFrequency mentions many/10+'],
        'IV antiemetics. IV fluid replacement. Monitor electrolytes. Identify underlying cause.'
      )
    );
  }

  // De-duplicate by category (keep highest severity)
  const seen = new Map<RedFlagCategory, RedFlagAlert>();
  for (const f of flags) {
    const existing = seen.get(f.category);
    if (!existing || severityRank(f.severity) > severityRank(existing.severity)) {
      seen.set(f.category, f);
    }
  }
  return Array.from(seen.values());
}

function severityRank(s: RedFlagAlert['severity']): number {
  return s === 'CRITICAL' ? 3 : s === 'HIGH' ? 2 : 1;
}
