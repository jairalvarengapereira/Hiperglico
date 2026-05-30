// src/hooks/useAuth.ts
export interface AuthState {
  userId: string;
  token: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

export const useAuth = (): AuthState => {
  // Retorna dados mockados do paciente padrão para desenvolvimento local.
  // Este ID de paciente deve corresponder ao semeado no banco de dados para que os testes de inserção funcionem.
  return {
    userId: 'c3f8b1a2-b3c4-4d5e-ae6f-7fa8b9c0d1e2',
    token: 'mock-jwt-token-for-patient-c3f8b1a2',
    role: 'PATIENT',
  };
};
