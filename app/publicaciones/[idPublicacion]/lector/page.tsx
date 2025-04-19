'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function PaginaLector() {
  const params = useParams();
  const router = useRouter();
  const [urlLector, setUrlLector] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tituloPublicacion, setTituloPublicacion] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const obtenerTituloPublicacion = async () => {
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${params.idPublicacion}`
        );
        if (respuesta.ok) {
          const data = await respuesta.json();
          setTituloPublicacion(data.datos.titulo);
          document.title = `${data.datos.titulo} - Axotl Xires`;
        }
      } catch (error) {
        console.error('Error al obtener el título:', error);
      }
    };

    obtenerTituloPublicacion();
  }, [params.idPublicacion]);

  useEffect(() => {
    try {
      const urlLectorCompleta = `${process.env.NEXT_PUBLIC_API_URL}/api/flipbook/${params.idPublicacion}`;
      //const urlLectorCompleta = `${process.env.NEXT_PUBLIC_LECTOR_URL}/?pdfUrl=${encodeURIComponent(urlApi)}`;
      setUrlLector(urlLectorCompleta);
      
      setTimeout(() => {
        setCargando(false);
      }, 1000);
    } catch (error) {
      console.error('Error al construir la URL del lector:', error);
      setError('No se pudo cargar el lector');
      setCargando(false);
    }
  }, [params.idPublicacion]);

  const salirDelLector = () => {
    router.push(`/publicaciones/${params.idPublicacion}`);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            Error al cargar el lector
          </h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <Skeleton className="w-full h-screen" />
      </div>
    );
  }

  return (
    <>
      {/* Canvas base que cubre toda la pantalla */}
      <div className="fixed inset-0 z-40 bg-black">
        <iframe
          src={urlLector}
          className="w-full h-screen border-0"
          allow="fullscreen"
          title="Lector inmersivo"
          onLoad={() => {
            setTimeout(() => {
              setIframeLoaded(true);
            }, 500);
          }}
        />
      </div>

      {/* Barra de control mejorada y siempre visible */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Gradiente superior para mejor legibilidad */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        
        {/* Contenido de la barra de control */}
        <div className="relative">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={salirDelLector}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors group"
                >
                  <X className="h-6 w-6 text-white opacity-75 group-hover:opacity-100" />
                </button>
                <div className="flex flex-col">
                  <span className="text-white/50 text-sm">Leyendo</span>
                  <h2 className="text-white font-medium text-lg line-clamp-1">
                    {tituloPublicacion}
                  </h2>
                </div>
              </div>
              
              {/* Aquí podrías añadir más controles si los necesitas */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(urlLector, '_blank')}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
                >
                  Abrir en nueva pestaña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas de carga */}
      <AnimatePresence>
        {!iframeLoaded && (
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              duration: 0.5,
              ease: "easeInOut"
            }}
            className="fixed inset-0 bg-white z-[60] flex items-center justify-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#612c7d] text-3xl font-semibold"
            >
              Lo estamos preparando
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Div vacío para mantener el layout original debajo */}
      <div className="min-h-screen" />
    </>
  );
}


