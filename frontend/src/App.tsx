// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { DashboardPaciente } from './pages/DashboardPaciente';
import { DashboardMedico } from './pages/DashboardMedico';
import { ClinicsList } from './pages/ClinicsList';
import { CreateClinic } from './pages/CreateClinic';
import { ClinicDetail } from './pages/ClinicDetail';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-800">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 items-center justify-center shadow-xl shadow-rose-500/20 mb-4 animate-pulse">
          <img src="/Logo3D01.png" alt="Hiperglico" className="h-14 w-14 object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold tracking-wider uppercase">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
          Carregando Sessão...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/80 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <img src="/Logo3D.png" alt="Hiperglico" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-wider bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                Hiperglico
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                Monitoramento Clínico de Hipertensão e Diabetes.
              </span>
            </div>
          </div>
          {/* Navigation links */}
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link to="/" className="hover:text-rose-600 transition-colors">Dashboard</Link>
            <Link to="/clinics" className="hover:text-rose-600 transition-colors">Clínicas</Link>
          </nav>
          {/* User Profile & Logout */}
          <div className="flex items-center gap-4 justify-between sm:justify-end">
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-700">
                {user.fullName || user.email}
              </span>
              <span className="block text-[9px] uppercase tracking-wide text-slate-400 font-bold">
                {user.role === 'PATIENT' ? '👤 Paciente' : user.role === 'DOCTOR' ? '🩺 Médico' : '🔑 Administrador'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-rose-500 hover:bg-slate-50 hover:border-rose-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>🚪</span> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={user.role === 'PATIENT' ? <DashboardPaciente /> : <DashboardMedico />} />
          <Route path="/clinics" element={<ClinicsList />} />
          <Route path="/clinics/create" element={<CreateClinic />} />
          <Route path="/clinics/:id" element={<ClinicDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Hiperglico — Monitoramento Clínico de Hipertensão e Diabetes. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
