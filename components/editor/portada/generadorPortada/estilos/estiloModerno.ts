/**
 * Implementación del estilo moderno para la portada
 * Diseño: Imagen de fondo completa con franja lateral derecha con gradiente
 * y textos centrados verticalmente
 */

import { ConfiguracionEstilo, ElementoTexto } from '../typesGeneradorPortada';
import { aplicarTransformaciones } from '../utilidades/transformaciones';
import { dibujarTexto } from '../utilidades/ajusteTexto';
import { hexARgb } from '../utilidades/colores';

interface PropiedadesEstilo {
  contexto: CanvasRenderingContext2D;
  imagen: HTMLImageElement;
  dimensiones: { ancho: number; alto: number };
  posicion: { x: number; y: number };
  escala: number;
  rotacion: number;
  configuracion: ConfiguracionEstilo;
  elementosTexto: ElementoTexto[];
}

/**
 * Aplica el estilo moderno a la portada
 */
export const aplicarEstiloModerno = ({
  contexto,
  imagen,
  dimensiones,
  posicion,
  escala,
  rotacion,
  configuracion,
  elementosTexto
}: PropiedadesEstilo) => {
  const { ancho, alto } = dimensiones;

  // Limpiar el canvas
  contexto.clearRect(0, 0, ancho, alto);

  // Dibujar imagen de fondo completa
  aplicarTransformaciones(
    contexto,
    imagen,
    posicion,
    escala,
    rotacion,
    dimensiones
  );

  // Crear franja lateral con gradiente
  const franjaAncho = ancho * (configuracion.anchoFranja || 0.8); // Usar el valor configurado o 80% por defecto
  const inicioGradiente = ancho - franjaAncho;

  // Convertir el color primario a formato RGB
  const colorRGB = hexARgb(configuracion.colorPrimario);

  // Gradiente de transparente a color primario
  const gradiente = contexto.createLinearGradient(inicioGradiente, 0, ancho, 0);
  gradiente.addColorStop(0, `rgba(${colorRGB}, 0)`);
  gradiente.addColorStop(0.3, `rgba(${colorRGB}, ${configuracion.opacidadGradiente})`);
  gradiente.addColorStop(1, `rgba(${colorRGB}, ${configuracion.opacidadGradiente})`);

  // Aplicar gradiente
  contexto.fillStyle = gradiente;
  contexto.fillRect(inicioGradiente, 0, franjaAncho, alto);

  // Ajustar posición y color de los textos
  const elementosAjustados = elementosTexto.map(elemento => {
    if (elemento.id === 'titulo') {
      return {
        ...elemento,
        posicion: { x: 70, y: 45 }, // Título un poco arriba del centro
        color: '#ffffff' // Forzar color blanco
      };
    } else {
      return {
        ...elemento,
        posicion: { x: 70, y: 55 }, // Autor un poco abajo del centro
        color: '#ffffff' // Forzar color blanco
      };
    }
  });

  // Dibujar elementos de texto
  elementosAjustados.forEach(elemento => {
    dibujarTexto(elemento, contexto, dimensiones);
  });
}; 