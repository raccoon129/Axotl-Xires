export interface Publicacion {
  id_publicacion: number;
  titulo: string;
  resumen: string;
  contenido: string;
  referencias: string;
  fecha_publicacion: string;
  imagen_portada: string | null;
  id_tipo: number;
  id_usuario: number;
  autor: string;
  autor_foto?: string | null;
  tipo_publicacion: string;
  total_favoritos: number;
  total_comentarios: number;
  estado: 'borrador' | 'en_revision' | 'publicado' | 'rechazado';
  es_privada: number;
}