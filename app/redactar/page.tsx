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
import BotonEnviarParaRevision from '@/components/redactar/BotonEnviarParaRevision';

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
  const [borradorGuardado, setBorradorGuardado] = useState(false);

  // Efecto inicial
  useEffect(() => {
    //  if (!isLoggedIn) {
    //  alert("No hay sesión iniciada");
    // return;
    //}
    obtenerProximoId();
    obtenerTiposPublicacion();
  }, [isLoggedIn]);

  useEffect(() => {
    document.title = "Redactar Nueva Publicación - Axotl Xires";
  }, []); // Array vacío para que solo se ejecute al montar el componente

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
        const idResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/publicaciones/proximoid`
        );
        const idData = await idResponse.json();
        const proximoId = idData.id[0]?.proximo_id;
        if (!proximoId) throw new Error("No se pudo obtener un ID para el borrador");
        setIdBorradorActual(proximoId);
      }

      const formData = new FormData();
      formData.append("titulo", nombrePublicacion);
      formData.append("resumen", resumenPublicacion);
      formData.append("contenido", editorContent);
      formData.append("id_tipo", tipoSeleccionado.toString());
      formData.append("referencias", referencias);

      // Manejar la imagen de portada
      if (vistaPrevia) {
        if (vistaPrevia.startsWith('data:')) {
          const response = await fetch(vistaPrevia);
          const blob = await response.blob();
          formData.append("imagen_portada", blob, "portada.png");
        } else if (portada instanceof File) {
          formData.append("imagen_portada", portada);
        }
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
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al guardar el borrador");
      }

      const data: BorradorResponse = await response.json();
      setBorradorGuardado(true);
      setTipoNotificacion("confirmacion");
      setMensajeGuardado("Borrador guardado exitosamente");

      // Actualizar la vista previa con la URL completa de la imagen
      if (data.datos.imagen_portada) {
        const urlPortada = `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${data.datos.imagen_portada}`;
        setVistaPrevia(urlPortada);
      }

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

  // Función para manejar la portada generada
  const manejarGuardadoPortada = (imagenPortada: string) => {
    setVistaPrevia(imagenPortada);
    setMostrarModal(false);
  };

  // Función para manejar la portada subida
  const manejarCambioPortada = (archivo: File) => {
    setPortada(archivo);
    const lector = new FileReader();
    lector.onloadend = () => setVistaPrevia(lector.result as string);
    lector.readAsDataURL(archivo);
  };

  // Nueva función para verificar si todos los campos están completos
  const camposCompletos = (): boolean => {
    return Boolean(
      nombrePublicacion.trim() &&
      resumenPublicacion.trim() &&
      editorContent.trim() &&
      tipoSeleccionado &&
      referencias.trim() // Añadimos validación de referencias
    );
  };

  const enviarParaRevision = async () => {
    try {
      if (!camposCompletos()) {
        setTipoNotificacion("excepcion");
        setMensajeGuardado("Todos los campos son obligatorios, incluyendo las fuentes de consulta");
        return { exito: false };
      }

      if (!idBorradorActual) {
        setTipoNotificacion("excepcion");
        setMensajeGuardado("Debes guardar el borrador primero");
        return { exito: false };
      }

      const formData = new FormData();
      formData.append('id_publicacion', idBorradorActual.toString());
      formData.append('titulo', nombrePublicacion.trim());
      formData.append('resumen', resumenPublicacion.trim());
      formData.append('contenido', editorContent.trim());
      formData.append('referencias', referencias.trim());
      formData.append('id_tipo', tipoSeleccionado.toString());

      // Manejar la imagen de portada
      if (vistaPrevia) {
        if (vistaPrevia.startsWith('data:')) {
          const response = await fetch(vistaPrevia);
          const blob = await response.blob();
          formData.append('imagen_portada', blob, 'portada.png');
        } else if (portada instanceof File) {
          formData.append('imagen_portada', portada);
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/nuevapublicacionrevision`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTipoNotificacion("excepcion");
        setMensajeGuardado(data.mensaje || 'Error al enviar para revisión');
        return { exito: false };
      }

      setTipoNotificacion("confirmacion");
      setMensajeGuardado("Publicación enviada a revisión exitosamente");
      return { exito: true };
    } catch (error) {
      setTipoNotificacion("excepcion");
      setMensajeGuardado("Error al enviar la publicación para revisión");
      return { exito: false };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Redactar una nueva publicación
        </h1>

        {/* Sección de detalles de la publicación */}
        <motion.section
          className="p-4 md:p-6 mb-6 md:mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 md:mb-6">
            Detalles de la publicación
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
          className="p-4 md:p-6 mb-6 md:mb-8 bg-white shadow-lg rounded-lg"
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
          className="p-4 md:p-6 mb-6 md:mb-8 bg-white shadow-lg rounded-lg"
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
          />
        </ModalPortada>

        <div className="flex justify-end gap-4 mt-6 px-4 md:px-0">
          <BotonEnviarParaRevision
            idBorradorActual={idBorradorActual}
            onEnviar={enviarParaRevision}
            className="shadow-md w-full md:w-auto"
            habilitado={borradorGuardado}
            camposCompletos={camposCompletos()}
          />
        </div>
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
