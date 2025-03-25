'use client';

import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publicacion } from '@/type/typePublicacion';
import { Eye, Edit, AlertCircle, Lock, Unlock, BookOpen } from 'lucide-react';
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
import NotificacionChip from '@/components/global/genericos/NotificacionChip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react';

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
    const [mostrarDialogoBaja, setMostrarDialogoBaja] = useState(false);
    const [confirmacionTexto, setConfirmacionTexto] = useState('');
    const [procesandoBaja, setProcesandoBaja] = useState(false);
    const [pasoConfirmacion, setPasoConfirmacion] = useState(1);

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
        if (publicacion?.estado === 'en_revision' || 
            publicacion?.estado === 'borrador' || 
            publicacion?.estado === 'rechazado') {
            router.push(`/perfiles/mispublicaciones/previsualizar/${publicacion.id_publicacion}`);
        } else {
            router.push(`/publicaciones/${publicacion?.id_publicacion}`);
        }
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

    const solicitarBaja = async () => {
        if (confirmacionTexto.toLowerCase() !== 'solicitar') return;
        
        try {
            setProcesandoBaja(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${publicacion?.id_publicacion}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                agregarNotificacion({
                    tipo: "confirmacion",
                    titulo: "Éxito",
                    contenido: data.mensaje
                });
                setMostrarDialogoBaja(false);
                if (publicacion) {
                    alSolicitarBaja(publicacion.id_publicacion);
                }
            } else {
                throw new Error(data.mensaje || 'Error al procesar la solicitud');
            }
        } catch (error) {
            agregarNotificacion({
                tipo: "excepcion",
                titulo: "Error",
                contenido: error instanceof Error ? error.message : 'Error al procesar la solicitud'
            });
        } finally {
            setProcesandoBaja(false);
            setPasoConfirmacion(1);
            setConfirmacionTexto('');
        }
    };

    const cerrarDialogo = () => {
        setMostrarDialogoBaja(false);
        setPasoConfirmacion(1);
        setConfirmacionTexto('');
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

                    <div className="flex flex-col flex-grow justify-between">
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                                {publicacion?.titulo}
                            </h2>
                            <p className="text-gray-600 line-clamp-3 text-sm">
                                {publicacion?.resumen}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                                {publicacion?.estado && (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${obtenerColorEstado(publicacion.estado)}`}>
                                        {formatearEstado(publicacion.estado)}
                                    </span>
                                )}
                                
                                {publicacion?.estado === 'publicado' && (
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${publicacion.es_privada === 1 ? 'bg-gray-400' : 'bg-green-400'}`} />
                                        <span className="text-sm text-gray-600">
                                            {publicacion.es_privada === 1 ? 'Privada' : 'Pública'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={irALectura}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50"
                                >
                                    {publicacion?.estado === 'en_revision' || 
                                     publicacion?.estado === 'borrador' || 
                                     publicacion?.estado === 'rechazado' ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Ver vista previa
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="w-4 h-4" />
                                            Leer
                                        </>
                                    )}
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
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {publicacion?.estado === 'publicado' && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setMostrarDialogo(true)}
                                        disabled={actualizandoPrivacidad}
                                        className="flex items-center gap-2 text-gray-700"
                                    >
                                        {publicacion.es_privada === 1 ? (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                <span className="text-sm">Cambiar a pública</span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-4 h-4" />
                                                <span className="text-sm">Cambiar a privada</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="destructive"
                                    onClick={() => setMostrarDialogoBaja(true)}
                                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Solicitar Baja
                                </Button>
                            </div>
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

                <Dialog open={mostrarDialogoBaja} onOpenChange={cerrarDialogo}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                Solicitar baja de publicación
                            </DialogTitle>
                            <DialogDescription>
                                {pasoConfirmacion === 1 ? (
                                    "Tu publicación dejará de estar visible y no podrás visualizarla o editarla. Esta acción no se puede deshacer. ¿Estás seguro que deseas dar de baja esta publicación?"
                                ) : (
                                    "Para confirmar, escribe 'Solicitar' en el campo de texto"
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        {pasoConfirmacion === 2 && (
                            <div className="my-4">
                                <Label htmlFor="confirmacion">Texto de confirmación:</Label>
                                <Input
                                    id="confirmacion"
                                    value={confirmacionTexto}
                                    onChange={(e) => setConfirmacionTexto(e.target.value)}
                                    placeholder="Escribe 'Solicitar'"
                                    className="mt-2"
                                />
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={cerrarDialogo}
                                disabled={procesandoBaja}
                            >
                                Cancelar
                            </Button>
                            {pasoConfirmacion === 1 ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => setPasoConfirmacion(2)}
                                >
                                    Continuar
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={solicitarBaja}
                                    disabled={confirmacionTexto.toLowerCase() !== 'solicitar' || procesandoBaja}
                                >
                                    {procesandoBaja ? "Procesando..." : "Confirmar baja"}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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