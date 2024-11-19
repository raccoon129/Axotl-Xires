import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface Comentario {
  id_comentario: number;
  id_usuario: number;
  id_publicacion: number;
  contenido: string;
  fecha_creacion: string;
  nombre_usuario?: string;
}

interface PropiedadesSeccionComentarios {
  idPublicacion: number;
}

const SeccionComentarios = ({ idPublicacion }: PropiedadesSeccionComentarios) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const { idUsuario } = useAuth();

  const idUsuarioNumero = idUsuario ? parseInt(idUsuario) : null;

  const cargarComentarios = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}/comentarios`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) throw new Error('Error al cargar comentarios');
      const datos = await respuesta.json();
      setComentarios(datos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [idPublicacion]);

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      setEnviando(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}/comentarios`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contenido: nuevoComentario })
        }
      );

      if (!respuesta.ok) throw new Error('Error al enviar comentario');
      
      await cargarComentarios();
      setNuevoComentario('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setEnviando(false);
    }
  };

  const eliminarComentario = async (idComentario: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/comentarios/${idComentario}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) throw new Error('Error al eliminar comentario');
      
      await cargarComentarios();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Comentarios</h3>
        <MessageSquare className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4 h-48 mb-4 overflow-y-auto">
        {cargando ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : comentarios.length > 0 ? (
          comentarios.map((comentario) => (
            <div 
              key={comentario.id_comentario}
              className="bg-gray-50 rounded-lg p-3 relative group"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`}
                    alt={comentario.nombre_usuario || 'Usuario'}
                  />
                </Avatar>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900">
                      {comentario.nombre_usuario || 'Usuario'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatearFecha(comentario.fecha_creacion)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {comentario.contenido}
                  </p>
                </div>
                {idUsuarioNumero === comentario.id_usuario && (
                  <button
                    onClick={() => eliminarComentario(comentario.id_comentario)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No hay comentarios aún
          </div>
        )}
      </div>

      <div className="relative">
        <Textarea
          placeholder="Escribe un comentario..."
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          className="resize-none bg-white pr-12"
          rows={3}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={enviarComentario}
          disabled={enviando || !nuevoComentario.trim()}
          className="absolute bottom-2 right-2 p-2 hover:bg-gray-100"
        >
          <Send className={`h-4 w-4 ${enviando ? 'text-gray-400' : 'text-blue-600'}`} />
        </Button>
      </div>
    </Card>
  );
};

export { SeccionComentarios };