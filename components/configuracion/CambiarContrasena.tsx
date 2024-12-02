'use client';

import { Button } from "@/components/ui/button";

interface PropiedadesCambiarContrasena {
  formData: {
    contrasenaActual: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onActualizar: () => void;
}

export function CambiarContrasena({
  formData,
  isLoading,
  onInputChange,
  onActualizar
}: PropiedadesCambiarContrasena) {
  return (
    <section id="seguridad" className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Cambiar Contraseña
        </h2>
        <Button
          onClick={onActualizar}
          disabled={isLoading || !formData.contrasenaActual || !formData.nuevaContrasena || formData.nuevaContrasena !== formData.confirmarContrasena}
          className="bg-blue-600 text-white"
        >
          {isLoading ? 'Guardando...' : 'Actualizar contraseña'}
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña Actual
          </label>
          <input
            type="password"
            name="contrasenaActual"
            value={formData.contrasenaActual}
            onChange={onInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <input
            type="password"
            name="nuevaContrasena"
            value={formData.nuevaContrasena}
            onChange={onInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            name="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={onInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </section>
  );
} 