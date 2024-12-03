'use client';

import { useState, useEffect } from 'react';
import { TarjetaPublicacionMiniCategorias } from '@/components/publicacion/TarjetaPublicacionMiniCategorias';
import { Publicacion } from '@/type/typePublicacion';
import { motion, AnimatePresence } from 'framer-motion';
import ModalDetallesPublicacion from '@/components/publicacion/ModalDetallesPublicacion';
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Categoria {
  id_tipo: number;
  categoria: string;
  descripcion: string;
}

export default function PaginaCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [publicacionesPorCategoria, setPublicacionesPorCategoria] = useState<Record<number, Publicacion[]>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [activeSlide, setActiveSlide] = useState<Record<number, number>>({});

  useEffect(() => {
    document.title = "Categorías - Axotl Xires";
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar todas las categorías
      const respCategorias = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/categorias/todas`);
      if (!respCategorias.ok) throw new Error('Error al cargar categorías');
      const dataCategorias = await respCategorias.json();
      setCategorias(dataCategorias.datos);

      // Cargar publicaciones
      const respPublicaciones = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones`);
      if (!respPublicaciones.ok) throw new Error('Error al cargar publicaciones');
      const publicaciones = await respPublicaciones.json();

      // Organizar publicaciones por categoría
      const publicacionesAgrupadas: Record<number, Publicacion[]> = {};
      for (const pub of publicaciones) {
        if (!publicacionesAgrupadas[pub.id_tipo]) {
          publicacionesAgrupadas[pub.id_tipo] = [];
        }
        publicacionesAgrupadas[pub.id_tipo].push(pub);
      }

      setPublicacionesPorCategoria(publicacionesAgrupadas);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const handleVerDetalles = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
  };

  const CategoriaSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Explorar por Categorías
        </h1>
        <p className="text-gray-600">
          Descubre publicaciones organizadas por tipo de contenido
        </p>
      </div>

      <div className="space-y-8">
        {cargando ? (
          // Mostrar 3 skeletons mientras carga
          <>
            <CategoriaSkeleton />
            <CategoriaSkeleton />
            <CategoriaSkeleton />
          </>
        ) : (
          categorias.map((categoria) => {
            const publicacionesCategoria = publicacionesPorCategoria[categoria.id_tipo] || [];
            const totalSlides = Math.ceil(publicacionesCategoria.length / 2);
            const currentSlide = activeSlide[categoria.id_tipo] || 0;

            return (
              <div key={categoria.id_tipo} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-purple-800 mb-2">
                    {categoria.categoria}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {categoria.descripcion}
                  </p>
                </div>

                <div className="relative">
                  {publicacionesCategoria.length > 2 && (
                    <>
                      <button
                        onClick={() => setActiveSlide(prev => ({
                          ...prev,
                          [categoria.id_tipo]: (currentSlide - 1 + totalSlides) % totalSlides
                        }))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setActiveSlide(prev => ({
                          ...prev,
                          [categoria.id_tipo]: (currentSlide + 1) % totalSlides
                        }))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                      </button>
                    </>
                  )}

                  <div className="overflow-hidden">
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      animate={{ x: `-${currentSlide * 100}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {publicacionesCategoria.map((publicacion) => (
                        <motion.div
                          key={publicacion.id_publicacion}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TarjetaPublicacionMiniCategorias
                            publicacion={publicacion}
                            categoria={categoria}
                            onVerDetalles={handleVerDetalles}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {publicacionesCategoria.length > 2 && (
                    <div className="flex justify-center mt-4 gap-2">
                      {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveSlide(prev => ({
                            ...prev,
                            [categoria.id_tipo]: index
                          }))}
                          className={`h-2 w-2 rounded-full transition-all ${
                            currentSlide === index ? 'bg-purple-600 w-4' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
            favoritos: publicacionSeleccionada.total_favoritos
          }}
        />
      )}
    </div>
  );
}