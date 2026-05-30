export interface BloodPressureDTO {
    systolic: number;
    diastolic: number;
    pulse?: number;
    note?: string;
}
export type GlucoseContext = 'FASTING' | 'PRE_MEAL' | 'POST_MEAL' | 'RANDOM';
export interface GlucoseDTO {
    valueMgDl: number;
    context: GlucoseContext;
    note?: string;
}
export interface CreateRecordResponse<T> {
    id: string;
    data: T;
    createdAt: string;
}
//# sourceMappingURL=health.d.ts.map