'use client';

import { useState, useEffect } from 'react';
import { TarjetaPublicacionCompleta } from '@/components/publicacion/TarjetaPublicacionCompleta';
import { Publicacion } from '@/type/typePublicacion';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Calendar, Star, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ModalDetallesPublicacion from '@/components/publicacion/ModalDetallesPublicacion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Categoria {
  id_tipo: number;
  categoria: string;
  descripcion: string;
}

type OrdenTipo = 'recientes' | 'antiguos' | 'alfabetico' | 'favoritos';

export default function PaginaExplorar() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [ordenActual, setOrdenActual] = useState<OrdenTipo>('recientes');

  useEffect(() => {
    document.title = "Explorar Publicaciones - Axotl Xires";
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones`);
      
      if (!respuesta.ok) {
        throw new Error('Error al cargar las publicaciones');
      }

      const datos = await respuesta.json();
      
      // Cargar categorías únicas
      const categoriasUnicas = new Set<number>();
      datos.forEach((pub: Publicacion) => categoriasUnicas.add(pub.id_tipo));
      
      // Obtener detalles de cada categoría
      const promesasCategorias = Array.from(categoriasUnicas).map(async (idTipo) => {
        const respCat = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/categorias/${idTipo}`);
        if (respCat.ok) {
          const dataCat = await respCat.json();
          return dataCat.datos;
        }
        return null;
      });

      const categoriasDetalladas = (await Promise.all(promesasCategorias)).filter(Boolean);
      setCategorias(categoriasDetalladas);

      // Enriquecer publicaciones con datos adicionales
      const publicacionesEnriquecidas = await Promise.all(
        datos.map(async (pub: Publicacion) => {
          // Obtener favoritos
          const respFav = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${pub.id_publicacion}`
          );
          const dataFav = await respFav.json();

          return {
            ...pub,
            total_favoritos: dataFav.total_favoritos || 0,
            total_comentarios: 0, // Se podría añadir endpoint para comentarios
          };
        })
      );

      setPublicaciones(publicacionesEnriquecidas);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar las publicaciones');
    } finally {
      setCargando(false);
    }
  };

  const ordenarPublicaciones = (publicaciones: Publicacion[]) => {
    const publicacionesOrdenadas = [...publicaciones];
    
    switch (ordenActual) {
      case 'recientes':
        return publicacionesOrdenadas.sort((a, b) => 
          new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
        );
      case 'antiguos':
        return publicacionesOrdenadas.sort((a, b) => 
          new Date(a.fecha_publicacion).getTime() - new Date(b.fecha_publicacion).getTime()
        );
      case 'alfabetico':
        return publicacionesOrdenadas.sort((a, b) => 
          a.titulo.localeCompare(b.titulo)
        );
      case 'favoritos':
        return publicacionesOrdenadas.sort((a, b) => 
          (b.total_favoritos || 0) - (a.total_favoritos || 0)
        );
      default:
        return publicacionesOrdenadas;
    }
  };

  const publicacionesFiltradas = ordenarPublicaciones(
    publicaciones.filter(pub => 
      (categoriaSeleccionada === null || pub.id_tipo === categoriaSeleccionada) &&
      (busqueda === '' || 
        pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        pub.resumen.toLowerCase().includes(busqueda.toLowerCase()))
    )
  );

  const handleVerDetalles = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Explorar Publicaciones
        </h1>
        <p className="text-gray-600">
          Descubre artículos científicos y académicos de diversos temas
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Barra lateral de filtros */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
            {/* Búsqueda */}
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8 w-full bg-gray-50 border-gray-200 h-8 text-sm"
              />
            </div>

            {/* Categorías */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Categorías
              </h3>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant={categoriaSeleccionada === null ? "default" : "ghost"}
                  onClick={() => setCategoriaSeleccionada(null)}
                  size="sm"
                  className="justify-start h-7 text-sm"
                >
                  <Filter className="h-3 w-3 mr-2" />
                  <span>Todas</span>
                </Button>
                {categorias.map((cat) => (
                  <Button
                    key={cat.id_tipo}
                    variant={categoriaSeleccionada === cat.id_tipo ? "default" : "ghost"}
                    onClick={() => setCategoriaSeleccionada(cat.id_tipo)}
                    size="sm"
                    className="justify-start h-7 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                    {cat.categoria}
                  </Button>
                ))}
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Ordenar por
              </h3>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant={ordenActual === 'recientes' ? "default" : "ghost"}
                  onClick={() => setOrdenActual('recientes')}
                  size="sm"
                  className="justify-start h-7 text-sm"
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  Más recientes
                </Button>
                <Button
                  variant={ordenActual === 'antiguos' ? "default" : "ghost"}
                  onClick={() => setOrdenActual('antiguos')}
                  size="sm"
                  className="justify-start h-7 text-sm"
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  Más antiguos
                </Button>
                <Button
                  variant={ordenActual === 'alfabetico' ? "default" : "ghost"}
                  onClick={() => setOrdenActual('alfabetico')}
                  size="sm"
                  className="justify-start h-7 text-sm"
                >
                  <SortAsc className="h-3 w-3 mr-2" />
                  Orden alfabético
                </Button>
                <Button
                  variant={ordenActual === 'favoritos' ? "default" : "ghost"}
                  onClick={() => setOrdenActual('favoritos')}
                  size="sm"
                  className="justify-start h-7 text-sm"
                >
                  <Star className="h-3 w-3 mr-2" />
                  Más favoritos
                </Button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="pt-3 border-t text-center">
              <p className="text-xs text-gray-500">
                {publicacionesFiltradas.length} publicación(es)
              </p>
            </div>
          </div>
        </div>

        {/* Grid de publicaciones */}
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {cargando ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg" style={{ aspectRatio: '612/792' }} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : publicacionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron publicaciones</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {publicacionesFiltradas.map((publicacion) => (
                  <motion.div
                    key={publicacion.id_publicacion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <TarjetaPublicacionCompleta 
                      publicacion={publicacion}
                      className="h-full"
                      onVerDetalles={handleVerDetalles}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal de detalles */}
      {publicacionSeleccionada && (
        <ModalDetallesPublicacion
          estaAbierto={!!publicacionSeleccionada}
          alCerrar={() => setPublicacionSeleccionada(null)}
          publicacion={{
            id_publicacion: publicacionSeleccionada.id_publicacion,
            titulo: publicacionSeleccionada.titulo,
            resumen: publicacionSeleccionada.resumen,
            autor: publicacionSeleccionada.autor,
            fecha_publicacion: publicacionSeleccionada.fecha_publicacion || "Fecha no disponible",
            imagen_portada: publicacionSeleccionada.imagen_portada,
            categoria: publicacionSeleccionada.tipo_publicacion,
            favoritos: publicacionSeleccionada.total_favoritos,
            id_usuario: publicacionSeleccionada.id_usuario || 0 // Añadimos la propiedad id_usuario requerida
          }}
        />
      )}
    </div>
  );
}