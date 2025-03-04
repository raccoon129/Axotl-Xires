/**
 * Utilidades para el manejo y ajuste de texto en el canvas
 * Proporciona funciones para dividir texto en múltiples líneas y dibujar texto con fondo
 */

import { ElementoTexto } from '../typesGeneradorPortada';

/**
 * Divide un texto en múltiples líneas según un ancho máximo
 * @param contexto - Contexto del canvas para medir el texto
 * @param texto - Texto a dividir
 * @param anchoMaximo - Ancho máximo permitido para cada línea
 */
export const ajustarTextoMultilinea = (
  contexto: CanvasRenderingContext2D,
  texto: string,
  anchoMaximo: number
): string[] => {
  if (!texto) return [];
  
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let lineaActual = '';

  for (const palabra of palabras) {
    const lineaConPalabra = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    const medidas = contexto.measureText(lineaConPalabra);
    
    if (medidas.width > anchoMaximo && lineaActual) {
      lineas.push(lineaActual);
      lineaActual = palabra;
    } else {
      lineaActual = lineaConPalabra;
    }
  }

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas;
};

/**
 * Dibuja texto con soporte para múltiples líneas y fondo personalizado
 * @param elemento - Elemento de texto a dibujar
 * @param contexto - Contexto del canvas
 * @param dimensiones - Dimensiones del canvas
 */
export const dibujarTexto = (
  elemento: ElementoTexto,
  contexto: CanvasRenderingContext2D,
  dimensiones: { ancho: number; alto: number }
) => {
  if (!elemento.texto) return;
  
  const { ancho, alto } = dimensiones;
  contexto.save();

  // Configuración inicial
  contexto.font = `${elemento.tamano}px ${elemento.fuente === 'crimson' ? 'Crimson Text' : elemento.fuente}`;
  contexto.fillStyle = elemento.color;
  contexto.textAlign = elemento.alineacion;

  // Posicionamiento y rotación
  const posX = (elemento.posicion.x / 100) * ancho;
  const posY = (elemento.posicion.y / 100) * alto;
  contexto.translate(posX, posY);
  contexto.rotate((elemento.rotacion * Math.PI) / 180);

  // Cálculo de dimensiones y líneas
  const anchoMaximo = elemento.id === 'titulo' ? ancho * 0.8 : ancho * 0.6;
  const lineas = ajustarTextoMultilinea(contexto, elemento.texto, anchoMaximo);
  const alturaLinea = elemento.tamano * 1.2;

  // Dibujar fondo si está activo
  if (elemento.fondoActivo) {
    dibujarFondoTexto(contexto, elemento, lineas, alturaLinea);
  }

  // Dibujar líneas de texto
  lineas.forEach((linea, indice) => {
    const yOffset = (indice - (lineas.length - 1) / 2) * alturaLinea;
    contexto.fillText(linea, 0, yOffset);
  });

  contexto.restore();
};

/**
 * Dibuja el fondo del texto con soporte para bordes redondeados
 */
const dibujarFondoTexto = (
  contexto: CanvasRenderingContext2D,
  elemento: ElementoTexto,
  lineas: string[],
  alturaLinea: number
) => {
  // Implementación del dibujo del fondo...
}; 