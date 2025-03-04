/**
 * Implementación del estilo académico para la portada
 * Caracterizado por un diseño formal con marco y disposición centrada
 */

import { ConfiguracionEstilo, ElementoTexto } from '../typesGeneradorPortada';
import { aplicarTransformaciones } from '../utilidades/transformaciones';
import { dibujarTexto } from '../utilidades/ajusteTexto';

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
 * Aplica el estilo académico a la portada
 */
export const aplicarEstiloAcademico = ({
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

  // Fondo blanco
  contexto.fillStyle = configuracion.colorSecundario;
  contexto.fillRect(0, 0, ancho, alto);

  // Dibujar marco decorativo
  const margen = ancho * 0.1;
  contexto.strokeStyle = configuracion.colorPrimario;
  contexto.lineWidth = 2;
  contexto.strokeRect(margen, margen, ancho - margen * 2, alto - margen * 2);

  // Área de imagen
  const areaImagenY = alto * 0.3;
  const areaImagenAltura = alto * 0.4;

  // Crear área de recorte para la imagen
  contexto.save();
  contexto.beginPath();
  contexto.rect(margen * 1.5, areaImagenY, ancho - margen * 3, areaImagenAltura);
  contexto.clip();

  // Dibujar imagen con transformaciones
  const centroX = ancho / 2;
  const centroY = areaImagenY + areaImagenAltura / 2;
  
  contexto.translate(centroX, centroY);
  contexto.rotate((rotacion * Math.PI) / 180);
  contexto.scale(escala, escala);

  const x = (posicion.x - 50) * (ancho / 100);
  const y = (posicion.y - 50) * (alto / 100);
  
  contexto.drawImage(
    imagen,
    -imagen.width / 2 + x,
    -imagen.height / 2 + y,
    imagen.width,
    imagen.height
  );
  
  contexto.restore();

  // Dibujar elementos de texto
  elementosTexto.forEach(elemento => {
    dibujarTexto(elemento, contexto, dimensiones);
  });
}; 