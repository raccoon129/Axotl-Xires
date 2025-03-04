/**
 * Punto de entrada para los estilos de portada
 * Exporta todas las funciones de aplicación de estilos y sus tipos
 */

import { ConfiguracionEstilo, ElementoTexto } from '../typesGeneradorPortada';

// Interfaces comunes para los estilos
export interface PropiedadesEstilo {
  contexto: CanvasRenderingContext2D;
  imagen: HTMLImageElement;
  dimensiones: { ancho: number; alto: number };
  posicion: { x: number; y: number };
  escala: number;
  rotacion: number;
  configuracion: ConfiguracionEstilo;
  elementosTexto: ElementoTexto[];
}

// Tipo para identificar los estilos disponibles
export type EstiloPortada = 'clasico' | 'moderno' | 'academico';

// Tipo para las funciones de renderizado de estilos
export type FuncionEstilo = (props: PropiedadesEstilo) => void;

// Importar las implementaciones de los estilos
import { aplicarEstiloClasico } from './estiloClasico';
import { aplicarEstiloModerno } from './estiloModerno';
import { aplicarEstiloAcademico } from './estiloAcademico';

/**
 * Obtiene la función de aplicación de estilo correspondiente
 * @param estilo - Identificador del estilo a aplicar
 * @returns Función que implementa el estilo seleccionado
 */
export const obtenerFuncionEstilo = (estilo: EstiloPortada): FuncionEstilo => {
  switch (estilo) {
    case 'clasico':
      return aplicarEstiloClasico;
    case 'moderno':
      return aplicarEstiloModerno;
    case 'academico':
      return aplicarEstiloAcademico;
    default:
      return aplicarEstiloClasico;
  }
};

// Exportar las implementaciones para uso directo
export {
  aplicarEstiloClasico,
  aplicarEstiloModerno,
  aplicarEstiloAcademico
}; 