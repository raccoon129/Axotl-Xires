//se usa para los componentes en /redactar

export interface TipoPublicacion {
    id_tipo: number;
    nombre: string;
    descripcion: string;
  }
  export interface TipoPublicacion {
    id_tipo: number;
    nombre: string;
    descripcion: string;
  }
  
  export interface BorradorData {
    titulo: string;
    resumen: string;
    contenido: string;
    id_tipo: number;
    referencias?: string;
    id_publicacion?: number;
  }
  
  export interface BorradorResponse {
    mensaje: string;
    datos: {
      id_publicacion: number;
      titulo: string;
      resumen: string;
      contenido: string;
      referencias: string;
      estado: string;
      es_privada: number;
      imagen_portada: string | null;
      id_tipo: number;
    };
  }