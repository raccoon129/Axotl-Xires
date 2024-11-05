// components/Modal.tsx
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  estaAbierto: boolean;
  alCerrar: () => void;
  titulo: string;
  autor: string;
  onGuardar: (imagenPortada: string) => void;
  dimensiones: { ancho: number; alto: number };
  children?: ReactNode; // Asegúrate de que `children` esté aquí
}

const Modal: React.FC<ModalProps> = ({
  estaAbierto,
  alCerrar,
  children,
  titulo
}) => {
  return (
    <AnimatePresence>
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={alCerrar}
        >
          <motion.div
            className="relative bg-white h-full w-2/3 shadow-lg overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                {titulo && <h2 className="text-xl font-semibold">{titulo}</h2>}
                <button
                  onClick={alCerrar}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Renderizar los children aquí */}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;