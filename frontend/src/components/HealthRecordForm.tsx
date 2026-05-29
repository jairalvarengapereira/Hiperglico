// frontend/src/components/HealthRecordForm.tsx
import React, { useState } from 'react';
import type { BloodPressureDTO, GlucoseDTO, GlucoseContext } from '../types/health';
import { useAuth } from '../hooks/useAuth';

type FormType = 'bloodPressure' | 'glucose';

interface HealthRecordFormProps {
  type: FormType;
  onSuccess?: () => void;
}

export const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ type, onSuccess }) => {
  const { userId, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // ---------- Estado do formulário ----------
  const [bp, setBP] = useState<BloodPressureDTO>({
    systolic: 120,
    diastolic: 80,
    pulse: 70,
    note: '',
  });

  const [glucose, setGlucose] = useState<GlucoseDTO>({
    valueMgDl: 100,
    context: 'FASTING',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let res: Response;
      const apiHost = 'http://localhost:3000'; // Aponta para a porta do backend Express

      if (type === 'bloodPressure') {
        res = await fetch(`${apiHost}/api/health/blood-pressure`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ patientId: userId || '', ...bp }),
        });
      } else {
        res = await fetch(`${apiHost}/api/health/glucose`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ patientId: userId || '', ...glucose }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro ${res.status}`);
      }

      setSuccess(true);
      if (onSuccess) onSuccess();

      // Resetar observações
      if (type === 'bloodPressure') {
        setBP(prev => ({ ...prev, note: '' }));
      } else {
        setGlucose(prev => ({ ...prev, note: '' }));
      }
    } catch (err: any) {
      setError(err.message ?? 'Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const isBP = type === 'bloodPressure';

  return (
    <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl shadow-md relative overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isBP ? 'from-rose-500 to-pink-500' : 'from-emerald-500 to-cyan-500'}`} />

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        {isBP ? (
          <>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">❤️</span>
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Pressão Arterial
            </span>
          </>
        ) : (
          <>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">🩸</span>
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Nível Glicêmico
            </span>
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isBP ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sistólica (mmHg)</label>
              <input
                type="number"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-slate-800"
                value={bp.systolic}
                onChange={(e) => setBP({ ...bp, systolic: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Diastólica (mmHg)</label>
              <input
                type="number"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-slate-800"
                value={bp.diastolic}
                onChange={(e) => setBP({ ...bp, diastolic: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pulsação (bpm) – opcional</label>
              <input
                type="number"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all text-slate-800"
                value={bp.pulse ?? ''}
                onChange={(e) =>
                  setBP({
                    ...bp,
                    pulse: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Valor (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-slate-800"
                value={glucose.valueMgDl}
                onChange={(e) => setGlucose({ ...glucose, valueMgDl: Number(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contexto da Medição</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-slate-800"
                value={glucose.context}
                onChange={(e) => setGlucose({ ...glucose, context: e.target.value as GlucoseContext })}
              >
                <option value="FASTING" className="bg-white">Jejum Matinal</option>
                <option value="PRE_MEAL" className="bg-white">Pré‑refeição</option>
                <option value="POST_MEAL" className="bg-white">Pós‑refeição</option>
                <option value="RANDOM" className="bg-white">Aleatório / Rotina</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Notas / Sintomas (opcional)</label>
          <textarea
            rows={2}
            className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all text-slate-800 ${isBP ? 'focus:border-rose-500 focus:ring-rose-500/20' : 'focus:border-emerald-500 focus:ring-emerald-500/20'}`}
            placeholder="Ex: Tontura leve, dor de cabeça, pós-treino..."
            value={isBP ? bp.note : glucose.note}
            onChange={(e) => {
              if (isBP) setBP({ ...bp, note: e.target.value });
              else setGlucose({ ...glucose, note: e.target.value });
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isBP ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/20' : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/20'}`}
        >
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2 font-semibold">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2 font-semibold">
          <span>✅</span>
          <span>Registro gravado com sucesso!</span>
        </div>
      )}
    </div>
  );
};
