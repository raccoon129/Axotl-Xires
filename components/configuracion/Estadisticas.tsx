'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PropiedadesEstadisticas {
  totalPublicaciones: number;
  fechaCreacion: string;
  ultimoAcceso: string | null;
  idUsuario: string | null;
  onVerActividadReciente: () => void;
}

interface EstadisticasUsuario {
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    fechaRegistro: string;
    ultimoAcceso: string | null;
  };
  publicaciones: {
    total: number;
    porEstado: {
      borrador: number;
      en_revision: number;
      publicado: number;
      rechazado: number;
      solicita_cambios: number;
    };
  };
  interacciones: {
    favoritosRecibidos: number;
    comentariosRecibidos: number;
    favoritosRealizados: number;
    comentariosRealizados: number;
    entradasBitacora: number;
  };
  revisiones: {
    total_revisiones: number;
    aprobadas: number;
    rechazadas: number;
    solicitados_cambios: number;
  } | null;
  actividadReciente: Array<{
    tipo_actividad: string;
    id_referencia: number;
    titulo: string;
    fecha: string;
    estado: string;
  }>;
  configuracion: {
    notificacionesCorreo: boolean;
  };
}

export function Estadisticas({
  totalPublicaciones,
  fechaCreacion,
  ultimoAcceso,
  idUsuario,
  onVerActividadReciente
}: PropiedadesEstadisticas) {
  const [estadisticasDetalladas, setEstadisticasDetalladas] = useState<EstadisticasUsuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las estadísticas detalladas del usuario
  const obtenerEstadisticasDetalladas = async () => {
    if (!idUsuario) return;
    
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idUsuario}/estadisticas`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!respuesta.ok) {
        const error = await respuesta.json();
        throw new Error(error.mensaje || 'Error al obtener estadísticas');
      }
      
      const datos = await respuesta.json();
      setEstadisticasDetalladas(datos.datos);
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    obtenerEstadisticasDetalladas();
  }, [idUsuario]);

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section 
      id="estadisticas" 
      className="bg-white p-6 rounded-lg shadow-lg transition-all transform hover:shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Estadísticas
        </h2>
        <Button
          onClick={onVerActividadReciente}
          className="bg-blue-600 text-white"
          disabled={cargando || !estadisticasDetalladas?.actividadReciente?.length}
        >
          {cargando ? 'Cargando...' : 'Ver actividad reciente'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
          Error al cargar estadísticas: {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700 font-semibold">
            Publicaciones: {estadisticasDetalladas?.publicaciones?.total || totalPublicaciones}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-semibold">
            Miembro desde: {formatearFecha(estadisticasDetalladas?.usuario?.fechaRegistro || fechaCreacion)}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-700 font-semibold">
            Último acceso: {formatearFecha(estadisticasDetalladas?.usuario?.ultimoAcceso || ultimoAcceso)}
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="text-amber-700 font-semibold">
            Rol: {estadisticasDetalladas?.usuario?.rol ? 
              estadisticasDetalladas.usuario.rol.charAt(0).toUpperCase() + 
              estadisticasDetalladas.usuario.rol.slice(1) : 'Usuario'}
          </p>
        </div>
      </div>
      
      {/* Estadísticas de interacciones */}
      {estadisticasDetalladas?.interacciones && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6">Interacciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-pink-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-pink-700">
                {estadisticasDetalladas.interacciones.favoritosRecibidos}
              </p>
              <p className="text-pink-600">Favoritos recibidos</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-indigo-700">
                {estadisticasDetalladas.interacciones.comentariosRecibidos}
              </p>
              <p className="text-indigo-600">Comentarios recibidos</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-teal-700">
                {estadisticasDetalladas.interacciones.entradasBitacora}
              </p>
              <p className="text-teal-600">Entradas de bitácora</p>
            </div>
          </div>
        </>
      )}
      
      {/* Estadísticas de publicaciones por estado */}
      {estadisticasDetalladas?.publicaciones?.porEstado && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6">Publicaciones por estado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-green-50 rounded-lg flex justify-between">
              <span className="text-green-700">Publicadas:</span>
              <span className="font-bold text-green-800">{estadisticasDetalladas.publicaciones.porEstado.publicado}</span>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg flex justify-between">
              <span className="text-yellow-700">En revisión:</span>
              <span className="font-bold text-yellow-800">{estadisticasDetalladas.publicaciones.porEstado.en_revision}</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg flex justify-between">
              <span className="text-blue-700">Borradores:</span>
              <span className="font-bold text-blue-800">{estadisticasDetalladas.publicaciones.porEstado.borrador}</span>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg flex justify-between">
              <span className="text-orange-700">Cambios solicitados:</span>
              <span className="font-bold text-orange-800">{estadisticasDetalladas.publicaciones.porEstado.solicita_cambios}</span>
            </div>
            <div className="p-4 bg-red-50 rounded-lg flex justify-between">
              <span className="text-red-700">Rechazadas:</span>
              <span className="font-bold text-red-800">{estadisticasDetalladas.publicaciones.porEstado.rechazado}</span>
            </div>
          </div>
        </>
      )}
      
      {/* Estadísticas de revisiones (solo para revisores) */}
      {estadisticasDetalladas?.revisiones && (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6">Actividad de revisión</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-cyan-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-cyan-700">
                {estadisticasDetalladas.revisiones.total_revisiones}
              </p>
              <p className="text-cyan-600">Revisiones totales</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {estadisticasDetalladas.revisiones.aprobadas}
              </p>
              <p className="text-emerald-600">Aprobadas</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-amber-700">
                {estadisticasDetalladas.revisiones.solicitados_cambios}
              </p>
              <p className="text-amber-600">Solicitaron cambios</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-700">
                {estadisticasDetalladas.revisiones.rechazadas}
              </p>
              <p className="text-red-600">Rechazadas</p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// Exportamos la interfaz para poder usarla en ConfiguracionContent
export type { EstadisticasUsuario };