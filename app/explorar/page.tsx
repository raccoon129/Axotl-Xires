'use client';

import { useState, useEffect } from 'react';
import { TarjetaPublicacionCompleta } from '@/components/publicacion/TarjetaPublicacionCompleta';
import { Publicacion } from '@/type/typePublicacion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Categoria {
  id_tipo: number;
  categoria: string;
  descripcion: string;
}

export default function PaginaExplorar() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: 'todos',
    ordenar: 'reciente'
  });

  // Cargar publicaciones y sus detalles
  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones`
        );

        if (!respuesta.ok) {
          throw new Error('Error al cargar las publicaciones');
        }

        const publicacionesBase = await respuesta.json();

        // Cargar detalles adicionales para cada publicación
        const publicacionesConDetalles = await Promise.all(
          publicacionesBase.map(async (pub: any) => {
            try {
              // Obtener categoría
              const respCategoria = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${pub.id_publicacion}/categoria`
              );
              const { datos: categoria } = await respCategoria.json();

              // Obtener cantidad de favoritos
              const respFavoritos = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/publicacion/${pub.id_publicacion}`
              );
              const { total_favoritos } = await respFavoritos.json();

              // Obtener cantidad de comentarios
              const respComentarios = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comentarios/publicacion/${pub.id_publicacion}/total`
              );
              const { total_comentarios } = await respComentarios.json();

              // Obtener detalles del autor
              const respAutor = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${pub.id_usuario}`
              );
              const { datos: autor } = await respAutor.json();

              return {
                ...pub,
                tipo_publicacion: categoria.categoria,
                total_favoritos,
                total_comentarios,
                autor: autor.nombre,
                autor_foto: autor.foto_perfil
              };
            } catch (error) {
              console.error('Error al cargar detalles:', error);
              return pub;
            }
          })
        );

        // Obtener categorías únicas para los filtros
        const categoriasUnicas = Array.from(
          new Set(publicacionesConDetalles.map(pub => pub.tipo_publicacion))
        );
        setCategorias(categoriasUnicas.map(cat => ({
          id_tipo: 0,
          categoria: cat,
          descripcion: ''
        })));

        setPublicaciones(publicacionesConDetalles);
      } catch (error) {
        setError('Error al cargar las publicaciones');
        console.error('Error:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPublicaciones();
  }, []);

  const publicacionesFiltradas = publicaciones
    .filter(pub => {
      const coincideBusqueda = pub.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                              pub.resumen.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                              pub.autor.toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      const coincideCategoria = filtros.categoria === 'todos' || pub.tipo_publicacion === filtros.categoria;
      
      return coincideBusqueda && coincideCategoria;
    })
    .sort((a, b) => {
      if (filtros.ordenar === 'reciente') {
        return new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime();
      } else {
        return b.total_favoritos - a.total_favoritos;
      }
    });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explorar Publicaciones
          </h1>
          <p className="text-gray-600">
            Descubre artículos científicos y académicos compartidos por la comunidad
          </p>
        </div>

        {/* Barra de filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título, resumen o autor..."
                  className="pl-10"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="rounded-md border border-gray-300 px-4 py-2"
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map((cat, index) => (
                  <option key={index} value={cat.categoria}>
                    {cat.categoria}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-gray-300 px-4 py-2"
                value={filtros.ordenar}
                onChange={(e) => setFiltros(prev => ({ ...prev, ordenar: e.target.value }))}
              >
                <option value="reciente">Más recientes</option>
                <option value="favoritos">Más favoritos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de publicaciones */}
        <div className="space-y-6">
          {publicacionesFiltradas.map((publicacion, index) => (
            <motion.div
              key={publicacion.id_publicacion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TarjetaPublicacionCompleta
                publicacion={publicacion}
                className="w-full"
              />
            </motion.div>
          ))}
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#612c7d] mx-auto"></div>
          </div>
        )}
        {error && (
          <div className="text-center py-12 text-red-600">
            {error}
          </div>
        )}
        {!cargando && publicacionesFiltradas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron publicaciones que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
} 