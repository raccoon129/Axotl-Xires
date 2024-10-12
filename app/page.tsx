import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  // Simulación de publicaciones recientes
  const recentPublications = [
    { id: 1, title: "Avances en la investigación del cambio climático", author: "Dr. María González", date: "2024-03-15" },
    { id: 2, title: "Nuevas técnicas de aprendizaje automático en la medicina", author: "Prof. Juan Pérez", date: "2024-03-14" },
    { id: 3, title: "El impacto de la inteligencia artificial en la educación superior", author: "Dra. Ana Martínez", date: "2024-03-13" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bienvenido a Axotl Xires Publicaciones</h1>
      <p className="text-xl text-center mb-12">Descubre las últimas publicaciones científicas y académicas</p>

      <h2 className="text-2xl font-semibold mb-6">Publicaciones Recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentPublications.map((pub) => (
          <Card key={pub.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>{pub.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Por: {pub.author}</p>
              <p className="text-sm text-gray-500">Publicado el: {pub.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}