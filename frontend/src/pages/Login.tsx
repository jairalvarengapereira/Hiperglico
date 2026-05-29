// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName, role);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('PATIENT');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main glass card container */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/80 border border-slate-200/80 rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300 hover:border-slate-300/80">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600" />
        
        {/* Branding header */}
        <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-violet-600 items-center justify-center mb-4 animate-pulse">
              <img src="/Logo.png" alt="Hiperglico" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Hiperglico
            </h1>
            <p className="text-slate-500 text-xs mt-1">Monitoramento Clínico de Hipertensão e Diabetes.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/60 mb-6">
          <button
            onClick={() => toggleTab('login')}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'login' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => toggleTab('register')}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${activeTab === 'register' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* Full Name field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">👤</span>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do usuário"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-slate-800 placeholder-slate-400"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Tipo de Conta</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('PATIENT')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${role === 'PATIENT' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 font-bold' : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:border-slate-300'}`}
                  >
                    👤 Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('DOCTOR')}
                    className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${role === 'DOCTOR' ? 'bg-violet-500/10 border-violet-500/30 text-violet-600 font-bold' : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:border-slate-300'}`}
                  >
                    🩺 Médico / Clínica
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">✉️</span>
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-slate-800 placeholder-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🔒</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-slate-800 placeholder-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'login' ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/20' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/20'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Processando...
              </span>
            ) : activeTab === 'login' ? (
              'Entrar na Conta'
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        {/* Error message alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-start gap-2.5 animate-slide-up">
            <span className="text-sm">⚠️</span>
            <div className="flex-1 leading-relaxed">
              <span className="font-bold block mb-0.5">Erro na Autenticação</span>
              {error}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};
