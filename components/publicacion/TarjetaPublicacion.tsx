// components/TarjetaPublicacion.tsx
import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publicacion } from '@/type/typePublicacion';
import { BookOpen, Edit, AlertCircle } from 'lucide-react';

interface PropsTarjetaPublicacion {
    publicacion: Publicacion;
    alLeer: (id: number) => void;
    alEditar: (id: number) => void;
    alSolicitarBaja: (id: number) => void;
}

const TarjetaPublicacion: FC<PropsTarjetaPublicacion> = ({
    publicacion,
    alLeer,
    alEditar,
    alSolicitarBaja
}) => {
    const obtenerColorEstado = (estado: Publicacion['estado']) => {
        const colores = {
            borrador: 'bg-gray-200 text-gray-700',
            en_revision: 'bg-yellow-200 text-yellow-700',
            publicado: 'bg-green-200 text-green-700',
            rechazado: 'bg-red-200 text-red-700'
        };
        return colores[estado];
    };

    const formatearEstado = (estado: Publicacion['estado']) => {
        const formatos = {
            borrador: 'Borrador',
            en_revision: 'En Revisión',
            publicado: 'Publicado',
            rechazado: 'Regresado'
        };
        return formatos[estado];
    };

    return (
        <Card className="w-full hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
                <div className="flex flex-row gap-4">
                    {/* Imagen de portada - Dimensiones carta (8.5x11 pulgadas = 215.9x279.4 mm) */}
                    <div className="w-48 h-64 flex-shrink-0"> {/* Proporción aproximada de carta */}
                        <img
                            src={publicacion.imagen_portada || `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`}
                            alt={publicacion.titulo}
                            className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                    </div>

                    {/* Contenido - Ajustado para mejor distribución */}
                    <div className="flex flex-col flex-grow space-y-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                                {publicacion.titulo}
                            </h2>
                            <p className="text-gray-600 mt-2 line-clamp-3 text-sm">
                                {publicacion.resumen}
                            </p>
                        </div>
                        
                        {/* Estado y Acciones - Alineados al fondo */}
                        <div className="mt-auto pt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${obtenerColorEstado(publicacion.estado)} mb-3`}>
                                {formatearEstado(publicacion.estado)}
                            </span>
                            
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => alLeer(publicacion.id_publicacion)}
                                    className="flex items-center gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Leer
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => alEditar(publicacion.id_publicacion)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={() => alSolicitarBaja(publicacion.id_publicacion)}
                                    className="flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Solicitar Baja
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TarjetaPublicacion;