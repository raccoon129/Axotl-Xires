/**
 * Componente principal para la generación y edición de portadas
 * Integra todos los módulos y gestiona la lógica central
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Palette,
  RotateCcw
} from 'lucide-react';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Componentes del editor
import { EditorImagen } from './EditorImagen';
import { EditorTexto } from './EditorTextoPortada';
import { EstilosPortada } from './EstilosPortada';
import { ControlesImagen } from './ControlesImagen';

// Tipos e interfaces
import { ElementoTexto, ConfiguracionEstilo, TipoEstilo } from './typesGeneradorPortada';

// Hooks personalizados
import { useCanvas } from './hooks/useCanvas';
import { useHistorial } from './hooks/useHistorial';
import { useEstilos } from './hooks/useEstilos';

interface PropiedadesGenerador {
  tituloPublicacion: string;        // Título inicial para la portada
  nombreAutor: string;              // Nombre del autor para la portada
  alGuardar: (imagenPortada: string) => void; // Callback al guardar la portada
}

// Estados iniciales
const elementosTextoIniciales: ElementoTexto[] = [
  {
    id: 'titulo',
    texto: '',
    fuente: 'crimson',
    tamano: 48,
    color: '#1a1a1a',
    posicion: { x: 50, y: 80 },
    alineacion: 'center',
    rotacion: 0,
    fondoActivo: false,
    colorFondo: '#ffffff',
    opacidadFondo: 0.7,
    paddingFondo: 10,
    bordeRedondeado: 8
  },
  {
    id: 'autor',
    texto: '',
    fuente: 'helvetica',
    tamano: 24,
    color: '#4a4a4a',
    posicion: { x: 50, y: 90 },
    alineacion: 'center',
    rotacion: 0,
    fondoActivo: false,
    colorFondo: '#ffffff',
    opacidadFondo: 0.7,
    paddingFondo: 8,
    bordeRedondeado: 4
  }
];

export function GeneradorPortadaAvanzado({
  tituloPublicacion,
  nombreAutor,
  alGuardar
}: PropiedadesGenerador) {
  // Estados para la imagen
  const [imagenBase, setImagenBase] = useState<HTMLImageElement | null>(null);
  const [posicionImagen, setPosicionImagen] = useState({ x: 50, y: 50 });
  const [escalaImagen, setEscalaImagen] = useState(1);
  const [rotacionImagen, setRotacionImagen] = useState(0);
  const [recorteActivo, setRecorteActivo] = useState(false);

  // Estados para el texto
  const [elementosTexto, setElementosTexto] = useState<ElementoTexto[]>(elementosTextoIniciales);

  // Inicializar hooks personalizados
  const { canvasRef, contexto, limpiarCanvas } = useCanvas({
    ancho: 612, // Tamaño A4 a 72 DPI
    alto: 792
  });

  const {
    estiloActual,
    configuracion,
    cambiarEstilo,
    actualizarConfiguracion,
    obtenerRenderizador,
    generarElementosTextoParaEstilo
  } = useEstilos({
    estiloInicial: 'clasico',
    onEstiloChange: (nuevoEstilo) => {
      // Cuando cambia el estilo, actualizar los elementos de texto
      // pero manteniendo el contenido actual
      const textoTitulo = elementosTexto.find(e => e.id === 'titulo')?.texto || tituloPublicacion;
      const textoAutor = elementosTexto.find(e => e.id === 'autor')?.texto || nombreAutor;
      
      const nuevosElementos = generarElementosTextoParaEstilo(textoTitulo, textoAutor);
      setElementosTexto(nuevosElementos);
    }
  });

  const {
    guardarEstado,
    deshacer,
    puedeDeshacer
  } = useHistorial();

  // Efecto para inicializar los elementos de texto con los valores del estilo seleccionado
  useEffect(() => {
    if (tituloPublicacion || nombreAutor) {
      const nuevosElementos = generarElementosTextoParaEstilo(
        tituloPublicacion,
        nombreAutor
      );
      setElementosTexto(nuevosElementos);
    }
  }, [tituloPublicacion, nombreAutor, generarElementosTextoParaEstilo]);

  // Manejadores de eventos
  const manejarCargaImagen = (imagen: HTMLImageElement) => {
    setImagenBase(imagen);
    setPosicionImagen({ x: 50, y: 50 });
    setEscalaImagen(1);
    setRotacionImagen(0);
    
    if (canvasRef.current) {
      guardarEstado(canvasRef.current.toDataURL());
    }
  };

  // Renderiza la portada con el estilo actual
  const renderizarPortada = () => {
    if (!contexto || !imagenBase) return;

    limpiarCanvas();

    const renderizador = obtenerRenderizador();
    renderizador({
      contexto,
      imagen: imagenBase,
      dimensiones: { ancho: 612, alto: 792 },
      posicion: posicionImagen,
      escala: escalaImagen,
      rotacion: rotacionImagen,
      configuracion,
      elementosTexto
    });

    if (canvasRef.current) {
      guardarEstado(canvasRef.current.toDataURL());
    }
  };

  // Efecto para renderizar cuando cambian las propiedades
  useEffect(() => {
    renderizarPortada();
  }, [
    imagenBase,
    posicionImagen,
    escalaImagen,
    rotacionImagen,
    elementosTexto,
    estiloActual,
    configuracion
  ]);

  // Modificar la función manejarCambioEstilo
  const manejarCambioEstilo = (nuevoEstilo: TipoEstilo) => {
    cambiarEstilo(nuevoEstilo);
    // No es necesario hacer nada más aquí, ya que el callback onEstiloChange
    // se encargará de actualizar los elementos de texto
  };

  return (
    <div className="flex h-full">
      {/* Panel de edición */}
      <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Controles de imagen siempre visibles cuando hay imagen */}
          {imagenBase && (
            <ControlesImagen
              posicion={posicionImagen}
              escala={escalaImagen}
              rotacion={rotacionImagen}
              onPosicionChange={setPosicionImagen}
              onEscalaChange={setEscalaImagen}
              onRotacionChange={setRotacionImagen}
            />
          )}

          {/* Tabs para otras opciones */}
          <Tabs defaultValue="imagen">
            <TabsList className="grid grid-cols-3 gap-4 mb-6">
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
            </TabsList>

            <TabsContent value="imagen">
              <EditorImagen
                onImagenCargada={manejarCargaImagen}
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
                configuracion={configuracion}
                onEstiloChange={manejarCambioEstilo}
                onConfiguracionChange={actualizarConfiguracion}
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
              disabled={!puedeDeshacer}
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