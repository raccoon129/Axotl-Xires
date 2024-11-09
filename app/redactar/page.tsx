// app/redactar/page.tsx
//RFuncionalidad parcial. Revisar el manejo de imagenes (portada) y el envio de publicaciones finales
//Pendiente añadir previsualizacion del trabajo en progreso

"use client";
import { AuthGuard } from "@/components/autenticacion/AuthGuard";
import { useEffect, useState } from "react";
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

const RedactarContenido = () => {
  
  const { isLoggedIn, userProfile } = useAuth();
  const router = useRouter();

  // Estados principales
  const [nombrePublicacion, setNombrePublicacion] = useState("");
  const [resumenPublicacion, setResumenPublicacion] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [referencias, setReferencias] = useState("");
  const [tiposPublicacion, setTiposPublicacion] = useState<TipoPublicacion[]>(
    []
  );
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
  const [idBorradorActual, setIdBorradorActual] = useState<number | null>(null);
  const [tipoNotificacion, setTipoNotificacion] = useState<
    "confirmacion" | "excepcion" | "notificacion" | null
  >(null);

  // Efecto inicial
  useEffect(() => {
    //  if (!isLoggedIn) {
    //  alert("No hay sesión iniciada");
    // return;
    //}
    obtenerProximoId();
    obtenerTiposPublicacion();
  }, [isLoggedIn]);

  // Funciones auxiliares
  const obtenerTiposPublicacion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/tipospublicacion`
      );
      const data = await response.json();
      if (data.datos) {
        setTiposPublicacion(data.datos);
      }
    } catch (error) {
      console.error("Error al obtener los tipos de publicación:", error);
    }
  };

  const obtenerProximoId = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/proximoid`
      );
      const data = await response.json();
      const proximoId = data.id[0]?.proximo_id;
      setIdBorradorActual(proximoId);
    } catch (error) {
      console.error("Error al obtener el próximo ID de publicación:", error);
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

      if (!idBorradorActual) {
        await obtenerProximoId();
      }

      const formData = new FormData();
      formData.append("titulo", nombrePublicacion);
      formData.append("resumen", resumenPublicacion);
      formData.append("contenido", editorContent);
      formData.append("id_tipo", tipoSeleccionado.toString());
      formData.append("referencias", referencias);

      if (portada) {
        formData.append("imagen_portada", portada);
      }

      if (idBorradorActual) {
        formData.append("id_publicacion", idBorradorActual.toString());
      } else {
        throw new Error(
          "El ID de la publicación es obligatorio para guardar o actualizar un borrador."
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/borrador`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al guardar el borrador");
      }

      const data: BorradorResponse = await response.json();

      setTipoNotificacion("confirmacion");
      setMensajeGuardado("Borrador guardado exitosamente");

      setTimeout(() => setMensajeGuardado(null), 6000);
    } catch (error) {
      console.error("Error al guardar el borrador:", error);

      setTipoNotificacion("excepcion");
      setMensajeGuardado(
        error instanceof Error ? error.message : "Error al guardar el borrador"
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-semibold text-gray-700 mb-6">
          Redactar una nueva publicación
        </h1>

        {/* Sección de detalles de la publicación */}
        <motion.section
          className="p-6 mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Detalles de la publicación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetallesPublicacion
              nombrePublicacion={nombrePublicacion}
              setNombrePublicacion={setNombrePublicacion}
              resumenPublicacion={resumenPublicacion}
              setResumenPublicacion={setResumenPublicacion}
              tipoSeleccionado={tipoSeleccionado}
              setTipoSeleccionado={setTipoSeleccionado}
              tiposPublicacion={tiposPublicacion}
            />
            <SeccionPortada
              vistaPrevia={vistaPrevia}
              dimensionesPortada={dimensionesPortada}
              nombrePublicacion={nombrePublicacion}
              onPortadaChange={manejarCambioPortada}
              onModalOpen={() => setMostrarModal(true)}
            />
          </div>
        </motion.section>

        {/* Editor de texto */}
        <motion.section
          className="p-6 mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

        {/* Referencias */}
        <motion.section
          className="p-6 mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Referencias
            referencias={referencias}
            setReferencias={setReferencias}
          />
        </motion.section>

        {/* Modal de generación de portada */}
        <ModalPortada
          estaAbierto={mostrarModal}
          alCerrar={() => setMostrarModal(false)}
          titulo="Crear una portada para la publicación"
          autor={userProfile?.userName || ""}
          onGuardar={manejarGuardadoPortada}
          dimensiones={dimensionesPortada}
        >
          <GeneradorPortada
            tituloPublicacion={nombrePublicacion}
            nombreAutor={userProfile?.userName || ""}
            alGuardar={manejarGuardadoPortada}
            //dimensiones={dimensionesPortada}
          />
        </ModalPortada>
      </div>
    </div>
  );
};
// Componente principal envuelto en AuthGuard
const RedactarPage = () => {
  return (
    <AuthGuard>
      <RedactarContenido />
    </AuthGuard>
  );
};
export default RedactarPage;
