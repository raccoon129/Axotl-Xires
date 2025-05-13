'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Tooltip from "@/components/global/Tooltip";

interface PropiedadesInformacionBasica {
  formData: {
    nombre: string;
    nombramiento: string;
    correo: string;
  };
  initialFormData: {
    nombre: string;
    nombramiento: string;
    correo: string;
  };
  idUsuario: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onActualizacionExitosa: () => Promise<void>;
  onNotificacion: (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string) => void;
}

export function InformacionBasica({ 
  formData, 
  initialFormData,
  idUsuario,
  onInputChange, 
  onActualizacionExitosa,
  onNotificacion
}: PropiedadesInformacionBasica) {
  const [isLoading, setIsLoading] = useState(false);

  // Verifica si hay cambios para habilitar el botón de guardar
  const hayCambios = () => {
    return formData.nombre !== initialFormData.nombre || 
           formData.nombramiento !== initialFormData.nombramiento || 
           formData.correo !== initialFormData.correo;
  };

  /**
   * Actualiza la información básica del usuario (nombre, nombramiento, correo)
   * Esta función realiza una petición PUT a la API y muestra una notificación con el resultado
   */
  const actualizarInformacionBasica = async () => {
    if (!idUsuario) {
      onNotificacion("excepcion", "Error", "No se ha podido identificar al usuario");
      return;
    }
    
    setIsLoading(true);
    try {
      // Obtenemos el token de autenticación del almacenamiento local
      const token = localStorage.getItem('token');
      
      // Preparamos los datos que enviaremos al servidor
      const datosActualizacion = {
        nombre: formData.nombre,
        nombramiento: formData.nombramiento,
        correo: formData.correo
      };
      
      // Realizamos la petición PUT al endpoint correspondiente
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion/usuarios/${idUsuario}/info-basica`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluimos el token en el encabezado
          },
          body: JSON.stringify(datosActualizacion)
        }
      );

      // Procesamos la respuesta del servidor
      const datosRespuesta = await respuesta.json();
      
      // Si la respuesta no es exitosa, lanzamos un error
      if (!respuesta.ok) {
        throw new Error(datosRespuesta.mensaje || 'Error al actualizar información básica');
      }
      
      // Actualizamos el perfil en el contexto de autenticación
      await onActualizacionExitosa();
      
      // Mostramos notificación de éxito
      onNotificacion(
        "confirmacion",
        "Actualización exitosa",
        datosRespuesta.mensaje || "La información básica se ha actualizado correctamente"
      );
    } catch (error) {
      // Manejamos cualquier error que ocurra durante el proceso
      onNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar información"
      );
    } finally {
      // Finalizamos el estado de carga independientemente del resultado
      setIsLoading(false);
    }
  };

  return (
    <section id="informacion-basica" className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Información Básica
        </h2>
        <Button
          onClick={actualizarInformacionBasica}
          disabled={isLoading || !hayCambios()}
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