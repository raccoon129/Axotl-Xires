export interface ElementoTexto {
  id: string;
  texto: string;
  fuente: string;
  tamano: number;
  color: string;
  posicion: { x: number; y: number };
  alineacion: 'left' | 'center' | 'right';
  rotacion: number;
  fondoActivo: boolean;
  colorFondo: string;
  opacidadFondo: number;
  paddingFondo: number;
}

export interface ConfiguracionEstilo {
  colorPrimario: string;
  colorSecundario: string;
  opacidadGradiente: number;
}

export interface Plantilla {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  categoria: string;
  estilo: string;
  elementosTexto: ElementoTexto[];
  configuracion: ConfiguracionEstilo;
} 