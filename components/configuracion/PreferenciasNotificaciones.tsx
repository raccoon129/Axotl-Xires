'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PreferenciasNotificacionesData {
  notificacionesCorreo: boolean;
}

interface PropiedadesPreferenciasNotificaciones {
  idUsuario: string | null;
  onNotificacion: (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string) => void;
}

/**
 * Componente que permite al usuario configurar sus preferencias de notificaciones
 * Muestra un interruptor para activar/desactivar notificaciones por correo
 */
export function PreferenciasNotificaciones({
  idUsuario,
  onNotificacion
}: PropiedadesPreferenciasNotificaciones) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreferencias, setIsLoadingPreferencias] = useState(true);
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacionesData>({
    notificacionesCorreo: true
  });
  const [preferenciasOriginales, setPreferenciasOriginales] = useState<PreferenciasNotificacionesData>({
    notificacionesCorreo: true
  });

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (idUsuario) {
      cargarPreferenciasNotificaciones();
    }
  }, [idUsuario]);

  /**
   * Carga las preferencias de notificaciones del usuario desde la API
   */
  const cargarPreferenciasNotificaciones = async () => {
    if (!idUsuario) return;
    
    setIsLoadingPreferencias(true);
    try {
      // Obtenemos el token de autenticación
      const token = localStorage.getItem('token');
      
      // Realizamos la petición GET al endpoint correspondiente
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion/usuarios/${idUsuario}/preferencias-notificaciones`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Procesamos la respuesta del servidor
      const datosRespuesta = await respuesta.json();
      
      // Si la respuesta no es exitosa, lanzamos un error
      if (!respuesta.ok) {
        throw new Error(datosRespuesta.mensaje || 'Error al cargar preferencias de notificaciones');
      }
      
      // Actualizamos los estados con los datos recibidos
      const preferenciasObtenidas = datosRespuesta.datos || { notificacionesCorreo: true };
      setPreferencias(preferenciasObtenidas);
      setPreferenciasOriginales(preferenciasObtenidas);
      
    } catch (error) {
      console.error('Error cargando preferencias de notificaciones:', error);
      // No mostramos notificación de error aquí para no interrumpir la carga inicial
    } finally {
      setIsLoadingPreferencias(false);
    }
  };

  /**
   * Actualiza las preferencias de notificaciones del usuario
   * Esta función envía las nuevas preferencias al servidor
   */
  const actualizarPreferenciasNotificaciones = async () => {
    if (!idUsuario) return;
    
    setIsLoading(true);
    try {
      // Obtenemos el token de autenticación
      const token = localStorage.getItem('token');
      
      // Preparamos los datos que enviaremos al servidor
      const datosActualizacion = {
        notificacionesCorreo: preferencias.notificacionesCorreo
      };
      
      // Realizamos la petición PUT al endpoint correspondiente
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion/usuarios/${idUsuario}/preferencias-notificaciones`,
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
        throw new Error(datosRespuesta.mensaje || 'Error al actualizar preferencias de notificaciones');
      }
      
      // Actualizamos el estado con los valores guardados
      setPreferenciasOriginales({...preferencias});
      
      // Mostramos notificación de éxito
      onNotificacion(
        "confirmacion",
        "Preferencias actualizadas",
        datosRespuesta.mensaje || "Las preferencias de notificaciones se han actualizado correctamente"
      );
    } catch (error) {
      // Manejamos cualquier error que ocurra durante el proceso
      onNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar preferencias de notificaciones"
      );
    } finally {
      // Finalizamos el estado de carga independientemente del resultado
      setIsLoading(false);
    }
  };

  const handleToggleNotificacionesCorreo = (valor: boolean) => {
    setPreferencias(prev => ({
      ...prev,
      notificacionesCorreo: valor
    }));
  };

  // Verificar si hay cambios en las preferencias
  const hayCambios = () => {
    return preferencias.notificacionesCorreo !== preferenciasOriginales.notificacionesCorreo;
  };

  if (isLoadingPreferencias) {
    return (
      <section id="notificaciones" className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Preferencias de Notificaciones
        </h2>
        <p className="text-gray-500">Cargando preferencias...</p>
      </section>
    );
  }

  return (
    <section id="notificaciones" className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Preferencias de Notificaciones
        </h2>
        <Button
          onClick={actualizarPreferenciasNotificaciones}
          disabled={isLoading || !hayCambios()}
          className="bg-blue-600 text-white"
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="font-medium text-gray-700">Notificaciones por correo electrónico</Label>
            <p className="text-sm text-gray-500">
              Recibe un correo cuando existan nuevas interacciones o actividad relevante
            </p>
          </div>
          <Switch
            checked={preferencias.notificacionesCorreo}
            onCheckedChange={handleToggleNotificacionesCorreo}
            disabled={isLoading}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
    </section>
  );
}
