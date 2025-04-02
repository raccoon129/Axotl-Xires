'use client';

import { useState, useEffect } from 'react';
import { Publicacion } from '@/type/typePublicacion';
import { TarjetaVerticalPublicacion } from '@/components/publicacion/TarjetaVerticalPublicacion';
import { TarjetaPublicacionMiniCategorias } from '@/components/publicacion/TarjetaPublicacionMiniCategorias';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import CarruselPublicaciones from '@/components/home/CarruselPublicaciones';
import ModalDetallesPublicacion from '@/components/publicacion/ModalDetallesPublicacion';

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

export function ContenidoHome({ publicacionesRecientes }: PropiedadesContenidoHome) {
  const [publicacionesDestacadas, setPublicacionesDestacadas] = useState<Publicacion[]>([]);
  const [publicacionesTendencia, setPublicacionesTendencia] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);

  useEffect(() => {
    const cargarPublicacionesAdicionales = async () => {
      try {
        // Cargar publicaciones más favoritas
        const respuestaDestacadas = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/favoritos/top`
        );
        
        if (respuestaDestacadas.ok) {
          const datosDestacadas = await respuestaDestacadas.json();
          // Convertir el formato de la respuesta al formato de Publicacion
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
            // Campos requeridos por el tipo Publicacion que no vienen en la respuesta
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

        // Cargar publicaciones en tendencia (mantener la lógica existente por ahora)
        const respuestaTendencia = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/tendencia`
        );
        if (respuestaTendencia.ok) {
          const datosTendencia = await respuestaTendencia.json();
          setPublicacionesTendencia(datosTendencia.slice(0, 6));
        }
      } catch (error) {
        console.error('Error al cargar publicaciones adicionales:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPublicacionesAdicionales();
  }, []);

  const handleVerDetalles = (publicacion: Publicacion) => {
    setPublicacionSeleccionada(publicacion);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl space-y-16">
      {/* Sección de publicaciones recientes con carrusel */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Publicaciones Recientes</h2>
          <Link href="/explorar">
            <Button variant="outline">Ver todas</Button>
          </Link>
        </div>
        <CarruselPublicaciones publicaciones={publicacionesRecientes} />
      </section>

      {/* Sección de pestañas para destacadas y tendencias */}
      <section>
        <Tabs defaultValue="destacadas" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="destacadas" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mejor Valoradas
            </TabsTrigger>
            <TabsTrigger value="tendencia" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              En Tendencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destacadas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicacionesDestacadas.map((pub) => (
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
          </TabsContent>

          <TabsContent value="tendencia">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicacionesTendencia.map((pub) => (
                <TarjetaVerticalPublicacion
                  key={pub.id_publicacion}
                  publicacion={pub}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Sección de categorías populares */}
      <section className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Explora por Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/categorias?tipo=1" className="group">
            <div className="p-6 border rounded-lg hover:border-[#612C7D] transition-colors">
              <BookOpen className="w-8 h-8 text-[#612C7D] mb-3" />
              <h3 className="font-semibold mb-2 group-hover:text-[#612C7D]">
                Artículos Científicos
              </h3>
              <p className="text-sm text-gray-600">
                Publicaciones académicas revisadas por pares
              </p>
            </div>
          </Link>
          {/* Añadir más categorías aquí */}
        </div>
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
            id_usuario: publicacionSeleccionada.id_usuario || 0 // Añadimos la propiedad id_usuario requerida
          }}
        />
      )}
    </div>
  );
}
