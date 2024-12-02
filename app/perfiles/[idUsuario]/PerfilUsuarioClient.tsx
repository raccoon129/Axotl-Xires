// app/perfiles/[idUsuario]/perfilUsuarioClient.tsx
// Este archivo se encarga de cargar el contenido de cada usuario respondiendo a
// una petición de la API, recuperndo su el ID del perfil

"use client";
import { Publicacion } from "@/type/typePublicacion";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import TarjetaPublicacionPerfil from "@/components/publicacion/TarjetaPublicacionPerfil";
import { useRouter } from "next/navigation";
import Head from "next/head";

const PerfilUsuarioClient = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [isLoadingPublicaciones, setIsLoadingPublicaciones] = useState(true);
  const router = useRouter();
  const { idUsuario } = useParams();
  const [fechaFormateada, setFechaFormateada] = useState<string>("");
  const [ultimoAccesoFormateado, setUltimoAccesoFormateado] = useState<string>("");

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

        // Modificamos esta parte para manejar mejor la respuesta
        const datos = await respuesta.json();
        
        if (!respuesta.ok) {
          console.warn("No se pudieron cargar las publicaciones:", datos.mensaje || "Error desconocido");
          setPublicaciones([]);
          return;
        }

        setPublicaciones(datos || []);
      } catch (error) {
        console.warn("Error al cargar las publicaciones:", error);
        setPublicaciones([]); // En caso de error, establecemos un array vacío
      } finally {
        setIsLoadingPublicaciones(false);
      }
    };

    if (idUsuario) {
      cargarPublicaciones();
    }
  }, [idUsuario]);

  //Acá se añade el nombre de la pestaña
  useEffect(() => {
    if (userData?.nombre) {
      // Actualiza el título del documento
      document.title = `Perfil de ${userData.nombre} - Axotl Xires`;
    } else {
      document.title = "Perfil - Axotl Xires";
    }
  }, [userData?.nombre]);

  // Mover la lógica de formateo a un efecto
  useEffect(() => {
    if (userData?.fecha_creacion) {
      const fecha = formatearFecha(userData.fecha_creacion);
      setFechaFormateada(fecha);
    }

    if (userData?.ultimo_acceso) {
      const date = new Date(userData.ultimo_acceso);
      const diferenciaDias = Math.floor(
        (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24)
      );

      let acceso = "";
      if (diferenciaDias === 0) acceso = "Hoy";
      else if (diferenciaDias === 1) acceso = "Ayer";
      else if (diferenciaDias === 2) acceso = "Antes de ayer";
      else acceso = formatearFecha(userData.ultimo_acceso);

      setUltimoAccesoFormateado(acceso);
    }
  }, [userData?.fecha_creacion, userData?.ultimo_acceso]);

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
    if (diferenciaDias === 2) return "Antes de ayer";
    return formatearFecha(fecha);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel lateral - Info del usuario */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 text-center border-b border-gray-100">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>

                {/* Estadísticas */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-center items-center space-x-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                </div>

                {/* Información adicional */}
                <div className="px-6 py-4">
                  <div className="space-y-4 text-center">
                    <div>
                      <Skeleton className="h-3 w-24 mx-auto mb-1" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-24 mx-auto mb-1" />
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Sección de perfil */}
                <div className="p-6 text-center border-b border-gray-100">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${userData?.foto_perfil || 'null'}`}
                      alt="Foto de perfil"
                      width={96}
                      height={96}
                      className="rounded-full shadow-sm object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {userData?.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {userData?.nombramiento}
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-gray-600 text-sm">Publicaciones</span>
                    <span className="text-lg font-bold text-gray-900">
                      {userData?.total_publicaciones || 0}
                    </span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="px-6 py-4">
                  <div className="space-y-2 text-center">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Miembro desde
                      </span>
                      <p className="text-sm text-gray-900 font-medium">
                        {fechaFormateada}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Último acceso
                      </span>
                      <p className="text-sm text-gray-900 font-medium">
                        {ultimoAccesoFormateado}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenido principal - Publicaciones */}
        <div className="lg:w-3/4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Publicaciones</h3>
          <div className="space-y-4">
            {isLoadingPublicaciones ? (
              [...Array(2)].map((_, index) => (
                <TarjetaPublicacionPerfil
                  key={index}
                  publicacion={{} as any}
                  alLeer={() => {}}
                  isLoading={true}
                />
              ))
            ) : publicaciones.length > 0 ? (
              publicaciones.map((publicacion) => (
                <TarjetaPublicacionPerfil
                  key={publicacion.id_publicacion}
                  publicacion={{
                    ...publicacion,
                    autor: userData?.nombre || "Autor",
                    fecha_publicacion: publicacion.fecha_publicacion || "Fecha no disponible",
                  }}
                  alLeer={handleLeerPublicacion}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">
                  Este usuario aún no tiene publicaciones públicas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuarioClient;
