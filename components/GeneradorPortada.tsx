// components/GeneradorPortada.tsx
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

interface PropiedadesGenerador {
  tituloPublicacion: string;
  nombreAutor: string;
  alGuardar: (imagenPortada: string) => void;
  dimensiones?: { ancho: number; alto: number }; // Hacemos las dimensiones opcionales
}

const GeneradorPortada: React.FC<PropiedadesGenerador> = ({
  tituloPublicacion,
  nombreAutor,
  alGuardar,
  dimensiones = { ancho: 612, alto: 792 }, // Valor por defecto si no se proporcionan dimensiones
}) => {
  const [imagenPortada, setImagenPortada] = useState<string | null>(null);
  const [tituloPersonalizado, setTituloPersonalizado] = useState(tituloPublicacion);
  const [autorPersonalizado, setAutorPersonalizado] = useState(nombreAutor);
  const [tamanoFuente, setTamanoFuente] = useState(70);
  const portadaRef = useRef<HTMLDivElement>(null);

  // Factor de escala para la vista previa
  const FACTOR_ESCALA = 0.8;

  // Usar las dimensiones proporcionadas
  const ANCHO_BASE = dimensiones.ancho;
  const ALTO_BASE = dimensiones.alto;

  // Dimensiones calculadas para el editor
  const ANCHO_EDITOR = Math.floor(ANCHO_BASE * FACTOR_ESCALA);
  const ALTO_EDITOR = Math.floor(ALTO_BASE * FACTOR_ESCALA);

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
        width: ANCHO_BASE,  // Usar dimensiones exactas recibidas
        height: ALTO_BASE,
        imageTimeout: 0,
      });

      const imagenFinal = canvas.toDataURL("image/png", 1.0);
      alGuardar(imagenFinal);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex gap-6 h-full">
        <div className="w-1/2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 h-[500px] flex items-center justify-center cursor-pointer"
            onDrop={manejarSoltarImagen}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("inputImagenPortada")?.click()}
          >
            <input
              id="inputImagenPortada"
              type="file"
              accept="image/*"
              onChange={manejarSeleccionImagen}
              className="hidden"
            />
            {!imagenPortada ? (
              <span className="text-gray-500 text-center">
                Arrastra una imagen aquí o haz clic para seleccionar
                <br />
                <span className="text-sm text-gray-400">
                  (Mínimo {ANCHO_BASE}px de ancho, máximo 3MB)
                </span>
              </span>
            ) : (
              <span className="text-gray-500 text-center">
                Reemplaza tu imagen arrastrándola aquí o haz clic para seleccionar
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
                Título en la portada
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

        <div className="w-1/2 flex items-center justify-center bg-gray-50 rounded-lg">
          <div
            ref={portadaRef}
            className="vista-previa-portada bg-white shadow-lg overflow-hidden"
            style={{
              width: `${ANCHO_EDITOR}px`,
              height: `${ALTO_EDITOR}px`,
            }}
          >
            {imagenPortada ? (
              <>
                <div className="h-2/3 overflow-hidden">
                  <img
                    src={imagenPortada}
                    alt="Portada"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="h-1/3 p-8 bg-white contenedor-titulo">
                  <h1
                    className="titulo-publicacion font-bold leading-tight"
                    style={{ fontSize: `${Math.floor(tamanoFuente * FACTOR_ESCALA)}px` }}
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

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          La imagen se generará en {ANCHO_BASE}x{ALTO_BASE}px
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
