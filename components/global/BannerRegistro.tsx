'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function BannerRegistro() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [descartadoPorUsuario, setDescartadoPorUsuario] = useState(false);
  const { isLoggedIn: sesionIniciada } = useAuth();

  useEffect(() => {
    // Verificar si el usuario ya cerró el banner anteriormente
    const bannerDescartado = localStorage.getItem('bannerRegistroDescartado');
    if (bannerDescartado) {
      setBannerVisible(false);
      setDescartadoPorUsuario(true);
    }

    // Función para manejar el desplazamiento
    const manejarDesplazamiento = () => {
      const posicionScroll = window.scrollY;
      const alturaVentana = window.innerHeight;
      const alturaDocumento = document.documentElement.scrollHeight;
      
      // Calcular si estamos cerca del final (dentro de los últimos 100px)
      const cercaDelFinal = posicionScroll + alturaVentana >= alturaDocumento - 100;
      
      // Animación suave usando requestAnimationFrame
      const animarOcultamiento = () => {
        if (cercaDelFinal && bannerVisible) {
          setBannerVisible(false);
        } else if (!cercaDelFinal && !descartadoPorUsuario) {
          setBannerVisible(true);
        }
      };

      requestAnimationFrame(animarOcultamiento);
    };

    // Agregar escucha de evento para el desplazamiento
    window.addEventListener('scroll', manejarDesplazamiento);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('scroll', manejarDesplazamiento);
    };
  }, [descartadoPorUsuario, bannerVisible]);

  const descartarBanner = () => {
    setBannerVisible(false);
    setDescartadoPorUsuario(true);
    localStorage.setItem('bannerRegistroDescartado', 'true');
  };

  if (sesionIniciada || descartadoPorUsuario) return null;

  return (
    <AnimatePresence mode="wait">
      {bannerVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ 
            y: 100, 
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-gradient-to-r from-[#612c7d] to-[#7d3ba3] text-white py-4 px-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div>
                  <p className="text-lg font-semibold text-center sm:text-left">
                    ¡Únete a Axotl Xires!
                  </p>
                  <p className="text-sm text-white/80 text-center sm:text-left">
                    Comparte y accede a publicaciones científicas y académicas sin restricciones
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/registro"
                  className="bg-white text-[#612c7d] px-6 py-2 rounded-full font-medium 
                           hover:bg-opacity-90 transition-all duration-300 
                           flex items-center gap-2 group hover:scale-105"
                >
                  Crea una cuenta
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={descartarBanner}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 
                           hover:rotate-90 hover:scale-110"
                  aria-label="Cerrar banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 