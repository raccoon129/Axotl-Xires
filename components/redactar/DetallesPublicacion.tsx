// components/redactar/DetallesPublicacion.tsx
import { useState } from 'react';
import Tooltip from "@/components/global/Tooltip";
import { TipoPublicacion } from '@/type/tipoPublicacion';

interface DetallesPublicacionProps {
  nombrePublicacion: string;
  setNombrePublicacion: (nombre: string) => void;
  resumenPublicacion: string;
  setResumenPublicacion: (resumen: string) => void;
  tipoSeleccionado: number | "";
  setTipoSeleccionado: (tipo: number) => void;
  tiposPublicacion: TipoPublicacion[];
}

export const DetallesPublicacion: React.FC<DetallesPublicacionProps> = ({
  nombrePublicacion,
  setNombrePublicacion,
  resumenPublicacion,
  setResumenPublicacion,
  tipoSeleccionado,
  setTipoSeleccionado,
  tiposPublicacion
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block font-medium text-gray-600 mb-2">
          Título de la publicación
        </label>
        <Tooltip message="Ingresa un título descriptivo para tu publicación, fácilmente identificable y breve.">
          <input
            type="text"
            value={nombrePublicacion}
            onChange={(e) => setNombrePublicacion(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Escribe un título llamativo"
          />
        </Tooltip>

        <label className="block font-medium text-gray-600 mt-4 mb-2">
          Resumen
        </label>
        <textarea
          value={resumenPublicacion}
          onChange={(e) => setResumenPublicacion(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-24"
          placeholder="Escribe un breve resumen de tu publicación"
        />

        <label className="block font-medium text-gray-600 mt-4 mb-2">
          Tipo de publicación
        </label>
        <select
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(Number(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Selecciona un tipo</option>
          {tiposPublicacion.map((tipo) => (
            <option key={tipo.id_tipo} value={tipo.id_tipo}>
              {tipo.nombre} - {tipo.descripcion}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
