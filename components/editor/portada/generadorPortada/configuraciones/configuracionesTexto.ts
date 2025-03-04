/**
 * Configuraciones predefinidas de texto para cada estilo de portada
 * Define las propiedades de texto por defecto para título y autor
 */

import { ElementoTexto } from '../typesGeneradorPortada';

type ConfiguracionTextoEstilo = {
  titulo: Partial<ElementoTexto>;
  autor: Partial<ElementoTexto>;
};

export const configuracionesTextoPorEstilo: Record<string, ConfiguracionTextoEstilo> = {
  clasico: {
    titulo: {
      posicion: { x: 50, y: 80 },
      tamano: 48,
      color: '#1a1a1a',
      fuente: 'crimson',
      alineacion: 'center',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 10,
      bordeRedondeado: 8
    },
    autor: {
      posicion: { x: 50, y: 90 },
      tamano: 24,
      color: '#4a4a4a',
      fuente: 'helvetica',
      alineacion: 'center',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 8,
      bordeRedondeado: 4
    }
  },
  moderno: {
    titulo: {
      posicion: { x: 70, y: 45 },
      tamano: 42,
      color: '#ffffff',
      fuente: 'montserrat',
      alineacion: 'right',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#000000',
      opacidadFondo: 0.3,
      paddingFondo: 15,
      bordeRedondeado: 0
    },
    autor: {
      posicion: { x: 70, y: 55 },
      tamano: 24,
      color: '#ffffff',
      fuente: 'helvetica',
      alineacion: 'right',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#000000',
      opacidadFondo: 0.3,
      paddingFondo: 10,
      bordeRedondeado: 0
    }
  },
  academico: {
    titulo: {
      posicion: { x: 50, y: 20 },
      tamano: 36,
      color: '#2c3e50',
      fuente: 'georgia',
      alineacion: 'center',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 10,
      bordeRedondeado: 4
    },
    autor: {
      posicion: { x: 50, y: 85 },
      tamano: 20,
      color: '#34495e',
      fuente: 'helvetica',
      alineacion: 'center',
      rotacion: 0,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 8,
      bordeRedondeado: 4
    }
  }
}; 