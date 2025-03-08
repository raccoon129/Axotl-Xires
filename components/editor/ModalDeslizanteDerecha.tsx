// components/Modal.tsx
import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ModalDeslizanteDerecha - Componente para mostrar un panel lateral deslizante
 * 
 * Características:
 * 1. Se desliza desde la derecha de la pantalla
 * 2. Bloquea el scroll del contenido detrás del modal
 * 3. No se cierra al hacer clic fuera del modal (previene cierres accidentales)
 * 4. Solo se cierra con el botón explícito de cerrar
 */
interface ModalProps {
  estaAbierto: boolean;        // Controla si el modal está visible
  alCerrar: () => void;        // Función para cerrar el modal
  titulo?: string;             // Título mostrado en la cabecera del modal
  autor?: string;              // Información del autor (si aplica)
  onGuardar?: (imagenPortada: string) => void; // Callback para guardar la portada
  dimensiones?: { ancho: number; alto: number }; // Dimensiones para el contenido
  children?: ReactNode;        // Contenido del modal
}

const Modal: React.FC<ModalProps> = ({
  estaAbierto,
  alCerrar,
  titulo,
  children
}) => {
  // Efecto para bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (estaAbierto) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      
      // Bloquear el scroll y fijar el body en su posición actual
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Mantener la barra de scroll para evitar saltos
    } else {
      // Restaurar el scroll cuando se cierra el modal
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      
      // Volver a la posición original del scroll
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      // Limpiar los estilos al desmontar el componente
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [estaAbierto]);

  return (
    <AnimatePresence>
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Eliminamos el onClick para evitar cierres accidentales
        >
          <motion.div
            className="relative bg-white h-full w-full sm:w-4/5 md:w-3/4 lg:w-2/3 shadow-lg overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            <div className="sticky top-0 bg-white z-10 px-3 py-2 md:px-6 md:py-4 border-b">
              <div className="flex justify-between items-center">
                {titulo && <h2 className="text-lg md:text-xl font-semibold">{titulo}</h2>}
                <button
                  onClick={alCerrar}
                  className="text-gray-500 hover:text-gray-700 transition p-1 md:p-2 rounded-full hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-2 md:p-6 overflow-hidden h-[calc(100%-4rem)]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;