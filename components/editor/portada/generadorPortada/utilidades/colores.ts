/**
 * Utilidades para el manejo y transformación de colores
 * Proporciona funciones para convertir entre diferentes formatos de color
 */

/**
 * Convierte un color hexadecimal a formato RGB
 */
export const hexARgb = (hex: string): string => {
  // Asegurarse de que el color comience con # y tenga el formato correcto
  const colorHex = hex.startsWith('#') ? hex : `#${hex}`;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Crea un gradiente con opacidad
 */
export const crearGradiente = (
  contexto: CanvasRenderingContext2D,
  colorBase: string,
  opacidad: number,
  inicio: { x: number; y: number },
  fin: { x: number; y: number }
): CanvasGradient => {
  const gradiente = contexto.createLinearGradient(inicio.x, inicio.y, fin.x, fin.y);
  const rgb = hexARgb(colorBase);
  
  gradiente.addColorStop(0, `rgba(${rgb}, 0)`);
  gradiente.addColorStop(1, `rgba(${rgb}, ${opacidad})`);
  
  return gradiente;
};

/**
 * Crea un gradiente con múltiples paradas
 */
export const crearGradienteMultiple = (
  contexto: CanvasRenderingContext2D,
  colorBase: string,
  opacidades: number[],
  posiciones: number[],
  inicio: { x: number; y: number },
  fin: { x: number; y: number }
): CanvasGradient => {
  const gradiente = contexto.createLinearGradient(inicio.x, inicio.y, fin.x, fin.y);
  const rgb = hexARgb(colorBase);
  
  posiciones.forEach((posicion, index) => {
    const opacidad = opacidades[index] || 0;
    gradiente.addColorStop(posicion, `rgba(${rgb}, ${opacidad})`);
  });
  
  return gradiente;
};