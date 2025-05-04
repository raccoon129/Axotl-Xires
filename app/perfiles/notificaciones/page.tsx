"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificaciones, Notificacion } from '@/hooks/useNotificaciones';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckIcon, 
  TrashIcon, 
  BellIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  RefreshCwIcon,
  FilterIcon,
  XIcon
} from 'lucide-react';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';

export default function NotificacionesPage() {
  const router = useRouter();
  const { idUsuario } = useAuth();
  const {
    notificaciones,
    cargando,
    error,
    marcarComoLeida,
    marcarTodasComoLeidas,
    obtenerNotificaciones
  } = useNotificaciones();
  
  const [filtro, setFiltro] = useState<'todas' | 'no-leidas'>('todas');
  const [notificacionesFiltradas, setNotificacionesFiltradas] = useState<Notificacion[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const elementosPorPagina = 10;
  
  // Función para eliminar una notificación
  const eliminarNotificacion = async (idNotificacion: number) => {
    if (!idUsuario) return;
    
    setEliminando(idNotificacion);
    
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}/${idNotificacion}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al eliminar la notificación');
      }

      // Actualizar la lista de notificaciones después de eliminar
      setNotificacionesFiltradas(prev => 
        prev.filter(notif => notif.id !== idNotificacion)
      );
      
      // Si eliminamos la última notificación de la página actual y no es la primera página
      const notificacionesRestantes = notificacionesFiltradas.filter(n => n.id !== idNotificacion);
      if (notificacionesRestantes.length === 0 && paginaActual > 1) {
        setPaginaActual(prev => prev - 1);
      }
      
      // Refrescar notificaciones
      await obtenerNotificaciones();
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    } finally {
      setEliminando(null);
    }
  };

  // Función para cargar notificaciones con paginación y filtros
  const cargarNotificacionesPaginadas = async () => {
    // Verificación estricta de autenticación
    
    setActualizando(true);
    
    try {
      const token = localStorage.getItem('token');

      const estadoLeida = filtro === 'no-leidas' ? 'false' : 'all';
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notificaciones/${idUsuario}?page=${paginaActual}&limit=${elementosPorPagina}&leidas=${estadoLeida}`,
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
      
      if (datos.status === 'success' && datos.datos) {
        // Transformar las notificaciones al formato esperado
        const notificacionesFormateadas = datos.datos.notificaciones.map((notif: any) => ({
          id: notif.id_notificacion || `temp-${Math.random()}`, // Asegurar ID único incluso si falta
          tipo: notif.tipo || 'sistema',
          mensaje: notif.contenido,
          leida: notif.leida === 1,
          fecha: notif.fecha_creacion || new Date().toISOString(),
          enlace: obtenerEnlaceNotificacion(notif),
          id_origen: notif.id_origen,
          nombre_origen: notif.nombre_origen,
          foto_origen: notif.foto_origen
        }));
        
        setNotificacionesFiltradas(notificacionesFormateadas);
        
        // Actualizar paginación
        if (datos.datos.paginacion) {
          setTotalPaginas(datos.datos.paginacion.total_paginas || 1);
        }
      }
    } catch (err) {
      console.error('Error al obtener notificaciones paginadas:', err);
    } finally {
      setActualizando(false);
    }
  };

  // Función para obtener enlaces según el tipo de notificación
  const obtenerEnlaceNotificacion = (notif: any) => {
    switch (notif.tipo) {
      case 'comentario':
        return `/publicaciones/${notif.id_referencia}#comentario-${notif.id_origen}`;
      case 'favorito':
        return `/publicaciones/${notif.id_referencia}`;
      case 'seguimiento':
        return `/perfil/${notif.id_origen}`;
      case 'cambios_solicitados':
        return `/perfiles/mispublicaciones/revisiones/${notif.id_referencia}`;
      case 'revision_iniciada':
        return `/perfiles/mispublicaciones/revisiones/${notif.id_referencia}`;
      case 'moderacion':
        //return `/publicaciones/${notif.id_referencia}`;
      case 'sistema':
      default:
        return notif.id_referencia ? `/publicaciones/${notif.id_referencia}` : undefined;
    }
  };

  // Efecto para cargar notificaciones al cambiar el filtro o la página,
  // pero solo si hay sesión activa
  useEffect(() => {
    if (idUsuario) {
      cargarNotificacionesPaginadas();
    }
  }, [filtro, paginaActual, idUsuario]);

  // Establecer el título de la página
  useEffect(() => {
    document.title = "Notificaciones - Axotl Xires";
  }, []);

  // Función para obtener el ícono según el tipo de notificación
  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
        );
      case 'favorito':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 'seguimiento':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        );
        case 'cambios_solicitados':
          return (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
          );
        case 'revision_iniciada':
          return (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
          );
          case 'moderacion':
            return (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M15 9l-6 6M9 9l6 6"></path>
                </svg>
              </div>
            );
      case 'sistema':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  // Agrupar notificaciones por fecha
  const agruparPorFecha = (notificaciones: Notificacion[]) => {
    const grupos: Record<string, Notificacion[]> = {};
    
    notificaciones.forEach(notif => {
      const fecha = new Date(notif.fecha);
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      
      let claveFecha;
      if (fecha.toDateString() === hoy.toDateString()) {
        claveFecha = 'Hoy';
      } else if (fecha.toDateString() === ayer.toDateString()) {
        claveFecha = 'Ayer';
      } else {
        claveFecha = format(fecha, 'dd MMMM yyyy', { locale: es });
      }
      
      if (!grupos[claveFecha]) {
        grupos[claveFecha] = [];
      }
      
      grupos[claveFecha].push(notif);
    });
    
    return grupos;
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return format(fecha, 'HH:mm', { locale: es });
    } catch (error) {
      return '';
    }
  };

  const gruposNotificaciones = agruparPorFecha(notificacionesFiltradas);

  // Mostrar skeleton mientras carga
  const NotificacionSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
      <div className="flex items-center mb-4">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={`skeleton-${i}`} className="flex items-start">
            <Skeleton className="w-10 h-10 rounded-full mr-4" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar contenido principal
  const renderContenidoNotificaciones = () => {
    if (cargando || actualizando) {
      return (
        <div>
          <NotificacionSkeleton />
          <NotificacionSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-8 text-center"
          key="error-notification"
        >
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 inline-flex items-center">
            <XIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button 
            onClick={() => {
              obtenerNotificaciones();
              cargarNotificacionesPaginadas();
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Reintentar
          </Button>
        </motion.div>
      );
    }

    if (notificacionesFiltradas.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-12 text-center"
          key="empty-notifications"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No hay notificaciones
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filtro === 'todas' 
              ? 'No tienes notificaciones aún. Te avisaremos cuando haya actividad relacionada con tu cuenta.'
              : 'No tienes notificaciones sin leer. ¡Estás al día!'}
          </p>
        </motion.div>
      );
    }

    return (
      <>
        {Object.entries(gruposNotificaciones).map(([fecha, notifs]) => (
          <motion.div 
            key={`grupo-${fecha}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6"
          >
            <div className="px-4 py-3 bg-purple-50 border-b">
              <h3 className="text-sm font-medium text-purple-800">{fecha}</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notifs.map((notif) => (
                <motion.div 
                  key={`notif-${notif.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 ${notif.leida ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition-colors duration-150 group relative`}
                >
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                      {obtenerIcono(notif.tipo)}
                    </div>
                    
                    {/* Contenido de la notificación */}
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={async () => {
                        if (!notif.leida) {
                          await marcarComoLeida(notif.id);
                          // Actualizar estado local
                          setNotificacionesFiltradas(prev => 
                            prev.map(n => n.id === notif.id ? {...n, leida: true} : n)
                          );
                        }
                        if (notif.enlace) {
                          router.push(notif.enlace);
                        }
                      }}
                    >
                      <p className={`text-sm ${notif.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notif.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatearFecha(notif.fecha)}
                      </p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-purple-500 hover:bg-purple-50"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await marcarComoLeida(notif.id);
                            // Actualizar estado local
                            setNotificacionesFiltradas(prev => 
                              prev.map(n => n.id === notif.id ? {...n, leida: true} : n)
                            );
                          }}
                          title="Marcar como leída"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarNotificacion(notif.id);
                        }}
                        disabled={eliminando === notif.id}
                        title="Eliminar notificación"
                      >
                        {eliminando === notif.id ? (
                          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </>
    );
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6 flex items-center">
        <BellIcon className="h-7 w-7 text-purple-600 mr-3" />
        Centro de Notificaciones
          </h1>
          <p className="text-gray-600">
        Mantente al día con toda la actividad relacionada con tu cuenta
          </p>
        </div>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Tabs 
            defaultValue="todas" 
            value={filtro} 
            onValueChange={(v) => {
              setFiltro(v as 'todas' | 'no-leidas');
              setPaginaActual(1);
            }}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <TabsList className="bg-purple-50">
                <TabsTrigger 
                  value="todas" 
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Todas las notificaciones
                </TabsTrigger>
                <TabsTrigger 
                  value="no-leidas"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  Sin leer
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setPaginaActual(1);
                    cargarNotificacionesPaginadas();
                  }}
                  disabled={actualizando}
                  className="text-sm border-purple-200 hover:bg-purple-50"
                >
                  <RefreshCwIcon className={`h-3.5 w-3.5 mr-1.5 ${actualizando ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>

                {notificacionesFiltradas.some(n => !n.leida) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      await marcarTodasComoLeidas();
                      cargarNotificacionesPaginadas();
                    }}
                    className="text-sm border-purple-200 hover:bg-purple-50"
                  >
                    <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                    Marcar todas como leídas
                  </Button>
                )}
              </div>
            </div>

            {/* Usamos una key para cada TabsContent */}
            <TabsContent value="todas" className="space-y-6 mt-0" key="tab-todas">
              {renderContenidoNotificaciones()}
            </TabsContent>
            
            <TabsContent value="no-leidas" className="space-y-6 mt-0" key="tab-no-leidas">
              {renderContenidoNotificaciones()}
            </TabsContent>
          </Tabs>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="h-8 w-8 p-0 border-purple-200 hover:bg-purple-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-700">
              Página {paginaActual} de {totalPaginas}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="h-8 w-8 p-0 border-purple-200 hover:bg-purple-50"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}