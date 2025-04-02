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
    }, 500);

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
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 w-full sm:w-1/2" />
            <Skeleton className="h-10 w-full sm:w-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`relative ${className} overflow-hidden transition-shadow duration-300 hover:shadow-lg`}>
        {Boolean(publicacion.es_privada) && (
          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span className="text-xs">Privada</span>
          </div>
        )}
        
        {/* Contenedor de imagen con ratio fijo y animación */}
        <div className="relative w-full overflow-hidden transition-all duration-300 ease-in-out">
          <div 
            className="relative w-full h-48 transition-all duration-300 ease-in-out hover:h-72"
            onMouseEnter={(e) => {
              // Detener la propagación del evento para que solo afecte a esta tarjeta
              e.stopPropagation();
              const target = e.currentTarget;
              target.style.height = '18rem'; // h-72 equivale a 18rem
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.height = '12rem'; // h-48 equivale a 12rem
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <div className="relative w-full h-full">
              <Image
                src={obtenerUrlPortada(publicacion.imagen_portada)}
                alt={publicacion.titulo}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className={`object-cover transition-all duration-300 ease-in-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                priority
              />
            </div>
          </div>
        </div>

        <CardHeader className="space-y-2">
          <CardTitle 
            className="cursor-pointer hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-lg sm:text-xl"
            onClick={() => setModalAbierto(true)}
          >
            {publicacion.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700 line-clamp-3">{publicacion.resumen}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Por: {publicacion.autor}</p>
            <p className="text-sm text-gray-500">
              Publicado el: {formatearFecha(publicacion.fecha_publicacion)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={irALectura}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
            >
              <BookOpen className="w-4 h-4" />
              <span className="whitespace-nowrap">Leer publicación</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setModalAbierto(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
            >
              <Info className="w-4 h-4" />
              <span className="whitespace-nowrap">Ver detalles</span>
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
            autor_foto: publicacion.autor_foto || null, // Aseguramos que se pase autor_foto
            fecha_publicacion: publicacion.fecha_publicacion || "Fecha no disponible",
            imagen_portada: publicacion.imagen_portada,
            categoria: publicacion.tipo_publicacion,
            favoritos: publicacion.total_favoritos,
            id_usuario: publicacion.id_usuario || 0 // Añadimos la propiedad id_usuario requerida
          }}
        />
      )}
    </>
  );
};