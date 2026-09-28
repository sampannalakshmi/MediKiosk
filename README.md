# MediKiosk — AI Clinical History & Medical Document Intelligence Platform
**Smart India Hackathon (SIH 2026) Prototype**  
*Problem Statement: Patient Case-Taking Software — Ministry of Ayush*

---

## ⚠️ Core Product Principle
> **MediKiosk is NOT an AI doctor.**  
> MediKiosk must **NEVER** autonomously diagnose, prescribe, or replace a clinician.  
> It extracts, structures, summarizes, and flags clinical information for physician review, ensuring consultation time in high-volume Indian hospitals is maximized for clinical decision-making.

---

## 🌟 Overview & Key Capabilities

Doctors in Indian public and private hospitals often have fewer than 3–5 minutes per patient consultation, while patients arrive with unstructured oral histories and fragmented paper records. MediKiosk bridges this gap:

1. **Phase 1 — Clinical Foundation & Portal Architecture**:
   - In-memory repository with hot-reload stability
   - Patient intake flow (Language selection, Consent disclaimer, Patient ID/Guest, Interaction modes)
   - Real-time Doctor Triage Dashboard sorted by clinical priority (`CRITICAL` → `HIGH` → `MEDIUM` → `LOW`)
   - ABDM FHIR R4 Bundle simulation exporter (`Patient`, `Encounter`, `Condition`, `Observation`)

2. **Phase 2 — Controlled Multilingual AI Clinical Interview**:
   - Primary scenario: **Abdominal Pain**
   - Supported languages: **English**, **Telugu (తెలుగు)**, **Hindi (हिन्दी)**
   - Supported interaction modes: **Voice** (Web Speech API / `webkitSpeechRecognition`), **Text** typing, **Touch** (structured button cards & 0–10 numeric scale pickers)
   - 16-node clinical question decision tree strictly following the **SOCRATES** pain assessment framework
   - 4-state field tracking: `present`, `denied`, `uncertain`, `unknown` (strictly preserved, missing data is never collapsed into "No")
   - Pure deterministic clinical red flag rule engine (6 categories: `HEMODYNAMIC_SHOCK`, `ACUTE_PERITONITIS`, `GI_BLEED`, `SEPSIS`, `PREGNANCY_ACUTE`, `INTRACTABLE_VOMITING`)

3. **Phase 3 — Medical Document Intelligence Pipeline**:
   - **Upload & Camera Capture**: Support for camera scan on mobile/tablet, file upload on desktop (JPG, JPEG, PNG, WEBP, PDF)
   - **File Validation Service**: Server-side MIME validation, extension check, filename sanitization, and configurable file size limits (`MAX_DOCUMENT_SIZE_MB`, default 10MB)
   - **Document Storage Abstraction**: Provider-agnostic storage interface (`DocumentStorageService`) with in-memory preview data URIs for rapid prototyping, swappable with S3/GCS/PACS in production
   - **OCR & Text Extraction**: Hybrid OCR abstraction combining Gemini Multimodal Vision API, synthetic document matching, and embedded text extraction with explicit uncertainty detection (`isUncertain`, low-quality scan alerts)
   - **Medical Information Extraction**: Dedicated service returning structured JSON facts for patient demographics, medications, lab investigations, conditions, surgeries, vitals, and allergies
   - **Explicit vs. Denied vs. Unknown**: Distinguishes explicitly stated facts from explicitly denied symptoms (e.g. `No vomiting` → `isDenied: true`), while omitting unmentioned items
   - **Clinical Evidence Chain**: Every extracted fact retains source document ID, page number, confidence score, and exact verbatim source text snippet
   - **Clinical Conflict Detection**: Automatically cross-references patient interview statements with document findings (e.g. Patient reported Amlodipine 10mg vs. Prescription lists Amlodipine 5mg). Alerts the clinician without silently overwriting
   - **Chronological Patient Timeline**: Merges intake statements and document events with distinct badges (`Patient`, `Document`, `System`)
   - **Doctor Document Viewer**: Split-screen modal with image zoom/pan, raw OCR text preview, structured facts table, and one-click `[View source]` jump that highlights the exact evidence snippet on the original page
   - **Patient Review Step**: Friendly patient-facing review card with `✓ Confirm`, `✎ Edit`, and `? Not sure` options before doctor submission

---

## 🧪 Synthetic Demo Documents

To enable instant evaluation without needing sample medical PDFs, MediKiosk includes 4 built-in synthetic documents:

| Document | Type | Key Findings | Demonstration Purpose |
| :--- | :--- | :--- | :--- |
| **Apex CBC Blood Report** | Lab Report (PDF) | Hb: 10.2 g/dL (Mild Anemia), WBC: 11,500 /cumm, Platelets: 220,000 /cumm | Validates laboratory parameter extraction, reference range parsing, and abnormal flagging |
| **Dr. Rao Outpatient Prescription** | Prescription (PNG) | Amlodipine 5 mg OD, Pantoprazole 40 mg OD, Paracetamol 500 mg SOS | Tests medication extraction and triggers the **Intentional Conflict Warning** against interview data |
| **Gastroenterology Consultation Note** | Consultation (PDF) | Epigastric burning, Ultrasound Fatty Liver Grade 1, Appendectomy (2012), Denied Haematemesis | Demonstrates explicitly denied symptom handling (`isDenied: true`), past surgical history, and imaging results |
| **Emergency STAT Lab Report** | Lab Report (PDF) | Hb: 5.8 g/dL (Critical), Platelets: 42,000 /cumm (Critical), Emergency surgical directive | Demonstrates **Document-Derived Red Flags** automatically escalating case to `CRITICAL` priority |

---

## 🏗️ Architecture & Clean Design

```
src/
├── app/
│   ├── api/
│   │   ├── abdm/simulate/route.ts          # Synthetic FHIR R4 Bundle generator
│   │   ├── consultations/                  # Consultation cases CRUD
│   │   ├── doctor/confirm/route.ts         # Doctor review sign-off
│   │   ├── document-extractions/[id]/      # PATCH individual fact edit
│   │   ├── documents/                      # Document upload, process, view, confirm
│   │   ├── interview/                      # Multilingual interview start & respond
│   │   └── patients/[id]/                  # Patient documents & timeline endpoints
│   ├── doctor/page.tsx                     # Doctor triage dashboard
│   ├── page.tsx                            # Patient kiosk intake workflow
│   └── globals.css                         # Tailwind directives
├── components/
│   ├── doctor/
│   │   ├── CaseDetailView.tsx              # SOCRATES history, red flags, conflict alerts
│   │   ├── DocumentViewerModal.tsx         # Zoomable viewer with evidence snippet jump
│   │   └── PatientQueue.tsx                # Auto-refreshing priority triage queue
│   └── patient/
│       ├── DocumentStep.tsx                # Camera scan, upload, preview, patient review
│       ├── InterviewStep.tsx               # Voice/text/touch AI-guided interview
│       └── ...                             # Welcome, Consent, Mode, Complaint, Review steps
├── i18n/
│   └── translations.ts                     # Full translations for English, Telugu, Hindi
├── lib/
│   └── db/repository.ts                    # In-memory singleton with demo pre-seeds
├── services/
│   ├── ai/aiService.ts                     # Server-side Gemini & Mock AI abstraction
│   ├── documents/
│   │   ├── demoDocuments.ts                # Synthetic demo documents with SVG previews
│   │   ├── documentProcessor.ts            # Master pipeline coordinator & conflict detector
│   │   ├── documentStorageService.ts       # Provider-agnostic storage abstraction
│   │   ├── fileValidationService.ts        # Server-side MIME & size validation
│   │   ├── medicalExtractionService.ts     # Structured clinical facts & red flag rules
│   │   └── ocrService.ts                   # Hybrid OCR text extractor
│   ├── evidenceService.ts                  # Evidence chain factories
│   ├── questionEngine.ts                   # 16-node SOCRATES decision tree
│   └── redFlagRules.ts                     # Deterministic clinical emergency rules
└── types/
    ├── clinical.ts                         # Core clinical domain types
    ├── document.ts                         # Document intelligence types
    └── interviewState.ts                   # Conversational interview state types
```

---

## 🔒 Prototype vs. Production Boundary

| Feature | Hackathon Prototype Implementation | Enterprise / Production Requirement |
| :--- | :--- | :--- |
| **Document Storage** | In-memory storage abstraction with base64 data URIs for instant preview | HIPAA / ABDM-compliant Cloud Object Storage (S3/GCS/Azure Blob) with AES-256 at-rest encryption and pre-signed short-lived URLs |
| **Database** | Global in-memory singleton (`__medikiosk_repo`) for rapid hot-reload demo stability | PostgreSQL / MongoDB with patient consent tracking, audit trails, and role-based access control (RBAC) |
| **Patient Identification** | ABHA ID / Guest flow with synthetic patient accounts | Direct integration with National Health Authority (NHA) ABDM M1/M2/M3 milestone APIs |
| **OCR & Vision** | Built-in high-accuracy synthetic matcher + Gemini Multimodal Vision API | Enterprise OCR pipeline with dedicated medical NER (e.g. AWS Comprehend Medical / Google Cloud Healthcare API) |
| **Security & Privacy** | Strict server-side only execution, zero client-side API keys, safe filename sanitization | End-to-end data encryption in transit and at rest, ISO 27001 / DISHA / DPDP Act compliance |
| **Clinical Decision** | Information structuring, red-flag alert surfacing, and evidence linking | Certified clinical decision support (CDS) subject to institutional review board (IRB) and clinician oversight |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher (tested on Node v24)
- npm or yarn

### 1. Installation
```bash
git clone <repo-url>
cd medikiosk
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional)* Add a Google Gemini API key in `.env.local` to enable live multimodal vision and conversational rephrasing:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
USE_MOCK_AI=false
```
*Note: If no API key is provided, MediKiosk automatically runs in deterministic mock mode for offline demonstration without any external dependency.*

### 3. Run Automated Tests
Execute the 35 automated integration tests:
```bash
npm test
```
**Test Coverage:**
- 7 Red Flag Deterministic Rule tests
- 5 Question Engine & Branching tests
- 5 In-Memory Repository tests
- 6 File Validation tests (JPG, PDF, unsupported format, oversize, path traversal)
- 2 OCR Text Extraction tests (high-confidence vs. uncertain scan)
- 4 Structured Clinical Extraction tests (explicit vs. denied vs. missing facts)
- 2 Document-Derived Red Flag tests (Severe anemia < 7.0 g/dL, thrombocytopenia < 50k)
- 2 Evidence Linking & Clinical Conflict tests (Amlodipine dosage discrepancy)
- 2 Document Repository & Persistence tests

### 4. Run Development / Production Server
```bash
# Production Build & Start
npm run build
npm start -- -p 3001

# Or Development Mode
npm run dev
```

---

## 📱 Accessing the Application

- **Patient Intake Kiosk**: [http://localhost:3001/](http://localhost:3001/)
- **Doctor Triage & Review Portal**: [http://localhost:3001/doctor](http://localhost:3001/doctor)

---

## 👥 Hackathon Presentation Walkthrough

1. **Step 1 — Patient Intake**:
   - Visit [http://localhost:3001/](http://localhost:3001/).
   - Select **Telugu** or **Hindi** to highlight regional language accessibility.
   - Accept consent disclaimer, continue as guest, and choose **Touch** or **Voice** mode.
   - Enter Chief Complaint: `"Stomach pain"`.
2. **Step 2 — AI Clinical Interview**:
   - Answer the SOCRATES abdominal pain questions (Site, Radiation, Onset, Severity, Associated symptoms).
   - Notice conditional branching (denying vomiting automatically skips haematemesis).
3. **Step 3 — Medical Document Intelligence**:
   - On the document screen, click **"🧪 Or select a synthetic demo record"**.
   - Pick **Dr. Rao Outpatient Prescription** or **Complete Blood Count (CBC) Report**.
   - Watch the 4-stage processing animation: *Reading document → Finding medical info → Preparing history → Ready for review*.
   - Review the extracted medications or lab values; click `✓ Confirm` or `✎ Edit`.
4. **Step 4 — Doctor Portal Review**:
   - Open [http://localhost:3001/doctor](http://localhost:3001/doctor).
   - View the active case prioritized in the triage queue.
   - Observe the **⚠ Information Conflict Alert**: *Patient reported 10 mg vs. Document states 5 mg*.
   - Click **"View Document →"** on any record to open the zoomable viewer, inspect the verbatim OCR text, and click **`[View source]`** to jump directly to the evidence snippet.
   - Inspect the **Patient Clinical Timeline** with color-coded `Patient`, `Document`, and `System` badges.
   - Add clinical examination notes and click **"✓ Confirm & Sign Off Case"**.
   - Click **"📋 View ABDM FHIR Bundle"** to inspect the simulated FHIR R4 Bundle.
