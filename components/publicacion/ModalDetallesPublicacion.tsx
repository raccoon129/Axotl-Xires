import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Book, FileText, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SeccionComentarios } from './SeccionComentarios';

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      alCerrar();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                duration: 0.5,
                bounce: 0.3
              }
            }}
            exit={{ 
              scale: 1.2, 
              opacity: 0,
              y: -20,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
              <motion.h2 
                className="text-xl font-semibold text-gray-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Detalles de la publicación
              </motion.h2>
              <motion.button
                onClick={alCerrar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            <motion.div 
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex gap-6">
                {/* Columna izquierda - Imagen */}
                <div className="w-1/2">
                  <Card className="aspect-[612/792] relative overflow-hidden">
                    <img
                      src={publicacion.imagen_portada || `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`}
                      alt={publicacion.titulo}
                      className="w-full h-full object-cover"
                    />
                  </Card>
                </div>

                {/* Columna derecha - Información, botones y comentarios */}
                <div className="w-1/2 space-y-6">
                  {/* Título y resumen */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {publicacion.titulo}
                    </h1>
                    <p className="text-gray-600">
                      {publicacion.resumen}
                    </p>
                  </div>

                  {/* Información del autor */}
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

                  {/* Botones de acción */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline"
                      className="flex flex-col items-center gap-2 py-4 bg-white hover:bg-blue-50 text-blue-600 h-auto"
                    >
                      <Book className="h-5 w-5" />
                      <span className="text-sm font-medium">Lectura inmersiva</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex flex-col items-center gap-2 py-4 bg-white hover:bg-orange-50 text-orange-600 h-auto"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-medium">Lectura simplificada</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex flex-col items-center gap-2 py-4 bg-white hover:bg-green-50 text-green-600 h-auto"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-sm font-medium">Descargar PDF</span>
                    </Button>
                  </div>

                  {/* Sección de comentarios */}
                  <SeccionComentarios idPublicacion={publicacion.id_publicacion} />

                  {/* Categoría y favoritos */}
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
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalDetallesPublicacion; 