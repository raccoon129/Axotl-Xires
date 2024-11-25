'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface PublicacionDescarga {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  autor: string;
  fecha_publicacion: string;
  imagen_portada: string | null;
  tipo_publicacion: string;
}

export default function DescargarPublicacion() {
  const params = useParams();
  const [publicacion, setPublicacion] = useState<PublicacionDescarga | null>(null);
  const [contador, setContador] = useState(3);
  const [descargaIniciada, setDescargaIniciada] = useState(false);
  const [mostrarConfeti, setMostrarConfeti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPublicacion = async () => {
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${params.idPublicacion}`
        );

        if (!respuesta.ok) {
          throw new Error('No se pudo cargar la publicación');
        }

        const data = await respuesta.json();
        setPublicacion(data.datos);
      } catch (error) {
        setError('Error al cargar la publicación');
        console.error('Error:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPublicacion();
  }, [params.idPublicacion]);

  useEffect(() => {
    if (!cargando && publicacion && contador > 0) {
      const timer = setInterval(() => {
        setContador((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cargando, publicacion, contador]);

  useEffect(() => {
    if (contador === 0 && !descargaIniciada) {
      iniciarDescarga();
    }
  }, [contador]);

  const iniciarDescarga = async () => {
    try {
      setDescargaIniciada(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/descargas/${params.idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${publicacion?.titulo || 'publicacion'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMostrarConfeti(true);
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#612c7d', '#9f5afd', '#ffffff']
      });
    } catch (error) {
      setError('Error al descargar la publicación');
      console.error('Error:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Error al procesar la descarga
          </h1>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna izquierda - Portada */}
            <div className="md:col-span-1">
              {cargando ? (
                <Skeleton className="w-full aspect-[612/792]" />
              ) : (
                <img
                  src={publicacion?.imagen_portada ? 
                    `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}` :
                    `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                  }
                  alt={publicacion?.titulo}
                  className="w-full rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Columna derecha - Detalles y descarga */}
            <div className="md:col-span-2 space-y-6">
              {cargando ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {publicacion?.titulo}
                    </h1>
                    <p className="text-gray-600 mb-4">
                      {publicacion?.resumen}
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Autor: {publicacion?.autor}</p>
                      <p>Tipo: {publicacion?.tipo_publicacion}</p>
                      <p>Fecha: {new Date(publicacion?.fecha_publicacion || '').toLocaleDateString()}</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {contador > 0 ? (
                      <motion.div
                        key="contador"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg"
                      >
                        <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                        <span className="text-blue-600">
                          La descarga comenzará en {contador} segundos...
                        </span>
                      </motion.div>
                    ) : descargaIniciada && mostrarConfeti ? (
                      <motion.div
                        key="mensaje"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4 p-6 bg-[#612c7d]/10 rounded-lg"
                      >
                        <Sparkles className="w-8 h-8 text-[#612c7d] mx-auto" />
                        <h3 className="text-xl font-semibold text-[#612c7d]">
                          ¡Gracias por descargar!
                        </h3>
                        <h6 className="text-[#612c7d]">
                          Si este contenido te resulta útil, considera crear una publicación para que otros puedan beneficiarse del conocimiento.
                        </h6>
                        <Link
                          href="/redactar"
                          className="inline-block mt-4 px-6 py-2 bg-[#612c7d] text-white rounded-full hover:bg-[#7d3ba3] transition-colors"
                        >
                          Redactar una publicación
                        </Link>
                        <p className="text-[#612c7d]">Si la descarga no ha iniciado, refresca esta página.</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="descargando"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-lg"
                      >
                        <Download className="w-5 h-5 text-green-500 animate-spin" />
                        <span className="text-green-600">
                          Preparando tu descarga...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {mostrarConfeti
      }
    </div>
  );
} 