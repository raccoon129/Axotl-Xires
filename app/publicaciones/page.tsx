"use client";


import { useState } from "react";
import NotificacionChip from "@/components/NotificacionChip";

const PaginaEjemplo = () => {
  const [notificacion, setNotificacion] = useState<{
    tipo: "excepcion" | "confirmacion" | "notificacion";
    titulo: string;
    contenido: string;
  } | null>(null);

  // Función para mostrar la notificación
  const mostrarNotificacion = (
    tipo: "excepcion" | "confirmacion" | "notificacion",
    titulo: string,
    contenido: string
  ) => {
    setNotificacion({ tipo, titulo, contenido });
  };

  // Función para cerrar la notificación
  const cerrarNotificacion = () => {
    setNotificacion(null);
  };

  return (
    <div>
      <button
        onClick={() =>
          mostrarNotificacion(
            "notificacion",
            "Éxito",
            "La operación se completó con éxito"
          )
        }
        className="btn-primary"
      >
        Mostrar Notificación de Confirmación
      </button>

      {notificacion && (
        <NotificacionChip
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          contenido={notificacion.contenido}

        />
      )}
    </div>
  );
};

export default PaginaEjemplo;
