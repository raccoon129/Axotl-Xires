import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Trash2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comentario {
  id_comentario: number;
  id_usuario: number;
  contenido: string;
  fecha_creacion: string;
  autor: string;
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
  const [comentarioAEliminar, setComentarioAEliminar] = useState<number | null>(null);

  const idUsuarioNumero = idUsuario ? parseInt(idUsuario) : null;

  const cargarComentarios = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/publicacion/${idPublicacion}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/comentarios`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_publicacion: idPublicacion,
            contenido: nuevoComentario
          })
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

  const confirmarEliminacion = (idComentario: number) => {
    setComentarioAEliminar(idComentario);
  };

  const eliminarComentario = async () => {
    if (!comentarioAEliminar) return;

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/${comentarioAEliminar}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al eliminar comentario');
      }
      
      setComentarios(prevComentarios => 
        prevComentarios.filter(comentario => comentario.id_comentario !== comentarioAEliminar)
      );
    } catch (error) {
      console.error('Error:', error);
      await cargarComentarios();
    } finally {
      setComentarioAEliminar(null);
    }
  };

  const manejarErrorCarga = async () => {
    try {
      await cargarComentarios();
    } catch (error) {
      console.error('Error al recargar comentarios:', error);
    }
  };

  useEffect(() => {
    const intervalo = setInterval(manejarErrorCarga, 30000);

    return () => clearInterval(intervalo);
  }, [idPublicacion]);

  useEffect(() => {
    window.addEventListener('online', manejarErrorCarga);
    
    return () => {
      window.removeEventListener('online', manejarErrorCarga);
    };
  }, []);

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
    <>
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
                className={`bg-gray-50 rounded-lg p-3 relative group 
                  ${comentarioAEliminar === comentario.id_comentario ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`}
                      alt={comentario.autor}
                    />
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/perfiles/${comentario.id_usuario}`}
                        className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {comentario.autor}
                      </Link>
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
                      onClick={() => confirmarEliminacion(comentario.id_comentario)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1 hover:bg-gray-200 rounded-full"
                      disabled={comentarioAEliminar === comentario.id_comentario}
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

      <AlertDialog 
        open={!!comentarioAEliminar} 
        onOpenChange={(open) => !open && setComentarioAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarComentario}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { SeccionComentarios };