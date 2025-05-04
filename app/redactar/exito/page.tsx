'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

// Forzar renderizado dinámico para evitar errores de prerenderización
export const dynamic = 'force-dynamic';

// Componente cliente que contiene la lógica y usa useSearchParams
function ContenidoExito() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const enviado = searchParams.get('enviado');

  useEffect(() => {
    // Verificar si se llegó aquí después de un envío exitoso
    if (!enviado) {
      router.replace('/redactar');
      return;
    }

    // Desplazar automáticamente hasta arriba
    window.scrollTo(0, 0);

    setMounted(true);
    document.title = "Publicación Enviada - Axotl Xires";

    // Lanzar confeti
    const lanzarConfeti = () => {
      const duracion = 3 * 1000;
      const final = Date.now() + duracion;

      const lanzar = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#612c7d', '#9f5afd', '#ffffff']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#612c7d', '#9f5afd', '#ffffff']
        });

        if (Date.now() < final) {
          requestAnimationFrame(lanzar);
        }
      };

      lanzar();
    };

    lanzarConfeti();

    // Limpiar el estado de envío cuando se desmonte el componente
    return () => {
      sessionStorage.removeItem('enviadoARevision');
    };
  }, [router, enviado]);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center"
      >
        <img 
          src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoMorado2.png`} 
          alt="Logo Axotl Xires" 
          className="h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Publicación enviada exitosamente!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu publicación ha sido enviada para revisión.
        </p>
        <p className="text-gray-600 mb-6">
          Puedes ver el estado de tu publicación en la sección de "Administrar mis Publicaciones"
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/perfiles/mispublicaciones')}
            className="w-full bg-[#612c7d] hover:bg-[#7d3ba3]"
          >
            Ver mis publicaciones
          </Button>
          <Button
            onClick={() => router.push('/redactar')}
            variant="outline"
            className="w-full"
          >
            Crear nueva publicación
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Componente principal exportado que envuelve el contenido en Suspense
export default function ExitoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando...</div>}>
      <ContenidoExito />
    </Suspense>
  );
}
