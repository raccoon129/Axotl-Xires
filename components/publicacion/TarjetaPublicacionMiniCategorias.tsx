'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Info } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Publicacion } from '@/type/typePublicacion';
import Link from 'next/link';

interface PropsTarjetaMini {
  publicacion: Publicacion;
  categoria: {
    id_tipo: number;
    categoria: string;
    descripcion: string;
  };
  onVerDetalles: (publicacion: Publicacion) => void;
}

export const TarjetaPublicacionMiniCategorias = ({ 
  publicacion, 
  categoria,
  onVerDetalles 
}: PropsTarjetaMini) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [autorId, setAutorId] = useState<number | null>(null);
  const router = useRouter();

  const obtenerUrlPortada = (idPublicacion: number | null) => {
    if (!idPublicacion) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
    return `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}/portada`;
  };

  const irALectura = () => {
    router.push(`/publicaciones/${publicacion.id_publicacion}`);
  };

  // Añadir efecto para obtener el ID del autor
  useEffect(() => {
    const obtenerAutorPublicacion = async () => {
      try {
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${publicacion.id_publicacion}/usuarioPertenece`
        );
        
        if (respuesta.ok) {
          const { datos } = await respuesta.json();
          setAutorId(datos.id_usuario);
        }
      } catch (error) {
        console.error('Error al obtener autor:', error);
      }
    };

    if (publicacion.id_publicacion) {
      obtenerAutorPublicacion();
    }
  }, [publicacion.id_publicacion]);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-white">
      <div className="flex gap-4 p-4">
        {/* Portada miniatura */}
        <div className="relative w-24 h-32 flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
          <Image
            src={obtenerUrlPortada(publicacion.id_publicacion)}
            alt={publicacion.titulo}
            fill
            className={`object-cover rounded transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-grow min-w-0">
          {/* Categoría */}
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {categoria.categoria}
            </span>
          </div>

          {/* Título y autor */}
          <h3 
            className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-purple-600 cursor-pointer"
            onClick={() => onVerDetalles(publicacion)}
          >
            {publicacion.titulo}
          </h3>
          
          <Link 
            href={`/perfiles/${autorId || '#'}`}
            className="text-xs text-gray-500 hover:text-purple-600 mb-2"
            onClick={(e) => {
              if (!autorId) e.preventDefault();
            }}
          >
            {publicacion.autor}
          </Link>

          {/* Botones */}
          <div className="flex gap-2 mt-auto">
            <Button 
              variant="ghost" 
              onClick={irALectura}
              className="h-8 px-2 text-xs"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Leer
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => onVerDetalles(publicacion)}
              className="h-8 px-2 text-xs"
            >
              <Info className="w-3 h-3 mr-1" />
              Detalles
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};