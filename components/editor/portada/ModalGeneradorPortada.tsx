'use client';

import Modal from '@/components/editor/ModalDeslizanteDerecha';
import { GeneradorPortadaAvanzado } from './GeneradorPortadaAvanzado';

/**
 * ModalGeneradorPortada - Componente contenedor que muestra el generador de portadas
 * en un modal deslizante desde la derecha.
 * 
 * Flujo:
 * 1. Se abre cuando el usuario quiere crear una portada
 * 2. Muestra el GeneradorPortadaAvanzado dentro del modal
 * 3. Cuando el usuario guarda, pasa la imagen generada al callback onGuardar
 */
interface PropiedadesModalGenerador {
  estaAbierto: boolean;        // Controla la visibilidad del modal
  alCerrar: () => void;        // Callback para cerrar el modal
  titulo: string;              // Título de la publicación para mostrar en la portada
  autor: string;               // Nombre del autor para mostrar en la portada
  onGuardar: (imagenPortada: string) => void; // Callback que recibe la imagen generada
  dimensiones: {               // Dimensiones de la portada
    ancho: number;
    alto: number;
  };
}

export function ModalGeneradorPortada({
  estaAbierto,
  alCerrar,
  titulo,
  autor,
  onGuardar,
  dimensiones
}: PropiedadesModalGenerador) {
  return (
    <Modal
      estaAbierto={estaAbierto}
      alCerrar={alCerrar}
      titulo="Crear portada para la publicación"
    >
      <div className="h-[calc(100vh-8rem)] w-full">
        <GeneradorPortadaAvanzado
          tituloPublicacion={titulo}
          nombreAutor={autor}
          alGuardar={onGuardar}
        />
      </div>
    </Modal>
  );
} 