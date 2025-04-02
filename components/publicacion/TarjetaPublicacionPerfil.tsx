'use client';

import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publicacion } from '@/type/typePublicacion';
import { BookOpen, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ModalDetallesPublicacion from './ModalDetallesPublicacion';
import { useRouter } from 'next/navigation';

interface PropsTarjetaPublicacionPerfil {
    publicacion: Publicacion;
    alLeer: (id: number) => void;
    isLoading?: boolean;
}

const TarjetaPublicacionPerfil: FC<PropsTarjetaPublicacionPerfil> = ({
    publicacion,
    alLeer,
    isLoading = false
}) => {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cargandoDetalles, setCargandoDetalles] = useState(false);

    const obtenerDetallesPublicacion = async () => {
        try {
            setCargandoDetalles(true);
            
            const detallesFormateados = {
                id_publicacion: publicacion.id_publicacion,
                titulo: publicacion.titulo,
                resumen: publicacion.resumen,
                autor: publicacion.autor,
                fecha_publicacion: publicacion.fecha_publicacion || "No se ha publicado",
                imagen_portada: publicacion.imagen_portada,
                categoria: 'Artículo científico',
                favoritos: 0
            };

            setModalAbierto(true);
        } catch (error) {
            console.error('Error al mostrar los detalles:', error);
            alert('No se pudieron cargar los detalles de la publicación');
        } finally {
            setCargandoDetalles(false);
        }
    };

    // Función para construir la URL de la portada
    const obtenerUrlPortada = (idPublicacion: number | null) => {
        if (!idPublicacion) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
        return `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${idPublicacion}/portada`;
    };

    const irALectura = () => {
        router.push(`/publicaciones/${publicacion.id_publicacion}`);
    };

    if (isLoading) {
        return (
            <Card className="w-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="w-full sm:w-48 h-64 flex-shrink-0" />
                        <div className="flex flex-col flex-grow justify-between">
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <Skeleton className="h-10 w-full sm:w-32" />
                                <Skeleton className="h-10 w-full sm:w-32" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="w-full hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48 h-64 flex-shrink-0 relative"> 
                            {!imageLoaded && (
                                <Skeleton className="w-full h-full absolute top-0 left-0" />
                            )}
                            <img
                                src={obtenerUrlPortada(publicacion.id_publicacion)}
                                alt={publicacion.titulo}
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
                                    {publicacion.titulo}
                                </h2>
                                <p className="text-gray-600 mt-2 line-clamp-3 text-sm">
                                    {publicacion.resumen}
                                </p>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-gray-500">
                                        Publicado el: {new Date(publicacion.fecha_publicacion).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={irALectura}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span className="whitespace-nowrap">Leer publicación</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={obtenerDetallesPublicacion}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50"
                                >
                                    <Info className="w-4 h-4" />
                                    <span className="whitespace-nowrap">Ver detalles</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {modalAbierto && (
                <ModalDetallesPublicacion
                    estaAbierto={modalAbierto}
                    alCerrar={() => setModalAbierto(false)}
                    publicacion={{
                        id_publicacion: publicacion.id_publicacion,
                        titulo: publicacion.titulo,
                        resumen: publicacion.resumen,
                        autor: publicacion.autor,
                        fecha_publicacion: publicacion.fecha_publicacion || "No se ha publicado",
                        imagen_portada: publicacion.imagen_portada,
                        categoria: 'Artículo científico',
                        favoritos: 0,
                        id_usuario: publicacion.id_usuario // Añadir esta línea
                    }}
                />
            )}
        </>
    );
};

export default TarjetaPublicacionPerfil;