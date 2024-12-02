'use client';

interface PropiedadesEstadisticas {
  totalPublicaciones: number;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}

export function Estadisticas({
  totalPublicaciones,
  fechaCreacion,
  ultimoAcceso
}: PropiedadesEstadisticas) {
  return (
    <section 
      id="estadisticas" 
      className="bg-white p-6 rounded-lg shadow-lg transition-all transform hover:shadow-xl"
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Estadísticas
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700 font-semibold">
            Publicaciones: {totalPublicaciones}
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-semibold">
            Miembro desde: {new Date(fechaCreacion).toLocaleDateString()}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-700 font-semibold">
            Último acceso: {ultimoAcceso 
              ? new Date(ultimoAcceso).toLocaleDateString()
              : 'N/A'
            }
          </p>
        </div>
      </div>
    </section>
  );
} 