export interface Publication {
    id_publicacion: number;
    titulo: string;
    resumen: string;
    autor: string;
    fecha_publicacion: string | Date | null;
    imagen_portada: string; // URL de la imagen de portada
  }