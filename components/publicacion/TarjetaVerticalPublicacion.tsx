'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Publicacion } from '@/type/typePublicacion';
import { useState } from 'react';
import ModalDetallesPublicacion from './ModalDetallesPublicacion';

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

  // Función de formateo dentro del componente
  const formatearFecha = (fecha: string | Date | null): string => {
    if (!fecha) return "Fecha no disponible";
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para construir la URL de la portada
  const obtenerUrlPortada = (nombreImagen: string | null) => {
    if (!nombreImagen) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
    return `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${nombreImagen}`;
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-500 ease-in-out max-h-72 hover:max-h-[500px] hover:shadow-lg ${className}`}>
        <div className="relative w-full h-48 overflow-hidden transition-all duration-500 ease-in-out hover:h-80">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={obtenerUrlPortada(publicacion.imagen_portada)}
            alt={publicacion.titulo}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
        <CardHeader>
          <CardTitle 
            className="cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={() => setModalAbierto(true)}
          >
            {publicacion.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">{publicacion.resumen}</p>
          <p className="text-sm text-gray-600 mb-2">Por: {publicacion.autor}</p>
          <p className="text-sm text-gray-500">
            Publicado el: {formatearFecha(publicacion.fecha_publicacion)}
          </p>
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
            fecha_publicacion: publicacion.fecha_publicacion || publicacion.fecha_creacion,
            imagen_portada: publicacion.imagen_portada,
            categoria: 'Artículo científico', // Puedes ajustar esto según tus necesidades
            favoritos: 0 // Este valor se actualizará desde la API en el modal
          }}
        />
      )}
    </>
  );
}; 