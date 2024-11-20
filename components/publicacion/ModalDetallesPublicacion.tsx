import { useState, useEffect } from 'react';
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
  const [cantidadFavoritos, setCantidadFavoritos] = useState(0);
  const [actualizandoFavorito, setActualizandoFavorito] = useState(false);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [contadorAnimado, setContadorAnimado] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Verificar si el usuario ya marcó como favorito
  const verificarFavorito = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${publicacion.id_publicacion}/usuario`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (respuesta.ok) {
        const { es_favorito } = await respuesta.json();
        setEsFavorito(es_favorito);
      }
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  };

  // Obtener cantidad de favoritos de forma independiente
  const obtenerCantidadFavoritos = async () => {
    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${publicacion.id_publicacion}`
      );
      
      if (respuesta.ok) {
        const { total_favoritos } = await respuesta.json();
        setCantidadFavoritos(total_favoritos);
      }
    } catch (error) {
      console.error('Error al obtener cantidad de favoritos:', error);
      // Mantener el último valor válido en caso de error
      setCantidadFavoritos(prev => prev);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const inicializarDatos = async () => {
      await Promise.all([
        verificarFavorito(),
        obtenerCantidadFavoritos()
      ]);
    };

    if (estaAbierto) {
      inicializarDatos();
    }
  }, [estaAbierto, publicacion.id_publicacion]);

  // Manejar clic en favorito
  const toggleFavorito = async () => {
    try {
      setActualizandoFavorito(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_publicacion: publicacion.id_publicacion
          })
        }
      );

      if (respuesta.ok) {
        // Actualizar estado local inmediatamente para mejor UX
        setEsFavorito(!esFavorito);
        setContadorAnimado(true);
        
        // Actualizar contador localmente para feedback inmediato
        setCantidadFavoritos(prev => esFavorito ? prev - 1 : prev + 1);
        
        // Obtener cantidad real del servidor
        await obtenerCantidadFavoritos();

        // Resetear animación después de un momento
        setTimeout(() => setContadorAnimado(false), 300);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      // Revertir cambios locales en caso de error
      await obtenerCantidadFavoritos();
      setEsFavorito(!esFavorito);
    } finally {
      setActualizandoFavorito(false);
    }
  };

  // Función para construir la URL de la portada
  const obtenerUrlPortada = (nombreImagen: string | null) => {
    if (!nombreImagen) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
    return `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${nombreImagen}`;
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
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <img
                      src={obtenerUrlPortada(publicacion.imagen_portada)}
                      alt={publicacion.titulo}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
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
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className="text-xl font-semibold text-gray-900"
                        animate={{
                          scale: contadorAnimado ? [1, 1.2, 1] : 1,
                          color: contadorAnimado ? 
                            esFavorito ? ["#1F2937", "#EAB308", "#1F2937"] : 
                            ["#1F2937", "#DC2626", "#1F2937"] : "#1F2937"
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {cantidadFavoritos}
                      </motion.span>
                      <motion.button
                        onClick={toggleFavorito}
                        className="focus:outline-none disabled:opacity-50 relative"
                        disabled={actualizandoFavorito}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          animate={esFavorito ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 15, -15, 0]
                          } : {}}
                          transition={{
                            duration: 0.4,
                            ease: "easeInOut"
                          }}
                        >
                          <Star
                            className={`h-6 w-6 transition-all duration-300 ${
                              esFavorito 
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-lg" 
                                : "text-gray-400 hover:text-yellow-400 hover:scale-110"
                            } ${actualizandoFavorito ? 'animate-pulse' : ''}`}
                          />
                        </motion.div>
                        {esFavorito && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 0] }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-yellow-400 rounded-full opacity-25"
                          />
                        )}
                      </motion.button>
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