// components/GeneradorPortada.tsx
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

interface PropiedadesGenerador {
  tituloPublicacion: string;
  nombreAutor: string;
  alGuardar: (imagenPortada: string) => void;
}

const GeneradorPortada: React.FC<PropiedadesGenerador> = ({
  tituloPublicacion,
  nombreAutor,
  alGuardar,
}) => {
  const [imagenPortada, setImagenPortada] = useState<string | null>(null);
  const [tituloPersonalizado, setTituloPersonalizado] =
    useState(tituloPublicacion);
  const [autorPersonalizado, setAutorPersonalizado] = useState(nombreAutor);
  const [tamanoFuente, setTamanoFuente] = useState(70);
  const portadaRef = useRef<HTMLDivElement>(null);

  // Dimensiones base (tamaño carta)
  const ANCHO_BASE = 612;
  const ALTO_BASE = 792;

  // Dimensiones para el editor (1.5x)
  const ANCHO_EDITOR = 918;
  const ALTO_EDITOR = 1188;

  const validarYEstablecerImagen = (archivo: File) => {
    if (archivo && archivo.type.startsWith("image/")) {
      if (archivo.size > 3 * 1024 * 1024) {
        alert("La imagen no debe superar los 3MB");
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width >= ANCHO_BASE) {
          const lector = new FileReader();
          lector.onloadend = () => setImagenPortada(lector.result as string);
          lector.readAsDataURL(archivo);
        } else {
          alert(`La imagen debe tener al menos ${ANCHO_BASE}px de ancho`);
        }
      };
      img.src = URL.createObjectURL(archivo);
    }
  };

  const manejarSoltarImagen = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const archivo = e.dataTransfer.files[0];
    validarYEstablecerImagen(archivo);
  };

  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) validarYEstablecerImagen(archivo);
  };

  const ajustarTamanoFuente = () => {
    if (portadaRef.current) {
      const contenedor = portadaRef.current.querySelector(".contenedor-titulo");
      const titulo = portadaRef.current.querySelector(".titulo-publicacion");
      if (contenedor && titulo) {
        const anchoContenedor = (contenedor as HTMLElement).offsetWidth;
        const anchoTitulo = (titulo as HTMLElement).offsetWidth;
        if (anchoTitulo > anchoContenedor) {
          setTamanoFuente((prev) => prev - 1);
        }
      }
    }
  };

  useEffect(() => {
    ajustarTamanoFuente();
  }, [tituloPersonalizado]);

  const generarPortada = async () => {
    if (portadaRef.current) {
      const escala = 2; // Factor de escala para mejor calidad

      const canvas = await html2canvas(portadaRef.current, {
        scale: escala,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: ANCHO_EDITOR,
        height: ALTO_EDITOR,
        imageTimeout: 0,
      });

      // Canvas temporal para el tamaño final
      const canvasTemporal = document.createElement("canvas");
      canvasTemporal.width = ANCHO_EDITOR;
      canvasTemporal.height = ALTO_EDITOR;
      const ctx = canvasTemporal.getContext("2d");

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, ANCHO_EDITOR, ALTO_EDITOR);

        const imagenFinal = canvasTemporal.toDataURL("image/png", 1.0);
        alGuardar(imagenFinal);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-h-full overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-700 mb-1">
        Imagen de la portada
      </h2>
      <div className="flex gap-6">
        <div className="w-1/2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[400px] flex items-center justify-center cursor-pointer"
            onDrop={manejarSoltarImagen}
            onDragOver={(e) => e.preventDefault()}
            onClick={() =>
              document.getElementById("inputImagenPortada")?.click()
            }
          >
            <input
              id="inputImagenPortada"
              type="file"
              accept="image/*"
              onChange={manejarSeleccionImagen}
              className="hidden"
            />
            {!imagenPortada && (
              <span className="text-gray-500 text-center">
                Arrastra una imagen aquí o haz clic para seleccionar
                <br />
                <span className="text-sm text-gray-400">
                  (Mínimo {ANCHO_BASE}px de ancho, máximo 3MB)
                </span>
              </span>
            )}
            {imagenPortada && (
              <span className="text-gray-500 text-center">
                Reemplaza tu imagen arrastrandola aquí o haz clic para
                seleccionar
                <br />
                <span className="text-sm text-gray-400">
                  (Mínimo {ANCHO_BASE}px de ancho, máximo 3MB)
                </span>
              </span>
            )}
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rectifica el título en la portada
              </label>
              <input
                type="text"
                value={tituloPersonalizado}
                onChange={(e) => setTituloPersonalizado(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Autor
              </label>
              <input
                type="text"
                value={autorPersonalizado}
                onChange={(e) => setAutorPersonalizado(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="w-1/2 overflow-hidden">
          <div
            ref={portadaRef}
            className="vista-previa-portada bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
              width: `${ANCHO_EDITOR}px`,
              height: `${ALTO_EDITOR}px`,
              transform: "scale(0.5)",
              transformOrigin: "top left",
            }}
          >
            {imagenPortada ? (
              <>
                <div className="h-2/3 overflow-hidden bg-gray-100">
                  <img
                    src={imagenPortada}
                    alt="Portada"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-1/3 p-8 bg-white contenedor-titulo">
                  <h1
                    className="titulo-publicacion font-bold leading-tight text-2xl"
                    style={{ fontSize: `${tamanoFuente}px` }}
                  >
                    {tituloPersonalizado}
                  </h1>
                  <p className="mt-4 text-lg text-gray-600">
                    {autorPersonalizado}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Vista previa de la portada
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          La imagen se generará en {ANCHO_EDITOR}x{ALTO_EDITOR}px (tamaño carta)
        </div>
        <button
          onClick={generarPortada}
          disabled={!imagenPortada}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          Guardar portada
        </button>
      </div>
    </div>
  );
};

export default GeneradorPortada;
