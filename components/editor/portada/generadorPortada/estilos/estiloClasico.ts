/**
 * Implementación del estilo clásico/sencillo para la portada
 * Diseño: 2/3 superiores para imagen, 1/3 inferior para texto sobre fondo blanco
 */

import { ConfiguracionEstilo, ElementoTexto } from '../typesGeneradorPortada';
import { aplicarTransformaciones } from '../utilidades/transformaciones';
import { dibujarTexto } from '../utilidades/ajusteTexto';
import { PropiedadesEstilo } from './index';

/**
 * Aplica el estilo clásico a la portada
 */
export const aplicarEstiloClasico = ({
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
  const alturaImagen = (alto * 2) / 3; // 2/3 del alto total

  // Limpiar el canvas
  contexto.clearRect(0, 0, ancho, alto);

  // Dibujar fondo blanco completo
  contexto.fillStyle = configuracion.colorSecundario;
  contexto.fillRect(0, 0, ancho, alto);

  // Crear área de recorte para la imagen (2/3 superiores)
  contexto.save();
  contexto.beginPath();
  contexto.rect(0, 0, ancho, alturaImagen);
  contexto.clip();

  // Dibujar imagen principal con transformaciones
  aplicarTransformaciones(
    contexto,
    imagen,
    posicion,
    escala,
    rotacion,
    dimensiones
  );

  contexto.restore();

  // Dibujar elementos de texto
  elementosTexto.forEach(elemento => {
    dibujarTexto(elemento, contexto, dimensiones);
  });
};