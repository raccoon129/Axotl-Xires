'use client';

import { useState, useEffect } from 'react';
import { Publicacion } from '@/type/typePublicacion';
import { TarjetaVerticalPublicacion } from '@/components/publicacion/TarjetaVerticalPublicacion';
import { TarjetaPublicacionMiniCategorias } from '@/components/publicacion/TarjetaPublicacionMiniCategorias';
import { Button } from "@/components/ui/button";
import { Star, BookOpen, FileText, Users, Award, Newspaper, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import CarruselPublicaciones from '@/components/home/CarruselPublicaciones';
import ModalDetallesPublicacion from '@/components/publicacion/ModalDetallesPublicacion';
import { motion } from 'framer-motion';

interface PropiedadesContenidoHome {
  publicacionesRecientes: Publicacion[];
}

interface PublicacionDestacada {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  imagen_portada: string;
  fecha_publicacion: string;
  autor: string;
  autor_foto: string;
  categoria: string;
  total_favoritos: number;
}

interface Categoria {
  id_tipo: number;
  categoria: string;
  descripcion: string;
}

export function ContenidoHome({ publicacionesRecientes }: PropiedadesContenidoHome) {
  const [publicacionesDestacadas, setPublicacionesDestacadas] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar publicaciones más favoritas
        const respuestaDestacadas = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/top`
        );
        
        if (respuestaDestacadas.ok) {
          const datosDestacadas = await respuestaDestacadas.json();
          const publicacionesFormateadas = datosDestacadas.datos.map((pub: PublicacionDestacada) => ({
            id_publicacion: pub.id_publicacion,
            titulo: pub.titulo,
            resumen: pub.resumen,
            imagen_portada: pub.imagen_portada,
            fecha_publicacion: pub.fecha_publicacion,
            autor: pub.autor,
            autor_foto: pub.autor_foto,
            tipo_publicacion: pub.categoria,
            total_favoritos: pub.total_favoritos,
            id_tipo: 0,
            id_usuario: 0,
            contenido: '',
            referencias: '',
            total_comentarios: 0,
            estado: 'publicado' as const,
            es_privada: 0
          }));
          setPublicacionesDestacadas(publicacionesFormateadas);
        }

        // Cargar categorías disponibles
        const respCategorias = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/categorias/todas`);
        if (respCategorias.ok) {
          const dataCategorias = await respCategorias.json();
          setCategorias(dataCategorias.datos || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleVerDetalles = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
  };

  // Función para obtener un icono según el tipo de categoría
  const obtenerIconoCategoria = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'artículo científico':
      case 'articulo cientifico':
        return <FileText className="w-8 h-8" />;
      case 'tesis':
        return <GraduationCap className="w-8 h-8" />;
      case 'ensayo':
        return <BookOpen className="w-8 h-8" />;
      case 'reporte':
        return <Newspaper className="w-8 h-8" />;
      case 'proyecto':
        return <Award className="w-8 h-8" />;
      default:
        return <BookOpen className="w-8 h-8" />;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl space-y-16">
      {/* Sección de publicaciones recientes con carrusel */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Publicaciones Recientes</h2>
          <Link href="/explorar">
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>
        <CarruselPublicaciones publicaciones={publicacionesRecientes} />
      </section>

      {/* Sección de publicaciones destacadas */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Publicaciones Mejor Valoradas
          </h2>
          <Link href="/explorar?filter=destacadas">
            <Button variant="outline">Ver más</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicacionesDestacadas.slice(0, 4).map((pub) => (
            <TarjetaPublicacionMiniCategorias
              key={pub.id_publicacion}
              publicacion={pub}
              categoria={{
                id_tipo: pub.id_tipo,
                categoria: pub.tipo_publicacion,
                descripcion: 'Publicación académica'
              }}
              onVerDetalles={handleVerDetalles}
            />
          ))}
        </div>
      </section>

      {/* Sección de categorías populares */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Explora por Categorías</h2>
        
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border rounded-lg bg-gray-50 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((cat, index) => (
              <motion.div
                key={cat.id_tipo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/categorias?tipo=${cat.id_tipo}`} className="group">
                  <div className="p-6 border rounded-lg hover:border-[#612C7D] hover:shadow-md transition-all bg-white">
                    <div className="text-[#612C7D] mb-3">
                      {obtenerIconoCategoria(cat.categoria)}
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-[#612C7D] transition-colors">
                      {cat.categoria}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cat.descripcion}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

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
            id_usuario: publicacionSeleccionada.id_usuario || 0
          }}
        />
      )}
    </div>
  );
}
