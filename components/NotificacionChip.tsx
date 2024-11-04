

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NotificacionChipProps {
  tipo: "excepcion" | "confirmacion" | "notificacion";
  titulo: string;
  contenido: string;
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

const NotificacionChip = ({ tipo, titulo, contenido }: NotificacionChipProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reproduce el sonido correspondiente al tipo de notificación
    const audio = new Audio(sonidos[tipo]);
    audio.play();

    // Cierra el toast automáticamente después de 4 segundos
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [tipo]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed right-4 bottom-4 p-4 rounded-lg shadow-lg flex items-start space-x-3 ${colores[tipo]}`}
        >
          <div>
            <strong className="block text-lg font-bold">{titulo}</strong>
            <p>{contenido}</p>
          </div>
          <button onClick={() => setVisible(false)} className="ml-auto">
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificacionChip;
