'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Type, Minus, Plus, Coffee } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { estilosContenido } from './EstilosContenido';

interface PropiedadesModoLectura {
  contenido: string;
  titulo: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ModoLectura({ contenido, titulo, isOpen, onClose }: PropiedadesModoLectura) {
  const [temaSepia, setTemaSepia] = useState(false);
  const [tamanoFuente, setTamanoFuente] = useState(18);
  const [progreso, setProgreso] = useState(0);
  const contenidoRef = useRef<HTMLDivElement>(null);

  // Constantes para el tamaño de fuente
  const TAMANO_MIN = 14;
  const TAMANO_MAX = 28;
  const INCREMENTO = 2;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (contenidoRef.current) {
        const element = contenidoRef.current;
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setProgreso(progress);
      }
    };

    const contenidoElement = contenidoRef.current;
    if (contenidoElement) {
      contenidoElement.addEventListener('scroll', handleScroll);
      return () => contenidoElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const ajustarTamanoFuente = (incremento: number) => {
    setTamanoFuente(prevTamano => {
      const nuevoTamano = prevTamano + incremento;
      return Math.min(Math.max(nuevoTamano, TAMANO_MIN), TAMANO_MAX);
    });
  };

  // Función para obtener el porcentaje del tamaño actual
  const obtenerPorcentajeTamano = () => {
    return Math.round(((tamanoFuente - TAMANO_MIN) / (TAMANO_MAX - TAMANO_MIN)) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 ${temaSepia ? 'tema-sepia' : 'bg-white'}`}
        >
          {/* Barra de progreso */}
          <div 
            className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50"
          >
            <motion.div
              className="h-full bg-blue-600"
              style={{ width: `${progreso}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Barra de herramientas actualizada */}
          <div className={`fixed top-1 left-0 right-0 ${
            temaSepia ? 'bg-[#f4f1ea]' : 'bg-white'
          } border-b p-4 flex items-center justify-between shadow-sm z-40`}>
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTemaSepia(prev => !prev)}
                className={temaSepia ? 'text-[#8b6b4d]' : ''}
              >
                <Coffee className="h-5 w-5" />
              </Button>

              {/* Control de tamaño de fuente mejorado */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => ajustarTamanoFuente(-INCREMENTO)}
                  disabled={tamanoFuente <= TAMANO_MIN}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center min-w-[3rem]">
                  <Type className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">
                    {obtenerPorcentajeTamano()}%
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => ajustarTamanoFuente(INCREMENTO)}
                  disabled={tamanoFuente >= TAMANO_MAX}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Contenido con estilos dinámicos */}
          <div 
            ref={contenidoRef}
            className="h-screen overflow-y-auto scroll-smooth"
            style={{
              paddingTop: 'calc(16px + 3.5rem)',
              paddingBottom: '4rem'
            }}
          >
            <div className="container mx-auto px-6 md:px-8 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8"
              >
                <style jsx global>
                  {estilosContenido}
                </style>
                <h1 
                  className="mb-12 font-crimson text-center"
                  style={{ 
                    fontSize: `${tamanoFuente * 1.5}px`,
                    lineHeight: '1.2'
                  }}
                >
                  {titulo}
                </h1>
                <div 
                  className="contenido-publicacion"
                  style={{ 
                    fontSize: `${tamanoFuente}px`,
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: contenido }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 