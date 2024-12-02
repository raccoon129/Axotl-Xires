'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Info, Star, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Publicacion } from '@/type/typePublicacion';
import Link from 'next/link';

interface PropsTarjetaCompleta {
  publicacion: Publicacion;
  className?: string;
  onVerDetalles: (publicacion: Publicacion) => void;
}

export const TarjetaPublicacionCompleta = ({ 
  publicacion, 
  className = "",
  onVerDetalles
}: PropsTarjetaCompleta) => {
  const [imageLoaded, setImageLoaded] = useState(false);
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
    <Card className={`${className} flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl bg-white`}>
      {/* Portada */}
      <div className="w-full relative" style={{ aspectRatio: '612/792' }}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={obtenerUrlPortada(publicacion.imagen_portada)}
          alt={publicacion.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          priority
        />
        
        {/* Overlay con estadísticas */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-white/50">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${publicacion.autor_foto || 'null'}`}
                  alt={publicacion.autor}
                />
              </Avatar>
              <Link 
                href={`/perfiles/${publicacion.id_usuario}`}
                className="text-sm hover:underline truncate max-w-[150px]"
              >
                {publicacion.autor}
              </Link>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{publicacion.total_favoritos}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{publicacion.total_comentarios}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#612c7d] cursor-pointer transition-colors"
          onClick={() => onVerDetalles(publicacion)}
        >
          {publicacion.titulo}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {publicacion.resumen}
        </p>

        <div className="text-xs text-gray-500 mb-3">
          {formatearFecha(publicacion.fecha_publicacion)}
        </div>

        {/* Botones */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            onClick={irALectura}
            className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-gray-50 h-8 text-sm"
          >
            <BookOpen className="w-3 h-3" />
            <span>Leer</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onVerDetalles(publicacion)}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 h-8 text-sm"
          >
            <Info className="w-3 h-3" />
            <span>Detalles</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};