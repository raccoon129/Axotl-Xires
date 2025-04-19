import { useState, useEffect } from 'react';
import ModalDeslizanteDerecha from '@/components/editor/ModalDeslizanteDerecha';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Edit, FileText, MessageCircle, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Comentario {
  id_comentario: number;
  contenido: string;
  fecha_creacion: string;
  fecha_comentario_formateada: string;
  autor_comentario: string;
  id_usuario: number;
}

interface Revision {
  id_revision: number;
  aprobado: boolean | null;
  fecha_creacion: string;
  fecha_revision_formateada: string;
  detalle_revision: string;
  descripcion_revision: string;
  revisor: string;
  id_revisor: number;
  comentarios: Comentario[];
}

interface DetallesRevisionProps {
  idPublicacion: number;
  estaAbierto: boolean;
  alCerrar: () => void;
  onEditar: () => void;
}

const ModalDetallesRevision = ({ idPublicacion, estaAbierto, alCerrar, onEditar }: DetallesRevisionProps) => {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detallesRevision, setDetallesRevision] = useState<Revision | null>(null);
  const [tituloPublicacion, setTituloPublicacion] = useState('');

  useEffect(() => {
    if (estaAbierto && idPublicacion) {
      obtenerDetallesRevision();
    }
  }, [estaAbierto, idPublicacion]);

  const obtenerDetallesRevision = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No se encontró token de autenticación');
      
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/revision/publicacion/${idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const datos = await respuesta.json();
      
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al obtener detalles de la revisión');
      }
      
      // Establece el título de la publicación
      if (datos.datos.publicacion) {
        setTituloPublicacion(datos.datos.publicacion.titulo);
      }
      
      // Obtener la revisión más reciente
      if (datos.datos.revisiones && datos.datos.revisiones.length > 0) {
        // Ordenamos por fecha de creación (la más reciente primero)
        const revisionesOrdenadas = [...datos.datos.revisiones].sort(
          (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
        setDetallesRevision(revisionesOrdenadas[0]);
      } else {
        setError('No hay revisiones disponibles para esta publicación');
      }
      
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const verHistorialCompleto = () => {
    router.push(`/perfiles/mispublicaciones/revisiones/${idPublicacion}`);
  };

  // Renderizado del estado de la revisión
  const renderizarEstadoRevision = () => {
    if (detallesRevision?.aprobado === true) {
      return (
        <div className="flex items-center text-green-600 gap-1">
          <CheckCircle size={16} />
          <span>Aprobada</span>
        </div>
      );
    } else if (detallesRevision?.aprobado === false) {
      return (
        <div className="flex items-center text-red-600 gap-1">
          <X size={16} />
          <span>Rechazada</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-orange-600 gap-1">
          <Clock size={16} />
          <span>Solicita cambios</span>
        </div>
      );
    }
  };

  return (
    <ModalDeslizanteDerecha
      estaAbierto={estaAbierto}
      alCerrar={alCerrar}
      titulo="Detalles de la revisión"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Cabecera del modal */}
        <div className="mb-6">
          {tituloPublicacion && (
            <h3 className="text-lg font-medium text-gray-900 mb-2">{tituloPublicacion}</h3>
          )}
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <span className="text-gray-500">Cargando detalles de la revisión...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-50 rounded-lg p-4 mb-4 text-red-600 w-full">
              <p>{error}</p>
            </div>
            <Button onClick={alCerrar} variant="outline">Cerrar</Button>
          </div>
        ) : (
          <div className="flex flex-col overflow-y-auto h-full">
            {/* Información de la revisión */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="mb-3">{renderizarEstadoRevision()}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    Fecha: {detallesRevision?.fecha_revision_formateada || 'No disponible'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    Tipo: {detallesRevision?.detalle_revision || 'No especificado'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 md:col-span-2">
                  <MessageCircle size={16} className="text-gray-500" />
                  <span className="text-gray-700">
                    Revisor: {detallesRevision?.revisor || 'No especificado'}
                  </span>
                </div>
              </div>
              
              {detallesRevision?.descripcion_revision && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Descripción: </span> 
                    {detallesRevision.descripcion_revision}
                  </p>
                </div>
              )}
            </div>
            
            {/* Comentarios */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-3">Comentarios del revisor:</h4>
              {detallesRevision?.comentarios && detallesRevision.comentarios.length > 0 ? (
                <div className="space-y-4">
                  {detallesRevision.comentarios.map((comentario) => (
                    <div key={comentario.id_comentario} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{comentario.autor_comentario}</span>
                        <span className="text-xs text-gray-500">
                          {comentario.fecha_comentario_formateada}
                        </span>
                      </div>
                      <p className="text-gray-600">{comentario.contenido}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hay comentarios para esta revisión.</p>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="mt-auto pt-6 border-t">
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Button 
                  onClick={verHistorialCompleto}
                  variant="outline" 
                  className="flex justify-center items-center gap-2"
                >
                  <FileText size={16} />
                  Ver historial
                </Button>
                
                <Button 
                  onClick={onEditar}
                  className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit size={16} />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalDeslizanteDerecha>
  );
};

export default ModalDetallesRevision;