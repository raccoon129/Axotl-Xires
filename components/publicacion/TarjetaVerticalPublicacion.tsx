'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, Info } from "lucide-react";
import { useState, useEffect } from 'react';
import ModalDetallesPublicacion from './ModalDetallesPublicacion';
import { useRouter } from 'next/navigation';
import { Publicacion } from '@/type/typePublicacion';
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';

interface PropsTarjetaVertical {
  publicacion: Publicacion;
  className?: string;
}

export const TarjetaVerticalPublicacion = ({ 
  publicacion, 
  className = ""
}: PropsTarjetaVertical) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simular un tiempo mínimo de carga para el skeleton
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <Card className={`relative ${className} animate-pulse`}>
        {/* Skeleton para la imagen */}
        <div className="relative w-full h-48 bg-gray-200" />
        
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`relative ${className} overflow-hidden transition-shadow duration-300 hover:shadow-lg group`}>
        {Boolean(publicacion.es_privada) && (
          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span className="text-xs">Privada</span>
          </div>
        )}
        
        {/* Contenedor de imagen con animación en hover */}
        <div className="relative w-full h-48 overflow-hidden transition-all duration-500 ease-in-out group-hover:h-80">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <div className="relative w-full h-full transform transition-transform duration-500 ease-in-out group-hover:scale-110">
            <Image
              src={obtenerUrlPortada(publicacion.imagen_portada)}
              alt={publicacion.titulo}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              priority
            />
          </div>
        </div>

        <CardHeader>
          <CardTitle 
            className="cursor-pointer hover:text-blue-600 transition-colors duration-200 line-clamp-2"
            onClick={() => setModalAbierto(true)}
          >
            {publicacion.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">{publicacion.resumen}</p>
          <p className="text-sm text-gray-600 mb-2">Por: {publicacion.autor}</p>
          <p className="text-sm text-gray-500 mb-4">
            Publicado el: {formatearFecha(publicacion.fecha_publicacion)}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={irALectura}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
            >
              <BookOpen className="w-4 h-4" />
              Leer publicación
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 bg-white hover:bg-gray-50"
            >
              <Info className="w-4 h-4" />
              Ver detalles
            </Button>
          </div>
        </CardContent>
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
            fecha_publicacion: publicacion.fecha_publicacion || publicacion.fecha_creacion || "Fecha no disponible",
            imagen_portada: publicacion.imagen_portada,
            categoria: publicacion.tipo_publicacion,
            favoritos: publicacion.total_favoritos
          }}
        />
      )}
    </>
  );
}; 