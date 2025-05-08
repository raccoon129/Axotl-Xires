/**
 * Utilidades para el ajuste y renderizado de texto en el canvas
 * Proporciona funciones para calcular dimensiones y dibujar texto con estilos
 */

import { ElementoTexto } from '../typesGeneradorPortada';
import { Dimensiones } from './transformaciones';

/**
 * Dibuja texto en el canvas con las propiedades especificadas
 * Incluye soporte para fondos, rotación, alineación y ajuste automático con saltos de línea
 */
export const dibujarTexto = (
  elemento: ElementoTexto,
  contexto: CanvasRenderingContext2D,
  dimensiones: Dimensiones
) => {
  const { ancho, alto } = dimensiones;
  
  // No dibujar si no hay texto
  if (!elemento.texto) return;
  
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

  // Calcular el ancho máximo disponible según la alineación
  const margen = 20; // margen de seguridad en píxeles
  let anchoMaximo: number;
  
  if (elemento.alineacion === 'center') {
    anchoMaximo = Math.min(x * 2, (ancho - x) * 2) - margen * 2;
  } else if (elemento.alineacion === 'left') {
    anchoMaximo = ancho - x - margen;
  } else { // 'right'
    anchoMaximo = x - margen;
  }
  
  // Ajustar tamaño de fuente y calcular líneas
  let tamanoFuente = elemento.tamano;
  let lineas: string[] = [];
  
  // Intentar ajustar hasta un tamaño mínimo razonable
  do {
    contexto.font = `${tamanoFuente}px ${elemento.fuente || 'sans-serif'}`;
    lineas = dividirTextoEnLineas(elemento.texto, contexto, anchoMaximo);
    
    const alturaLinea = tamanoFuente * 1.2; // Factor de interlineado
    const alturaTotal = lineas.length * alturaLinea;
    const alturaMaxima = alto * 0.3; // Máximo 30% del alto del canvas
    
    // Si el texto cabe o llegamos al tamaño mínimo, salir
    if (alturaTotal <= alturaMaxima || tamanoFuente <= 12) break;
    
    // Reducir tamaño gradualmente
    tamanoFuente = Math.max(12, tamanoFuente - 2);
    
  } while (tamanoFuente > 12);
  
  // Configurar estilos de texto finales
  contexto.font = `${tamanoFuente}px ${elemento.fuente || 'sans-serif'}`;
  contexto.fillStyle = elemento.color;
  contexto.textAlign = elemento.alineacion;
  contexto.textBaseline = 'middle';
  
  // Calcular altura total del bloque de texto
  const alturaLinea = tamanoFuente * 1.2;
  const alturaTextoTotal = lineas.length * alturaLinea;
  
  // Dibujar fondo si está activo
  if (elemento.fondoActivo) {
    const padding = elemento.paddingFondo || 0;
    
    // Medir el ancho máximo de todas las líneas
    let anchoMaximoTexto = 0;
    lineas.forEach(linea => {
      const medida = contexto.measureText(linea);
      anchoMaximoTexto = Math.max(anchoMaximoTexto, medida.width);
    });
    
    // Calcular posición del fondo según alineación
    let xFondo = x;
    if (elemento.alineacion === 'center') {
      xFondo = x - (anchoMaximoTexto / 2) - padding;
    } else if (elemento.alineacion === 'right') {
      xFondo = x - anchoMaximoTexto - padding;
    } else { // 'left'
      xFondo = x - padding;
    }
    
    const yFondo = y - (alturaTextoTotal / 2) - padding;
    const anchoFondo = anchoMaximoTexto + (padding * 2);
    const altoFondo = alturaTextoTotal + (padding * 2);
    
    // Guardar opacidad y dibujar fondo
    const opacidadOriginal = contexto.globalAlpha;
    contexto.globalAlpha = elemento.opacidadFondo;
    contexto.fillStyle = elemento.colorFondo;
    
    // Dibujar con bordes redondeados si corresponde
    if (elemento.bordeRedondeado && elemento.bordeRedondeado > 0) {
      dibujarRectanguloRedondeado(
        contexto, 
        xFondo, 
        yFondo, 
        anchoFondo, 
        altoFondo, 
        elemento.bordeRedondeado
      );
    } else {
      contexto.fillRect(xFondo, yFondo, anchoFondo, altoFondo);
    }
    
    contexto.globalAlpha = opacidadOriginal;
  }
  
  // Dibujar cada línea de texto
  contexto.fillStyle = elemento.color;
  const yInicial = y - (alturaTextoTotal / 2) + (alturaLinea / 2);
  
  lineas.forEach((linea, indice) => {
    contexto.fillText(linea, x, yInicial + (indice * alturaLinea));
  });
  
  // Restaurar el estado
  contexto.restore();
};

/**
 * Divide un texto en líneas que se ajustan al ancho máximo
 */
const dividirTextoEnLineas = (
  texto: string,
  contexto: CanvasRenderingContext2D,
  anchoMaximo: number
): string[] => {
  // Si el texto cabe en una línea, devolverlo directamente
  if (contexto.measureText(texto).width <= anchoMaximo) {
    return [texto];
  }
  
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let lineaActual = '';
  
  for (const palabra of palabras) {
    const lineaConPalabra = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    
    if (contexto.measureText(lineaConPalabra).width <= anchoMaximo) {
      lineaActual = lineaConPalabra;
    } else {
      // Si la línea actual tiene contenido, guardarla
      if (lineaActual) {
        lineas.push(lineaActual);
        lineaActual = palabra;
      } else {
        // La palabra sola es demasiado larga, dividirla por caracteres
        let palabraTemp = '';
        for (const caracter of palabra) {
          const prueba = palabraTemp + caracter;
          if (contexto.measureText(prueba).width <= anchoMaximo) {
            palabraTemp = prueba;
          } else {
            lineas.push(palabraTemp);
            palabraTemp = caracter;
          }
        }
        lineaActual = palabraTemp;
      }
    }
  }
  
  // Añadir la última línea
  if (lineaActual) {
    lineas.push(lineaActual);
  }
  
  return lineas;
};

/**
 * Dibuja un rectángulo con esquinas redondeadas
 */
const dibujarRectanguloRedondeado = (
  contexto: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  radio: number
) => {
  contexto.beginPath();
  contexto.moveTo(x + radio, y);
  contexto.lineTo(x + ancho - radio, y);
  contexto.arcTo(x + ancho, y, x + ancho, y + radio, radio);
  contexto.lineTo(x + ancho, y + alto - radio);
  contexto.arcTo(x + ancho, y + alto, x + ancho - radio, y + alto, radio);
  contexto.lineTo(x + radio, y + alto);
  contexto.arcTo(x, y + alto, x, y + alto - radio, radio);
  contexto.lineTo(x, y + radio);
  contexto.arcTo(x, y, x + radio, y, radio);
  contexto.closePath();
  contexto.fill();
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