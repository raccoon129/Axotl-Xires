/**
 * Utilidades para el ajuste y renderizado de texto en el canvas
 * Proporciona funciones para calcular dimensiones y dibujar texto con estilos
 */

import { ElementoTexto } from '../typesGeneradorPortada';
import { Dimensiones } from './transformaciones';

/**
 * Dibuja texto en el canvas con las propiedades especificadas
 * Incluye soporte para fondos, rotación y alineación
 */
export const dibujarTexto = (
  elemento: ElementoTexto,
  contexto: CanvasRenderingContext2D,
  dimensiones: Dimensiones
) => {
  const { ancho, alto } = dimensiones;
  
  // No dibujar si no hay texto
  if (!elemento.texto) return;
  
  // Configurar estilos de texto
  contexto.font = `${elemento.tamano}px ${elemento.fuente || 'sans-serif'}`;
  contexto.fillStyle = elemento.color;
  contexto.textAlign = elemento.alineacion;
  contexto.textBaseline = 'middle'; // Alinear verticalmente al centro
  
  // Calcular posición en píxeles
  const x = (elemento.posicion.x / 100) * ancho;
  const y = (elemento.posicion.y / 100) * alto;
  
  // Guardar el estado actual
  contexto.save();
  
  // Aplicar rotación si es necesario
  if (elemento.rotacion !== 0) {
    contexto.translate(x, y);
    contexto.rotate((elemento.rotacion * Math.PI) / 180);
    contexto.translate(-x, -y);
  }
  
  // Si el fondo está activo, dibujarlo primero
  if (elemento.fondoActivo) {
    // Medir el ancho del texto
    const medidaTexto = contexto.measureText(elemento.texto);
    const anchoTexto = medidaTexto.width;
    // Una mejor aproximación de la altura del texto (varía según la fuente)
    const alturaTexto = elemento.tamano * 0.7; 
    
    // Calcular dimensiones del fondo (con padding)
    const padding = elemento.paddingFondo || 0;
    let xFondo = x;
    const yFondo = y - (alturaTexto / 2) - padding;
    const anchoFondo = anchoTexto + (padding * 2);
    const altoFondo = alturaTexto + (padding * 2);
    
    // Ajustar posición x según la alineación
    if (elemento.alineacion === 'center') {
      xFondo = x - (anchoTexto / 2) - padding;
    } else if (elemento.alineacion === 'right') {
      xFondo = x - anchoTexto - padding;
    } else { // 'left'
      xFondo = x - padding;
    }
    
    // Guardar la opacidad global actual
    const opacidadOriginal = contexto.globalAlpha;
    
    // Aplicar opacidad para el fondo
    contexto.globalAlpha = elemento.opacidadFondo;
    
    // Dibujar el fondo con esquinas redondeadas si es necesario
    contexto.fillStyle = elemento.colorFondo;
    
    if (elemento.bordeRedondeado && elemento.bordeRedondeado > 0) {
      // Dibujar rectángulo con esquinas redondeadas
      const radio = elemento.bordeRedondeado;
      contexto.beginPath();
      contexto.moveTo(xFondo + radio, yFondo);
      contexto.lineTo(xFondo + anchoFondo - radio, yFondo);
      contexto.arcTo(xFondo + anchoFondo, yFondo, xFondo + anchoFondo, yFondo + radio, radio);
      contexto.lineTo(xFondo + anchoFondo, yFondo + altoFondo - radio);
      contexto.arcTo(xFondo + anchoFondo, yFondo + altoFondo, xFondo + anchoFondo - radio, yFondo + altoFondo, radio);
      contexto.lineTo(xFondo + radio, yFondo + altoFondo);
      contexto.arcTo(xFondo, yFondo + altoFondo, xFondo, yFondo + altoFondo - radio, radio);
      contexto.lineTo(xFondo, yFondo + radio);
      contexto.arcTo(xFondo, yFondo, xFondo + radio, yFondo, radio);
      contexto.closePath();
      contexto.fill();
    } else {
      // Dibujar rectángulo normal
      contexto.fillRect(xFondo, yFondo, anchoFondo, altoFondo);
    }
    
    // Restaurar la opacidad original para el texto
    contexto.globalAlpha = opacidadOriginal;
  }
  
  // Dibujar el texto
  contexto.fillStyle = elemento.color;
  contexto.fillText(elemento.texto, x, y);
  
  // Restaurar el estado
  contexto.restore();
};

/**
 * Calcula el tamaño apropiado para el texto según el espacio disponible
 */
export const calcularTamanoTextoAjustado = (
  texto: string,
  anchoDisponible: number,
  altoDisponible: number,
  tamanoMaximo: number = 72
): number => {
  // Implementación básica - se puede mejorar con pruebas
  const longitudTexto = texto.length;
  let tamanoEstimado = Math.min(
    anchoDisponible / (longitudTexto * 0.6),
    altoDisponible / 2,
    tamanoMaximo
  );
  
  return Math.max(12, Math.floor(tamanoEstimado)); // Mínimo 12px
};