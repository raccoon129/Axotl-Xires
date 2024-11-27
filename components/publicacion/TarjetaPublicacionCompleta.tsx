'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Info, Calendar, User, Star, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Publicacion } from '@/type/typePublicacion';
import ModalDetallesPublicacion from './ModalDetallesPublicacion';

interface PropsTarjetaCompleta {
  publicacion: Publicacion;
  className?: string;
}

export const TarjetaPublicacionCompleta = ({ 
  publicacion, 
  className = ""
}: PropsTarjetaCompleta) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const router = useRouter();

  const formatearFecha = (fecha: string | Date | null): string => {
    if (!fecha) return "Fecha no disponible";
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerUrlPortada = (nombreImagen: string | null) => {
    if (!nombreImagen) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
    return `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${nombreImagen}`;
  };

  const irALectura = () => {
    router.push(`/publicaciones/${publicacion.id_publicacion}`);
  };

  return (
    <>
      <Card className={`${className} overflow-hidden transition-all duration-300 hover:shadow-xl bg-white`}>
        <div className="flex flex-col md:flex-row">
          {/* Columna de imagen */}
          <div className="w-full md:w-1/3 relative">
            <div className="relative aspect-[4/3] md:h-full overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <Image
                src={obtenerUrlPortada(publicacion.imagen_portada)}
                alt={publicacion.titulo}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                priority
              />
            </div>
          </div>

          {/* Columna de contenido */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Encabezado con título */}
              <div className="mb-4">
                <h3 
                  className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#612c7d] cursor-pointer transition-colors"
                  onClick={() => setModalAbierto(true)}
                >
                  {publicacion.titulo}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {publicacion.resumen}
                </p>
              </div>

              {/* Información del autor y fecha */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <img 
                      src={publicacion.autor_foto || `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`}
                      alt={publicacion.autor}
                    />
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{publicacion.autor}</p>
                    <div className="flex items-center text-gray-500 gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatearFecha(publicacion.fecha_publicacion)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Star className="w-4 h-4" />
                  <span>{publicacion.total_favoritos} favoritos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{publicacion.total_comentarios} comentarios</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  onClick={irALectura}
                  className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="whitespace-nowrap">Leer publicación</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setModalAbierto(true)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <Info className="w-4 h-4" />
                  <span className="whitespace-nowrap">Ver detalles</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {modalAbierto && (
        <ModalDetallesPublicacion
          estaAbierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          publicacion={{
            id_publicacion: publicacion.id_publicacion,
            titulo: publicacion.titulo,
            resumen: publicacion.resumen,
            autor: publicacion.autor,
            fecha_publicacion: publicacion.fecha_publicacion || "Fecha no disponible",
            imagen_portada: publicacion.imagen_portada,
            categoria: publicacion.tipo_publicacion,
            favoritos: publicacion.total_favoritos
          }}
        />
      )}
    </>
  );
}; 