import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Book, FileText, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PropiedadesModal {
  estaAbierto: boolean;
  alCerrar: () => void;
  publicacion: {
    id_publicacion: number;
    titulo: string;
    resumen: string;
    autor: string;
    fecha_publicacion: string;
    imagen_portada: string | null;
    categoria: string;
    favoritos: number;
  };
}

const ModalDetallesPublicacion = ({
  estaAbierto,
  alCerrar,
  publicacion
}: PropiedadesModal) => {
  const [comentario, setComentario] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Detalles de la publicación</h2>
              <button
                onClick={alCerrar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-6">
                {/* Columna izquierda - Imagen y botones */}
                <div className="w-1/2">
                  <Card className="aspect-[612/792] relative overflow-hidden">
                    <img
                      src={publicacion.imagen_portada || `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`}
                      alt={publicacion.titulo}
                      className="w-full h-full object-cover"
                    />
                  </Card>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600"
                    >
                      <Book className="h-4 w-4" />
                      Lectura inmersiva
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-600"
                    >
                      <FileText className="h-4 w-4" />
                      Lectura simplificada
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-600"
                    >
                      <Download className="h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </div>
                </div>

                {/* Columna derecha - Información y comentarios */}
                <div className="w-1/2 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {publicacion.titulo}
                    </h1>
                    <p className="text-gray-600">
                      {publicacion.resumen}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <img src={`${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`} alt={publicacion.autor} />
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{publicacion.autor}</p>
                      <p className="text-sm text-gray-500">
                        Publicado el {formatearFecha(publicacion.fecha_publicacion)}
                      </p>
                    </div>
                  </div>

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Comentarios</h3>
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="h-48 mb-4 overflow-y-auto">
                      {cargandoComentarios ? (
                        <div className="space-y-4">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 mt-8">
                          No hay comentarios aún
                        </div>
                      )}
                    </div>

                    <Textarea
                      placeholder="Escribe un comentario..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="resize-none bg-white"
                      rows={3}
                    />
                  </Card>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500">Categoría:</span>
                      <span className="ml-2 text-gray-900">{publicacion.categoria}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-semibold text-gray-900">
                        {publicacion.favoritos}
                      </span>
                      <button
                        onClick={() => setEsFavorito(!esFavorito)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            esFavorito ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalDetallesPublicacion; 