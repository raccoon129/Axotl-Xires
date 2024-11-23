'use client';

import { motion } from 'framer-motion';

interface OverlayEnvioProps {
  mostrar: boolean;
}

const OverlayEnvio = ({ mostrar }: OverlayEnvioProps) => {
  if (!mostrar) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 bg-[#612c7d] z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-white"
      >
        <h1 className="text-4xl font-bold mb-4">
          Tu borrador se está enviando a revisión
        </h1>
        <p className="text-xl opacity-90">
          Ya casi está listo
        </p>
      </motion.div>
    </motion.div>
  );
};

export default OverlayEnvio; 