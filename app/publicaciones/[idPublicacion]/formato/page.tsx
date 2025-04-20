'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';

export default function PaginaFormatoHTML() {
  const params = useParams();
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tituloPublicacion, setTituloPublicacion] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const idPublicacion = params.idPublicacion;

  useEffect(() => {
    const obtenerTituloPublicacion = async () => {
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}`
        );
        if (respuesta.ok) {
          const data = await respuesta.json();
          setTituloPublicacion(data.datos.titulo);
          document.title = `${data.datos.titulo} - Formato HTML - Axotl Xires`;
        }
      } catch (error) {
        console.error('Error al obtener el título:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerTituloPublicacion();
  }, [idPublicacion]);

  const volverAtras = () => {
    router.push(`/publicaciones/${idPublicacion}`);
  };

  if (cargando) {
    return (
      <div className="min-h-screen p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-[calc(100vh-120px)] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Error al cargar el formato HTML
          </h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={volverAtras}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={volverAtras}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="font-medium text-lg truncate">{tituloPublicacion}</h1>
            </div>
            <div className="text-sm text-gray-500">
              Visualización en HTML
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: iframeLoaded ? 1 : 0 }}
            className="relative"
          >
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-[600px]" />
              </div>
            )}
            <iframe 
              src={`${process.env.NEXT_PUBLIC_API_URL}/api/visualizar/${idPublicacion}`}
              className="w-full min-h-[1900px] border-0"
              onLoad={() => setIframeLoaded(true)}
              title={`${tituloPublicacion} - Formato HTML`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}