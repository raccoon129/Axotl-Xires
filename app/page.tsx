import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRecentPublications } from '@/services/publicacionesServicio';
import { Publication } from '@/type/typePublicacion';

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

// Componente principal Home
export default async function Home() {
  let recentPublications: Publication[] = [];
  let error: string | undefined;

  try {
    recentPublications = await fetchRecentPublications(3);
  } catch (e) {
    console.error('Error fetching publications:', e);
    error = 'Failed to load publications. Please try again later.';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bienvenido a Axotl Publicaciones</h1>
      <p className="text-xl text-center mb-12">Descubre las publicaciones científicas y académicas más relevantes del momento, por la comunidad y para la comunidad.</p>

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
  );
}
