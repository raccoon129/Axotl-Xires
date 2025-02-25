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
import { X } from "lucide-react";

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

const NotificacionChip = ({ 
  tipo, 
  titulo, 
  contenido, 
  onClose,
  duracion = 3000 
}: NotificacionChipProps) => {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed right-4 bottom-4 p-4 rounded-lg shadow-lg flex items-start space-x-3 ${colores[tipo]} z-50`}
        >
          <div>
            <strong className="block text-lg font-bold">{titulo}</strong>
            <p>{contenido}</p>
          </div>
          <button 
            onClick={handleClose} 
            className="ml-auto hover:bg-black/10 rounded-full p-1 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificacionChip;
