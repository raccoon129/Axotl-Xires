// components/publicacion/TarjetaPublicacion.tsx
import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publicacion } from '@/type/typePublicacion';
import { BookOpen, Edit, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PropsTarjetaPublicacion {
    publicacion?: Publicacion;
    alLeer: (id: number) => void;
    alEditar: (id: number) => void;
    alSolicitarBaja: (id: number) => void;
    isLoading?: boolean;
}

const TarjetaPublicacion: FC<PropsTarjetaPublicacion> = ({
    publicacion,
    alLeer,
    alEditar,
    alSolicitarBaja,
    isLoading = false
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);

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

    const puedeEditar = (estado: Publicacion['estado']) => {
        return estado === 'borrador' || estado === 'rechazado';
    };

    if (isLoading) {
        return (
            <Card className="w-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                    <div className="flex flex-row gap-4">
                        <Skeleton className="w-48 h-64 flex-shrink-0" />
                        <div className="flex flex-col flex-grow justify-between">
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-36" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
                <div className="flex flex-row gap-4">
                    <div className="w-48 h-64 flex-shrink-0 relative"> 
                        {!imageLoaded && (
                            <Skeleton className="w-full h-full absolute top-0 left-0" />
                        )}
                        <img
                            src={publicacion?.imagen_portada || `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`}
                            alt={publicacion?.titulo}
                            className={`w-full h-full object-cover rounded-md shadow-sm transition-opacity duration-300 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                        />
                    </div>

                    <div className="flex flex-col flex-grow justify-between">
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                                {publicacion?.titulo}
                            </h2>
                            <p className="text-gray-600 mt-2 line-clamp-3 text-sm">
                                {publicacion?.resumen}
                            </p>
                            {publicacion?.estado && (
                                <span className={`inline-block px-3 py-1 rounded-full text-sm ${obtenerColorEstado(publicacion.estado)}`}>
                                    {formatearEstado(publicacion.estado)}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => alLeer(publicacion!.id_publicacion)}
                                className="flex items-center gap-2 bg-white hover:bg-gray-50"
                            >
                                <BookOpen className="w-4 h-4" />
                                Leer
                            </Button>
                            
                            {publicacion?.estado && puedeEditar(publicacion.estado) && (
                                <Button 
                                    variant="outline"
                                    onClick={() => alEditar(publicacion!.id_publicacion)}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Button>
                            )}
                            
                            <Button 
                                variant="destructive"
                                onClick={() => alSolicitarBaja(publicacion!.id_publicacion)}
                                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Solicitar Baja
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TarjetaPublicacion;