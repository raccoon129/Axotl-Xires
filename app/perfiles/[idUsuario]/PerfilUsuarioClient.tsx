// app/perfiles/[idUsuario]/perfilUsuarioClient.tsx
// Este archivo se encarga de cargar el contenido de cada usuario respondiendo a
// una petición de la API, recuperndo su el ID del perfil

"use client";
import { Publicacion } from '@/type/typePublicacion';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import TarjetaPublicacionPerfil from '@/components/publicacion/TarjetaPublicacionPerfil';
import { useRouter } from 'next/navigation';



const PerfilUsuarioClient = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [isLoadingPublicaciones, setIsLoadingPublicaciones] = useState(true);
  const router = useRouter();
  const { idUsuario } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idUsuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserData(data.datos);
        }
      } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (idUsuario) {
      fetchUserData();
    }
  }, [idUsuario]);

  useEffect(() => {
    const cargarPublicaciones = async () => {
      try {
        setIsLoadingPublicaciones(true);
        const token = localStorage.getItem("token");
        const respuesta = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/usuario/${idUsuario}/publicadas`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error('Error al cargar las publicaciones');
        }

        const datos = await respuesta.json();
        setPublicaciones(datos || []);
      } catch (error) {
        console.error("Error al cargar las publicaciones:", error);
      } finally {
        setIsLoadingPublicaciones(false);
      }
    };

    if (idUsuario) {
      cargarPublicaciones();
    }
  }, [idUsuario]);

  const handleLeerPublicacion = (id: number) => {
    router.push(`/publicaciones/${id}`);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const opciones = {
      year: "numeric",
      month: "long",
      day: "numeric",
    } as const;
    return date.toLocaleDateString("es-ES", opciones);
  };

  const formatearUltimoAcceso = (fecha: string) => {
    const date = new Date(fecha);
    const diferenciaDias = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24)
    );

    if (diferenciaDias === 0) return "Hoy";
    if (diferenciaDias === 1) return "Ayer";
    return formatearFecha(fecha);
  };

  return (
    <div className="flex p-8">
      {/* Columna izquierda */}
      <div className="w-1/3 pr-8">
        {/* Info del perfil */}
        <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Skeleton className="w-[150px] h-[150px] rounded-full mb-4" />
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-4 w-56 mb-2" />
              <Skeleton className="h-4 w-44" />
            </div>
          ) : (
            <>
              <Image
                src={
                  userData?.foto_perfil ||
                  `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`
                }
                alt="Foto de perfil"
                width={150}
                height={150}
                className="rounded-full mx-auto mb-4"
              />

              <h2 className="text-center text-2xl font-semibold">
                {userData?.nombre}
              </h2>
              <p className="text-center text-gray-500">
                {userData?.nombramiento}
              </p>
              <p className="text-center text-sm text-gray-400 mt-2">
                Miembro desde el{" "}
                {userData?.fecha_creacion &&
                  formatearFecha(userData.fecha_creacion)}
              </p>
              <p className="text-center text-sm text-gray-400 mt-2">
                Último acceso:{" "}
                {userData?.ultimo_acceso &&
                  formatearUltimoAcceso(userData.ultimo_acceso)}
              </p>
            </>
          )}
        </div>
        {/* Estadísticas */}
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <p>Publicaciones: {userData?.total_publicaciones || 0}</p>
          )}
        </div>
      </div>
      {/* Columna derecha: Publicaciones */}
      <div className="w-2/3">
        <h3 className="text-2xl font-semibold mb-6">Publicaciones</h3>
        <div className="space-y-6">
          {isLoadingPublicaciones ? (
            // Mostrar skeletons mientras carga
            [...Array(3)].map((_, index) => (
              <TarjetaPublicacionPerfil
                key={index}
                publicacion={{} as any}
                alLeer={() => {}}
                isLoading={true}
              />
            ))
          ) : publicaciones.length > 0 ? (
            // Mostrar las publicaciones
            publicaciones.map((publicacion) => (
              <TarjetaPublicacionPerfil
                key={publicacion.id_publicacion}
                publicacion={{
                  ...publicacion,
                  autor: userData?.nombre || 'Autor',
                  fecha_publicacion: publicacion.fecha_publicacion || publicacion.fecha_creacion,
                  id_usuario: publicacion.id_usuario || 0,
                  id_tipo: publicacion.id_tipo || 0,
                  contenido: publicacion.contenido || '',
                  referencias: publicacion.referencias || '',
                  estado: publicacion.estado || 'borrador',
                  es_privada: publicacion.es_privada || false,
                  eliminado: publicacion.eliminado || false,
                  fecha_eliminacion: publicacion.fecha_eliminacion || null
                }}
                alLeer={handleLeerPublicacion}
              />
            ))
          ) : (
            // Mensaje cuando no hay publicaciones
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Este usuario aún no tiene publicaciones públicas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuarioClient;
