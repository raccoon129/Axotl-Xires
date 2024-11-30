'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface ResultadoBusqueda {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  imagen_portada: string | null;
  fecha_publicacion: string;
  autor: string;
  autor_foto: string | null;
  categoria: string;
  coincidencia_en: string;
}

export default function PaginaBusqueda() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminosBuscados, setTerminosBuscados] = useState<string[]>([]);

  useEffect(() => {
    document.title = `Búsqueda: ${query} - Axotl Xires`;
  }, [query]);

  useEffect(() => {
    const buscarPublicaciones = async () => {
      if (!query) {
        setResultados([]);
        return;
      }

      setCargando(true);
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/busqueda/buscar?q=${encodeURIComponent(query)}`
        );
        
        if (respuesta.ok) {
          const data = await respuesta.json();
          setResultados(data.datos || []);
          setTerminosBuscados(data.terminos_buscados || []);
        }
      } catch (error) {
        console.error('Error en la búsqueda:', error);
      } finally {
        setCargando(false);
      }
    };

    buscarPublicaciones();
  }, [query]);

  const resaltarCoincidencias = (texto: string) => {
    if (!terminosBuscados.length) return texto;
    try {
      const regex = new RegExp(`(${terminosBuscados.join('|')})`, 'gi');
      return texto.replace(regex, '<mark class="bg-transparent text-[#612c7d] font-semibold">$1</mark>');
    } catch (error) {
      return texto;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        Resultados de búsqueda para "{query}"
      </h1>
      <p className="text-gray-600 mb-8">
        Se encontraron {resultados.length} resultados
      </p>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {cargando ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 bg-white p-4 rounded-lg shadow">
                  <Skeleton className="h-32 w-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {resultados.map((resultado) => (
                <motion.div
                  key={resultado.id_publicacion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Link 
                    href={`/publicaciones/${resultado.id_publicacion}`}
                    className="flex gap-4 w-full"
                  >
                    <div className="h-32 w-24 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={resultado.imagen_portada ? 
                          `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${resultado.imagen_portada}` :
                          `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                        }
                        alt={resultado.titulo}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 
                        className="text-xl font-semibold mb-2"
                        dangerouslySetInnerHTML={{ 
                          __html: resaltarCoincidencias(resultado.titulo)
                        }}
                      />
                      <p 
                        className="text-gray-600 mb-2"
                        dangerouslySetInnerHTML={{ 
                          __html: resaltarCoincidencias(resultado.resumen)
                        }}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{resultado.categoria}</span>
                        <span>•</span>
                        <span>{resultado.autor}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
