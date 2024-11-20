// app/perfiles/mispublicaciones/page.tsx
// Aquí solo se verán las publicaciones correspondientes al usuario en cuestión que podrá administrar
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import TarjetaPublicacion from '@/components/publicacion/TarjetaPublicacion';
import { Publicacion } from '@/type/typePublicacion';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';

export default function PaginaPublicaciones() {
    const enrutador = useRouter();
    const { idUsuario } = useAuth();
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const obtenerPublicaciones = async () => {
            if (!idUsuario) return;

            try {
                const token = localStorage.getItem('token');
                const respuesta = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/usuario/${idUsuario}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!respuesta.ok) {
                    throw new Error('Error al cargar las publicaciones');
                }

                const datos = await respuesta.json();
                setPublicaciones(datos);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            }
        };

        if (idUsuario) {
            obtenerPublicaciones();
        }
    }, [idUsuario]);

    const manejarLectura = (id: number) => {
        enrutador.push(`/publicaciones/${id}`);
    };

    const manejarEdicion = (id: number) => {
        enrutador.push(`/perfiles/mispublicaciones/editar/${id}`);
    };

    const manejarSolicitudBaja = async (id: number) => {
        if (!confirm('¿Está seguro que desea solicitar la baja de esta publicación?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const respuesta = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/${id}/baja`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!respuesta.ok) {
                throw new Error('Error al solicitar la baja');
            }

            setPublicaciones(publicaciones.filter(pub => pub.id_publicacion !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
        }
    };

    return (
        <AuthGuard>
            <div className="container mx-auto px-8 md:px-16 lg:px-24 py-8">
                <h1 className="text-3xl font-bold mb-6">Administrar mis publicaciones</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                {publicaciones.length === 0 ? (
                    <p className="text-gray-600">No tienes publicaciones aún.</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {publicaciones.map(publicacion => (
                            <TarjetaPublicacion
                                key={publicacion.id_publicacion}
                                publicacion={publicacion}
                                alLeer={manejarLectura}
                                alEditar={manejarEdicion}
                                alSolicitarBaja={manejarSolicitudBaja}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}