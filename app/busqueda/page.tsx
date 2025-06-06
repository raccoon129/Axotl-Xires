'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { ResultadosBusqueda } from '@/components/busqueda/ResultadosBusqueda';

// Forzar renderizado dinámico para evitar errores de prerenderización
export const dynamic = 'force-dynamic';

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

// Componente que contiene la lógica y usa useSearchParams
function ContenidoBusqueda() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminosBuscados, setTerminosBuscados] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados para el buscador cuando no hay query
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const busquedaRef = useRef<HTMLDivElement>(null);
  const verMasRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminoBusqueda.trim()) {
      e.preventDefault();
      router.push(`/busqueda?q=${encodeURIComponent(terminoBusqueda)}`);
    }
  };

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resaltarCoincidencias = (texto: string) => {
    if (!terminosBuscados.length) return texto;
    try {
      const regex = new RegExp(`(${terminosBuscados.join('|')})`, 'gi');
      return texto.replace(regex, '<mark class="bg-transparent text-[#612c7d] font-semibold">$1</mark>');
    } catch (error) {
      return texto;
    }
  };

  // Componente SkeletonResultado - modificarlo para que coincida con la estructura y dimensiones finales
  const SkeletonResultado = () => (
    <div className="flex gap-4 bg-white p-6 rounded-lg shadow">
      <div className="flex-shrink-0">
        <div className="h-32 w-24 bg-gray-200 rounded" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );

  // Si no está montado, mostrar un estado inicial consistente
  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <div className="space-y-3 mb-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <SkeletonResultado key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Si no hay query, mostrar el buscador principal
  if (!query) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#612c7d] to-[#9f5afd] 
                         text-transparent bg-clip-text">
              Explora Nuestro Contenido
            </h1>
            <p className="text-gray-600 text-lg">
              Descubre publicaciones académicas, artículos y más...
            </p>
          </div>

          <div className="relative" ref={busquedaRef}>
            <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#612c7d] to-[#9f5afd] rounded-xl 
                            opacity-10 blur-lg transition-opacity group-hover:opacity-20" />
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#612c7d] h-6 w-6 
                                pointer-events-none opacity-70" />
                <input
                  type="text"
                  placeholder="¿Qué te gustaría encontrar?"
                  value={terminoBusqueda}
                  onChange={(e) => {
                    setTerminoBusqueda(e.target.value);
                    setMostrarResultados(e.target.value.length > 0);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => terminoBusqueda.length > 0 && setMostrarResultados(true)}
                  className="w-full pl-16 pr-6 py-5 bg-transparent text-xl placeholder:text-gray-400 
                           text-gray-900 focus:outline-none border-none"
                />
              </div>
            </div>

            <AnimatePresence>
              {mostrarResultados && terminoBusqueda.length > 0 && (
                <ResultadosBusqueda
                  busqueda={terminoBusqueda}
                  onClose={() => {
                    setMostrarResultados(false);
                    setTerminoBusqueda('');
                  }}
                  verMasRef={verMasRef}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Publicaciones</h3>
              <p className="text-gray-600 text-sm">
                Encuentra artículos científicos y académicos creados por gente como tu
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Autores</h3>
              <p className="text-gray-600 text-sm">
                Descubre investigadores o estudiantes y sus trabajos
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Categorías</h3>
              <p className="text-gray-600 text-sm">
                Explora por áreas de conocimiento
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Presiona <kbd className="font-semibold">Enter</kbd> para ver todos los resultados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay query, mostrar skeleton mientras carga
  if (query && cargando) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <div className="space-y-3 mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-48" />
        </div>
        
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <SkeletonResultado key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Modificar las animaciones para que solo se ejecuten después del montaje
  const animationProps = isMounted ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } : {};

  // Renderizado normal cuando hay query
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
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
                <div key={i} className="flex gap-4 bg-white p-6 rounded-lg shadow">
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
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {resultados.map((resultado) => (
                <motion.div
                  key={resultado.id_publicacion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >                <Link 
                    href={`/publicaciones/${resultado.id_publicacion}`}
                    className="flex gap-4 w-full"
                  >
                    <div className="h-32 w-24 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={resultado.imagen_portada ? 
                          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${resultado.id_publicacion}/portada` :
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
                        className="text-gray-600 mb-2 line-clamp-2"
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

// Componente principal exportado que envuelve el contenido en Suspense
export default function PaginaBusqueda() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">Cargando resultados...</div>}>
      <ContenidoBusqueda />
    </Suspense>
  );
}
