import { Metadata } from 'next';
import { Publicacion } from '@/type/typePublicacion';
import { Banner } from '@/components/home/banner';
import { ContenidoHome } from '@/components/home/ContenidoHome';

export const metadata: Metadata = {
  title: 'Inicio - Axotl Xires',
  description: 'Plataforma para la divulgación de artículos científicos y académicos',
};

// Función para obtener las publicaciones recientes
async function obtenerPublicacionesRecientes(): Promise<Publicacion[]> {
  try {
    const respuesta = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/recientes`,
      { next: { revalidate: 3600 } }
    );
    
    if (!respuesta.ok) {
      throw new Error('Error al obtener publicaciones');
    }
    
    const datos = await respuesta.json();
    return datos.slice(0, 9); // Limitar a 9 publicaciones
  } catch (error) {
    console.error('Error al cargar publicaciones:', error);
    return [];
  }
}

export default async function PaginaInicio() {
  const publicacionesRecientes = await obtenerPublicacionesRecientes();

  return (
    <div className="w-full mx-0 px-0">
      <Banner />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContenidoHome publicacionesRecientes={publicacionesRecientes} />
      </div>
    </div>
  );
}
