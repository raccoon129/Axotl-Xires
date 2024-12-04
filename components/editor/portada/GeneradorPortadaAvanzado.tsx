'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Move, 
  Palette,
  Layers,
  Crop,
  RotateCcw,
  ZoomIn,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { EditorImagen } from './EditorImagen';
import { EditorTexto } from './EditorTexto';
import { PlantillasPortada } from './PlantillasPortada';
import { EstilosPortada } from './EstilosPortada';
import { ElementoTexto, ConfiguracionEstilo, Plantilla } from './types';
import { Label } from '@/components/ui/label';

interface PropiedadesGenerador {
  tituloPublicacion: string;
  nombreAutor: string;
  alGuardar: (imagenPortada: string) => void;
}

// Añadir estas configuraciones de texto por estilo
const configuracionesTextoPorEstilo = {
  clasico: {
    titulo: {
      posicion: { x: 50, y: 80 },
      tamano: 48,
      color: '#1a1a1a',
      fuente: 'Crimson Text',
      alineacion: 'center' as const,
      rotacion: 0,
      maxWidth: 500, // Ancho máximo en píxeles
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 10
    },
    autor: {
      posicion: { x: 50, y: 90 },
      tamano: 24,
      color: '#4a4a4a',
      fuente: 'Helvetica',
      alineacion: 'center' as const,
      rotacion: 0,
      maxWidth: 400,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 8
    }
  },
  moderno: {
    titulo: {
      posicion: { x: 70, y: 50 },
      tamano: 42,
      color: '#ffffff',
      fuente: 'Montserrat',
      alineacion: 'right' as const,
      rotacion: 0,
      maxWidth: 300,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 10
    },
    autor: {
      posicion: { x: 70, y: 60 },
      tamano: 24,
      color: '#ffffff',
      fuente: 'Helvetica',
      alineacion: 'right' as const,
      rotacion: 0,
      maxWidth: 250,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 8
    }
  },
  academico: {
    titulo: {
      posicion: { x: 50, y: 20 },
      tamano: 36,
      color: '#2c3e50',
      fuente: 'Georgia',
      alineacion: 'center' as const,
      rotacion: 0,
      maxWidth: 450,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 10
    },
    autor: {
      posicion: { x: 50, y: 85 },
      tamano: 20,
      color: '#34495e',
      fuente: 'Helvetica',
      alineacion: 'center' as const,
      rotacion: 0,
      maxWidth: 350,
      fondoActivo: false,
      colorFondo: '#ffffff',
      opacidadFondo: 0.7,
      paddingFondo: 8
    }
  }
};

// Función para ajustar texto a múltiples líneas
const ajustarTextoMultilinea = (
  contexto: CanvasRenderingContext2D,
  texto: string,
  maxWidth: number
): string[] => {
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let lineaActual = '';

  palabras.forEach(palabra => {
    const lineaTemporal = lineaActual + (lineaActual ? ' ' : '') + palabra;
    const medida = contexto.measureText(lineaTemporal).width;

    if (medida <= maxWidth) {
      lineaActual = lineaTemporal;
    } else {
      lineas.push(lineaActual);
      lineaActual = palabra;
    }
  });

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas;
};

export function GeneradorPortadaAvanzado({
  tituloPublicacion,
  nombreAutor,
  alGuardar
}: PropiedadesGenerador) {
  // Estados para el canvas y la edición
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contexto, setContexto] = useState<CanvasRenderingContext2D | null>(null);
  const [historialAcciones, setHistorialAcciones] = useState<string[]>([]);
  const [indiceHistorial, setIndiceHistorial] = useState(-1);

  // Estados para la imagen
  const [imagenBase, setImagenBase] = useState<HTMLImageElement | null>(null);
  const [posicionImagen, setPosicionImagen] = useState({ x: 0, y: 0 });
  const [escalaImagen, setEscalaImagen] = useState(1);
  const [rotacionImagen, setRotacionImagen] = useState(0);
  const [recorteActivo, setRecorteActivo] = useState(false);

  // Estados para el texto
  const [elementosTexto, setElementosTexto] = useState<ElementoTexto[]>([
    {
      id: 'titulo',
      texto: tituloPublicacion,
      ...configuracionesTextoPorEstilo.clasico.titulo
    },
    {
      id: 'autor',
      texto: nombreAutor,
      ...configuracionesTextoPorEstilo.clasico.autor
    }
  ]);

  // Estado para el estilo actual
  const [estiloActual, setEstiloActual] = useState('clasico');
  const [configuracionEstilo, setConfiguracionEstilo] = useState<ConfiguracionEstilo>({
    colorPrimario: '#1a1a1a',
    colorSecundario: '#ffffff',
    opacidadGradiente: 0.6
  });

  // Estado para el arrastre de imagen
  const [arrastrandoImagen, setArrastrandoImagen] = useState(false);

  // Función para manejar el arrastre
  const manejarArrastre = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!arrastrandoImagen) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosicionImagen({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  }, [arrastrandoImagen]);

  // Funciones para manejar escala y rotación
  const onEscalaChange = useCallback((valor: number) => {
    setEscalaImagen(valor);
  }, []);

  const onRotacionChange = useCallback((valor: number) => {
    setRotacionImagen(valor);
  }, []);

  // Efectos y funciones principales
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      setContexto(ctx);
    }
  }, []);

  const guardarEstadoActual = () => {
    if (canvasRef.current) {
      const estado = canvasRef.current.toDataURL();
      setHistorialAcciones(prev => [...prev.slice(0, indiceHistorial + 1), estado]);
      setIndiceHistorial(prev => prev + 1);
    }
  };

  const deshacer = () => {
    if (indiceHistorial > 0) {
      setIndiceHistorial(prev => prev - 1);
      cargarEstado(historialAcciones[indiceHistorial - 1]);
    }
  };

  const cargarEstado = (estadoBase64: string) => {
    const imagen = new Image();
    imagen.onload = () => {
      if (contexto && canvasRef.current) {
        contexto.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contexto.drawImage(imagen, 0, 0);
      }
    };
    imagen.src = estadoBase64;
  };

  const handlePlantillaSelect = (plantilla: Plantilla) => {
    setEstiloActual(plantilla.estilo);
    setConfiguracionEstilo(plantilla.configuracion);
    setElementosTexto(plantilla.elementosTexto);
  };

  // Efecto para dibujar en el canvas
  useEffect(() => {
    if (!canvasRef.current || !contexto || !imagenBase) return;

    const canvas = canvasRef.current;
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    // Guardar el estado actual del contexto
    contexto.save();

    // Aplicar transformaciones desde el centro
    contexto.translate(canvas.width / 2, canvas.height / 2);
    contexto.rotate((rotacionImagen * Math.PI) / 180);
    contexto.scale(escalaImagen, escalaImagen);

    // Calcular posición relativa desde el centro
    const x = (posicionImagen.x - 50) * (canvas.width / 100);
    const y = (posicionImagen.y - 50) * (canvas.height / 100);

    // Dibujar la imagen centrada
    contexto.drawImage(
      imagenBase,
      -imagenBase.width / 2 + x,
      -imagenBase.height / 2 + y,
      imagenBase.width,
      imagenBase.height
    );

    // Restaurar el estado del contexto
    contexto.restore();

    // Dibujar los elementos de texto
    elementosTexto.forEach(elemento => {
      contexto.save();
      
      // Configurar el estilo del texto
      contexto.font = `${elemento.tamano}px ${elemento.fuente}`;
      contexto.fillStyle = elemento.color;
      contexto.textAlign = elemento.alineacion;
      
      // Calcular posición del texto
      const textX = (elemento.posicion.x / 100) * canvas.width;
      const textY = (elemento.posicion.y / 100) * canvas.height;
      
      // Aplicar rotación al texto
      contexto.translate(textX, textY);
      contexto.rotate((elemento.rotacion * Math.PI) / 180);
      
      // Dibujar el texto
      contexto.fillText(elemento.texto, 0, 0);
      
      contexto.restore();
    });

    // Guardar el estado en el historial
    guardarEstadoActual();
  }, [imagenBase, posicionImagen, escalaImagen, rotacionImagen, elementosTexto, estiloActual, configuracionEstilo]);

  // Función para previsualizar la imagen antes de cargarla
  const previsualizarImagen = (imagen: HTMLImageElement) => {
    // Calcular escala inicial para ajustar la imagen al canvas
    const escalaAncho = canvasRef.current!.width / imagen.width;
    const escalaAlto = canvasRef.current!.height / imagen.height;
    const escalaInicial = Math.min(escalaAncho, escalaAlto);

    setEscalaImagen(escalaInicial);
    setPosicionImagen({ x: 50, y: 50 }); // Centrar la imagen
    setRotacionImagen(0);
    setImagenBase(imagen);
  };

  // Añadir esta función dentro del componente GeneradorPortadaAvanzado
  const dibujarTexto = useCallback((configEstilo: typeof configuracionesTextoPorEstilo[keyof typeof configuracionesTextoPorEstilo]) => {
    if (!canvasRef.current || !contexto) return;
    const canvas = canvasRef.current;

    elementosTexto.forEach(elemento => {
      const config = elemento.id === 'titulo' ? configEstilo.titulo : configEstilo.autor;
      
      contexto.save();
      contexto.font = `${elemento.tamano}px ${elemento.fuente}`;
      
      // Calcular dimensiones del texto para el fondo
      const lineas = ajustarTextoMultilinea(contexto, elemento.texto, config.maxWidth);
      const alturaLinea = elemento.tamano * 1.2;
      const anchuraMaxima = Math.max(...lineas.map(linea => contexto.measureText(linea).width));
      
      lineas.forEach((linea, index) => {
        const x = (elemento.posicion.x / 100) * canvas.width;
        const y = (elemento.posicion.y / 100) * canvas.height + (index * alturaLinea);
        
        contexto.save();
        contexto.translate(x, y);
        contexto.rotate((elemento.rotacion * Math.PI) / 180);

        if (elemento.fondoActivo) {
          // Dibujar el fondo del texto
          const padding = elemento.paddingFondo;
          const medidaTexto = contexto.measureText(linea);
          let rectX = 0;
          
          // Ajustar posición X según alineación
          switch (elemento.alineacion) {
            case 'center':
              rectX = -medidaTexto.width / 2 - padding;
              break;
            case 'right':
              rectX = -medidaTexto.width - padding;
              break;
            default:
              rectX = -padding;
          }

          // Dibujar el fondo con opacidad
          contexto.fillStyle = elemento.colorFondo;
          contexto.globalAlpha = elemento.opacidadFondo;
          contexto.fillRect(
            rectX,
            -elemento.tamano + padding/2,
            medidaTexto.width + padding * 2,
            elemento.tamano + padding
          );
          contexto.globalAlpha = 1;
        }

        // Dibujar el texto
        contexto.fillStyle = elemento.color;
        contexto.textAlign = elemento.alineacion;
        contexto.fillText(linea, 0, 0);
        
        contexto.restore();
      });
      
      contexto.restore();
    });
  }, [contexto, elementosTexto]);

  // Actualizar las funciones de estilo para incluir el dibujo de texto
  const aplicarEstiloClasico = useCallback(() => {
    if (!canvasRef.current || !contexto || !imagenBase) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;
    
    contexto.clearRect(0, 0, width, height);
    
    // Dibujar fondo blanco
    contexto.fillStyle = configuracionEstilo.colorSecundario;
    contexto.fillRect(0, 0, width, height);

    // Área de imagen (2/3 superiores)
    const alturaImagen = height * 0.6667;
    contexto.save();
    contexto.beginPath();
    contexto.rect(0, 0, width, alturaImagen);
    contexto.clip();
    
    // Dibujar imagen con transformaciones
    const centroX = width / 2;
    const centroY = alturaImagen / 2;
    contexto.translate(centroX, centroY);
    contexto.rotate((rotacionImagen * Math.PI) / 180);
    contexto.scale(escalaImagen, escalaImagen);
    
    const x = (posicionImagen.x - 50) * (width / 100);
    const y = (posicionImagen.y - 50) * (height / 100);
    contexto.drawImage(
      imagenBase,
      -imagenBase.width / 2 + x,
      -imagenBase.height / 2 + y,
      imagenBase.width,
      imagenBase.height
    );
    contexto.restore();

    // Área de texto (1/3 inferior)
    contexto.fillStyle = configuracionEstilo.colorSecundario;
    contexto.fillRect(0, alturaImagen, width, height - alturaImagen);

    // Dibujar texto
    dibujarTexto(configuracionesTextoPorEstilo.clasico);
  }, [imagenBase, contexto, posicionImagen, escalaImagen, rotacionImagen, configuracionEstilo, dibujarTexto]);

  const aplicarEstiloModerno = useCallback(() => {
    if (!canvasRef.current || !contexto || !imagenBase) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;
    
    contexto.clearRect(0, 0, width, height);

    // Dibujar imagen de fondo
    contexto.save();
    contexto.translate(width / 2, height / 2);
    contexto.rotate((rotacionImagen * Math.PI) / 180);
    contexto.scale(escalaImagen, escalaImagen);
    
    const x = (posicionImagen.x - 50) * (width / 100);
    const y = (posicionImagen.y - 50) * (height / 100);
    contexto.drawImage(
      imagenBase,
      -imagenBase.width / 2 + x,
      -imagenBase.height / 2 + y,
      imagenBase.width,
      imagenBase.height
    );
    contexto.restore();

    // Franja lateral con gradiente
    const franjaAncho = width * 0.4;
    const gradient = contexto.createLinearGradient(width - franjaAncho, 0, width, 0);
    gradient.addColorStop(0, `rgba(${hexToRgb(configuracionEstilo.colorPrimario)}, 0)`);
    gradient.addColorStop(1, `rgba(${hexToRgb(configuracionEstilo.colorPrimario)}, ${configuracionEstilo.opacidadGradiente})`);
    
    contexto.fillStyle = gradient;
    contexto.fillRect(width - franjaAncho, 0, franjaAncho, height);

    // Dibujar texto
    dibujarTexto(configuracionesTextoPorEstilo.moderno);
  }, [imagenBase, contexto, posicionImagen, escalaImagen, rotacionImagen, configuracionEstilo, dibujarTexto]);

  const aplicarEstiloAcademico = useCallback(() => {
    if (!canvasRef.current || !contexto || !imagenBase) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;
    
    contexto.clearRect(0, 0, width, height);

    // Fondo blanco
    contexto.fillStyle = configuracionEstilo.colorSecundario;
    contexto.fillRect(0, 0, width, height);

    // Marco
    const margen = width * 0.1;
    contexto.strokeStyle = configuracionEstilo.colorPrimario;
    contexto.lineWidth = 2;
    contexto.strokeRect(margen, margen, width - margen * 2, height - margen * 2);

    // Área de imagen
    const areaImagenY = height * 0.3;
    const areaImagenAltura = height * 0.4;
    
    contexto.save();
    contexto.beginPath();
    contexto.rect(margen * 1.5, areaImagenY, width - margen * 3, areaImagenAltura);
    contexto.clip();
    
    // Dibujar imagen con transformaciones
    const centroX = width / 2;
    const centroY = areaImagenY + areaImagenAltura / 2;
    contexto.translate(centroX, centroY);
    contexto.rotate((rotacionImagen * Math.PI) / 180);
    contexto.scale(escalaImagen, escalaImagen);
    
    const x = (posicionImagen.x - 50) * (width / 100);
    const y = (posicionImagen.y - 50) * (height / 100);
    contexto.drawImage(
      imagenBase,
      -imagenBase.width / 2 + x,
      -imagenBase.height / 2 + y,
      imagenBase.width,
      imagenBase.height
    );
    contexto.restore();

    // Dibujar texto
    dibujarTexto(configuracionesTextoPorEstilo.academico);
  }, [imagenBase, contexto, posicionImagen, escalaImagen, rotacionImagen, configuracionEstilo, dibujarTexto]);

  // Función auxiliar para convertir hex a rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  };

  // Efecto para aplicar estilos cuando cambian
  useEffect(() => {
    switch (estiloActual) {
      case 'clasico':
        aplicarEstiloClasico();
        break;
      case 'moderno':
        aplicarEstiloModerno();
        break;
      case 'academico':
        aplicarEstiloAcademico();
        break;
    }
  }, [estiloActual, aplicarEstiloClasico, aplicarEstiloModerno, aplicarEstiloAcademico]);

  // Añadir este efecto para redibujar cuando cambian los elementos de texto
  useEffect(() => {
    if (!canvasRef.current || !contexto || !imagenBase) return;

    switch (estiloActual) {
      case 'clasico':
        aplicarEstiloClasico();
        break;
      case 'moderno':
        aplicarEstiloModerno();
        break;
      case 'academico':
        aplicarEstiloAcademico();
        break;
    }
  }, [elementosTexto, estiloActual, aplicarEstiloClasico, aplicarEstiloModerno, aplicarEstiloAcademico]);

  // Actualizar el efecto que maneja el cambio de estilo
  useEffect(() => {
    if (!estiloActual || !elementosTexto.length) return;

    const configEstilo = configuracionesTextoPorEstilo[estiloActual as keyof typeof configuracionesTextoPorEstilo];
    
    setElementosTexto(prevElementos => prevElementos.map(elemento => ({
      ...elemento,
      ...(elemento.id === 'titulo' ? configEstilo.titulo : configEstilo.autor),
      texto: elemento.texto // Mantener el texto actual
    })));
  }, [estiloActual]);

  return (
    <div className="flex h-full">
      {/* Panel de edición */}
      <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Controles de imagen siempre visibles cuando hay imagen */}
          {imagenBase && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="font-medium text-sm text-gray-700">Ajustes de imagen</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Escala
                  </Label>
                  <Slider
                    value={[escalaImagen * 100]}
                    onValueChange={([valor]) => onEscalaChange(valor / 100)}
                    min={50}
                    max={150}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4" />
                    Rotación
                  </Label>
                  <Slider
                    value={[rotacionImagen]}
                    onValueChange={([valor]) => onRotacionChange(valor)}
                    min={-180}
                    max={180}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Posición
                  </Label>
                  <div
                    className="w-full aspect-[612/792] bg-gray-100 rounded-lg relative cursor-move"
                    onMouseDown={() => setArrastrandoImagen(true)}
                    onMouseUp={() => setArrastrandoImagen(false)}
                    onMouseLeave={() => setArrastrandoImagen(false)}
                    onMouseMove={manejarArrastre}
                  >
                    <motion.div
                      className="absolute w-4 h-4 bg-blue-500 rounded-full"
                      style={{
                        left: `${posicionImagen.x}%`,
                        top: `${posicionImagen.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs para otras opciones */}
          <Tabs defaultValue="imagen">
            <TabsList className="grid grid-cols-4 gap-4 mb-6">
              <TabsTrigger value="imagen">
                <ImageIcon className="w-4 h-4 mr-2" />
                Imagen
              </TabsTrigger>
              <TabsTrigger value="texto">
                <Type className="w-4 h-4 mr-2" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="estilo">
                <Palette className="w-4 h-4 mr-2" />
                Estilo
              </TabsTrigger>
              <TabsTrigger value="plantillas">
                <Layout className="w-4 h-4 mr-2" />
                Plantillas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="imagen">
              <EditorImagen
                onImagenCargada={previsualizarImagen}
                posicion={posicionImagen}
                escala={escalaImagen}
                rotacion={rotacionImagen}
                onPosicionChange={setPosicionImagen}
                onEscalaChange={setEscalaImagen}
                onRotacionChange={setRotacionImagen}
                onRecorteChange={setRecorteActivo}
              />
            </TabsContent>

            <TabsContent value="texto">
              <EditorTexto
                elementos={elementosTexto}
                onElementosChange={setElementosTexto}
              />
            </TabsContent>

            <TabsContent value="estilo">
              <EstilosPortada
                estiloActual={estiloActual}
                configuracion={configuracionEstilo}
                onEstiloChange={setEstiloActual}
                onConfiguracionChange={setConfiguracionEstilo}
              />
            </TabsContent>

            <TabsContent value="plantillas">
              <PlantillasPortada
                onPlantillaSelect={handlePlantillaSelect}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Área de previsualización */}
      <div className="flex-1 bg-gray-100 p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={612}
            height={792}
            className="border shadow-lg bg-white"
          />
          
          {/* Controles adicionales */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={deshacer}
              disabled={indiceHistorial <= 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (canvasRef.current) {
                  alGuardar(canvasRef.current.toDataURL('image/png'));
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Guardar portada
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 