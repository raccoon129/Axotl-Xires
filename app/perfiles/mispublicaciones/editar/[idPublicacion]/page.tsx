//app/perfiles/mispublicaciones/editar/[idPublicacion]/page.tsx

"use client";

import { AuthGuard } from "@/components/autenticacion/AuthGuard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import ModalPortada from "@/components/editor/Modal";
import GeneradorPortada from "@/components/editor/GeneradorPortada";
import { DetallesPublicacion } from "@/components/redactar/DetallesPublicacion";
import { SeccionPortada } from "@/components/redactar/SeleccionPortada";
import { ContenidoPublicacion } from "@/components/redactar/ContenidoPublicacion";
import { Referencias } from "@/components/redactar/Referencias";
import { TipoPublicacion, BorradorResponse } from "@/type/tipoPublicacion";

const EditarPublicacionContenido = () => {
  const params = useParams();
  const idPublicacion = params.idPublicacion as string;
  const { isLoggedIn, userProfile } = useAuth();
  const enrutador = useRouter();

  // Estados principales
  const [nombrePublicacion, setNombrePublicacion] = useState("");
  const [resumenPublicacion, setResumenPublicacion] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [referencias, setReferencias] = useState("");
  const [tiposPublicacion, setTiposPublicacion] = useState<TipoPublicacion[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | "">("");

  // Estados de la portada
  const [portada, setPortada] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dimensionesPortada] = useState({
    ancho: 612,
    alto: 792,
  });

  // Estados para el guardado
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);
  const [tipoNotificacion, setTipoNotificacion] = useState<"confirmacion" | "excepcion" | "notificacion" | null>(null);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await Promise.all([
        obtenerTiposPublicacion(),
        cargarPublicacion()
      ]);
    };

    cargarDatosIniciales();
  }, [idPublicacion]);

  const cargarPublicacion = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/${idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al cargar la publicación');
      }

      const { datos } = await respuesta.json();
      
      setNombrePublicacion(datos.titulo);
      setResumenPublicacion(datos.resumen);
      setEditorContent(datos.contenido);
      setReferencias(datos.referencias);
      setTipoSeleccionado(datos.id_tipo);
      if (datos.imagen_portada) {
        setVistaPrevia(datos.imagen_portada);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorGuardado('Error al cargar la publicación');
    }
  };

  // Funciones auxiliares
  const obtenerTiposPublicacion = async () => {
    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/tipospublicacion`
      );
      const datos = await respuesta.json();
      if (datos.datos) {
        setTiposPublicacion(datos.datos);
      }
    } catch (error) {
      console.error("Error al obtener los tipos de publicación:", error);
    }
  };

  const puedeGuardarBorrador = (): boolean => {
    return Boolean(
      nombrePublicacion.trim() &&
      resumenPublicacion.trim() &&
      tipoSeleccionado &&
      editorContent.trim()
    );
  };

  const manejarGuardadoPortada = (imagenPortada: string) => {
    setVistaPrevia(imagenPortada);
    setMostrarModal(false);
  };

  const manejarCambioPortada = (archivo: File) => {
    setPortada(archivo);
    const lector = new FileReader();
    lector.onloadend = () => setVistaPrevia(lector.result as string);
    lector.readAsDataURL(archivo);
  };

  const guardarBorrador = async () => {
    if (!puedeGuardarBorrador()) {
      setErrorGuardado("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setGuardando(true);
      setErrorGuardado(null);
      setMensajeGuardado(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token de autenticación");

      const datosActualizacion = {
        id_publicacion: idPublicacion,
        titulo: nombrePublicacion,
        resumen: resumenPublicacion,
        contenido: editorContent,
        referencias: referencias,
        id_tipo: tipoSeleccionado
      };

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/borrador`,
        {
          method: "POST",
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datosActualizacion)
        }
      );

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.mensaje || "Error al actualizar el borrador");
      }

      setTipoNotificacion("confirmacion");
      setMensajeGuardado("Borrador actualizado exitosamente");

      setTimeout(() => setMensajeGuardado(null), 6000);
    } catch (error) {
      console.error("Error al actualizar el borrador:", error);
      setTipoNotificacion("excepcion");
      setMensajeGuardado(
        error instanceof Error ? error.message : "Error al actualizar el borrador"
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold text-gray-700 mb-6">
          Editar publicación
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna izquierda - 2 columnas del grid */}
          <div className="lg:col-span-2 space-y-6">
            <motion.section
              className="p-6 bg-white shadow-lg rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DetallesPublicacion
                nombrePublicacion={nombrePublicacion}
                setNombrePublicacion={setNombrePublicacion}
                resumenPublicacion={resumenPublicacion}
                setResumenPublicacion={setResumenPublicacion}
                tipoSeleccionado={tipoSeleccionado}
                setTipoSeleccionado={setTipoSeleccionado}
                tiposPublicacion={tiposPublicacion}
              />
            </motion.section>

            <motion.section
              className="p-6 bg-white shadow-lg rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SeccionPortada
                vistaPrevia={vistaPrevia}
                dimensionesPortada={dimensionesPortada}
                nombrePublicacion={nombrePublicacion}
                onPortadaChange={manejarCambioPortada}
                onModalOpen={() => setMostrarModal(true)}
              />
            </motion.section>
          </div>

          {/* Columna derecha - 3 columnas del grid */}
          <div className="lg:col-span-3 space-y-6">
            <motion.section
              className="p-6 bg-white shadow-lg rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ContenidoPublicacion
                editorContent={editorContent}
                setEditorContent={setEditorContent}
                onGuardar={guardarBorrador}
                puedeGuardar={puedeGuardarBorrador()}
                guardando={guardando}
                errorGuardado={errorGuardado}
                mensajeGuardado={mensajeGuardado}
                tipoNotificacion={tipoNotificacion}
              />
            </motion.section>

            <motion.section
              className="p-6 bg-white shadow-lg rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Referencias
                referencias={referencias}
                setReferencias={setReferencias}
              />
            </motion.section>
          </div>
        </div>

        <ModalPortada
          estaAbierto={mostrarModal}
          alCerrar={() => setMostrarModal(false)}
          titulo="Actualizar portada de la publicación"
          autor={userProfile?.userName || ""}
          onGuardar={manejarGuardadoPortada}
          dimensiones={dimensionesPortada}
        >
          <GeneradorPortada
            tituloPublicacion={nombrePublicacion}
            nombreAutor={userProfile?.userName || ""}
            alGuardar={manejarGuardadoPortada}
            dimensiones={dimensionesPortada}
          />
        </ModalPortada>
      </div>
    </div>
  );
};

const EditarPublicacionPage = () => {
  return (
    <AuthGuard>
      <EditarPublicacionContenido />
    </AuthGuard>
  );
};

export default EditarPublicacionPage;