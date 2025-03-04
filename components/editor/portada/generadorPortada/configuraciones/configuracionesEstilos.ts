/**
 * Configuraciones visuales predefinidas para cada estilo de portada
 * Define colores, opacidades y otros aspectos visuales
 */

import { ConfiguracionEstilo } from '../typesGeneradorPortada';

export interface EstiloPortada {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  configuracionPredeterminada: ConfiguracionEstilo;
}

export const estilosDisponibles: EstiloPortada[] = [
  {
    id: 'clasico',
    nombre: 'Sencillo',
    descripcion: 'Diseño tradicional con imagen superior y texto inferior',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C1.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#1a1a1a',
      colorSecundario: '#ffffff',
      opacidadGradiente: 0.6,
      anchoFranja: 0.4
    }
  },
  {
    id: 'moderno',
    nombre: 'Moderno',
    descripcion: 'Diseño con franja lateral y gradiente sobre la imagen',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C2.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#612c7d',
      colorSecundario: '#ffffff',
      opacidadGradiente: 0.8,
      anchoFranja: 0.8
    }
  },
  {
    id: 'academico',
    nombre: 'Académico',
    descripcion: 'Formato formal con marco y disposición centrada',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C3.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#2c3e50',
      colorSecundario: '#ecf0f1',
      opacidadGradiente: 0.7
    }
  }
];

/**
 * Obtiene la configuración predeterminada para un estilo específico
 */
export const obtenerConfiguracionEstilo = (idEstilo: string): ConfiguracionEstilo => {
  const estilo = estilosDisponibles.find(e => e.id === idEstilo);
  return estilo?.configuracionPredeterminada || estilosDisponibles[0].configuracionPredeterminada;
}; 