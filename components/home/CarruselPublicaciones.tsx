'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TarjetaVerticalPublicacion } from '@/components/publicacion/TarjetaVerticalPublicacion';
import { Publicacion } from '@/type/typePublicacion';

interface CarruselPublicacionesProps {
  publicaciones: Publicacion[];
}

export default function CarruselPublicaciones({ publicaciones }: CarruselPublicacionesProps) {
  return (
    <div className="relative">
      {publicaciones.length > 3 && (
        <>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => {
              const container = document.getElementById('publicaciones-container');
              if (container) {
                container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => {
              const container = document.getElementById('publicaciones-container');
              if (container) {
                container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </>
      )}

      <div 
        id="publicaciones-container"
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {publicaciones.map((publicacion) => (
          <div 
            key={publicacion.id_publicacion}
            className="flex-none w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
          >
            <TarjetaVerticalPublicacion
              publicacion={publicacion}
            />
          </div>
        ))}
      </div>

      {/* Indicadores de página */}
      {publicaciones.length > 3 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(publicaciones.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = document.getElementById('publicaciones-container');
                if (container) {
                  container.scrollTo({
                    left: container.offsetWidth * index,
                    behavior: 'smooth'
                  });
                }
              }}
              className="h-2 w-2 rounded-full bg-gray-300 hover:bg-[#612C7D] transition-colors"
            />
          ))}
        </div>
      )}
    </div>
  );
}