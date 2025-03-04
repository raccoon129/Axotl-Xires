/**
 * Hook para manejar el historial de acciones en el canvas
 * Permite deshacer cambios y mantener un registro de estados
 */

import { useState } from 'react';

export const useHistorial = (capacidadMaxima: number = 10) => {
  const [historialAcciones, setHistorialAcciones] = useState<string[]>([]);
  const [indiceHistorial, setIndiceHistorial] = useState(-1);

  /**
   * Guarda un nuevo estado en el historial
   */
  const guardarEstado = (estadoBase64: string) => {
    setHistorialAcciones(prev => {
      const nuevosEstados = [...prev.slice(0, indiceHistorial + 1), estadoBase64];
      return nuevosEstados.slice(-capacidadMaxima);
    });
    setIndiceHistorial(prev => Math.min(prev + 1, capacidadMaxima - 1));
  };

  /**
   * Deshace la última acción
   */
  const deshacer = (): string | null => {
    if (indiceHistorial > 0) {
      setIndiceHistorial(prev => prev - 1);
      return historialAcciones[indiceHistorial - 1];
    }
    return null;
  };

  return {
    guardarEstado,
    deshacer,
    puedeDeshacer: indiceHistorial > 0
  };
}; 