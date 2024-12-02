'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export const Banner = () => {
  return (
    <div className="bg-[#612C7D] text-white overflow-hidden">
      {/* Patrón de fondo */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("/pattern.svg")',
          backgroundSize: '50px 50px',
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Columna izquierda: Logo */}
          <div className="lg:w-1/2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.1,
                ease: "easeOut"
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoBlanco.png`}
                alt="Logo Axotl"
                className="w-full max-w-xs mx-auto lg:mx-0"
              />
            </motion.div>
          </div>

          {/* Columna derecha: Título y CTA */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.1,
                ease: "easeOut"
              }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                Descubre y Comparte<br />
                Conocimiento Científico
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Una plataforma dedicada a la divulgación de publicaciones científicas y académicas, 
                creada por y para la comunidad investigadora.
              </p>
              <motion.div 
                className="flex justify-center lg:justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.1,
                  ease: "easeOut"
                }}
              >
                <Link href="/explorar">
                  <Button 
                    size="lg"
                    className="bg-white text-[#612C7D] hover:bg-white/90 w-full sm:w-auto"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explorar publicaciones
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
