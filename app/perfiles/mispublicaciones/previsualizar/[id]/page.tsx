'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';
import { ContenidoPublicacion } from '@/components/publicacion/visualizacion/ContenidoPublicacion';
import { useRouter, useParams } from 'next/navigation';
import { Publicacion } from '@/type/typePublicacion';
import { Skeleton } from '@/components/ui/skeleton';
import BotonMorado from '@/components/global/genericos/BotonMorado';

const obtenerMensajeVistaPrevia = (estado?: string) => {
    const mensajes = {
        borrador: {
            titulo: "Vista Previa de Borrador",
            descripcion: "Esta es una vista previa de tu publicación en borrador"
        },
        en_revision: {
            titulo: "Vista Previa en Revisión",
            descripcion: "Esta es una vista previa de tu publicación que está siendo revisada"
        },
        rechazado: {
            titulo: "Vista Previa de Publicación Regresada",
            descripcion: "Esta es una vista previa de tu publicación que fue regresada para correcciones"
        }
    };
    return mensajes[estado as keyof typeof mensajes] || mensajes.borrador;
};

export default function PrevisualizarPublicacion() {
    const router = useRouter();
    const params = useParams();
    const { isLoggedIn, idUsuario } = useAuth();
    const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const cargarPublicacion = async () => {
            if (!isLoggedIn || !params?.id || !idUsuario) return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/usuario/${idUsuario}/revision/${params.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.mensaje || 'Error al cargar la publicación');
                }

                if (data.status === 'success') {
                    // Verificar el estado de la publicación
                    if (!['borrador', 'en_revision', 'rechazado'].includes(data.datos.estado)) {
                        throw new Error('No tienes permiso para ver esta vista previa');
                    }
                    setPublicacion(data.datos);
                } else {
                    throw new Error(data.mensaje || 'Error al cargar la publicación');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                setTimeout(() => {
                    router.push('/perfiles/mispublicaciones');
                }, 3000);
            } finally {
                setCargando(false);
            }
        };

        cargarPublicacion();
    }, [isLoggedIn, params?.id, idUsuario, router]);

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
                {/* Alerta de vista previa dinámica */}
                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 rounded-full p-2">
                            <svg
                                className="w-5 h-5 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-purple-700 font-medium">
                                {obtenerMensajeVistaPrevia(publicacion?.estado).titulo}
                            </h2>
                            <p className="text-purple-600 text-sm">
                                {obtenerMensajeVistaPrevia(publicacion?.estado).descripcion}
                            </p>
                        </div>
                    </div>
                </div>

                {cargando ? (
                    <div>Cargando...</div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Columna izquierda - Portada */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-24 space-y-6">
                                {/* Portada con skeleton */}
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="aspect-[612/792] relative">
                                        {!imageLoaded && (
                                            <Skeleton className="absolute inset-0 w-full h-full" />
                                        )}
                                        <img
                                            src={publicacion?.imagen_portada ? 
                                                `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}` :
                                                `${process.env.NEXT_PUBLIC_ASSET_URL}/defaultCover.gif`
                                            }
                                            alt={publicacion?.titulo}
                                            className="w-full h-full object-cover transition-opacity duration-300"
                                            style={{ opacity: imageLoaded ? 1 : 0 }}
                                            onLoad={() => setImageLoaded(true)}
                                            onError={() => setImageLoaded(true)}
                                        />
                                    </div>
                                </div>

                                {/* Botón Volver usando BotonMorado */}
                                <BotonMorado
                                    onClick={() => router.back()}
                                    variante="principal"
                                    anchoCompleto
                                >
                                    Regresar
                                </BotonMorado>
                            </div>
                        </div>

                        {/* Columna central - Contenido */}
                        <div className="lg:col-span-9">
                            {publicacion && <ContenidoPublicacion publicacion={publicacion} />}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}