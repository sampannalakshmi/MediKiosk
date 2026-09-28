// ─────────────────────────────────────────────────────────────────────────────
// MediKiosk — ABDM FHIR Simulation
// Generates a synthetic FHIR R4 Bundle for demo purposes
// ─────────────────────────────────────────────────────────────────────────────

import type { ConsultationCase, Patient } from '@/types/clinical';

export function generateFHIRBundle(patient: Patient, consultation: ConsultationCase): object {
  const now = new Date().toISOString();
  const h = consultation.socratesHistory;

  return {
    resourceType: 'Bundle',
    id: `bundle-${consultation.id}`,
    type: 'document',
    timestamp: now,
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: patient.id,
          name: [{ text: patient.name ?? 'Unknown' }],
          gender: patient.gender ?? 'unknown',
          birthDate: patient.age ? `${new Date().getFullYear() - patient.age}-01-01` : undefined,
        },
      },
      {
        resource: {
          resourceType: 'Encounter',
          id: `enc-${consultation.id}`,
          status: 'in-progress',
          class: { code: 'AMB', display: 'Ambulatory' },
          subject: { reference: `Patient/${patient.id}` },
          period: { start: consultation.createdAt },
          reasonCode: [{ text: consultation.chiefComplaint }],
        },
      },
      ...(h.site ? [{
        resource: {
          resourceType: 'Condition',
          id: `cond-${consultation.id}-pain`,
          subject: { reference: `Patient/${patient.id}` },
          code: { text: `Abdominal pain — ${h.site}` },
          onsetDateTime: consultation.createdAt,
          note: h.character ? [{ text: `Character: ${h.character}` }] : undefined,
        },
      }] : []),
      ...(h.severity !== undefined ? [{
        resource: {
          resourceType: 'Observation',
          id: `obs-${consultation.id}-severity`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '72514-3', display: 'Pain severity' }] },
          subject: { reference: `Patient/${patient.id}` },
          valueQuantity: { value: h.severity, unit: '/10', system: 'http://unitsofmeasure.org' },
        },
      }] : []),
    ],
  };
}
