import pool from './db';
import { RowDataPacket } from 'mysql2';
import { Publication } from '@/type/typePublicacion';

interface IPublication extends RowDataPacket {
  id_publicacion: number;
  titulo: string;
  autor: string;
  fecha_publicacion: Date;
  // ... otros campos según tu esquema
}

// publicacionesServicio.ts
// publicacionesServicio.ts
export async function fetchRecentPublications(limit: number = 3): Promise<Publication[]> {
    try {
      const [rows] = await pool.query<IPublication[]>(`
        SELECT p.id_publicacion, p.titulo, p.resumen, u.nombre as autor, p.fecha_publicacion, p.imagen_portada
        FROM publicaciones p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.estado = 'publicado' AND p.eliminado = 0
        ORDER BY p.fecha_publicacion DESC
        LIMIT ?
      `, [limit]);
      return rows as Publication[]; // Convertimos el resultado a Publication[]
    } catch (error) {
      console.error('Error fetching recent publications:', error);
      throw new Error('Failed to fetch recent publications');
    }
  }
  
  
  
/*
export async function fetchPublicationById(id: number): Promise<IPublication | null> {
  try {
    const [rows] = await pool.query<IPublication[]>(`
      SELECT p.*, u.nombre as autor
      FROM publicaciones p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_publicacion = ? AND p.eliminado = 0
    `, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching publication by ID:', error);
    throw new Error('Failed to fetch publication');
  }
}

export async function createPublication(publicationData: Omit<IPublication, 'id_publicacion'>): Promise<number> {
  try {
    const [result] = await pool.query(`
      INSERT INTO publicaciones SET ?
    `, [publicationData]);
    return (result as any).insertId;
  } catch (error) {
    console.error('Error creating publication:', error);
    throw new Error('Failed to create publication');
  }
}
*/
// ... otras funciones relacionadas con publicaciones