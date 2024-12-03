// app/perfiles/mispublicaciones/page.tsx
// Aquí solo se verán las publicaciones correspondientes al usuario en cuestión que podrá administrar
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import TarjetaPublicacion from '@/components/publicacion/TarjetaPublicacionAdministrador';
import { Publicacion } from '@/type/typePublicacion';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaginaPublicaciones() {
    const enrutador = useRouter();
    const { idUsuario } = useAuth();
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filtroActual, setFiltroActual] = useState<string>('todos');

    // Obtener estados únicos de las publicaciones
    const estadosDisponibles = useMemo(() => {
        const estados = new Set(publicaciones.map(pub => pub.estado));
        return Array.from(estados);
    }, [publicaciones]);

    // Filtrar publicaciones
    const publicacionesFiltradas = useMemo(() => {
        if (filtroActual === 'todos') return publicaciones;
        return publicaciones.filter(pub => pub.estado === filtroActual);
    }, [publicaciones, filtroActual]);

    useEffect(() => {
        // Establecer el título de la página
        document.title = "Mis Publicaciones - Axotl Xires";
        
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

    const obtenerColorBotonFiltro = (estado: string) => {
        const colores = {
            todos: 'bg-blue-500 hover:bg-blue-600',
            borrador: 'bg-gray-500 hover:bg-gray-600',
            en_revision: 'bg-yellow-500 hover:bg-yellow-600',
            publicado: 'bg-green-500 hover:bg-green-600',
            rechazado: 'bg-red-500 hover:bg-red-600'
        };
        return colores[estado as keyof typeof colores] || 'bg-gray-200 hover:bg-gray-300';
    };

    const handlePrivacidadCambiada = (idPublicacion: number, nuevoEstado: number) => {
        setPublicaciones(prevPublicaciones => 
            prevPublicaciones.map(pub => {
                if (pub.id_publicacion === idPublicacion) {
                    return {
                        ...pub,
                        es_privada: nuevoEstado
                    };
                }
                return pub;
            })
        );
    };

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
                <h1 className="text-3xl font-bold mb-6">Administrar mis publicaciones</h1>
                
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltroActual('todos')}
                        className={`px-4 py-2 rounded-full transition-colors ${
                            filtroActual === 'todos' 
                            ? `${obtenerColorBotonFiltro('todos')} text-white` 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                        Todos
                    </button>
                    {estadosDisponibles.map(estado => (
                        <button
                            key={estado}
                            onClick={() => setFiltroActual(estado)}
                            className={`px-4 py-2 rounded-full transition-colors ${
                                filtroActual === estado 
                                ? `${obtenerColorBotonFiltro(estado)} text-white` 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                        >
                            {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={filtroActual}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {publicacionesFiltradas.map((publicacion, index) => (
                            <motion.div
                                key={publicacion.id_publicacion}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ 
                                    y: 0, 
                                    opacity: 1,
                                    transition: { delay: index * 0.1 }
                                }}
                            >
                                <TarjetaPublicacion
                                    publicacion={publicacion}
                                    alLeer={manejarLectura}
                                    alEditar={manejarEdicion}
                                    alSolicitarBaja={manejarSolicitudBaja}
                                    onPrivacidadCambiada={handlePrivacidadCambiada}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AuthGuard>
    );
}