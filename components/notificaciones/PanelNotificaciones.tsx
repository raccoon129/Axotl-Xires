import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BellIcon, CheckIcon, MailOpenIcon } from 'lucide-react';
import { Notificacion } from '@/hooks/useNotificaciones';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PanelNotificacionesProps {
  notificaciones: Notificacion[];
  cargando: boolean;
  error: string | null;
  onMarcarLeida: (id: number) => Promise<void>;
  onMarcarTodasLeidas: () => Promise<void>;
  onCerrar: () => void;
}

export const PanelNotificaciones: React.FC<PanelNotificacionesProps> = ({
  notificaciones,
  cargando,
  error,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onCerrar
}) => {
  const router = useRouter();
  const [animacionSalida, setAnimacionSalida] = useState(false);

  // Función para formatear fechas relativas (ej: "hace 5 minutos")
  const formatearFechaRelativa = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        return 'Fecha desconocida';
      }
      const ahora = new Date();
      const diferenciaMilisegundos = ahora.getTime() - fecha.getTime();
      const diferenciaMinutos = Math.floor(diferenciaMilisegundos / (1000 * 60));
      const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
      const diferenciaDias = Math.floor(diferenciaHoras / 24);

      // Mostrar tiempo relativo para fechas recientes
      if (diferenciaDias < 1) {
        if (diferenciaMinutos < 1) return 'Ahora mismo';
        if (diferenciaMinutos === 1) return 'Hace 1 minuto';
        if (diferenciaMinutos < 60) return `Hace ${diferenciaMinutos} minutos`;
        if (diferenciaHoras === 1) return 'Hace 1 hora';
        return `Hace ${diferenciaHoras} horas`;
      } else if (diferenciaDias === 1) {
        return 'Ayer';
      } else if (diferenciaDias < 7) {
        return `Hace ${diferenciaDias} días`;
      } else {
        // Para fechas más antiguas, usar formato completo
        return format(fecha, 'dd MMM yyyy', { locale: es });
      }
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha desconocida';
    }
  };

  // Función para obtener el ícono según el tipo de notificación
  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>;
    case 'favorito':
      return <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
      case 'seguimiento':
        return <svg className="w-5 h-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
      case 'sistema':
      default:
        return <svg className="w-5 h-5 text-purple-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
    }
  };

  // Manejar clic en una notificación
  const manejarClicNotificacion = async (notificacion: Notificacion) => {
    // Si no ha sido leída, marcarla como leída
    if (!notificacion.leida) {
      await onMarcarLeida(notificacion.id);
    }
    
    // Si tiene enlace, navegar a él
    if (notificacion.enlace) {
      setAnimacionSalida(true);
      // Pequeño retraso para la animación
      setTimeout(() => {
        router.push(notificacion.enlace || '/');
        onCerrar();
      }, 200);
    }
  };

  // Contenido del panel según el estado
  const renderContenido = () => {
    if (cargando) {
      // Mostrar esqueletos durante la carga
      return (
        <div className="space-y-4 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      // Mostrar mensaje de error
      return (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-sm"
          >
            Reintentar
          </Button>
        </div>
      );
    }

    if (notificaciones.length === 0) {
      // Mostrar mensaje cuando no hay notificaciones
      return (
        <div className="p-4 text-center">
          <MailOpenIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No tienes notificaciones</p>
        </div>
      );
    }

    // Limitar a solo 4 notificaciones más recientes
    const notificacionesRecientes = notificaciones.slice(0, 4);
    const notificacionesRestantes = notificaciones.length - 4;

    // Mostrar lista de notificaciones
    return (
      <div className="max-h-[60vh] overflow-y-auto">
        {notificacionesRecientes.map((notificacion) => (
          <div 
            key={notificacion.id}
            onClick={() => manejarClicNotificacion(notificacion)}
            className={`
              p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer
              ${notificacion.leida ? 'bg-white' : 'bg-blue-50'}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {obtenerIcono(notificacion.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notificacion.leida ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {notificacion.mensaje}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatearFechaRelativa(notificacion.fecha)}
                </p>
              </div>
              {!notificacion.leida && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
          </div>
        ))}
        
        {/* Mostrar mensaje si hay más notificaciones */}
        {notificacionesRestantes > 0 && (
          <div className="p-2 text-center bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              Y {notificacionesRestantes} notificación{notificacionesRestantes !== 1 ? 'es' : ''} más
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: animacionSalida ? 0 : 1, y: animacionSalida ? -10 : 0, scale: animacionSalida ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">
          Notificaciones
          {notificaciones.length > 0 && (
        <span className="block text-xs text-gray-500">
          {notificaciones.filter(n => !n.leida).length} sin leer
        </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          {notificaciones.some(n => !n.leida) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onMarcarTodasLeidas();
          }}
          className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900"
        >
          <CheckIcon className="h-3.5 w-3.5 mr-1" />
          Marcar todas como leídas
        </Button>
          )}
        </div>
      </div>
      
      {renderContenido()}
      
      {notificaciones.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            onClick={() => {
              router.push('/perfiles/notificaciones');
              onCerrar();
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      )}
    </motion.div>
  );
};