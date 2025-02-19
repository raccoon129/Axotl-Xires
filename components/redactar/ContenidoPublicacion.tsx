// components/redactar/ContenidoPublicacion.tsx
import { Save } from "lucide-react";
import NotificacionChip from "@/components/global/NotificacionChip";
import dynamic from "next/dynamic";
import Tooltip from "@/components/global/Tooltip";

const EditorTexto = dynamic(() => import("@/components/editor/EditorTexto"), {
  ssr: false,
});
// Este componente envuelve el editor y maneja la lógica de guardado
// Ahora incluye soporte para gestión de imágenes

interface ContenidoPublicacionProps {
  editorContent: string;
  setEditorContent: (content: string) => void;
  onGuardar: () => void;
  puedeGuardar: boolean;
  guardando: boolean;
  errorGuardado: string | null;
  mensajeGuardado: string | null;
  tipoNotificacion: "confirmacion" | "excepcion" | "notificacion" | null;
  idPublicacion: number | null;  // ID de la publicación (null si es nueva)
  borradorGuardado: boolean;  // Indica si ya existe en la base de datos
}

// Ejemplo de uso:
// <ContenidoPublicacion
//   idPublicacion={66}              // ID real de la publicación
//   borradorGuardado={true}         // Ya existe en la base de datos
//   editorContent="<p>Contenido</p>"
//   // ... otras props
// />
export const ContenidoPublicacion: React.FC<ContenidoPublicacionProps> = ({
  editorContent,
  setEditorContent,
  onGuardar,
  puedeGuardar,
  guardando,
  errorGuardado,
  mensajeGuardado,
  tipoNotificacion,
  idPublicacion,
  borradorGuardado,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          Contenido de la publicación
        </h2>
        <div className="flex items-center gap-2">
          {mensajeGuardado && (
            <span className="text-green-600 text-sm">{mensajeGuardado}</span>
          )}
          <Tooltip message="Guarda tu progreso para continuar más tarde">
            <button
              onClick={onGuardar}
              disabled={!puedeGuardar || guardando}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                puedeGuardar && !guardando
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                puedeGuardar
                  ? "Guardar borrador"
                  : "Complete los campos requeridos para guardar"
              }
            >
              <Save size={20} />
              {guardando ? "Guardando..." : "Guardar borrador"}
            </button>
          </Tooltip>
        </div>
        {mensajeGuardado && tipoNotificacion && (
          <NotificacionChip
            tipo={tipoNotificacion}
            titulo={tipoNotificacion === "confirmacion" ? "Éxito" : "Error"}
            contenido={mensajeGuardado}
          />
        )}
      </div>

      {errorGuardado && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorGuardado}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg">
        <EditorTexto
          onChange={setEditorContent}
          initialContent={editorContent}
          idPublicacion={idPublicacion}
          borradorGuardado={borradorGuardado}
        />
      </div>
    </div>
  );
};