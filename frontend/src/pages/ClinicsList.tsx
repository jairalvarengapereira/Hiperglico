// ClinicsList.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const API_HOST = '';
import { Link, useNavigate } from 'react-router-dom';

interface Clinic {
  id: string;
  name: string;
  address?: string;
  doctorCount?: number;
  patientCount?: number;
}

export const ClinicsList: React.FC = () => {
  const { token, role } = useAuth();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === 'ADMIN';

  const fetchClinics = async () => {
    if (!token) {
      setLoading(false);
      setError('Autenticação necessária. Por favor, faça login.');
      return;
    }
    try {
      const res = await fetch(`${API_HOST}/api/clinic`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao carregar clínicas');
      const data = await res.json();
      setClinics(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [token]);

  const handleDelete = async (clinicId: string, clinicName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${clinicName}"?`)) return;
    try {
      const res = await fetch(`${API_HOST}/api/clinic/${clinicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao excluir clínica');
      setClinics(clinics.filter(c => c.id !== clinicId));
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando clínicas...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clínicas</h1>
        {isAdmin && (
          <Link
            to="/clinics/create"
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
          >
            + Nova Clínica
          </Link>
        )}
      </div>
      {clinics.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma clínica cadastrada.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinics.map((clinic) => (
            <li
              key={clinic.id}
              className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <Link to={`/clinics/${clinic.id}`} className="block flex-1">
                  <h2 className="text-xl font-semibold text-rose-600">{clinic.name}</h2>
                  {clinic.address && <p className="text-sm text-gray-500">{clinic.address}</p>}
                  <div className="mt-2 text-xs text-gray-400 flex space-x-4">
                    <span>👩‍⚕️ {clinic.doctorCount ?? 0} Médicos</span>
                    <span>🧑‍🤝‍🧑 {clinic.patientCount ?? 0} Pacientes</span>
                  </div>
                </Link>
                {isAdmin && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => navigate(`/clinics/${clinic.id}`)}
                      className="p-1.5 text-xs bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(clinic.id, clinic.name)}
                      className="p-1.5 text-xs bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
