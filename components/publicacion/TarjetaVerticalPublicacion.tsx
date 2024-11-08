import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Publicacion } from '@/type/typePublicacion';

interface PropsTarjetaVertical {
  publicacion: Publicacion;
  formatearFecha?: (fecha: string | Date | null) => string;
  className?: string;
}

export const TarjetaVerticalPublicacion = ({ 
  publicacion, 
  formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    if (typeof fecha === 'string') {
      return new Date(fecha).toLocaleDateString();
    }
    return fecha.toLocaleDateString();
  },
  className = ""
}: PropsTarjetaVertical) => {
  return (
    <Card className={`overflow-hidden transition-all duration-500 ease-in-out max-h-72 hover:max-h-[500px] hover:shadow-lg ${className}`}>
      <div className="relative w-full h-48 overflow-hidden transition-all duration-500 ease-in-out hover:h-80">
        <img
          src={publicacion.imagen_portada || '/imagen-por-defecto.jpg'}
          alt={publicacion.titulo}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{publicacion.titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{publicacion.resumen}</p>
        <p className="text-sm text-gray-600 mb-2">Por: {publicacion.autor}</p>
        <p className="text-sm text-gray-500">
          Publicado el: {formatearFecha(publicacion.fecha_publicacion)}
        </p>
      </CardContent>
    </Card>
  );
}; 