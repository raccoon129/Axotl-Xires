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
import NotificacionChip from '@/components/global/genericos/NotificacionChip';

export default function PaginaPublicaciones() {
    const enrutador = useRouter();
    const { idUsuario } = useAuth();
    const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sinPublicaciones, setSinPublicaciones] = useState<boolean>(false);
    const [filtroActual, setFiltroActual] = useState<string>('todos');
    const [notificaciones, setNotificaciones] = useState<Array<{
        id: number;
        tipo: "excepcion" | "confirmacion" | "notificacion";
        titulo: string;
        contenido: string;
    }>>([]);

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
            setSinPublicaciones(false);
            setError(null);

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

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    if (respuesta.status === 404) {
                        setSinPublicaciones(true);
                        setPublicaciones([]);
                        return;
                    }
                    throw new Error('Error al cargar las publicaciones');
                }

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

        setTimeout(() => {
            setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
        }, 5000);
    };

    const manejarSolicitudBaja = async (id: number) => {
        const publicacionEliminada = publicaciones.find(pub => pub.id_publicacion === id);
        setPublicaciones(publicaciones.filter(pub => pub.id_publicacion !== id));
        
        agregarNotificacion({
            tipo: "confirmacion",
            titulo: "Publicación dada de baja",
            contenido: `La publicación "${publicacionEliminada?.titulo}" ha sido dada de baja exitosamente`
        });
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
                
                {!sinPublicaciones && (
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
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {sinPublicaciones ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                ¡Aún no tienes publicaciones!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Este es el momento perfecto para compartir tu primer artículo o investigación con la comunidad.
                            </p>
                            <button
                                onClick={() => enrutador.push('/redactar')}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full transition-colors"
                            >
                                Crear mi primera publicación
                            </button>
                        </div>
                    </motion.div>
                ) : (
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
                )}

                {notificaciones.map((notificacion) => (
                    <NotificacionChip
                        key={notificacion.id}
                        tipo={notificacion.tipo}
                        titulo={notificacion.titulo}
                        contenido={notificacion.contenido}
                    />
                ))}
            </div>
        </AuthGuard>
    );
}