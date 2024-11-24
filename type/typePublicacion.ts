export interface Publicacion {
  id_publicacion: number;
  id_usuario: number;
  id_tipo: number;
  titulo: string;
  resumen: string;
  contenido: string;
  referencias: string;
  estado: 'borrador' | 'en_revision' | 'publicado' | 'rechazado';
  imagen_portada: string;
  es_privada: boolean;
  fecha_creacion: string;
  fecha_publicacion: string | null;
  eliminado: boolean;
  fecha_eliminacion: string | null;
  autor:  string;
  tipo_publicacion: string;
  total_favoritos: number;

  }