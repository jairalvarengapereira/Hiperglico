export interface AuthState {
    userId: string;
    token: string;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}
export declare const useAuth: () => AuthState;
//# sourceMappingURL=useAuth.d.ts.map