// frontend/src/pages/DashboardPaciente.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { HealthRecordForm } from '../components/HealthRecordForm';
import type { BloodPressureRecord, GlucoseRecord } from '../types/health';
import { useAuth } from '../hooks/useAuth';

const API_HOST = '';

// Dados de fallback para quando o backend não estiver disponível
const makeFallbackBP = (userId: string): BloodPressureRecord[] => [
  { id: '1', systolic: 118, diastolic: 79, pulse: 68, note: 'Pós-caminhada leve', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), createdAt: '' },
  { id: '2', systolic: 124, diastolic: 82, pulse: 72, note: 'Normal após almoço', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), createdAt: '' },
  { id: '3', systolic: 129, diastolic: 84, pulse: 75, note: 'Estresse no trabalho', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), createdAt: '' },
  { id: '4', systolic: 121, diastolic: 80, pulse: 70, note: 'Após meditação', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), createdAt: '' },
  { id: '5', systolic: 132, diastolic: 85, pulse: 78, note: 'Manhã agitada', patientId: userId, recordedAt: new Date().toISOString(), createdAt: '' },
];

const makeFallbackGlucose = (userId: string): GlucoseRecord[] => [
  { id: '1', valueMgDl: 92, context: 'FASTING', note: 'Jejum regular', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), createdAt: '' },
  { id: '2', valueMgDl: 138, context: 'POST_MEAL', note: 'Medição pós almoço', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), createdAt: '' },
  { id: '3', valueMgDl: 104, context: 'PRE_MEAL', note: 'Pré-jantar', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), createdAt: '' },
  { id: '4', valueMgDl: 88, context: 'FASTING', note: 'Jejum matinal', patientId: userId, recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), createdAt: '' },
  { id: '5', valueMgDl: 112, context: 'RANDOM', note: 'Medição aleatória', patientId: userId, recordedAt: new Date().toISOString(), createdAt: '' },
];

// --- Helpers de classificação classificação clínica ---
const getBPCategory = (sys: number, dia: number) => {
  if (sys < 120 && dia < 80) return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  if (sys <= 129 && dia < 80) return { label: 'Elevado', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  if (sys <= 139 || dia <= 89) return { label: 'Hipertensão E1', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
  return { label: 'Hipertensão E2', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
};

const getGlucoseCategory = (val: number, context: string) => {
  const isFasting = context === 'FASTING';
  if (isFasting) {
    if (val < 100) return { label: 'Normal (Jejum)', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (val <= 125) return { label: 'Pré-Diabetes', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    return { label: 'Diabetes', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
  }
  if (val < 140) return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  if (val <= 199) return { label: 'Tolerância Reduzida', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  return { label: 'Hiperglicemia', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
};

const contextLabel: Record<string, string> = {
  FASTING: 'Jejum',
  PRE_MEAL: 'Pré-refeição',
  POST_MEAL: 'Pós-refeição',
  RANDOM: 'Aleatório',
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

// --- Componente de gráfico SVG dinâmico ---
interface SparklineProps {
  values: number[];
  color: string;
  fillId: string;
  fillColor: string;
}

const Sparkline: React.FC<SparklineProps> = ({ values, color, fillId, fillColor }) => {
  if (values.length < 2) return null;

  const W = 500;
  const H = 180;
  const PAD = 20;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={color} stroke="#ffffff" strokeWidth="2" />
      ))}
    </svg>
  );
};

// --- Dashboard principal ---
export const DashboardPaciente: React.FC = () => {
  const { userId, token, fullName } = useAuth();
  const [bpRecords, setBpRecords] = useState<BloodPressureRecord[]>([]);
  const [glucoseRecords, setGlucoseRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<'bp' | 'glucose'>('bp');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [bpRes, gRes] = await Promise.all([
        fetch(`${API_HOST}/api/health/blood-pressure`, { headers }),
        fetch(`${API_HOST}/api/health/glucose`, { headers }),
      ]);

      if (bpRes.ok && gRes.ok) {
        const [bpData, gData] = await Promise.all([bpRes.json(), gRes.json()]);
        setBpRecords(bpData.length > 0 ? bpData : makeFallbackBP(userId || ''));
        setGlucoseRecords(gData.length > 0 ? gData : makeFallbackGlucose(userId || ''));
        setApiOnline(true);
      } else {
        throw new Error('API retornou erro');
      }
    } catch {
      // Fallback visual — não bloqueia a interface
      setBpRecords(makeFallbackBP(userId || ''));
      setGlucoseRecords(makeFallbackGlucose(userId || ''));
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const lastBP = bpRecords[bpRecords.length - 1];
  const lastGlucose = glucoseRecords[glucoseRecords.length - 1];
  const bpStatus = lastBP ? getBPCategory(lastBP.systolic, lastBP.diastolic) : null;
  const glucoseStatus = lastGlucose ? getGlucoseCategory(lastGlucose.valueMgDl, lastGlucose.context) : null;

  // Últimos 5 pontos para o gráfico
  const bpSlice = bpRecords.slice(-5);
  const glucoseSlice = glucoseRecords.slice(-5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-rose-500 text-xs font-semibold uppercase tracking-wider">Painel do Paciente</span>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Olá, {fullName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhe e registre seus índices vitais de saúde.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs ${apiOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {apiOnline ? 'API Online' : 'Modo Demo'}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white border border-slate-200 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            Clínica Saúde &amp; Vida
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pressão Arterial */}
        <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl relative overflow-hidden shadow-md transition-all duration-300 hover:border-slate-300 animate-slide-up animation-delay-100">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="absolute top-0 right-0 p-5 text-4xl opacity-[0.06] select-none">❤️</div>
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Última Pressão Arterial</span>
          {loading ? (
            <div className="mt-4 h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : lastBP ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-slate-800">{lastBP.systolic}/{lastBP.diastolic}</span>
                <span className="text-slate-500 text-sm font-medium">mmHg</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lastBP.pulse && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                    💓 {lastBP.pulse} bpm
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${bpStatus?.color}`}>{bpStatus?.label}</span>
              </div>
              {lastBP.note && <p className="text-slate-500 text-xs italic font-medium">"{lastBP.note}"</p>}
              <p className="text-slate-400 text-[10px] font-semibold">{formatDate(lastBP.recordedAt)}</p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-4">Nenhum registro encontrado.</p>
          )}
        </div>

        {/* Glicemia */}
        <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl relative overflow-hidden shadow-md transition-all duration-300 hover:border-slate-300 animate-slide-up animation-delay-200">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="absolute top-0 right-0 p-5 text-4xl opacity-[0.06] select-none">🩸</div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Último Nível Glicêmico</span>
          {loading ? (
            <div className="mt-4 h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : lastGlucose ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-slate-800">{lastGlucose.valueMgDl}</span>
                <span className="text-slate-500 text-sm font-medium">mg/dL</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                  🕒 {contextLabel[lastGlucose.context] ?? lastGlucose.context}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${glucoseStatus?.color}`}>{glucoseStatus?.label}</span>
              </div>
              {lastGlucose.note && <p className="text-slate-500 text-xs italic font-medium">"{lastGlucose.note}"</p>}
              <p className="text-slate-400 text-[10px] font-semibold">{formatDate(lastGlucose.recordedAt)}</p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mt-4">Nenhum registro encontrado.</p>
          )}
        </div>
      </div>

      {/* Gráfico + Formulários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico dinâmico */}
        <div className="lg:col-span-2 space-y-4">
          <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl shadow-md animate-slide-up animation-delay-300">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Evolução Clínica</h3>
              <div className="flex p-1 rounded-lg bg-slate-100 border border-slate-200/80 gap-1">
                <button
                  onClick={() => setActiveTab('bp')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'bp' ? 'bg-white text-rose-600 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pressão
                </button>
                <button
                  onClick={() => setActiveTab('glucose')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'glucose' ? 'bg-white text-emerald-600 border border-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Glicemia
                </button>
              </div>
            </div>

            {/* Eixo Y labels */}
            {activeTab === 'bp' && (
              <div className="relative">
                <div className="h-48 w-full relative border-b border-slate-100">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="border-t border-slate-100/60" />
                    ))}
                  </div>
                  {bpSlice.length >= 2 ? (
                    <Sparkline
                      values={bpSlice.map(r => r.systolic)}
                      color="#f43f5e"
                      fillId="bpSysGrad"
                      fillColor="#f43f5e"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold">Aguardando dados suficientes…</div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                  {bpSlice.map((r, i) => (
                    <span key={i}>{new Date(r.recordedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-500">Sistólica (mmHg)</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    Último: <span className="text-rose-500 font-bold">{lastBP?.systolic ?? '—'}</span> / <span className="text-pink-500 font-bold">{lastBP?.diastolic ?? '—'}</span> mmHg
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'glucose' && (
              <div className="relative">
                <div className="h-48 w-full relative border-b border-slate-100">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="border-t border-slate-100/60" />
                    ))}
                  </div>
                  {glucoseSlice.length >= 2 ? (
                    <Sparkline
                      values={glucoseSlice.map(r => r.valueMgDl)}
                      color="#10b981"
                      fillId="glucoseGrad"
                      fillColor="#10b981"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold">Aguardando dados suficientes…</div>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 font-semibold">
                  {glucoseSlice.map((r, i) => (
                    <span key={i}>{new Date(r.recordedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Glicose (mg/dL)</span>
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    Último: <span className="text-emerald-500 font-bold">{lastGlucose?.valueMgDl ?? '—'}</span> mg/dL
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de registros */}
          <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl shadow-md animate-slide-up animation-delay-400">
            <h3 className="text-base font-bold text-slate-800 mb-4">Histórico de Registros</h3>
            <div className="overflow-x-auto">
              {activeTab === 'bp' ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 text-left border-b border-slate-100 font-bold">
                      <th className="pb-2 font-bold uppercase tracking-wider">Data/Hora</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Sistólica</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Diastólica</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Pulso</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Status</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...bpRecords].reverse().slice(0, 8).map((r) => {
                      const st = getBPCategory(r.systolic, r.diastolic);
                      return (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 text-slate-400 font-semibold">{formatDate(r.recordedAt)}</td>
                          <td className="py-2.5 text-rose-500 font-bold">{r.systolic}</td>
                          <td className="py-2.5 text-pink-500 font-bold">{r.diastolic}</td>
                          <td className="py-2.5 text-slate-600 font-semibold">{r.pulse ?? '—'}</td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded-md border text-[8px] whitespace-nowrap font-semibold ${st.color}`}>{st.label}</span></td>
                          <td className="py-2.5 text-slate-400 italic font-medium truncate max-w-[120px]">{r.note || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 text-left border-b border-slate-100 font-bold">
                      <th className="pb-2 font-bold uppercase tracking-wider">Data/Hora</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Glicose</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Contexto</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Status</th>
                      <th className="pb-2 font-bold uppercase tracking-wider">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...glucoseRecords].reverse().slice(0, 8).map((r) => {
                      const st = getGlucoseCategory(r.valueMgDl, r.context);
                      return (
                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 text-slate-400 font-semibold">{formatDate(r.recordedAt)}</td>
                          <td className="py-2.5 text-emerald-600 font-bold">{r.valueMgDl} mg/dL</td>
                          <td className="py-2.5 text-slate-600 font-semibold">{contextLabel[r.context]}</td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded-md border text-[8px] whitespace-nowrap font-semibold ${st.color}`}>{st.label}</span></td>
                          <td className="py-2.5 text-slate-400 italic font-medium truncate max-w-[120px]">{r.note || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Formulários de inserção */}
        <div className="space-y-6">
          <HealthRecordForm type="bloodPressure" onSuccess={fetchRecords} />
          <HealthRecordForm type="glucose" onSuccess={fetchRecords} />
        </div>
      </div>
    </div>
  );
};
