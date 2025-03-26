import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Interfaz para definir la estructura de una notificación
export interface Notificacion {
  id: number;
  tipo: 'comentario' | 'favorito' | 'seguimiento' | 'sistema';
  mensaje: string;
  leida: boolean;
  fecha: string;
  enlace?: string; // Enlace opcional al que redirigir al hacer clic
  id_origen?: number; // ID del elemento que originó la notificación (ej: id de publicación)
}

export const useNotificaciones = () => {
  const { idUsuario, isLoggedIn } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las notificaciones del usuario
  const obtenerNotificaciones = async () => {
    if (!isLoggedIn || !idUsuario) {
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al obtener notificaciones');
      }

      const datos = await respuesta.json();
      
      // Verificar la estructura correcta de la respuesta
      if (datos.status === 'success' && datos.datos && Array.isArray(datos.datos.notificaciones)) {
        // Transformar las notificaciones al formato que espera nuestro frontend
        const notificacionesFormateadas = datos.datos.notificaciones.map((notif: any) => ({
          id: notif.id_notificacion,
          tipo: notif.tipo || 'sistema',
          mensaje: notif.contenido,
          leida: notif.leida === 1, // Convertir 0/1 a booleano
          fecha: notif.fecha_creacion,
          enlace: obtenerEnlaceNotificacion(notif),
          id_origen: notif.id_origen
        }));
        
        setNotificaciones(notificacionesFormateadas);
        
        // Usar el contador de no leídas que proporciona la API
        if (typeof datos.datos.no_leidas === 'number') {
          setNoLeidas(datos.datos.no_leidas);
        } else {
          // Como respaldo, calcular manualmente
          const cantidadNoLeidas = notificacionesFormateadas.filter(
            (notif: Notificacion) => !notif.leida
          ).length;
          setNoLeidas(cantidadNoLeidas);
        }
      } else {
        // Formato de respuesta inesperado
        console.error('Formato de respuesta inesperado:', datos);
        setNotificaciones([]);
        setNoLeidas(0);
      }
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
      // También establecer arrays vacíos en caso de error
      setNotificaciones([]);
      setNoLeidas(0);
    } finally {
      setCargando(false);
    }
  };

  // Función para determinar el enlace basado en el tipo de notificación
  const obtenerEnlaceNotificacion = (notif: any) => {
    // Ejemplos de enlaces según el tipo de notificación
    switch (notif.tipo) {
      case 'comentario':
        return `/publicaciones/${notif.id_referencia}`;
      case 'favorito':
        return `/publicaciones/${notif.id_referencia}`;
      case 'seguimiento':
        return `/perfil/${notif.id_origen}`;
      case 'sistema':
      default:
        // Para notificaciones del sistema, podría no haber enlace
        return notif.id_referencia ? `/publicaciones/${notif.id_referencia}` : undefined;
    }
  };

  // Función optimizada para obtener solo la cantidad de notificaciones no leídas
  // Útil para actualizaciones rápidas del badge sin recargar todas las notificaciones
  const obtenerCantidadNoLeidas = async () => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}/no-leidas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al obtener cantidad de notificaciones no leídas');
      }

      const datos = await respuesta.json();
      
      // Actualizar con la estructura correcta de la respuesta
      if (datos.status === 'success' && datos.datos && typeof datos.datos.no_leidas === 'number') {
        setNoLeidas(datos.datos.no_leidas);
      } else {
        console.warn('Respuesta inesperada de la API de notificaciones no leídas:', datos);
      }
    } catch (err) {
      console.error('Error al obtener cantidad de notificaciones no leídas:', err);
      // En caso de error, mantener el valor actual
    }
  };

  // Función para marcar una notificación como leída
  const marcarComoLeida = async (idNotificacion: number) => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}/${idNotificacion}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      // Actualizar el estado local de las notificaciones
      setNotificaciones(prevNotificaciones => 
        prevNotificaciones.map(notif => 
          notif.id === idNotificacion 
            ? { ...notif, leida: true } 
            : notif
        )
      );

      // Actualizar contador de no leídas
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  // Función para marcar todas las notificaciones como leídas
  const marcarTodasComoLeidas = async () => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}/todas/leidas`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al marcar todas las notificaciones como leídas');
      }

      // Actualizar el estado local de las notificaciones
      setNotificaciones(prevNotificaciones => 
        prevNotificaciones.map(notif => ({ ...notif, leida: true }))
      );

      // Resetear contador de no leídas
      setNoLeidas(0);
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err);
    }
  };

  // Cargar notificaciones al iniciar o cuando cambie el estado de autenticación
  useEffect(() => {
    if (isLoggedIn && idUsuario) {
      obtenerNotificaciones();
    }
  }, [isLoggedIn, idUsuario]);

  // Configurar un intervalo para refrescar el contador de notificaciones no leídas
  useEffect(() => {
    if (!isLoggedIn || !idUsuario) return;

    // Obtener cantidad inicial de no leídas
    obtenerCantidadNoLeidas();

    // Refrescar cada 2 minutos (solo la cantidad, no todas las notificaciones)
    const intervalo = setInterval(() => {
      obtenerCantidadNoLeidas();
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, [isLoggedIn, idUsuario]);

  return {
    notificaciones,
    noLeidas,
    cargando,
    error,
    obtenerNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    obtenerCantidadNoLeidas
  };
};