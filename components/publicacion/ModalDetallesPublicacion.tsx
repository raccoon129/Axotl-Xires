'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Book, FileText, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SeccionComentarios } from './SeccionComentarios';
import { useRouter } from 'next/navigation';
import Tooltip from "@/components/global/Tooltip";

interface PropiedadesModal {
  estaAbierto: boolean;
  alCerrar: () => void;
  publicacion: {
    id_publicacion: number;
    titulo: string;
    resumen: string;
    autor: string;
    autor_foto?: string | null;  // Añadimos esta propiedad
    fecha_publicacion: string;
    imagen_portada: string | null;
    categoria: string;
    favoritos: number;
    id_usuario: number;  // Añadir esta propiedad
  };
}

interface Categoria {
  id_tipo: number;
  categoria: string;
  descripcion: string;
}

interface CategoriaProps {
  idPublicacion: number;
}

export const CategoriaPublicacion = ({ idPublicacion }: CategoriaProps) => {
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerCategoria = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}/categoria`
        );

        if (!response.ok) {
          throw new Error('Error al obtener la categoría');
        }

        const data = await response.json();
        setCategoria(data.datos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar la categoría:', err);
      } finally {
        setIsLoading(false);
      }
    };

    obtenerCategoria();
  }, [idPublicacion]);

  if (isLoading) {
    return <span className="animate-pulse bg-gray-200 rounded h-5 w-24 inline-block" />;
  }

  if (error || !categoria) {
    return <span className="text-gray-500">Categoría no disponible</span>;
  }

  return (
    <Tooltip message={categoria.descripcion}>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-help">
        {categoria.categoria}
      </span>
    </Tooltip>
  );
};

// Actualizamos la interfaz para tener toda la información del perfil
interface PerfilAutor {
  id_usuario: number;
  nombre: string;
  nombramiento: string;
  fecha_creacion: string;
  ultimo_acceso: string;
  foto_perfil: string;
  total_publicaciones: number;
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
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  // Estado para almacenar toda la información del perfil del autor
  const [perfilAutor, setPerfilAutor] = useState<PerfilAutor | null>(null);
  const [autorId, setAutorId] = useState<number | null>(null);

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

  // Efecto para controlar el scroll
  useEffect(() => {
    if (estaAbierto) {
      // Deshabilitar scroll
      document.body.style.overflow = 'hidden';
      // Opcional: Añadir padding para compensar la scrollbar
      document.body.style.paddingRight = 'var(--scrollbar-width)';
    }

    return () => {
      // Rehabilitar scroll al desmontar
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    };
  }, [estaAbierto]);

  /**
   * Efecto para obtener y gestionar la foto de perfil del autor
   * Proceso:
   * 1. Cuando se abre el modal y tenemos un id_usuario válido
   * 2. Hacemos una petición a /api/usuarios/{id_usuario}
   * 3. De la respuesta extraemos el nombre del archivo de la foto (foto_perfil)
   * 4. Este nombre de archivo se usará para construir la URL completa de la imagen
   */
  useEffect(() => {
    const obtenerPerfilAutor = async () => {
      try {
        // 1. Llamada a la API para obtener los datos del perfil
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/detalles/${publicacion.id_usuario}`
        );
        
        if (respuesta.ok) {
          // 2. Extraemos los datos de la respuesta
          const { datos } = await respuesta.json();
          // 3. Actualizamos el estado con todos los datos del perfil
          setPerfilAutor(datos);
          console.log("Datos del perfil del autor:", datos); // Para depuración
        }
      } catch (error) {
        console.error('Error al obtener perfil del autor:', error);
      }
    };

    if (publicacion.id_usuario) {
      obtenerPerfilAutor();
    }
  }, [publicacion.id_usuario]);

  useEffect(() => {
    const obtenerAutorPublicacion = async () => {
      try {
        // Primero obtenemos el ID del autor
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${publicacion.id_publicacion}/usuarioPertenece`
        );
        
        if (respuesta.ok) {
          const { datos } = await respuesta.json();
          setAutorId(datos.id_usuario);

          // Luego obtenemos los detalles del autor
          const respuestaDetalles = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/detalles/${datos.id_usuario}`
          );

          if (respuestaDetalles.ok) {
            const { datos: datosAutor } = await respuestaDetalles.json();
            setPerfilAutor(datosAutor);
          }
        }
      } catch (error) {
        console.error('Error al obtener autor:', error);
      }
    };

    if (publicacion.id_publicacion) {
      obtenerAutorPublicacion();
    }
  }, [publicacion.id_publicacion]);

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

  const irALectorInmersivo = () => {
    router.push(`/publicaciones/${publicacion.id_publicacion}/lector`);
    alCerrar(); // Cerramos el modal después de la redirección
  };

  const irALecturaSimplificada = () => {
    router.push(`/publicaciones/${publicacion.id_publicacion}`);
    alCerrar(); // Cerramos el modal después de la redirección
  };

  const irADescarga = () => {
    router.push(`/publicaciones/${publicacion.id_publicacion}/descargar`);
    alCerrar(); // Cerramos el modal después de la redirección
  };

  // Agregar después de los otros useEffect, antes del return
  useEffect(() => {
    const handleEscapeKey = async (event: KeyboardEvent) => {
      if (event.key === 'Escape' && estaAbierto) {
        setIsClosing(true);
        // Esperar a que termine la animación antes de cerrar
        await new Promise(resolve => setTimeout(resolve, 200));
        alCerrar();
      }
    };

    if (estaAbierto) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [estaAbierto, alCerrar]);

  return (
    <AnimatePresence mode="wait">
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: isClosing ? 0.9 : 1, 
              opacity: isClosing ? 0 : 1, 
              y: isClosing ? 20 : 0,
              transition: { 
                type: "spring", 
                duration: isClosing ? 0.2 : 0.5, 
                bounce: isClosing ? 0 : 0.3 
              }
            }}
            exit={{ 
              scale: 0.9, 
              opacity: 0,
              y: 20,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                Detalles de la publicación
              </h2>
              <button
                onClick={alCerrar}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <motion.div 
              className="p-4 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Columna izquierda - Imagen */}
                <div className="w-full lg:w-1/2">
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

                {/* Columna derecha - Información */}
                <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
                  {/* Título y resumen */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                      {publicacion.titulo}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                      {publicacion.resumen}
                    </p>
                  </div>

                  {/* Información del autor */}
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      {/* 
                        Construcción de la URL de la imagen:
                        1. Verificamos si tenemos perfilAutor y si tiene foto_perfil
                        2. Si existe, usamos ese nombre de archivo en la URL
                        3. Si no existe, usamos 'null' para obtener la imagen por defecto
                        4. En caso de error al cargar la imagen, mostramos la imagen por defecto
                      */}
                      <img 
                        src={autorId ? 
                          `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/detalles/${autorId}/foto` :
                          `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`
                        }
                        alt={publicacion.autor}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`;
                        }}
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {perfilAutor?.nombre || publicacion.autor}
                      </p>
                      {perfilAutor?.nombramiento && (
                        <p className="text-xs text-gray-500">{perfilAutor.nombramiento}</p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500">
                        Publicado el {formatearFecha(publicacion.fecha_publicacion)}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <Button 
                      variant="outline"
                      onClick={irALectorInmersivo}
                      className="flex flex-row sm:flex-col items-center justify-center gap-2 py-2 sm:py-4 bg-white hover:bg-blue-50 text-blue-600 h-auto"
                    >
                      <Book className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Lectura inmersiva</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={irALecturaSimplificada}
                      className="flex flex-row sm:flex-col items-center justify-center gap-2 py-2 sm:py-4 bg-white hover:bg-orange-50 text-orange-600 h-auto"
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Lectura simplificada</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={irADescarga}
                      className="flex flex-row sm:flex-col items-center justify-center gap-2 py-2 sm:py-4 bg-white hover:bg-green-50 text-green-600 h-auto"
                    >
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">Descargar PDF</span>
                    </Button>
                  </div>

                  {/* Sección de comentarios */}
                  <SeccionComentarios idPublicacion={publicacion.id_publicacion} />

                  {/* Categoría y favoritos */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">Categoría:</span>
                      <CategoriaPublicacion idPublicacion={publicacion.id_publicacion} />
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.span 
                        className="text-lg sm:text-xl font-semibold text-gray-900"
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