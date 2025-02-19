//app/perfiles/mispublicaciones/editar/[idPublicacion]/page.tsx
// Página para editar publicaciones existentes
// Importante: Aquí siempre tenemos un idPublicacion válido y borradorGuardado = true

"use client";

import { AuthGuard } from "@/components/autenticacion/AuthGuard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { ModalGeneradorPortada } from '@/components/editor/portada/ModalGeneradorPortada';
import { DetallesPublicacion } from "@/components/redactar/DetallesPublicacion";
import { SeccionPortada } from "@/components/redactar/SeleccionPortada";
import { ContenidoPublicacion } from "@/components/redactar/ContenidoPublicacion";
import { Referencias } from "@/components/redactar/Referencias";
import { TipoPublicacion, BorradorResponse } from "@/type/tipoPublicacion";
import LoaderAxotl from "@/components/global/LoaderAxotl";
import BotonEnviarParaRevision from '@/components/redactar/BotonEnviarParaRevision';

const EditarPublicacionContenido = () => {
  // Inicializamos borradorGuardado como true porque ya existe la publicación
  const params = useParams();
  const idPublicacion = params.idPublicacion as string;
  const { isLoggedIn, userProfile, idUsuario } = useAuth();
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

  // Nuevo estado para controlar el acceso
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Como estamos en la página de edición, el borrador ya existe
  const [borradorGuardado, setBorradorGuardado] = useState(true); // Inicializado en true porque ya existe el borrador

  useEffect(() => {
          // 1. Verifica que la publicación existe
      // 2. Verifica que el usuario tiene permiso para editarla
      // 3. Carga los datos de la publicación
      // Ejemplo de respuesta:
      // {
      //   "datos": {
      //     "titulo": "Mi publicación",
      //     "contenido": "<p>Texto con <img src='...'></p>",
      //     "id_usuario": "123",
      //     "estado": "borrador"
      //   }
      // }
    const verificarAcceso = async () => {
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

        const datos = await respuesta.json();

        if (!respuesta.ok || datos.mensaje === "Publicación no encontrada") {
          setAccesoPermitido(false);
          setMensajeError("La publicación no existe");
          return;
        }

        const publicacion = datos.datos;

        // Verificar si el usuario es propietario y si es borrador
        if (publicacion.id_usuario !== idUsuario) {
          setAccesoPermitido(false);
          setMensajeError("No tienes permiso para editar esta publicación");
          return;
        }

        if (publicacion.estado !== "borrador") {
          setAccesoPermitido(false);
          setMensajeError("Solo se pueden editar publicaciones en estado borrador");
          return;
        }

        setAccesoPermitido(true);
        // Cargar los datos de la publicación
        setNombrePublicacion(publicacion.titulo);
        setResumenPublicacion(publicacion.resumen);
        setEditorContent(publicacion.contenido);
        setReferencias(publicacion.referencias);
        setTipoSeleccionado(publicacion.id_tipo);
        setBorradorGuardado(true); // Aseguramos que se establece como true

        // Manejar la imagen de portada
        if (publicacion.imagen_portada) {
          const urlPortada = `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${publicacion.imagen_portada}`;
          setVistaPrevia(urlPortada);
        }

      } catch (error) {
        console.error('Error:', error);
        setAccesoPermitido(false);
        setMensajeError("Error al cargar la publicación");
      }
    };

    if (idPublicacion && idUsuario) {
      verificarAcceso();
    }
  }, [idPublicacion, idUsuario]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await obtenerTiposPublicacion();
    };

    if (accesoPermitido) {
      cargarDatosIniciales();
    }
  }, [accesoPermitido]);

  // Añadir efecto para el título dinámico
  useEffect(() => {
    document.title = nombrePublicacion 
      ? `Editando: ${nombrePublicacion} - Axotl Xires`
      : 'Editando publicación - Axotl Xires';
  }, [nombrePublicacion]);

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

      const formData = new FormData();
      formData.append("id_publicacion", idPublicacion);
      formData.append("titulo", nombrePublicacion);
      formData.append("resumen", resumenPublicacion);
      formData.append("contenido", editorContent);
      formData.append("referencias", referencias);
      formData.append("id_tipo", tipoSeleccionado.toString());

      // Manejar la imagen de portada
      if (vistaPrevia) {
        // Si es una nueva imagen en base64 del generador de portadas
        if (vistaPrevia.startsWith('data:image/png;base64,')) {
          const response = await fetch(vistaPrevia);
          const blob = await response.blob();
          const imageFile = new File([blob], 'portada.png', { type: 'image/png' });
          formData.append("imagen_portada", imageFile);
        }
        // Si es un archivo subido directamente
        else if (portada instanceof File) {
          formData.append("imagen_portada", portada);
        }
        // Si es una URL del servidor, no enviamos la imagen pues no ha cambiado
        else if (!vistaPrevia.startsWith(process.env.NEXT_PUBLIC_PORTADAS_URL!)) {
          const response = await fetch(vistaPrevia);
          const blob = await response.blob();
          const imageFile = new File([blob], 'portada.png', { type: 'image/png' });
          formData.append("imagen_portada", imageFile);
        }
      }

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/borrador`,
        {
          method: "POST",
          headers: { 
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.mensaje || "Error al actualizar el borrador");
      }

      const data = await respuesta.json();
      
      // Actualizar la vista previa si hay una nueva imagen
      if (data.datos.imagen_portada) {
        const urlPortada = `${process.env.NEXT_PUBLIC_PORTADAS_URL}/${data.datos.imagen_portada}`;
        setVistaPrevia(urlPortada);
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

  // Función para verificar si todos los campos están completos
  const camposCompletos = (): boolean => {
    return Boolean(
      nombrePublicacion.trim() &&
      resumenPublicacion.trim() &&
      editorContent.trim() &&
      tipoSeleccionado &&
      referencias.trim()
    );
  };

  // Función para enviar a revisión
  const enviarParaRevision = async () => {
    try {
      if (!camposCompletos()) {
        setTipoNotificacion("excepcion");
        setMensajeGuardado("Todos los campos son obligatorios, incluyendo las fuentes de consulta");
        return { exito: false };
      }

      const formData = new FormData();
      formData.append('id_publicacion', idPublicacion as string);
      formData.append('titulo', nombrePublicacion.trim());
      formData.append('resumen', resumenPublicacion.trim());
      formData.append('contenido', editorContent.trim());
      formData.append('referencias', referencias.trim());
      formData.append('id_tipo', tipoSeleccionado.toString());

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

  // Renderizado condicional basado en el estado de acceso
  if (accesoPermitido === null) {
    return <LoaderAxotl />;
  }

  if (accesoPermitido === false) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg 
              className="mx-auto h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {mensajeError}
          </p>
          <div className="text-center">
            <button
              onClick={() => enrutador.push('/perfiles/mispublicaciones')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a Mis Publicaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado normal del editor si el acceso está permitido
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
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
                onCrearPortadaClick={() => setMostrarModal(true)}
                userProfile={userProfile}
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
                idPublicacion={parseInt(idPublicacion as string)} // Convertimos el ID a número
                borradorGuardado={borradorGuardado} // Pasamos el estado
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

        <ModalGeneradorPortada
          estaAbierto={mostrarModal}
          alCerrar={() => setMostrarModal(false)}
          titulo={nombrePublicacion}
          autor={userProfile?.userName || ""}
          onGuardar={manejarGuardadoPortada}
          dimensiones={dimensionesPortada}
        />

        {/* Botón Enviar para revisión */}
        <div className="flex justify-end gap-4 mt-6 px-4 md:px-0">
          <BotonEnviarParaRevision
            idBorradorActual={parseInt(idPublicacion as string)}
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

const EditarPublicacionPage = () => {
  return (
    <AuthGuard>
      <EditarPublicacionContenido />
    </AuthGuard>
  );
};

export default EditarPublicacionPage;