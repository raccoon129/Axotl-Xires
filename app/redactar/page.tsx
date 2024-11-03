// app/redactar/page.tsx
//Revisar a detalle su comportamiento al momento de guardar borradores junto con su ruta en la API

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import Tooltip from "@/components/Tooltip";
import ModalPortada from "@/components/Modal";
import GeneradorPortada from "@/components/GeneradorPortada";
import { motion } from "framer-motion";
import { Save } from "lucide-react";

// Interfaces
interface TipoPublicacion {
  id_tipo: number;
  nombre: string;
  descripcion: string;
}

interface BorradorData {
  titulo: string;
  resumen: string;
  contenido: string;
  id_tipo: number;
  referencias?: string;
  id_publicacion?: number;
}

interface BorradorResponse {
  mensaje: string;
  datos: {
    id_publicacion: number;
    titulo: string;
    resumen: string;
    contenido: string;
    referencias: string;
    estado: string;
    es_privada: number;
    imagen_portada: string | null;
    id_tipo: number;
  };
}

// Importación dinámica del editor
const EditorTexto = dynamic(() => import("@/components/EditorTexto"), {
  ssr: false,
});

const RedactarPage = () => {
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
  const [dimensionesPortada, setDimensionesPortada] = useState({
    ancho: 612,
    alto: 792,
  });

  // Estados para el guardado
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);
  const [idBorradorActual, setIdBorradorActual] = useState<number | null>(null);

  // Efecto inicial
  useEffect(() => {
    if (!isLoggedIn) {
      alert("No hay sesión iniciada");
      return;
    }

    obtenerTiposPublicacion();
  }, [isLoggedIn]);

  // Función para obtener tipos de publicación
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

  // Validación para guardar borrador
  const puedeGuardarBorrador = (): boolean => {
    return Boolean(
      nombrePublicacion.trim() &&
        resumenPublicacion.trim() &&
        tipoSeleccionado &&
        editorContent.trim()
    );
  };

  // Función para guardar borrador
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
      if (!token) {
        throw new Error("No hay token de autenticación");
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
      setIdBorradorActual(data.datos.id_publicacion);
      setMensajeGuardado("Borrador guardado exitosamente");

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setMensajeGuardado(null);
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el borrador:", error);
      setErrorGuardado(
        error instanceof Error ? error.message : "Error al guardar el borrador"
      );
    } finally {
      setGuardando(false);
    }
  };
  const manejarGuardadoPortada = (imagenPortada: string) => {
    setVistaPrevia(imagenPortada);
    setMostrarModal(false);
    // Aquí puedes implementar la llamada a la API para guardar la imagen
  };
  const validarDimensionesImagen = (archivo: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const imagen = new window.Image();
      imagen.onload = () => {
        const dimensionesValidas =
          (imagen.width === 612 && imagen.height === 792) ||
          (imagen.width === 918 && imagen.height === 1188) ||
          (imagen.width === 1224 && imagen.height === 1584);
        resolve(dimensionesValidas);
      };
      imagen.src = URL.createObjectURL(archivo);
    });
  };

  const validarTamanoArchivo = (archivo: File): boolean => {
    const tamanoMaximo = 3 * 1024 * 1024; // 3MB en bytes
    return archivo.size <= tamanoMaximo;
  };

  const manejarCambioPortada = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const dimensionesCorrectas = await validarDimensionesImagen(archivo);
      const tamanoValido = validarTamanoArchivo(archivo);

      if (!dimensionesCorrectas) {
        alert(
          "La imagen debe tener dimensiones de 612x792, 918x1188 o 1224x1584 píxeles"
        );
        return;
      }

      if (!tamanoValido) {
        alert("El tamaño del archivo no debe superar los 3MB");
        return;
      }

      if (archivo.type === "image/png" || archivo.type === "image/jpeg") {
        setPortada(archivo);
        const lector = new FileReader();
        lector.onloadend = () => setVistaPrevia(lector.result as string);
        lector.readAsDataURL(archivo);
      } else {
        alert("Solo se permiten archivos PNG o JPG");
      }
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
            <div>
              <label className="block font-medium text-gray-600 mb-2">
                Título de la publicación
              </label>
              <Tooltip message="Ingresa un título descriptivo para tu publicación, fácilmente identificable y breve.">
                <input
                  type="text"
                  value={nombrePublicacion}
                  onChange={(e) => setNombrePublicacion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Escribe un título llamativo"
                />
              </Tooltip>

              <label className="block font-medium text-gray-600 mt-4 mb-2">
                Resumen
              </label>
              <textarea
                value={resumenPublicacion}
                onChange={(e) => setResumenPublicacion(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 h-24"
                placeholder="Escribe un breve resumen de tu publicación"
              />

              <label className="block font-medium text-gray-600 mt-4 mb-2">
                Tipo de publicación
              </label>
              <select
                value={tipoSeleccionado}
                onChange={(e) => setTipoSeleccionado(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Selecciona un tipo</option>
                {tiposPublicacion.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre} - {tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>

            {/* Sección de portada */}
            <div className="portada-section">
              <label className="block font-medium text-gray-600 mb-2">
                Portada
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => document.getElementById("inputPortada")?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const archivo = e.dataTransfer.files[0];
                  const input = document.getElementById(
                    "inputPortada"
                  ) as HTMLInputElement;
                  if (input) {
                    input.files = e.dataTransfer.files;
                    manejarCambioPortada({ target: input } as any);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  id="inputPortada"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={manejarCambioPortada}
                  className="hidden"
                />
                {vistaPrevia ? (
                  <Image
                    src={vistaPrevia}
                    alt="Vista previa de portada"
                    width={dimensionesPortada.ancho / 2}
                    height={dimensionesPortada.alto / 2}
                    className="rounded shadow-md"
                  />
                ) : (
                  <>
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </span>
                    <span className="text-sm mt-2 text-gray-400">
                      (Dimensiones admitidas: 612x792, 918x1188 o 1224x1584 px,
                      máx. 3MB)
                    </span>
                  </>
                )}
              </div>
              <label className="mt-4 block font-medium text-gray-600">
                Si no cuentas con una portada, crea una a continuación:
              </label>
              <button
                onClick={() => setMostrarModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!nombrePublicacion}
              >
                Crear portada
              </button>
            </div>
          </div>
        </motion.section>

        {/* Editor de texto */}
        <motion.section
          className="p-6 mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Contenido de la publicación
            </h2>
            <div className="flex items-center gap-2">
              {mensajeGuardado && (
                <span className="text-green-600 text-sm">
                  {mensajeGuardado}
                </span>
              )}
              <button
                onClick={guardarBorrador}
                disabled={!puedeGuardarBorrador() || guardando}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  puedeGuardarBorrador() && !guardando
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  puedeGuardarBorrador()
                    ? "Guardar borrador"
                    : "Complete los campos requeridos para guardar"
                }
              >
                <Save size={20} />
                {guardando ? "Guardando..." : "Guardar borrador"}
              </button>
            </div>
          </div>

          {errorGuardado && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorGuardado}
            </div>
          )}

          <div className="border border-gray-200 rounded-lg">
            <EditorTexto
              onChange={(content) => setEditorContent(content)}
              initialContent={editorContent}
            />
          </div>
        </motion.section>

        {/* Referencias bibliográficas */}
        <motion.section
          className="p-6 mb-8 bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Referencias bibliográficas
          </h2>
          <textarea
            value={referencias}
            onChange={(e) => setReferencias(e.target.value)}
            rows={5}
            placeholder="Ingresa tus referencias aquí"
            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            dimensiones={dimensionesPortada}
          />
        </ModalPortada>
      </div>
    </div>
  );
};
export default RedactarPage;
