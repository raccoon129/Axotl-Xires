import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Publicacion } from '@/type/typePublicacion';

// Función auxiliar para formatear la fecha
function formatDate(date: string | Date | null): string {
  if (!date) {
    return "Fecha no disponible"; // Mensaje si la fecha es NULL o indefinida
  }
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
}

// Función para obtener las publicaciones recientes
async function fetchRecentPublications(limit: number): Promise<Publicacion[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/recientes`);
  if (!response.ok) {
    throw new Error('Failed to fetch publications');
  }
  const data = await response.json();
  return data;
}

// Componente principal Home
export default async function Home() {
  let recentPublications: Publicacion[] = [];
  let error: string | undefined;

  try {
    recentPublications = await fetchRecentPublications(3);
  } catch (e) {
    console.error('Error fetching publications:', e);
    error = 'Failed to load publications. Please try again later.';
  }

  return (
    <div className="w-full mx-0 px-0">
      {/* Sección superior que ocupa toda la pantalla en el eje X */}
      <div className="flex flex-col lg:flex-row items-center bg-[#612C7D] text-white px-8 lg:px-16 mb-8" style={{ height: '300px' }}>
        {/* Columna izquierda: Imagen y subtítulo */}
        <div className="lg:w-1/2 mb-4 lg:mb-0 flex flex-col items-center lg:items-start">
          <img
            src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoBlanco.png`}
            alt="Descripción de la imagen"
            className="w-full h-auto max-w-xs mb-2"
          />
          <p className="text-xs lg:text-sm text-left opacity-80">
            Subtítulo en tamaño pequeño alineado a la izquierda
          </p>
        </div>

        {/* Columna derecha: Título y subtítulo principal */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl font-bold">Bienvenido a Axotl Publicaciones</h1>
          <p className="text-xl mt-4">
            Descubre las publicaciones científicas y académicas más relevantes del momento, por la comunidad y para la comunidad.
          </p>
        </div>
      </div>

      {/* Sección de publicaciones */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Publicaciones Recientes</h2>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPublications.map((pub) => (
              <Card key={pub.id_publicacion} className="overflow-hidden transition-all duration-500 ease-in-out max-h-72 hover:max-h-[500px] hover:shadow-lg">
                <div className="relative w-full h-48 overflow-hidden transition-all duration-500 ease-in-out hover:h-80">
                  <img
                    src={pub.imagen_portada}
                    alt={pub.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{pub.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{pub.resumen}</p>
                  <p className="text-sm text-gray-600 mb-2">Por: {pub.autor}</p>
                  <p className="text-sm text-gray-500">Publicado el: {formatDate(pub.fecha_publicacion)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
