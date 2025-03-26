import { useState, useEffect, useCallback } from 'react';
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
  const [cargando, setCargando] = useState<boolean>(false); // Iniciar en false para no mostrar estados de carga innecesarios
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las notificaciones del usuario
  const obtenerNotificaciones = useCallback(async () => {
    // Verificación estricta de autenticación
    if (!isLoggedIn || !idUsuario) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No hay token, no hacer la petición
        setCargando(false);
        return;
      }

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
          id: notif.id_notificacion || `temp-${Math.random()}`, // ID seguro
          tipo: notif.tipo || 'sistema',
          mensaje: notif.contenido,
          leida: notif.leida === 1, // Convertir 0/1 a booleano
          fecha: notif.fecha_creacion || new Date().toISOString(), // Fecha segura
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
  }, [isLoggedIn, idUsuario]);

  // Resto de funciones, asegurando que usen useCallback para evitar recreaciones
  const obtenerEnlaceNotificacion = useCallback((notif: any) => {
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
        return notif.id_referencia ? `/publicaciones/${notif.id_referencia}` : undefined;
    }
  }, []);

  // Función optimizada para obtener solo la cantidad de notificaciones no leídas
  const obtenerCantidadNoLeidas = useCallback(async () => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return; // No hay token, no hacer la petición

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
  }, [isLoggedIn, idUsuario]);

  // Función para marcar una notificación como leída
  const marcarComoLeida = useCallback(async (idNotificacion: number) => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return; // No hay token, no hacer la petición

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
  }, [isLoggedIn, idUsuario]);

  // Función para marcar todas las notificaciones como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    if (!isLoggedIn || !idUsuario) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return; // No hay token, no hacer la petición

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
  }, [isLoggedIn, idUsuario]);

  // Uso de useEffect con verificación estricta y dependencias correctas
  useEffect(() => {
    // Verificación estricta para no ejecutar nada si no hay sesión
    if (!isLoggedIn || !idUsuario) {
      // Limpiar estados cuando no hay sesión
      setNotificaciones([]);
      setNoLeidas(0);
      setCargando(false);
      setError(null);
      return;
    }
    
    // Solo cargar notificaciones si hay sesión activa
    obtenerNotificaciones();
    
    // No incluir obtenerNotificaciones en las dependencias para evitar un bucle
  }, [isLoggedIn, idUsuario]);

  // Configurar un intervalo para refrescar el contador de notificaciones no leídas
  useEffect(() => {
    if (!isLoggedIn || !idUsuario) return;

    // Obtener cantidad inicial de no leídas
    obtenerCantidadNoLeidas();

    // Refrescar cada 2 minutos (solo la cantidad, no todas las notificaciones)
    const intervalo = setInterval(() => {
      // Verificar nuevamente que el usuario siga con sesión antes de hacer la petición
      if (isLoggedIn && idUsuario) {
        obtenerCantidadNoLeidas();
      } else {
        // Si ya no hay sesión, limpiar el intervalo
        clearInterval(intervalo);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, [isLoggedIn, idUsuario, obtenerCantidadNoLeidas]);

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