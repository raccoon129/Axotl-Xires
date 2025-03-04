/**
 * Utilidades para transformaciones de imágenes en el canvas
 * Proporciona funciones para escalar, rotar y posicionar imágenes
 */

interface Dimensiones {
  ancho: number;
  alto: number;
}

interface Posicion {
  x: number;
  y: number;
}

/**
 * Calcula la escala inicial óptima para ajustar una imagen al canvas
 */
export const calcularEscalaInicial = (
  dimensionesImagen: Dimensiones,
  dimensionesCanvas: Dimensiones
): number => {
  const escalaAncho = dimensionesCanvas.ancho / dimensionesImagen.ancho;
  const escalaAlto = dimensionesCanvas.alto / dimensionesImagen.alto;
  return Math.min(escalaAncho, escalaAlto);
};

/**
 * Aplica transformaciones a una imagen en el canvas
 */
export const aplicarTransformaciones = (
  contexto: CanvasRenderingContext2D,
  imagen: HTMLImageElement,
  posicion: Posicion,
  escala: number,
  rotacion: number,
  dimensionesCanvas: Dimensiones
) => {
  const { ancho, alto } = dimensionesCanvas;
  
  // Guardar el estado actual del contexto
  contexto.save();
  
  // Aplicar transformaciones desde el centro
  contexto.translate(ancho / 2, alto / 2);
  contexto.rotate((rotacion * Math.PI) / 180);
  contexto.scale(escala, escala);
  
  // Calcular posición relativa desde el centro
  const x = (posicion.x - 50) * (ancho / 100);
  const y = (posicion.y - 50) * (alto / 100);
  
  // Dibujar la imagen centrada
  contexto.drawImage(
    imagen,
    -imagen.width / 2 + x,
    -imagen.height / 2 + y,
    imagen.width,
    imagen.height
  );
  
  // Restaurar el estado del contexto
  contexto.restore();
}; 