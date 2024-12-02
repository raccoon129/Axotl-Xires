'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Star, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { SeccionComentarios } from '@/components/publicacion/SeccionComentarios';
import { useAuth } from '@/hooks/useAuth';
import SEOMetadata from '@/components/global/SEOMetadata';

interface Publicacion {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  contenido: string;
  referencias: string;
  fecha_publicacion: string;
  imagen_portada: string | null;
  id_tipo: number;
  id_usuario: number;
  autor: string;
  autor_foto: string | null;
  tipo_publicacion: string;
  total_favoritos: number;
  total_comentarios: number;
  estado: string;
  es_privada: number;
}

const EsqueletoLectura = () => (
  <div className="min-h-screen">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 max-w-screen-2xl mx-auto px-4 py-4 lg:py-8">
      {/* Skeleton columna izquierda - Solo visible en desktop */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-[612/792]">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton columna central */}
      <div className="lg:col-span-7">
        {/* Portada móvil */}
        <div className="lg:hidden aspect-[16/9] relative overflow-hidden rounded-t-lg">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Info autor versión móvil */}
          <div className="p-4 border-b lg:hidden">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>

          {/* Título y resumen */}
          <div className="p-4 lg:p-8 border-b">
            <Skeleton className="h-8 lg:h-10 w-3/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4 lg:p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton columna derecha */}
      <div className="col-span-2">
        <div className="sticky top-24">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <Skeleton className="h-6 w-24 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PanelComentarios = ({ 
  mostrar, 
  onClose,
  idPublicacion 
}: { 
  mostrar: boolean; 
  onClose: () => void;
  idPublicacion: number;
}) => {
  if (!mostrar) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-[220px] left-0 right-0"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl mx-auto"
          style={{ 
            maxHeight: '500px',
            maxWidth: '100%',
            width: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold">Comentarios</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(500px - 57px)' }}>
            <SeccionComentarios idPublicacion={idPublicacion} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function PublicacionPage() {
  const params = useParams();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cantidadFavoritos, setCantidadFavoritos] = useState(0);
  const [actualizandoFavorito, setActualizandoFavorito] = useState(false);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [contadorAnimado, setContadorAnimado] = useState(false);
  const { idUsuario } = useAuth();
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPublicacion = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${params.idPublicacion}`
        );

        if (!respuesta.ok) {
          throw new Error('No se pudo cargar la publicación');
        }

        const data = await respuesta.json();
        const publicacionData = data.datos;

        // Verificar si la publicación es privada y el usuario tiene acceso
        if (publicacionData.es_privada === 1) {
          if (!idUsuario) {
            setAccesoPermitido(false);
            setMensajeError("Esta publicación es privada");
            return;
          }

          if (publicacionData.id_usuario !== parseInt(idUsuario)) {
            setAccesoPermitido(false);
            setMensajeError("No tienes permiso para ver esta publicación");
            return;
          }
        }

        setAccesoPermitido(true);
        setPublicacion(publicacionData);
      } catch (error) {
        setError('Error al cargar la publicación');
        console.error('Error:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPublicacion();
  }, [params.idPublicacion, idUsuario]);

  useEffect(() => {
    if (publicacion?.titulo) {
      document.title = `${publicacion.titulo} - Publicación en Axotl Xires`;
    } else {
      document.title = "Publicación no encontrada - Axotl Xires";
    }
  }, [publicacion?.titulo]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Verificar si el usuario ya marcó como favorito
  const verificarFavorito = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${params.idPublicacion}/usuario`,
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

  // Obtener cantidad de favoritos
  const obtenerCantidadFavoritos = async () => {
    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${params.idPublicacion}`
      );
      
      if (respuesta.ok) {
        const { total_favoritos } = await respuesta.json();
        setCantidadFavoritos(total_favoritos);
      }
    } catch (error) {
      console.error('Error al obtener cantidad de favoritos:', error);
    }
  };

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
            id_publicacion: params.idPublicacion
          })
        }
      );

      if (respuesta.ok) {
        setEsFavorito(!esFavorito);
        setContadorAnimado(true);
        setCantidadFavoritos(prev => esFavorito ? prev - 1 : prev + 1);
        await obtenerCantidadFavoritos();
        setTimeout(() => setContadorAnimado(false), 300);
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      await obtenerCantidadFavoritos();
      setEsFavorito(!esFavorito);
    } finally {
      setActualizandoFavorito(false);
    }
  };

  useEffect(() => {
    if (publicacion) {
      verificarFavorito();
      obtenerCantidadFavoritos();
    }
  }, [publicacion]);

  if (cargando) {
    return <EsqueletoLectura />;
  }

  if (!accesoPermitido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        >
          <div className="text-red-600 mb-4">
            <svg 
              className="mx-auto h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-6">
            {mensajeError || "No tienes permiso para acceder a esta publicación"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !publicacion) {
    useEffect(() => {
      document.title = "Publicación no encontrada - Axotl Xires";
    }, []);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No se pudo cargar la publicación
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {publicacion && (
        <SEOMetadata 
          titulo={publicacion.titulo}
          descripcion={publicacion.resumen}
          imagen={publicacion.imagen_portada ? 
            `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}` : 
            undefined
          }
          autor={publicacion.autor}
          fechaPublicacion={publicacion.fecha_publicacion}
          tipoPublicacion={publicacion.tipo_publicacion}
          url={`/publicaciones/${publicacion.id_publicacion}`}
        />
      )}
      
      <div className="min-h-screen">
        {/* Contenedor principal con grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-2xl mx-auto px-4 py-8">
          {/* Columna izquierda - Portada y detalles */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <motion.div 
              className="lg:sticky lg:top-24 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Mensaje de publicación privada */}
              {publicacion?.es_privada === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <div className="bg-purple-100 rounded-full p-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium">Publicación Privada</p>
                    <p className="text-purple-600 text-sm">Solo tú puedes ver esta publicación</p>
                  </div>
                </motion.div>
              )}

              {/* Portada */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-[612/792]">
                  <img
                    src={publicacion?.imagen_portada ? 
                      `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}` :
                      `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                    }
                    alt={publicacion?.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Detalles del autor */}
              <div className="bg-white rounded-lg shadow-lg p-6 relative">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${publicacion?.autor_foto || 'null'}`}
                      alt={publicacion?.autor}
                    />
                  </Avatar>
                  <div>
                    <Link 
                      href={`/perfiles/${publicacion?.id_usuario}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {publicacion?.autor}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {publicacion?.tipo_publicacion}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatearFecha(publicacion?.fecha_publicacion || '')}
                  </div>
                  <motion.button
                    onClick={toggleFavorito}
                    disabled={actualizandoFavorito}
                    className="flex items-center gap-2 w-full hover:bg-gray-50 p-1 rounded transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={esFavorito ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 15, -15, 0]
                      } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Star className={`h-4 w-4 ${
                        esFavorito ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                      }`} />
                    </motion.div>
                    <motion.span
                      animate={{
                        scale: contadorAnimado ? [1, 1.2, 1] : 1,
                        color: contadorAnimado ? 
                          esFavorito ? ["#1F2937", "#EAB308", "#1F2937"] : 
                          ["#1F2937", "#DC2626", "#1F2937"] : "#1F2937"
                      }}
                    >
                      {cantidadFavoritos} favoritos
                    </motion.span>
                  </motion.button>
                  <button
                    onClick={() => setMostrarComentarios(true)}
                    className="flex items-center gap-2 w-full hover:bg-gray-50 p-1 rounded transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    {publicacion?.total_comentarios} comentarios
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Columna central - Contenido principal */}
          <motion.article 
            className="lg:col-span-7 bg-white shadow-lg rounded-lg overflow-hidden order-1 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Portada móvil */}
            <div className="lg:hidden aspect-[16/9] relative overflow-hidden">
              <img
                src={publicacion?.imagen_portada ? 
                  `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}` :
                  `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                }
                alt={publicacion?.titulo}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Título y resumen */}
            <header className="p-4 lg:p-8 border-b">
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 font-crimson">
                {publicacion?.titulo}
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 font-crimson leading-relaxed">
                {publicacion?.resumen}
              </p>
            </header>

            {/* Contenido */}
            <div className="p-4 lg:p-8">
              <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');
                
                .contenido-publicacion {
                  font-family: 'Crimson Text', serif;
                  font-size: 1.125rem;
                  line-height: 1.8;
                  color: #1a1a1a;
                }

                .contenido-publicacion h1,
                .contenido-publicacion h2,
                .contenido-publicacion h3 {
                  font-weight: 700;
                  color: #111827;
                  margin: 1.5em 0 0.5em;
                }

                .contenido-publicacion h1 { font-size: 2em; }
                .contenido-publicacion h2 { font-size: 1.75em; }
                .contenido-publicacion h3 { font-size: 1.5em; }

                .contenido-publicacion p { margin: 1em 0; }

                .contenido-publicacion img {
                  max-width: 100%;
                  height: auto;
                  margin: 2em auto;
                  border-radius: 0.5rem;
                }

                .contenido-publicacion a {
                  color: #2563eb;
                  text-decoration: underline;
                }

                .contenido-publicacion blockquote {
                  border-left: 4px solid #e5e7eb;
                  padding-left: 1em;
                  margin: 1.5em 0;
                  font-style: italic;
                  color: #4b5563;
                }
              `}</style>
              <div 
                className="contenido-publicacion"
                dangerouslySetInnerHTML={{ __html: publicacion?.contenido || '' }}
              />
            </div>

            {/* Referencias */}
            {publicacion?.referencias && (
              <footer className="p-4 lg:p-8 bg-gray-50 border-t">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-4 font-crimson">
                  Fuentes de consulta
                </h2>
                <div className="prose max-w-none font-crimson">
                  <pre className="whitespace-pre-wrap text-base lg:text-lg text-gray-600">
                    {publicacion.referencias}
                  </pre>
                </div>
              </footer>
            )}
          </motion.article>

          {/* Columna derecha - Navegación y acciones */}
          <div className="lg:col-span-2 order-3">
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-white lg:bg-transparent lg:static lg:sticky lg:top-24 shadow-inner lg:shadow-none p-4 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-around lg:flex-col lg:space-y-4">
                <button className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm">
                  <BookOpen className="h-5 w-5" />
                  <span className="hidden lg:inline">Modo lectura</span>
                </button>
                {/* Otros botones de acción */}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Panel de comentarios responsivo */}
        <AnimatePresence>
          {mostrarComentarios && (
            <PanelComentarios
              mostrar={mostrarComentarios}
              onClose={() => setMostrarComentarios(false)}
              idPublicacion={Number(params.idPublicacion)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}