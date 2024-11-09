// components/GeneradorPortada.tsx
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { RadioGroup } from '@headlessui/react';

// Agregar tipo para los estilos de portada
type EstiloPortada = 'clasico' | 'moderno';

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
  const [tituloPersonalizado, setTituloPersonalizado] = useState(tituloPublicacion);
  const [autorPersonalizado, setAutorPersonalizado] = useState(nombreAutor);
  const [tamanoFuente, setTamanoFuente] = useState(70);
  const portadaRef = useRef<HTMLDivElement>(null);
  const [estiloSeleccionado, setEstiloSeleccionado] = useState<EstiloPortada>('clasico');

  // Dimensiones fijas para la portada
  const ANCHO_BASE = 612;
  const ALTO_BASE = 792;
  const FACTOR_ESCALA = 0.8;

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
          // Crear un canvas temporal para recortar la imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            let recorteAncho, recorteAlto, x, y;
            
            if (estiloSeleccionado === 'moderno') {
              // Para el estilo moderno, la imagen ocupa la mitad superior sin la franja
              const franjaAncho = ANCHO_BASE * 0.1; // 10% del ancho para la franja
              const anchoDisponible = ANCHO_BASE - franjaAncho;
              const altoDisponible = ALTO_BASE * 0.5; // Mitad de la altura
              
              // Calcular proporciones para el recorte
              const aspectRatio = anchoDisponible / altoDisponible;
              
              if (img.width / img.height > aspectRatio) {
                // La imagen es más ancha proporcionalmente
                recorteAlto = img.height;
                recorteAncho = img.height * aspectRatio;
                x = (img.width - recorteAncho) / 2;
                y = 0;
              } else {
                // La imagen es más alta proporcionalmente
                recorteAncho = img.width;
                recorteAlto = img.width / aspectRatio;
                x = 0;
                y = (img.height - recorteAlto) / 2;
              }

              // Establecer dimensiones del canvas para el estilo moderno
              canvas.width = anchoDisponible;
              canvas.height = altoDisponible;
            } else {
              // Mantener el recorte original para el estilo clásico
              const aspectRatio = ANCHO_BASE / (ALTO_BASE * 0.6667);
              
              if (img.width / img.height > aspectRatio) {
                recorteAlto = img.height;
                recorteAncho = img.height * aspectRatio;
                x = (img.width - recorteAncho) / 2;
                y = 0;
              } else {
                recorteAncho = img.width;
                recorteAlto = img.width / aspectRatio;
                x = 0;
                y = (img.height - recorteAlto) / 2;
              }

              // Establecer dimensiones del canvas para el estilo clásico
              canvas.width = ANCHO_BASE;
              canvas.height = Math.floor(ALTO_BASE * 0.6667);
            }

            // Dibujar la imagen recortada en el canvas
            ctx.drawImage(
              img,
              x, y, recorteAncho, recorteAlto,
              0, 0, canvas.width, canvas.height
            );

            // Convertir el canvas a base64 con alta calidad
            const imagenRecortada = canvas.toDataURL('image/jpeg', 0.95);
            setImagenPortada(imagenRecortada);
          }
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

  const generarPortadaModerna = async () => {
    if (portadaRef.current && imagenPortada) {
      const canvas = document.createElement('canvas');
      canvas.width = ANCHO_BASE;
      canvas.height = ALTO_BASE;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Fondo blanco base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ANCHO_BASE, ALTO_BASE);

        // Franja decorativa lateral con el nuevo color
        const franjaAncho = ANCHO_BASE * 0.1;
        ctx.fillStyle = '#612c7d';
        ctx.fillRect(0, 0, franjaAncho, ALTO_BASE);

        // Cargar y dibujar la imagen
        const imgTemp = new Image();
        imgTemp.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          imgTemp.onload = () => {
            // Ajustar posición y tamaño de la imagen
            const imgX = franjaAncho;
            const imgY = 0;
            const imgAncho = ANCHO_BASE - franjaAncho;
            const imgAlto = ALTO_BASE * 0.5; // La mitad de la altura total

            ctx.drawImage(imgTemp, imgX, imgY, imgAncho, imgAlto);

            // Crear un gradiente más prolongado
            const gradiente = ctx.createLinearGradient(imgX, imgY + (imgAlto * 0.5), imgX, imgY + imgAlto);
            gradiente.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradiente.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
            gradiente.addColorStop(1, 'rgba(255, 255, 255, 1)');
            ctx.fillStyle = gradiente;
            ctx.fillRect(imgX, imgY, imgAncho, imgAlto);

            resolve(null);
          };
          imgTemp.src = imagenPortada;
        });

        // Dibujar título centrado
        ctx.fillStyle = '#1e293b';
        ctx.font = `bold ${tamanoFuente}px 'Helvetica Neue', sans-serif`;
        ctx.textBaseline = 'top';
        
        const maxAnchoTexto = (ANCHO_BASE - franjaAncho) * 0.8;
        const lineasTitulo = dividirTexto(ctx, tituloPersonalizado, maxAnchoTexto);
        const tituloY = ALTO_BASE * 0.6; // Ajustado para estar debajo de la imagen
        
        lineasTitulo.forEach((linea, index) => {
          const medidas = ctx.measureText(linea);
          const x = franjaAncho + ((ANCHO_BASE - franjaAncho) - medidas.width) / 2;
          ctx.fillText(linea, x, tituloY + (index * tamanoFuente * 1.2));
        });

        // Dibujar autor en la parte inferior
        ctx.fillStyle = '#64748b';
        ctx.font = `normal 24px 'Helvetica Neue', sans-serif`;
        const medidaAutor = ctx.measureText(autorPersonalizado);
        const autorX = franjaAncho + ((ANCHO_BASE - franjaAncho) - medidaAutor.width) / 2;
        ctx.fillText(autorPersonalizado, autorX, ALTO_BASE - 50); // 50px desde el fondo

        const imagenFinal = canvas.toDataURL('image/png', 1.0);
        alGuardar(imagenFinal);
      }
    }
  };

  const generarPortada = async () => {
    if (estiloSeleccionado === 'moderno') {
      await generarPortadaModerna();
    } else {
      // Llamar al generador clásico existente
      await generarPortadaClasica();
    }
  };

  // Renombrar el generador original
  const generarPortadaClasica = async () => {
    if (portadaRef.current && imagenPortada) {
      const canvas = document.createElement('canvas');
      canvas.width = ANCHO_BASE;
      canvas.height = ALTO_BASE;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ANCHO_BASE, ALTO_BASE);

        // Cargar y dibujar la imagen (ya recortada)
        const imgTemp = new Image();
        imgTemp.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          imgTemp.onload = () => {
            // La imagen ya está recortada, solo la dibujamos en la parte superior
            ctx.drawImage(imgTemp, 0, 0);
            resolve(null);
          };
          imgTemp.src = imagenPortada;
        });

        // Sección de texto (1/3 inferior)
        const inicioTexto = Math.floor(ALTO_BASE * 0.6667);
        const padding = Math.floor(ANCHO_BASE * 0.05);

        // Fondo blanco para la sección de texto
        ctx.fillStyle = 'white';
        ctx.fillRect(0, inicioTexto, ANCHO_BASE, ALTO_BASE - inicioTexto);

        // Configurar y dibujar título
        ctx.fillStyle = 'black';
        ctx.font = `bold ${tamanoFuente}px sans-serif`;
        ctx.textBaseline = 'top';
        
        const maxAnchoTexto = ANCHO_BASE - (padding * 2);
        const lineasTitulo = dividirTexto(ctx, tituloPersonalizado, maxAnchoTexto);
        lineasTitulo.forEach((linea, index) => {
          ctx.fillText(linea, padding, inicioTexto + padding + (index * tamanoFuente));
        });

        // Dibujar autor
        ctx.fillStyle = '#4B5563';
        ctx.font = '18px sans-serif';
        ctx.fillText(
          autorPersonalizado, 
          padding, 
          ALTO_BASE - padding - 18
        );

        const imagenFinal = canvas.toDataURL('image/png', 1.0);
        alGuardar(imagenFinal);
      }
    }
  };

  // Función auxiliar para dividir el texto en líneas
  const dividirTexto = (ctx: CanvasRenderingContext2D, texto: string, maxAncho: number): string[] => {
    const palabras = texto.split(' ');
    const lineas: string[] = [];
    let lineaActual = '';

    palabras.forEach(palabra => {
      const lineaPrueba = lineaActual + (lineaActual ? ' ' : '') + palabra;
      const medidas = ctx.measureText(lineaPrueba);
      
      if (medidas.width <= maxAncho) {
        lineaActual = lineaPrueba;
      } else {
        lineas.push(lineaActual);
        lineaActual = palabra;
      }
    });
    
    if (lineaActual) {
      lineas.push(lineaActual);
    }

    return lineas.slice(0, 2); // Limitar a 2 líneas
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de estilo */}
      <div className="w-full">
        <RadioGroup value={estiloSeleccionado} onChange={setEstiloSeleccionado}>
          <RadioGroup.Label className="block text-sm font-medium text-gray-700 mb-2">
            Estilo de portada
          </RadioGroup.Label>
          <div className="flex gap-4">
            <RadioGroup.Option value="clasico">
              {({ checked }) => (
                <div className={`
                  p-4 rounded-lg cursor-pointer border-2
                  ${checked ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                `}>
                  <div className="flex items-center">
                    <div className={`
                      w-4 h-4 rounded-full border-2 mr-2
                      ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}
                    `} />
                    <span className="font-medium">Clásico</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Diseño tradicional con imagen superior y texto inferior
                  </p>
                </div>
              )}
            </RadioGroup.Option>
            <RadioGroup.Option value="moderno">
              {({ checked }) => (
                <div className={`
                  p-4 rounded-lg cursor-pointer border-2
                  ${checked ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                `}>
                  <div className="flex items-center">
                    <div className={`
                      w-4 h-4 rounded-full border-2 mr-2
                      ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}
                    `} />
                    <span className="font-medium">Moderno</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Diseño contemporáneo con franja lateral y efectos visuales
                  </p>
                </div>
              )}
            </RadioGroup.Option>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-6">
        {/* Panel izquierdo */}
        <div className="w-1/2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 aspect-[612/792] flex items-center justify-center cursor-pointer"
            style={{
              maxHeight: `${ALTO_EDITOR}px`,
              maxWidth: `${ANCHO_EDITOR}px`,
            }}
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

        {/* Panel derecho - Vista previa */}
        <div className="w-1/2 flex items-center justify-center bg-gray-50 rounded-lg">
          <div
            ref={portadaRef}
            className="vista-previa-portada bg-white shadow-lg relative"
            style={{
              width: `${ANCHO_EDITOR}px`,
              height: `${ALTO_EDITOR}px`,
              aspectRatio: '612/792',
              overflow: 'hidden',
            }}
          >
            {imagenPortada ? (
              estiloSeleccionado === 'moderno' ? (
                <div className="relative h-full bg-white">
                  <div className="absolute left-0 top-0 h-full w-[10%] bg-[#612c7d]" />
                  <div className="absolute left-[10%] top-0 right-0 h-1/2">
                    <img
                      src={imagenPortada}
                      alt="Portada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"
                         style={{
                           background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.9) 85%, white 100%)'
                         }}
                    />
                  </div>
                  <div className="absolute top-[60%] left-[10%] right-0 px-8 text-center">
                    <h1 className="text-[#1e293b] font-bold" style={{
                      fontSize: `${Math.floor(tamanoFuente * FACTOR_ESCALA)}px`,
                      lineHeight: '1.2'
                    }}>
                      {tituloPersonalizado}
                    </h1>
                  </div>
                  <div className="absolute bottom-[20px] left-[10%] right-0 text-center">
                    <p className="text-[#64748b]" style={{
                      fontSize: `${Math.floor(24 * FACTOR_ESCALA)}px`
                    }}>
                      {autorPersonalizado}
                    </p>
                  </div>
                </div>
              ) : (
                // Vista previa estilo clásico (código existente)
                <>
                  {/* Contenedor de imagen con posición absoluta */}
                  <div 
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: `${ALTO_EDITOR * 0.6667}px`, // Exactamente 2/3 del alto
                    }}
                  >
                    <img
                      src={imagenPortada}
                      alt="Portada"
                      className="w-full h-full object-cover"
                      style={{
                        display: 'block', // Elimina espacio extra debajo de la imagen
                      }}
                    />
                  </div>
                  
                  {/* Contenedor de texto con posición absoluta */}
                  <div 
                    className="absolute bg-white"
                    style={{
                      top: `${ALTO_EDITOR * 0.6667}px`, // Comienza donde termina la imagen
                      left: 0,
                      width: '100%',
                      height: `${ALTO_EDITOR * 0.3333}px`, // Exactamente 1/3 del alto
                      padding: `${ALTO_EDITOR * 0.05}px ${ANCHO_EDITOR * 0.05}px`, // Padding proporcional
                    }}
                  >
                    <h1
                      className="titulo-publicacion font-bold leading-tight m-0"
                      style={{ 
                        fontSize: `${Math.floor(tamanoFuente * FACTOR_ESCALA)}px`,
                        maxHeight: `${ALTO_EDITOR * 0.15}px`, // Limitar altura del título
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tituloPersonalizado}
                    </h1>
                    <p 
                      className="text-gray-600 m-0"
                      style={{
                        fontSize: `${Math.floor(18 * FACTOR_ESCALA)}px`,
                        position: 'absolute',
                        bottom: `${ALTO_EDITOR * 0.05}px`,
                        left: `${ANCHO_EDITOR * 0.05}px`,
                      }}
                    >
                      {autorPersonalizado}
                    </p>
                  </div>
                </>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
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
