import React from 'react';

interface ClinicCardProps {
  name: string;
  cnpj?: string;
  doctorCount: number;
  patientCount: number;
  onSelect?: () => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  name,
  cnpj,
  doctorCount,
  patientCount,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer p-6 rounded-2xl bg-white/30 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
    >
      <h3 className="text-xl font-semibold text-slate-800 group-hover:text-rose-600 transition-colors duration-200">
        {name}
      </h3>
      {cnpj && (
        <p className="text-sm text-slate-600 mt-1">CNPJ: {cnpj}</p>
      )}
      <div className="mt-4 flex space-x-4 text-sm text-slate-600">
        <span>{doctorCount} Médico{doctorCount !== 1 ? 's' : ''}</span>
        <span>{patientCount} Paciente{patientCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};
