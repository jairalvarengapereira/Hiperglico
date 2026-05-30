// frontend/src/pages/DashboardMedico.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const API_HOST = '';

interface PatientMedicalRecord {
  id: string;
  fullName: string;
  age: number;
  phone: string;
  lastBP: string;
  lastGlucose: number;
  riskStatus: 'CRITICAL' | 'WARNING' | 'STABLE';
  note: string;
  sysHistory: number[];
  diaHistory: number[];
  glucoseHistory: number[];
}

// Dados mock para fallback
const MOCK_PATIENTS: PatientMedicalRecord[] = [
  {
    id: 'p1', fullName: 'João da Silva', age: 46, phone: '(11) 98765-4321',
    lastBP: '135/85', lastGlucose: 140, riskStatus: 'WARNING',
    note: 'Relatou leve tontura matinal após picos glicêmicos.',
    sysHistory: [120, 124, 135, 128, 135], diaHistory: [80, 82, 85, 80, 85],
    glucoseHistory: [95, 102, 138, 110, 140],
  },
  {
    id: 'p2', fullName: 'Maria de Souza', age: 62, phone: '(11) 97654-3210',
    lastBP: '152/95', lastGlucose: 210, riskStatus: 'CRITICAL',
    note: 'Diabetes descompensada. Necessita ajuste de dose de insulina imediato.',
    sysHistory: [138, 142, 148, 150, 152], diaHistory: [88, 90, 92, 94, 95],
    glucoseHistory: [142, 168, 185, 198, 210],
  },
  {
    id: 'p3', fullName: 'Carlos Alberto Ferreira', age: 38, phone: '(11) 96543-2109',
    lastBP: '118/75', lastGlucose: 90, riskStatus: 'STABLE',
    note: 'Respondeu excepcionalmente bem às orientações nutricionais.',
    sysHistory: [122, 120, 118, 119, 118], diaHistory: [80, 78, 76, 75, 75],
    glucoseHistory: [95, 92, 88, 92, 90],
  },
  {
    id: 'p4', fullName: 'Francisca das Chagas', age: 71, phone: '(11) 95432-1098',
    lastBP: '144/88', lastGlucose: 155, riskStatus: 'CRITICAL',
    note: 'Idosa hipertensa sob observação. Recomenda-se contato semanal.',
    sysHistory: [135, 140, 138, 145, 144], diaHistory: [82, 85, 84, 88, 88],
    glucoseHistory: [110, 125, 130, 148, 155],
  },
];

// --- Componente de mini-gráfico SVG dinâmico para o painel médico ---
interface MiniChartProps {
  values: number[];
  color: string;
  dashed?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({ values, color, dashed }) => {
  if (values.length < 2) return null;
  const W = 280;
  const H = 130;
  const PAD = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => ({
    x: PAD + (i / (values.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / range) * (H - PAD * 2),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '5 3' : undefined}
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === pts.length - 1 ? 5 : 3.5}
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity={i === pts.length - 1 ? 1 : 0.7}
        />
      ))}
      {/* Valor atual no último ponto */}
      <text
        x={pts[pts.length - 1].x}
        y={Math.max(pts[pts.length - 1].y - 10, 12)}
        textAnchor="middle"
        fill={color}
        fontSize="9"
        fontWeight="600"
      >
        {values[values.length - 1]}
      </text>
    </svg>
  );
};

const getRiskBadge = (status: 'CRITICAL' | 'WARNING' | 'STABLE') => {
  switch (status) {
    case 'CRITICAL': return { label: 'Crítico', style: 'bg-rose-500/10 text-rose-600 border-rose-500/20', dot: 'bg-rose-500' };
    case 'WARNING':  return { label: 'Alerta',  style: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' };
    case 'STABLE':   return { label: 'Estável', style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' };
  }
};

export const DashboardMedico: React.FC = () => {
  const { fullName, token } = useAuth();
  const [patients, setPatients] = useState<PatientMedicalRecord[]>(MOCK_PATIENTS);
  const [selectedId, setSelectedId] = useState<string>('p1');
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'STABLE'>('ALL');
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/health/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        if (Array.isArray(data) && data.length > 0) {
          // Mapear dados da API para o formato do componente
          const mapped: PatientMedicalRecord[] = data.map((p: any) => {
            const bpList: number[] = (p.bloodPressure ?? []).map((r: any) => r.systolic);
            const diaList: number[] = (p.bloodPressure ?? []).map((r: any) => r.diastolic);
            const gList: number[] = (p.glucose ?? []).map((r: any) => r.valueMgDl);
            const lastSys = bpList[bpList.length - 1] ?? 0;
            const lastDia = diaList[diaList.length - 1] ?? 0;
            const lastG = gList[gList.length - 1] ?? 0;
            let riskStatus: 'CRITICAL' | 'WARNING' | 'STABLE' = 'STABLE';
            if (lastSys >= 140 || lastDia >= 90 || lastG >= 200) riskStatus = 'CRITICAL';
            else if (lastSys >= 130 || lastG >= 140) riskStatus = 'WARNING';

            return {
              id: p.id,
              fullName: p.fullName,
              age: p.birthDate ? Math.floor((Date.now() - new Date(p.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0,
              phone: p.phone ?? '—',
              lastBP: `${lastSys}/${lastDia}`,
              lastGlucose: lastG,
              riskStatus,
              note: `${p.fullName} — ${p.bloodPressure?.length ?? 0} medições de PA e ${p.glucose?.length ?? 0} de glicemia registradas.`,
              sysHistory: bpList.slice(-5),
              diaHistory: diaList.slice(-5),
              glucoseHistory: gList.slice(-5),
            };
          });
          setPatients(mapped);
          setSelectedId(mapped[0]?.id ?? 'p1');
        }
        setApiOnline(true);
      }
    } catch {
      // mantém os dados mock
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = patients.filter(p => filter === 'ALL' || p.riskStatus === filter);
  const selected = patients.find(p => p.id === selectedId) ?? patients[0]!;

  const criticalCount = patients.filter(p => p.riskStatus === 'CRITICAL').length;
  const warningCount  = patients.filter(p => p.riskStatus === 'WARNING').length;
  const stableCount   = patients.filter(p => p.riskStatus === 'STABLE').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-violet-600 text-xs font-semibold uppercase tracking-wider">Painel do Médico</span>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            {fullName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie seus pacientes crônicos da Clínica Saúde &amp; Vida.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs self-start ${apiOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            <span className={`h-2 w-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {apiOnline ? 'API Online' : 'Modo Demo'}
          </div>
          {/* Quick Metrics */}
          {([
            { label: 'Total', value: patients.length, color: 'text-slate-800' },
            { label: 'Críticos', value: criticalCount, color: 'text-rose-600' },
            { label: 'Alertas', value: warningCount, color: 'text-amber-600' },
            { label: 'Estáveis', value: stableCount, color: 'text-emerald-600' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center min-w-[64px]">
              <span className={`block text-xl font-bold ${color}`}>{value}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pacientes */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-md animate-slide-up animation-delay-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Lista de Pacientes</h3>
              <span className="text-[10px] text-slate-400 font-semibold">{filtered.length} exibidos</span>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
              {(['ALL', 'CRITICAL', 'WARNING', 'STABLE'] as const).map(f => {
                const active = filter === f;
                const styles: Record<string, string> = {
                  ALL: 'bg-white text-slate-800 border border-slate-200/40 shadow-sm',
                  CRITICAL: 'bg-white text-rose-600 border border-slate-200/40 shadow-sm',
                  WARNING: 'bg-white text-amber-600 border border-slate-200/40 shadow-sm',
                  STABLE: 'bg-white text-emerald-600 border border-slate-200/40 shadow-sm',
                };
                const labels: Record<string, string> = {
                  ALL: 'Todos', CRITICAL: 'Crítico', WARNING: 'Alerta', STABLE: 'Estável',
                };
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-[10px] py-1.5 px-1 rounded-lg font-bold transition-all ${active ? styles[f] : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {/* Scroll list */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  ))
                : filtered.map(p => {
                    const badge = getRiskBadge(p.riskStatus);
                    const isSelected = p.id === selectedId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-violet-50/20 border-violet-500/30 shadow-md shadow-violet-500/5' : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`h-2 w-2 rounded-full ${badge.dot} shrink-0`} />
                            <span className="font-bold text-sm text-slate-700 truncate">{p.fullName}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold uppercase tracking-wide shrink-0 ${badge.style}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 ml-[18px]">
                          <span>{p.age} anos</span>
                          <span className="text-slate-600 font-bold">PA: {p.lastBP}</span>
                          <span className="text-emerald-600 font-bold">{p.lastGlucose} mg/dL</span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* Detalhes do paciente selecionado */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-md animate-slide-up animation-delay-200">
              {/* Cabeçalho do paciente */}
              <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-slate-100 pb-5 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selected.fullName}</h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    📞 {selected.phone} &nbsp;·&nbsp; {selected.age} anos
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Pressão Recente</span>
                    <span className="text-base font-bold text-slate-800">
                      {selected.sysHistory.at(-1)}/{selected.diaHistory.at(-1)} mmHg
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-200 pl-4">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Última Glicemia</span>
                    <span className="text-base font-bold text-slate-800">{selected.lastGlucose} mg/dL</span>
                  </div>
                  <div className="pl-4 border-l border-slate-200">
                    {(() => {
                      const b = getRiskBadge(selected.riskStatus);
                      return (
                        <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${b.style}`}>
                          {b.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Anotação clínica */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  📋 Anotações Clínicas
                </span>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{selected.note}"</p>
              </div>

              {/* Gráficos dinâmicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PA */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                    Pressão Arterial — Histórico
                  </span>
                  <div className="h-36 relative border-b border-slate-100 pt-2">
                    <MiniChart values={selected.sysHistory} color="#f43f5e" />
                    <MiniChart values={selected.diaHistory} color="#ec4899" dashed />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Med. 1</span><span>Med. 3</span><span>Recente</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-rose-500 inline-block" /> Sistólica</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded bg-pink-500 inline-block border-dashed" /> Diastólica</span>
                  </div>
                </div>

                {/* Glicemia */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                    Glicemia — Histórico (mg/dL)
                  </span>
                  <div className="h-36 relative border-b border-slate-100 pt-2">
                    <MiniChart values={selected.glucoseHistory} color="#10b981" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Med. 1</span><span>Med. 3</span><span>Recente</span>
                  </div>
                  {/* Linha de referência DM */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold">
                    <span>Alvo em jejum: &lt;100 | Pós-prandial: &lt;140 mg/dL</span>
                  </div>
                </div>
              </div>

              {/* Tendência da Pressão (sparkline adicional — sistólica completa) */}
              {selected.sysHistory.length >= 3 && (
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Tendência Sistólica — {selected.sysHistory.at(-1)} mmHg
                    {(selected.sysHistory.at(-1) ?? 0) > (selected.sysHistory[0] ?? 0)
                      ? ' ↑ em elevação'
                      : ' ↓ em queda'}
                  </span>
                  <div className="flex items-center gap-2">
                    {selected.sysHistory.map((v, i) => {
                      const max = Math.max(...selected.sysHistory);
                      const pct = Math.round((v / max) * 100);
                      return (
                        <div key={i} className="flex flex-col items-center flex-1 gap-1">
                          <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: 4 }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: v >= 140 ? '#f43f5e' : v >= 130 ? '#f59e0b' : '#10b981',
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/80 border border-slate-200/80 p-16 rounded-2xl text-center text-slate-400 shadow-md">
              Selecione um paciente para ver os dados clínicos detalhados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
