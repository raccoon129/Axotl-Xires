'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface ResultadoBusqueda {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  imagen_portada: string | null;
  coincidencia_en: string;
}

interface RespuestaBusqueda {
  datos: ResultadoBusqueda[];
  termino_busqueda: string;
}

interface ResultadosBusquedaProps {
  busqueda: string;
  onClose: () => void;
  verMasRef: React.RefObject<HTMLButtonElement>;
}

export const ResultadosBusqueda = ({ busqueda, onClose, verMasRef }: ResultadosBusquedaProps) => {
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [primeraConsulta, setPrimeraConsulta] = useState(true);
  const router = useRouter();

  // Función mejorada para resaltar coincidencias
  const resaltarCoincidencias = (texto: string) => {
    if (!terminoBusqueda) return texto;
    try {
      const regex = new RegExp(`(${terminoBusqueda})`, 'gi');
      return texto.replace(regex, '<mark class="bg-transparent text-[#612c7d] font-black">$1</mark>');
    } catch (error) {
      console.error('Error al resaltar coincidencias:', error);
      return texto;
    }
  };

  // Nueva función para extraer fragmento relevante del resumen
  const obtenerFragmentoRelevante = (resumen: string): string => {
    if (!terminoBusqueda) {
      // Si no hay término de búsqueda, devolver las primeras 15 palabras
      return resumen.split(' ').slice(0, 15).join(' ') + '...';
    }

    const regex = new RegExp(terminoBusqueda, 'gi');
    const match = regex.exec(resumen);

    if (!match) {
      // Si no hay coincidencia, devolver las primeras 15 palabras
      return resumen.split(' ').slice(0, 15).join(' ') + '...';
    }

    // Obtener un fragmento alrededor de la coincidencia
    const inicio = Math.max(0, match.index - 30);
    const fin = Math.min(resumen.length, match.index + terminoBusqueda.length + 30);
    let fragmento = resumen.slice(inicio, fin);

    // Ajustar el fragmento para no cortar palabras
    if (inicio > 0) {
      fragmento = '...' + fragmento.slice(fragmento.indexOf(' ') + 1);
    }
    if (fin < resumen.length) {
      fragmento = fragmento.slice(0, fragmento.lastIndexOf(' ')) + '...';
    }

    return fragmento;
  };

  useEffect(() => {
    const buscarPublicaciones = async () => {
      if (!busqueda) {
        setResultados([]);
        setTerminoBusqueda('');
        return;
      }

      setCargando(true);
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/busqueda/buscar?q=${encodeURIComponent(busqueda)}`
        );
        
        if (respuesta.ok) {
          const data: RespuestaBusqueda = await respuesta.json();
          setResultados(data.datos || []);
          setTerminoBusqueda(data.termino_busqueda || '');
        }
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setResultados([]);
        setTerminoBusqueda('');
      } finally {
        setCargando(false);
        setPrimeraConsulta(false);
      }
    };

    const timeoutId = setTimeout(buscarPublicaciones, 300);
    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  const handleVerMasResultados = () => {
    router.push(`/busqueda?q=${encodeURIComponent(busqueda)}`);
    onClose();
  };

  if (!busqueda) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden border z-50"
    >
      <div className="max-h-[400px] overflow-y-auto">
        {(cargando || primeraConsulta) ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : resultados.length > 0 ? (
          <div className="divide-y">
            {resultados.map((resultado) => (              <Link
                key={resultado.id_publicacion}
                href={`/publicaciones/${resultado.id_publicacion}`}
                onClick={onClose}
                className="flex gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="h-16 w-12 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={resultado.imagen_portada ? 
                      `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${resultado.id_publicacion}/portada` :
                      `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                    }
                    alt={resultado.titulo}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="text-sm font-medium text-gray-900 mb-1"
                    dangerouslySetInnerHTML={{ 
                      __html: resaltarCoincidencias(resultado.titulo)
                    }}
                  />
                  <p 
                    className="text-xs text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: resaltarCoincidencias(obtenerFragmentoRelevante(resultado.resumen))
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : !primeraConsulta && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No se encontraron resultados
          </div>
        )}
        
        {resultados.length > 0 && (
          <div className="p-3 border-t">
            <button
              ref={verMasRef}
              onClick={handleVerMasResultados}
              className="w-full py-2 px-4 text-sm text-[#612c7d] hover:bg-purple-50 
                       transition-colors rounded-md font-medium"
            >
              {resultados.length > 5 
                ? `Ver más resultados (${resultados.length})` 
                : "Ver búsqueda"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};