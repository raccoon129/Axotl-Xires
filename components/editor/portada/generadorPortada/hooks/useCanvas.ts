/**
 * Hook personalizado para manejar las operaciones del canvas
 * Proporciona funciones para dibujar, transformar y gestionar el estado del canvas
 */

import { useRef, useEffect, useState } from 'react';
import { ElementoTexto } from '../typesGeneradorPortada';

interface PropiedadesCanvas {
  ancho: number;
  alto: number;
  onContextoListo?: (contexto: CanvasRenderingContext2D) => void;
}

export const useCanvas = ({ ancho, alto, onContextoListo }: PropiedadesCanvas) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contexto, setContexto] = useState<CanvasRenderingContext2D | null>(null);

  // Inicializar el canvas
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        setContexto(ctx);
        onContextoListo?.(ctx);
      }
    }
  }, [onContextoListo]);

  /**
   * Limpia el canvas y lo prepara para un nuevo dibujo
   */
  const limpiarCanvas = () => {
    if (contexto && canvasRef.current) {
      contexto.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  /**
   * Dibuja una imagen en el canvas con las transformaciones especificadas
   */
  const dibujarImagen = (
    imagen: HTMLImageElement,
    posicion: { x: number; y: number },
    escala: number,
    rotacion: number
  ) => {
    if (!contexto || !canvasRef.current) return;

    contexto.save();
    // Implementación del dibujo de la imagen...
    contexto.restore();
  };

  return {
    canvasRef,
    contexto,
    limpiarCanvas,
    dibujarImagen
  };
}; 