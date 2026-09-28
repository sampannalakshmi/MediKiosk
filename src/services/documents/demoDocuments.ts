// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — Synthetic Demo Documents (Phase 3)
// Realistic, clearly synthetic clinical documents for demonstration
// ─────────────────────────────────────────────────────────────────────────────

import type { DocumentType } from '@/types/document';

export interface SyntheticDemoDocument {
  id: string;
  filename: string;
  title: string;
  documentType: DocumentType;
  mimeType: string;
  documentDate: string;
  facility: string;
  patientName: string;
  description: string;
  rawOcrText: string;
  previewSvg: string; // SVG graphic for realistic visual preview
}

export const SYNTHETIC_DEMO_DOCUMENTS: SyntheticDemoDocument[] = [
  // ── 1. Blood Report ────────────────────────────────────────────────────────
  {
    id: 'demo-doc-blood-report',
    filename: 'apex_cbc_blood_report_12sep2026.pdf',
    title: 'Complete Blood Count (CBC) Report',
    documentType: 'lab_report',
    mimeType: 'application/pdf',
    documentDate: '2026-09-12',
    facility: 'Apex Clinical Diagnostic Center, Hyderabad',
    patientName: 'Ramesh Verma (45Y / Male)',
    description: 'Complete blood picture showing mild anemia (Hb 10.2 g/dL) and mild leukocytosis.',
    rawOcrText: `APEX CLINICAL DIAGNOSTIC CENTER
ISO 9001:2015 & NABL ACCREDITED LABORATORY
Plot 44, Road No 2, Banjara Hills, Hyderabad - 500034

PATIENT INVESTIGATION REPORT
Patient ID: PT-2026-8941          Date: 12-Sep-2026
Name: Ramesh Verma               Age: 45 Yrs / Male
Ref By: Dr. K. S. Rao, MD        Specimen: Whole Blood (EDTA)

DEPARTMENT OF PATHOLOGY & HEMATOLOGY
TEST NAME                   RESULT    UNIT        REFERENCE RANGE    STATUS
--------------------------------------------------------------------------------
Hemoglobin (Hb)             10.2      g/dL        13.0 - 17.0        LOW (Mild Anemia)
Total WBC Count (TLC)       11,500    /cumm       4,000 - 11,000     HIGH (Mild Leukocytosis)
RBC Count                   4.1       mil/cumm    4.5 - 5.5          LOW
Packed Cell Volume (PCV)    32.5      %           40.0 - 50.0        LOW
Platelet Count              220,000   /cumm       150,000 - 450,000  NORMAL
E.S.R. (Westergren)         28        mm/1st hr   0 - 15             ELEVATED

DIFFERENTIAL LEUCOCYTE COUNT (DLC):
Neutrophils                 68        %           50 - 70
Lymphocytes                 24        %           20 - 40
Eosinophils                 04        %           01 - 06
Monocytes                   04        %           02 - 08
Basophils                   00        %           00 - 01

PERIPHERAL BLOOD SMEAR:
RBCs show mild microcytic hypochromic picture. No parasites seen.
Impression: Microcytic hypochromic mild anemia with reactive leukocytosis.

*** End of Report — Dr. P. Anitha, MD (Pathologist) ***`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%" style="background:#ffffff; font-family:sans-serif;">
      <rect width="600" height="800" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="70" fill="#1e3a8a"/>
      <text x="30" y="38" fill="#ffffff" font-size="20" font-weight="bold">APEX DIAGNOSTICS &amp; CLINICAL LABS</text>
      <text x="30" y="58" fill="#93c5fd" font-size="12">NABL ACCREDITED — HYDERABAD</text>
      
      <rect x="30" y="90" width="540" height="60" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
      <text x="45" y="115" fill="#334155" font-size="13" font-weight="bold">Patient: Ramesh Verma (45M)</text>
      <text x="360" y="115" fill="#334155" font-size="13">Date: 12-Sep-2026</text>
      <text x="45" y="135" fill="#64748b" font-size="12">Ref: Dr. K. S. Rao, MD</text>
      <text x="360" y="135" fill="#64748b" font-size="12">Specimen: Whole Blood</text>
      
      <text x="30" y="185" fill="#1e293b" font-size="16" font-weight="bold">COMPLETE BLOOD COUNT (CBC)</text>
      <line x1="30" y1="195" x2="570" y2="195" stroke="#94a3b8" stroke-width="1.5"/>
      
      <text x="30" y="225" fill="#475569" font-size="13" font-weight="bold">Test Parameter</text>
      <text x="240" y="225" fill="#475569" font-size="13" font-weight="bold">Result</text>
      <text x="350" y="225" fill="#475569" font-size="13" font-weight="bold">Units</text>
      <text x="440" y="225" fill="#475569" font-size="13" font-weight="bold">Ref. Range</text>
      
      <line x1="30" y1="235" x2="570" y2="235" stroke="#e2e8f0"/>
      
      <text x="30" y="265" fill="#0f172a" font-size="14">Hemoglobin</text>
      <rect x="235" y="250" width="60" height="22" fill="#fee2e2" rx="4"/>
      <text x="242" y="266" fill="#b91c1c" font-size="14" font-weight="bold">10.2 (L)</text>
      <text x="350" y="265" fill="#475569" font-size="14">g/dL</text>
      <text x="440" y="265" fill="#64748b" font-size="13">13.0 - 17.0</text>
      
      <line x1="30" y1="285" x2="570" y2="285" stroke="#e2e8f0"/>
      
      <text x="30" y="315" fill="#0f172a" font-size="14">Total WBC Count</text>
      <rect x="235" y="300" width="75" height="22" fill="#fef3c7" rx="4"/>
      <text x="240" y="316" fill="#b45309" font-size="14" font-weight="bold">11,500 (H)</text>
      <text x="350" y="315" fill="#475569" font-size="14">/cumm</text>
      <text x="440" y="315" fill="#64748b" font-size="13">4,000 - 11,000</text>
      
      <line x1="30" y1="335" x2="570" y2="335" stroke="#e2e8f0"/>
      
      <text x="30" y="365" fill="#0f172a" font-size="14">Platelet Count</text>
      <text x="240" y="365" fill="#15803d" font-size="14" font-weight="bold">220,000</text>
      <text x="350" y="365" fill="#475569" font-size="14">/cumm</text>
      <text x="440" y="365" fill="#64748b" font-size="13">150,000 - 450,000</text>
      
      <line x1="30" y1="385" x2="570" y2="385" stroke="#e2e8f0"/>
      
      <text x="30" y="415" fill="#0f172a" font-size="14">E.S.R. (Westergren)</text>
      <text x="240" y="415" fill="#b45309" font-size="14" font-weight="bold">28 (H)</text>
      <text x="350" y="415" fill="#475569" font-size="14">mm/1st hr</text>
      <text x="440" y="415" fill="#64748b" font-size="13">0 - 15</text>
      
      <rect x="30" y="460" width="540" height="80" fill="#f1f5f9" rx="6"/>
      <text x="45" y="485" fill="#334155" font-size="12" font-weight="bold">Pathologist Remarks:</text>
      <text x="45" y="505" fill="#475569" font-size="12">Microcytic hypochromic mild anemia with reactive leukocytosis.</text>
      <text x="45" y="525" fill="#64748b" font-size="11">Clinical correlation advised with serum ferritin and iron profile.</text>
      
      <text x="400" y="740" fill="#64748b" font-size="12">Dr. P. Anitha, MD</text>
      <text x="400" y="756" fill="#94a3b8" font-size="11">Consultant Pathologist</text>
    </svg>`,
  },

  // ── 2. Prescription ────────────────────────────────────────────────────────
  {
    id: 'demo-doc-prescription',
    filename: 'dr_rao_prescription_02jul2026.png',
    title: 'Outpatient Medical Prescription',
    documentType: 'prescription',
    mimeType: 'image/png',
    documentDate: '2026-07-02',
    facility: 'Apollo Clinic, Himayatnagar, Hyderabad',
    patientName: 'Ramesh Verma (45Y / Male)',
    description: 'Prescription containing Amlodipine 5 mg, Pantoprazole 40 mg, and Paracetamol 500 mg.',
    rawOcrText: `DR. K. S. RAO, MD (Internal Medicine)
Regd No: TSMC-48291
APOLLO CLINIC, HIMAYATNAGAR, HYDERABAD
Ph: 040-23456789

OUTPATIENT CONSULTATION PRESCRIPTION
Date: 02-Jul-2026
Patient: Ramesh Verma          Age: 45 Yrs / Male
BP: 142/88 mmHg               Weight: 74 kg
Diagnosis: Essential Hypertension, Dyspepsia / Acid Peptic Disease

Rx:
1. Tab. AMLODIPINE 5 mg
   Sig: 1 tablet Once Daily (Morning after food)
   Duration: 30 days
   Dispense: 30 tablets

2. Tab. PANTOPRAZOLE 40 mg
   Sig: 1 tablet Once Daily (Before breakfast)
   Duration: 14 days
   Dispense: 14 tablets

3. Tab. PARACETAMOL 500 mg
   Sig: 1 tablet SOS for headache / fever (max 3 per day)
   Duration: 5 days

General Advice:
- Low sodium diet (< 5g salt/day)
- Avoid spicy and oily foods
- Review BP after 4 weeks or earlier if headache persists

Dr. K. S. Rao, MD
Signature: [Verified Clinician Signature]`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%" style="background:#ffffff; font-family:sans-serif;">
      <rect width="600" height="800" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="80" fill="#047857"/>
      <text x="30" y="38" fill="#ffffff" font-size="20" font-weight="bold">DR. K. S. RAO, MD</text>
      <text x="30" y="58" fill="#a7f3d0" font-size="12">CONSULTANT PHYSICIAN — Reg No: TSMC-48291</text>
      <text x="30" y="72" fill="#d1fae5" font-size="11">APOLLO CLINIC, HIMAYATNAGAR, HYDERABAD</text>
      
      <rect x="30" y="100" width="540" height="50" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
      <text x="45" y="125" fill="#334155" font-size="13" font-weight="bold">Patient: Ramesh Verma (45M)</text>
      <text x="380" y="125" fill="#334155" font-size="13">Date: 02-Jul-2026</text>
      <text x="45" y="142" fill="#64748b" font-size="12">BP: 142/88 mmHg  |  Wt: 74 kg</text>
      <text x="380" y="142" fill="#047857" font-size="12">Dx: Hypertension, Dyspepsia</text>
      
      <text x="30" y="195" fill="#047857" font-size="32" font-style="italic" font-weight="bold">Rx</text>
      <line x1="30" y1="210" x2="570" y2="210" stroke="#047857" stroke-width="2"/>
      
      <g transform="translate(40, 240)">
        <circle cx="10" cy="10" r="4" fill="#047857"/>
        <text x="25" y="15" fill="#0f172a" font-size="16" font-weight="bold">Tab. AMLODIPINE 5 mg</text>
        <text x="25" y="35" fill="#475569" font-size="13">1 tablet Once Daily (Morning after food) x 30 days</text>
      </g>
      
      <g transform="translate(40, 310)">
        <circle cx="10" cy="10" r="4" fill="#047857"/>
        <text x="25" y="15" fill="#0f172a" font-size="16" font-weight="bold">Tab. PANTOPRAZOLE 40 mg</text>
        <text x="25" y="35" fill="#475569" font-size="13">1 tablet Once Daily (Before breakfast) x 14 days</text>
      </g>
      
      <g transform="translate(40, 380)">
        <circle cx="10" cy="10" r="4" fill="#047857"/>
        <text x="25" y="15" fill="#0f172a" font-size="16" font-weight="bold">Tab. PARACETAMOL 500 mg</text>
        <text x="25" y="35" fill="#475569" font-size="13">1 tablet SOS for headache / fever</text>
      </g>
      
      <rect x="30" y="470" width="540" height="90" fill="#f0fdf4" stroke="#bbf7d0" rx="6"/>
      <text x="45" y="495" fill="#166534" font-size="13" font-weight="bold">Lifestyle &amp; Dietary Advice:</text>
      <text x="45" y="515" fill="#334155" font-size="12">• Low salt diet (&lt; 5g/day). Regular brisk walk 30 mins/day.</text>
      <text x="45" y="535" fill="#334155" font-size="12">• Avoid late night dinners and oily foods for acid reflux.</text>
      <text x="45" y="550" fill="#334155" font-size="12">• Follow-up in 4 weeks with BP chart.</text>
      
      <text x="380" y="730" fill="#15803d" font-size="14" font-weight="bold">Dr. K. S. Rao, MD</text>
      <text x="380" y="748" fill="#64748b" font-size="11">Reg No: TSMC-48291</text>
    </svg>`,
  },

  // ── 3. Previous Consultation Note ──────────────────────────────────────────
  {
    id: 'demo-doc-consultation',
    filename: 'gastro_consultation_summary_08aug2026.pdf',
    title: 'Gastroenterology Consultation Note',
    documentType: 'previous_consultation',
    mimeType: 'application/pdf',
    documentDate: '2026-08-08',
    facility: 'City General Hospital, Gastroenterology Dept',
    patientName: 'Ramesh Verma (45Y / Male)',
    description: 'Consultation note detailing epigastric symptoms, past appendectomy, and ultrasound findings.',
    rawOcrText: `CITY GENERAL HOSPITAL
DEPARTMENT OF GASTROENTEROLOGY & HEPATOLOGY
OPD Case Record No: GASTRO-2026-0742

CONSULTATION SUMMARY NOTE
Date: 08-Aug-2026
Patient: Ramesh Verma               Age/Sex: 45 / M
Consultant: Dr. V. Murali Krishna, DM (Gastro)

CHIEF COMPLAINT:
Recurrent upper abdominal / epigastric pain and discomfort for 3 weeks, aggravated after eating spicy food.

REVIEW OF SYSTEMS / NEGATIVE FINDINGS:
- Vomiting: DENIED. No episodes of vomiting.
- Haematemesis: DENIED. No blood in vomitus.
- Melaena: DENIED. No black tarry stools.
- Fever: DENIED.
- Weight loss: Not reported, appetite preserved.
- Nausea: Mild nausea occasionally present after heavy meals.

PAST MEDICAL & SURGICAL HISTORY:
- Appendectomy performed in 2012 (uncomplicated laparoscopic procedure).
- Essential Hypertension diagnosed in 2024, currently on Tab. Amlodipine 5mg OD.
- No history of diabetes, asthma, or tuberculosis.
- No known drug allergies (NKDA).

INVESTIGATION FINDINGS:
- Ultrasonography (USG) Abdomen (06-Aug-2026):
  Liver: Mild diffuse increased echogenicity consistent with Grade 1 Fatty Liver. No focal lesions.
  Gallbladder: Well-distended, normal wall thickness, NO gallstones or sludge.
  Common Bile Duct (CBD) & Pancreas: Within normal limits.
  Spleen & Kidneys: Normal size and parenchymal pattern.

ASSESSMENT / CLINICAL IMPRESSION:
Non-ulcer dyspepsia with Grade 1 hepatic steatosis. Controlled hypertension.

PLAN & RECOMMENDATIONS:
1. Continue anti-reflux medication (Pantoprazole 40mg before meals).
2. Weight management and aerobic physical exercise.
3. If pain radiates to back or severe sharp episodes recur, advise upper GI endoscopy.

Dr. V. Murali Krishna, MD, DM
Consultant Gastroenterologist`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%" style="background:#ffffff; font-family:sans-serif;">
      <rect width="600" height="800" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="600" height="70" fill="#0369a1"/>
      <text x="30" y="38" fill="#ffffff" font-size="20" font-weight="bold">CITY GENERAL HOSPITAL</text>
      <text x="30" y="58" fill="#bae6fd" font-size="12">DEPARTMENT OF GASTROENTEROLOGY &amp; HEPATOLOGY</text>
      
      <rect x="30" y="85" width="540" height="50" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
      <text x="45" y="108" fill="#334155" font-size="13" font-weight="bold">Patient: Ramesh Verma (45 / M)</text>
      <text x="370" y="108" fill="#334155" font-size="13">Date: 08-Aug-2026</text>
      <text x="45" y="125" fill="#64748b" font-size="12">Consultant: Dr. V. Murali Krishna, DM</text>
      
      <text x="30" y="165" fill="#0f172a" font-size="14" font-weight="bold">CLINICAL PRESENTATION</text>
      <text x="30" y="185" fill="#334155" font-size="12">Chief Complaint: Recurrent upper epigastric discomfort for 3 weeks post-meals.</text>
      
      <text x="30" y="215" fill="#0f172a" font-size="14" font-weight="bold">EXPLICITLY DENIED SYMPTOMS</text>
      <rect x="30" y="225" width="540" height="35" fill="#f1f5f9" rx="4"/>
      <text x="45" y="247" fill="#475569" font-size="12">No haematemesis (denied) • No melaena (denied) • No vomiting (denied) • No fever</text>
      
      <text x="30" y="285" fill="#0f172a" font-size="14" font-weight="bold">PAST HISTORY</text>
      <text x="30" y="305" fill="#334155" font-size="12">• Appendectomy (2012)</text>
      <text x="30" y="325" fill="#334155" font-size="12">• Essential Hypertension (2024) — on Amlodipine 5mg OD</text>
      <text x="30" y="345" fill="#334155" font-size="12">• Allergies: No Known Drug Allergies (NKDA)</text>
      
      <text x="30" y="380" fill="#0f172a" font-size="14" font-weight="bold">ULTRASOUND ABDOMEN (06-Aug-2026)</text>
      <text x="30" y="400" fill="#334155" font-size="12">• Liver: Grade 1 Fatty Liver (hepatic steatosis)</text>
      <text x="30" y="418" fill="#334155" font-size="12">• Gallbladder: Normal, no calculi/cholelithiasis</text>
      <text x="30" y="436" fill="#334155" font-size="12">• Pancreas, spleen, kidneys: Normal</text>
      
      <rect x="30" y="470" width="540" height="60" fill="#f0f9ff" stroke="#bae6fd" rx="6"/>
      <text x="45" y="495" fill="#0369a1" font-size="13" font-weight="bold">Clinical Impression:</text>
      <text x="45" y="515" fill="#334155" font-size="12">Non-ulcer dyspepsia with Grade 1 fatty liver. Controlled hypertension.</text>
      
      <text x="350" y="730" fill="#0284c7" font-size="13" font-weight="bold">Dr. V. Murali Krishna, DM</text>
      <text x="350" y="748" fill="#64748b" font-size="11">Consultant Gastroenterologist</text>
    </svg>`,
  },

  // ── 4. Critical Red-Flag Emergency Lab Report ───────────────────────────────
  {
    id: 'demo-doc-critical-lab',
    filename: 'urgent_stat_cbc_critical_anemia.pdf',
    title: 'Emergency STAT Lab Report (Critical Anemia)',
    documentType: 'lab_report',
    mimeType: 'application/pdf',
    documentDate: '2026-09-28',
    facility: 'Emergency Trauma Center Diagnostics',
    patientName: 'Sunita Devi (28Y / Female)',
    description: 'Emergency CBC demonstrating severe critical anemia (Hb 5.8 g/dL) and thrombocytopenia.',
    rawOcrText: `EMERGENCY TRAUMA CENTER
STAT LABORATORY DIVISION
CRITICAL VALUE NOTIFICATION REPORT

Patient: Sunita Devi          Age/Sex: 28 Yrs / Female
Date: 28-Sep-2026 07:45 AM    Specimen: STAT Venous Blood

*** CRITICAL ALERT VALUES REPORTED TO ON-DUTY CLINICIAN ***
Parameter                   Result    Units       Reference Range    Alert
--------------------------------------------------------------------------------
Hemoglobin (Hb)             5.8       g/dL        12.0 - 15.0        *** CRITICAL LOW ***
Platelet Count              42,000    /cumm       150,000 - 450,000  *** CRITICAL LOW ***
Total Leucocytes (WBC)      18,400    /cumm       4,000 - 11,000     HIGH LEUKOCYTOSIS
Hematocrit (HCT)            18.2      %           36.0 - 46.0        CRITICAL LOW

EMERGENCY CLINICAL DIRECTIVE:
Severe decompensated anemia with marked thrombocytopenia.
High clinical risk of acute internal haemorrhage or ruptured ectopic pregnancy.
URGENT ACTION: Immediate surgical/gynaecological review, group and cross-match 2 units PRBC, establish large bore IV access.

Reported by: Dr. R. Sen, MD (Emergency Medicine)`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%" style="background:#ffffff; font-family:sans-serif;">
      <rect width="600" height="800" fill="#ffffff" stroke="#ef4444" stroke-width="4"/>
      <rect x="0" y="0" width="600" height="80" fill="#b91c1c"/>
      <text x="30" y="38" fill="#ffffff" font-size="20" font-weight="bold">EMERGENCY TRAUMA STAT LAB</text>
      <text x="30" y="60" fill="#fecaca" font-size="13" font-weight="bold">*** CRITICAL VALUE NOTIFICATION ***</text>
      
      <rect x="30" y="95" width="540" height="50" fill="#fef2f2" stroke="#fca5a5" rx="6"/>
      <text x="45" y="120" fill="#991b1b" font-size="13" font-weight="bold">Patient: Sunita Devi (28F) — STAT</text>
      <text x="360" y="120" fill="#991b1b" font-size="13">Date: 28-Sep-2026</text>
      
      <rect x="30" y="170" width="540" height="75" fill="#fee2e2" stroke="#ef4444" rx="6"/>
      <text x="45" y="200" fill="#991b1b" font-size="15" font-weight="bold">Hemoglobin: 5.8 g/dL  (CRITICAL LOW)</text>
      <text x="45" y="225" fill="#b91c1c" font-size="13">Platelets: 42,000 /cumm  (CRITICAL LOW) • WBC: 18,400 /cumm</text>
      
      <rect x="30" y="270" width="540" height="120" fill="#fff1f2" stroke="#fda4af" rx="6"/>
      <text x="45" y="298" fill="#9f1239" font-size="13" font-weight="bold">EMERGENCY DIRECTIVE:</text>
      <text x="45" y="325" fill="#881337" font-size="13">• Severe acute decompensated anemia.</text>
      <text x="45" y="348" fill="#881337" font-size="13">• Rule out ruptured ectopic pregnancy / acute abdominal bleed.</text>
      <text x="45" y="370" fill="#881337" font-size="13">• Immediate cross-match and emergency surgical consult.</text>
    </svg>`,
  },
];
