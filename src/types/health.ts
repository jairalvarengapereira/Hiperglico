// src/types/health.ts
export interface BloodPressureDTO {
  systolic: number;      // mmHg
  diastolic: number;     // mmHg
  pulse?: number;        // bpm (opcional)
  note?: string;
  // recordedAt será definido pelo servidor (hora atual)
}

export type GlucoseContext = 'FASTING' | 'PRE_MEAL' | 'POST_MEAL' | 'RANDOM';

export interface GlucoseDTO {
  valueMgDl: number;     // mg/dL
  context: GlucoseContext;
  note?: string;
  // recordedAt será definido pelo servidor
}

// Tipo genérico para resposta de criação
export interface CreateRecordResponse<T> {
  id: string;
  data: T;
  createdAt: string;
}