import React, { useState } from 'react';
import { BloodPressureDTO, GlucoseDTO, GlucoseContext } from '../types/health';
import { useAuth } from '../hooks/useAuth';

type FormType = 'bloodPressure' | 'glucose';

export const HealthRecordForm: React.FC<{ type: FormType }> = ({ type }) => {
  const { userId, token } = useAuth(); // returns { userId: string, token: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // ---------- Estado do formulário ----------
  const [bp, setBP] = useState<BloodPressureDTO>({
    systolic: 0,
    diastolic: 0,
    pulse: undefined,
    note: '',
  });

  const [glucose, setGlucose] = useState<GlucoseDTO>({
    valueMgDl: 0,
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
      if (type === 'bloodPressure') {
        res = await fetch('/api/health/blood-pressure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ patientId: userId, ...bp }),
        });
      } else {
        res = await fetch('/api/health/glucose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ patientId: userId, ...glucose }),
        });
      }

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json();
      setSuccess(true);
      // optional: reset form
      if (type === 'bloodPressure') {
        setBP({ systolic: 0, diastolic: 0, pulse: undefined, note: '' });
      } else {
        setGlucose({ valueMgDl: 0, context: 'FASTING', note: '' });
      }
    } catch (err: any) {
      setError(err.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {type === 'bloodPressure' ? 'Registro de Pressão Arterial' : 'Registro de Glicemia'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'bloodPressure' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Sistólica (mmHg)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={bp.systolic}
                onChange={(e) =>
                  setBP({ ...bp, systolic: Number(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diastólica (mmHg)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={bp.diastolic}
                onChange={(e) =>
                  setBP({ ...bp, diastolic: Number(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pulsação (bpm) – opcional</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={bp.pulse ?? ''}
                onChange={(e) =>
                  setBP({
                    ...bp,
                    pulse: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor (mg/dL)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border rounded"
                value={glucose.valueMgDl}
                onChange={(e) =>
                  setGlucose({
                    ...glucose,
                    valueMgDl: Number(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contexto</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={glucose.context}
                onChange={(e) =>
                  setGlucose({ ...glucose, context: e.target.value as GlucoseContext })
                }
              >
                <option value="FASTING">Jejum</option>
                <option value="PRE_MEAL">Pré‑refeição</option>
                <option value="POST_MEAL">Pós‑refeição</option>
                <option value="RANDOM">Aleatório</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Observação (opcional)</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 border rounded"
            value={type === 'bloodPressure' ? bp.note : glucose.note}
            onChange={(e) => {
              if (type === 'bloodPressure')
                setBP({ ...bp, note: e.target.value });
              else
                setGlucose({ ...glucose, note: e.target.value });
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar registro'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">Registro salvo com sucesso!</p>}
    </div>
  );
};