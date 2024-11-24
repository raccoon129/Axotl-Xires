import { Publicacion } from '@/type/typePublicacion';
import { TarjetaVerticalPublicacion } from '@/components/publicacion/TarjetaVerticalPublicacion';
import { Banner } from '@/app/home/banner';

// Función para obtener las publicaciones recientes
async function fetchRecentPublications(): Promise<Publicacion[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/recientes`,
      { next: { revalidate: 3600 } } // Revalidar cada hora
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener publicaciones');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
}

export default async function Home() {
  const recentPublications = await fetchRecentPublications();

  return (
    <div className="w-full mx-0 px-0">
      <Banner />

      {/* Sección de publicaciones */}
      <div className="container mx-auto px-10 py-8">
        <h2 className="text-2xl font-semibold mb-6">Publicaciones Recientes</h2>
        
        {recentPublications.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay publicaciones disponibles en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPublications.map((publicacion) => (
              <TarjetaVerticalPublicacion
                key={publicacion.id_publicacion}
                publicacion={publicacion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
