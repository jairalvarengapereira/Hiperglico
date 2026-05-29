// ClinicDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_HOST = '';

interface Clinic {
  id: string;
  name: string;
  cnpj?: string;
  doctorCount?: number;
  patientCount?: number;
  doctors?: { id: string; email: string }[];
  patients?: { id: string; fullName: string }[];
}

export const ClinicDetail: React.FC = () => {
  const { token, role } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    const fetchClinic = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/clinic/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao carregar clínica');
        const data = await res.json();
        setClinic(data);
        setFormName(data.name);
        setFormCnpj(data.cnpj || '');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id, token]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_HOST}/api/clinic/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formName, cnpj: formCnpj }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar clínica');
      const updated = await res.json();
      setClinic({ ...clinic!, name: updated.name, cnpj: updated.cnpj });
      setEditing(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;
    try {
      const res = await fetch(`${API_HOST}/api/clinic/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao excluir clínica');
      navigate('/clinics');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Carregando...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!clinic) return <div className="text-center">Clínica não encontrada.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <Link to="/clinics" className="text-rose-500 hover:underline text-sm">← Voltar à lista</Link>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              {editing ? 'Cancelar' : '✏️ Editar'}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition"
            >
              🗑️ Excluir
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Editar Clínica</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ</label>
            <input
              type="text"
              value={formCnpj}
              onChange={(e) => setFormCnpj(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-rose-600">{clinic.name}</h1>
          {clinic.cnpj && <p className="text-gray-600">CNPJ: {clinic.cnpj}</p>}
          <div className="flex space-x-6 text-sm text-gray-500">
            <span>👩‍⚕️ {clinic.doctorCount ?? 0} Médicos</span>
            <span>🧑‍🤝‍🧑 {clinic.patientCount ?? 0} Pacientes</span>
          </div>
        </>
      )}
    </div>
  );
};
