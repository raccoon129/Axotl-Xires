'use client';

import { Button } from "@/components/ui/button";
import Tooltip from "@/components/global/Tooltip";

interface PropiedadesInformacionBasica {
  formData: {
    nombre: string;
    nombramiento: string;
    correo: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGuardar: () => void;
}

export function InformacionBasica({ 
  formData, 
  isLoading, 
  onInputChange, 
  onGuardar 
}: PropiedadesInformacionBasica) {
  return (
    <section id="informacion-basica" className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Información Básica
        </h2>
        <Button
          onClick={onGuardar}
          disabled={isLoading}
          className="bg-blue-600 text-white"
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <Tooltip message="Ingresa tu nombre completo">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={onInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </Tooltip>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombramiento
          </label>
          <Tooltip message="Ej: Profesor, Investigador, Estudiante">
            <input
              type="text"
              name="nombramiento"
              value={formData.nombramiento}
              onChange={onInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </Tooltip>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={onInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </section>
  );
} 