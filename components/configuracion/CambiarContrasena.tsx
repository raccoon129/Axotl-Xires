'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface PropiedadesCambiarContrasena {
  formData: {
    contrasenaActual: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
  };
  idUsuario: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLimpiarCamposContrasena: () => void;
  onNotificacion: (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string) => void;
}

export function CambiarContrasena({
  formData,
  idUsuario,
  onInputChange,
  onLimpiarCamposContrasena,
  onNotificacion
}: PropiedadesCambiarContrasena) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Actualiza la contraseña del usuario
   * Esta función requiere la contraseña actual y la nueva contraseña
   */
  const actualizarContrasena = async () => {
    // Verificamos que existan los datos necesarios
    if (!idUsuario || !formData.contrasenaActual || !formData.nuevaContrasena) return;

    setIsLoading(true);
    try {
      // Obtenemos el token de autenticación
      const token = localStorage.getItem('token');
      
      // Preparamos los datos que enviaremos al servidor
      const datosActualizacion = {
        contrasenaActual: formData.contrasenaActual,
        nuevaContrasena: formData.nuevaContrasena,
        confirmarContrasena: formData.confirmarContrasena
      };

      // Realizamos la petición PUT al endpoint correspondiente
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion/usuarios/${idUsuario}/contrasena`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datosActualizacion)
        }
      );

      // Procesamos la respuesta del servidor
      const datosRespuesta = await respuesta.json();
      
      // Si la respuesta no es exitosa, lanzamos un error
      if (!respuesta.ok) {
        throw new Error(datosRespuesta.mensaje || 'Error al actualizar contraseña');
      }
      
      // Limpiamos los campos del formulario
      onLimpiarCamposContrasena();

      // Mostramos notificación de éxito
      onNotificacion(
        "confirmacion",
        "Contraseña actualizada",
        datosRespuesta.mensaje || "La contraseña se ha actualizado correctamente"
      );
    } catch (error) {
      // Manejamos cualquier error que ocurra durante el proceso
      onNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar contraseña"
      );
    } finally {
      // Finalizamos el estado de carga independientemente del resultado
      setIsLoading(false);
    }
  };

  // Verificar si se deben habilitar los botones
  const formularioValido = () => {
    return formData.contrasenaActual && 
           formData.nuevaContrasena && 
           formData.nuevaContrasena === formData.confirmarContrasena;
  };

  return (
    <section id="seguridad" className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Cambiar Contraseña
        </h2>
        <Button
          onClick={actualizarContrasena}
          disabled={isLoading || !formularioValido()}
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