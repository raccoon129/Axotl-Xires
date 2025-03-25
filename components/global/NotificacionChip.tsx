//components/NotificacionChip

/*
Invocar como 
      <NotificacionChip 
        tipo="confirmacion" 
        titulo="Éxito" 
        contenido="La operación se completó correctamente." 
      />
*/

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Bell } from "lucide-react";

interface NotificacionChipProps {
  tipo: "excepcion" | "confirmacion" | "notificacion";
  titulo: string;
  contenido: string;
  onClose?: () => void;
  duracion?: number; // Duración en ms (opcional)
}

const assetUrl = process.env.NEXT_PUBLIC_ASSET_URL;

const sonidos = {
  excepcion: `${assetUrl}/sonidos/excepcion.ogg`,
  confirmacion: `${assetUrl}/sonidos/confirmacion.ogg`,
  notificacion: `${assetUrl}/sonidos/notificacion.ogg`,
};

const colores = {
  excepcion: "bg-red-600 text-white",
  confirmacion: "bg-green-600 text-white",
  notificacion: "bg-blue-600 text-white",
};

const iconos = {
  excepcion: <AlertCircle className="w-5 h-5" />,
  confirmacion: <CheckCircle className="w-5 h-5" />,
  notificacion: <Bell className="w-5 h-5" />,
};

// Animaciones personalizadas según el tipo
const animacionesEntrada = {
  excepcion: {
    initial: { x: 300, y: 0, opacity: 0, scale: 0.5, rotate: 5 },
    animate: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 200,
        delay: 0.1
      }
    }
  },
  confirmacion: {
    initial: { y: 100, opacity: 0, scale: 0.8 },
    animate: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 300 
      }
    }
  },
  notificacion: {
    initial: { y: 50, opacity: 0, x: 50 },
    animate: { 
      y: 0, 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "tween", 
        ease: "easeOut", 
        duration: 0.4 
      }
    }
  }
};

const animacionesSalida = {
  excepcion: {
    exit: { 
      x: 300, 
      opacity: 0, 
      scale: 0.5, 
      rotate: -5,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  },
  confirmacion: {
    exit: { 
      y: 100, 
      opacity: 0, 
      scale: 0.5,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  },
  notificacion: {
    exit: { 
      x: 100, 
      opacity: 0,
      y: 20,
      transition: { duration: 0.25, ease: "easeIn" }
    }
  }
};

const NotificacionChip = ({ 
  tipo, 
  titulo, 
  contenido, 
  onClose,
  duracion = 3000 
}: NotificacionChipProps) => {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [animacionPulso, setAnimacionPulso] = useState(false);

  // Efecto para reproducir el sonido cuando se muestra la notificación
  useEffect(() => {
    if (visible) {
      // Crear elemento de audio
      audioRef.current = new Audio(sonidos[tipo]);
      
      // Reproducir sonido
      const playPromise = audioRef.current.play();
      
      // Manejar posibles errores de reproducción (ej. navegadores que bloquean autoplay)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Error al reproducir sonido:", error);
        });
      }
      
      // Iniciar el efecto de pulso para tipos específicos
      if (tipo === "excepcion") {
        const intervalId = setInterval(() => {
          setAnimacionPulso(prev => !prev);
        }, 1000);
        
        return () => clearInterval(intervalId);
      }
    }
    
    // Limpiar el audio al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [tipo, visible]);

  // Efecto para el temporizador de cierre automático
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duracion);
    
    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // Obtener las animaciones según el tipo
  const { initial, animate } = animacionesEntrada[tipo];
  const { exit } = animacionesSalida[tipo];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={initial}
          animate={animate}
          exit={exit}
          className={`fixed right-4 bottom-4 p-4 rounded-lg shadow-xl flex items-start space-x-3 ${colores[tipo]} z-50 backdrop-blur-sm`}
          style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}
        >
          {/* Icono con animación de pulso */}
          <motion.div 
            animate={{
              scale: tipo === "excepcion" && animacionPulso ? 1.2 : 1,
              opacity: tipo === "excepcion" && animacionPulso ? 0.8 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="mt-0.5"
          >
            {iconos[tipo]}
          </motion.div>
          
          <div>
            <motion.strong 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="block text-lg font-bold"
            >
              {titulo}
            </motion.strong>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {contenido}
            </motion.p>
          </div>
          
          <motion.button 
            onClick={handleClose} 
            className="ml-auto hover:bg-black/10 rounded-full p-1 transition-colors"
            aria-label="Cerrar notificación"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificacionChip;
