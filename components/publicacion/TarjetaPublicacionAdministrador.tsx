'use client';

import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publicacion } from '@/type/typePublicacion';
import { BookOpen, Edit, AlertCircle, Lock, Unlock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NotificacionChip from '@/components/global/NotificacionChip';

interface PropsTarjetaPublicacion {
    publicacion?: Publicacion;
    alLeer: (id: number) => void;
    alEditar: (id: number) => void;
    alSolicitarBaja: (id: number) => void;
    isLoading?: boolean;
    onPrivacidadCambiada?: (idPublicacion: number, nuevoEstado: number) => void;
}

const TarjetaPublicacion: FC<PropsTarjetaPublicacion> = ({
    publicacion,
    alLeer,
    alEditar,
    alSolicitarBaja,
    isLoading = false,
    onPrivacidadCambiada
}) => {
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [mostrarDialogo, setMostrarDialogo] = useState(false);
    const [actualizandoPrivacidad, setActualizandoPrivacidad] = useState(false);
    const [notificaciones, setNotificaciones] = useState<Array<{
        id: number;
        tipo: "excepcion" | "confirmacion" | "notificacion";
        titulo: string;
        contenido: string;
    }>>([]);

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

    const obtenerUrlPortada = (nombreImagen: string | undefined | null) => {
        if (!nombreImagen) return `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`;
        return `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${nombreImagen}`;
    };

    const irALectura = () => {
        router.push(`/publicaciones/${publicacion?.id_publicacion}`);
    };

    const agregarNotificacion = (notificacion: {
        tipo: "excepcion" | "confirmacion" | "notificacion";
        titulo: string;
        contenido: string;
    }) => {
        const nuevaNotificacion = {
            id: Date.now(),
            ...notificacion
        };
        setNotificaciones(prev => [...prev, nuevaNotificacion]);

        // Remover la notificación después de 3 segundos
        setTimeout(() => {
            setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
        }, 5000);
    };

    const togglePrivacidad = async () => {
        if (!publicacion || publicacion.estado !== 'publicado') return;
        
        try {
            setActualizandoPrivacidad(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/${publicacion.id_publicacion}/privacidad`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                agregarNotificacion({
                    tipo: "confirmacion",
                    titulo: "Privacidad actualizada",
                    contenido: `La publicación ahora es ${data.datos.es_privada ? 'privada' : 'pública'}`
                });
                
                if (onPrivacidadCambiada) {
                    onPrivacidadCambiada(publicacion.id_publicacion, data.datos.es_privada);
                }
            } else {
                throw new Error(data.mensaje || 'Error al actualizar la privacidad');
            }
        } catch (error) {
            agregarNotificacion({
                tipo: "excepcion",
                titulo: "Error",
                contenido: "No se pudo actualizar la privacidad de la publicación"
            });
        } finally {
            setActualizandoPrivacidad(false);
            setMostrarDialogo(false);
        }
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
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48 h-64 flex-shrink-0 relative"> 
                        {!imageLoaded && (
                            <Skeleton className="w-full h-full absolute top-0 left-0" />
                        )}
                        <img
                            src={obtenerUrlPortada(publicacion?.imagen_portada)}
                            alt={publicacion?.titulo}
                            className="w-full h-full object-cover rounded-md shadow-sm transition-opacity duration-300"
                            style={{ opacity: imageLoaded ? 1 : 0 }}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                        />
                    </div>

                    <div className="flex flex-col flex-grow justify-between space-y-4 md:space-y-0">
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                                {publicacion?.titulo}
                            </h2>
                            <p className="text-gray-600 line-clamp-3 text-sm">
                                {publicacion?.resumen}
                            </p>
                            {publicacion?.estado && (
                                <span className={`inline-block px-3 py-1 rounded-full text-sm ${obtenerColorEstado(publicacion.estado)}`}>
                                    {formatearEstado(publicacion.estado)}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                variant="outline" 
                                onClick={irALectura}
                                className="flex items-center gap-2 bg-white hover:bg-gray-50 w-full sm:w-auto"
                            >
                                <BookOpen className="w-4 h-4" />
                                Leer
                            </Button>
                            
                            {publicacion?.estado && puedeEditar(publicacion.estado) && (
                                <Button 
                                    variant="outline"
                                    onClick={() => alEditar(publicacion!.id_publicacion)}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 w-full sm:w-auto"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Button>
                            )}
                            
                            <Button 
                                variant="destructive"
                                onClick={() => alSolicitarBaja(publicacion!.id_publicacion)}
                                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 w-full sm:w-auto"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Solicitar Baja
                            </Button>
                            
                            {publicacion?.estado === 'publicado' && (
                                <Button
                                    variant="outline"
                                    onClick={() => setMostrarDialogo(true)}
                                    disabled={actualizandoPrivacidad}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 w-full sm:w-auto"
                                >
                                    {publicacion.es_privada === 1 ? (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Privada
                                        </>
                                    ) : (
                                        <>
                                            <Unlock className="w-4 h-4" />
                                            Pública
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <AlertDialog open={mostrarDialogo} onOpenChange={setMostrarDialogo}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {publicacion?.es_privada ? 
                                    "¿Hacer pública esta publicación?" : 
                                    "¿Hacer privada esta publicación?"
                                }
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {publicacion?.es_privada ?
                                    "Al hacer pública la publicación, todos los usuarios podrán verla." :
                                    "Al hacer privada la publicación, solo tú podrás verla."
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={togglePrivacidad}>
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {notificaciones.map((notificacion) => (
                    <NotificacionChip
                        key={notificacion.id}
                        tipo={notificacion.tipo}
                        titulo={notificacion.titulo}
                        contenido={notificacion.contenido}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default TarjetaPublicacion;