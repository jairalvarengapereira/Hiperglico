// frontend/src/types/health.ts
export interface BloodPressureDTO {
  systolic: number;      // mmHg
  diastolic: number;     // mmHg
  pulse?: number;        // bpm (opcional)
  note?: string;
}

export type GlucoseContext = 'FASTING' | 'PRE_MEAL' | 'POST_MEAL' | 'RANDOM';

export interface GlucoseDTO {
  valueMgDl: number;     // mg/dL
  context: GlucoseContext;
  note?: string;
}

export interface BloodPressureRecord extends BloodPressureDTO {
  id: string;
  patientId: string;
  recordedAt: string;
  createdAt: string;
}

export interface GlucoseRecord extends GlucoseDTO {
  id: string;
  patientId: string;
  recordedAt: string;
  createdAt: string;
}
