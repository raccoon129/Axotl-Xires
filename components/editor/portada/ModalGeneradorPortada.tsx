'use client';

import Modal from '@/components/editor/Modal';
import { GeneradorPortadaAvanzado } from './GeneradorPortadaAvanzado';

interface PropiedadesModalGenerador {
  estaAbierto: boolean;
  alCerrar: () => void;
  titulo: string;
  autor: string;
  onGuardar: (imagenPortada: string) => void;
  dimensiones: {
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