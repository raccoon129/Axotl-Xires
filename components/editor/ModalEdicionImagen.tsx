'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImageOff, RotateCw, Contrast, SunMedium } from 'lucide-react';

interface ModalEdicionImagenProps {
  imagenOriginal: File;
  onGuardar: (imagenEditada: File, descripcion: string) => void;
  onCancelar: () => void;
  estaAbierto: boolean;
}

export const ModalEdicionImagen: React.FC<ModalEdicionImagenProps> = ({
  imagenOriginal,
  onGuardar,
  onCancelar,
  estaAbierto
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  
  // Estados para los filtros
  const [esGrises, setEsGrises] = useState(false);
  const [brillo, setBrillo] = useState(100);
  const [contraste, setContraste] = useState(100);
  const [rotacion, setRotacion] = useState(0);
  
  const [imagenPrevia, setImagenPrevia] = useState<string | null>(null);
  const imagenRef = useRef<HTMLImageElement>(null);

  const [descripcion, setDescripcion] = useState('');
  const [errorDescripcion, setErrorDescripcion] = useState(false);

  // Cargar imagen cuando el modal se abre
  useEffect(() => {
    if (estaAbierto && imagenOriginal) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPrevia(reader.result as string);
      };
      reader.readAsDataURL(imagenOriginal);
    }
    
    // Limpiar al cerrar
    return () => {
      if (!estaAbierto) {
        setImagenPrevia(null);
        // Resetear otros estados
        setEsGrises(false);
        setBrillo(100);
        setContraste(100);
        setRotacion(0);
      }
    };
  }, [estaAbierto, imagenOriginal]);

  const aplicarFiltros = async (imagen: HTMLImageElement): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

    const scaleX = imagen.naturalWidth / imagen.width;
    const scaleY = imagen.naturalHeight / imagen.height;
    
    // Si el usuario no modificó el recorte, usar toda la imagen
    const fullCrop = (crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100);
    const pixelCrop = fullCrop
      ? {
          x: 0,
          y: 0,
          width: imagen.naturalWidth,
          height: imagen.naturalHeight
        }
      : {
          x: crop.x * scaleX,
          y: crop.y * scaleY,
          width: crop.width * scaleX,
          height: crop.height * scaleY
        };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Aplicar rotación si es necesario
    if (rotacion !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotacion * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Dibujar imagen (ya sea recortada o completa)
    ctx.filter = `brightness(${brillo}%) contrast(${contraste}%)`;
    ctx.drawImage(
      imagen,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Aplicar filtro blanco y negro si está activado
    if (esGrises) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gris = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = gris;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const validarDescripcion = () => {
    if (descripcion.trim().length < 10) {
      setErrorDescripcion(true);
      return false;
    }
    setErrorDescripcion(false);
    return true;
  };

  const guardarCambios = async () => {
    if (!imagenRef.current || !validarDescripcion()) {
      return;
    }

    try {
      const blob = await aplicarFiltros(imagenRef.current);
      const imagenFinal = new File([blob], imagenOriginal.name, {
        type: 'image/jpeg'
      });
      onGuardar(imagenFinal, descripcion.trim());
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
    }
  };

  return (
    <AnimatePresence>
      {estaAbierto && imagenPrevia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Encabezado */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Editar imagen</h2>
              <button
                onClick={onCancelar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido principal - Grid de dos columnas */}
            <div className="grid grid-cols-3 gap-6 p-6">
              {/* Área de recorte - 2 columnas */}
              <div className="col-span-2 bg-gray-50 rounded-lg overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  aspect={undefined}
                  className="max-h-[60vh] overflow-auto"
                >
                  <img
                    ref={imagenRef}
                    src={imagenPrevia}
                    alt="Imagen a editar"
                    className="max-w-full h-auto"
                    style={{
                      filter: `brightness(${brillo}%) contrast(${contraste}%) ${esGrises ? 'grayscale(100%)' : ''}`,
                      transform: `rotate(${rotacion}deg)`
                    }}
                  />
                </ReactCrop>
              </div>

              {/* Panel de controles - 1 columna */}
              <div className="space-y-6">
                {/* Descripción de la imagen */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Descripción de la imagen</h3>
                  <div className="space-y-2">
                    <textarea
                      value={descripcion}
                      onChange={(e) => {
                        setDescripcion(e.target.value);
                        if (errorDescripcion) setErrorDescripcion(false);
                      }}
                      placeholder="Describe detalladamente el contenido de la imagen. Esta descripción aparecerá en la publicación final."
                      className={`w-full h-32 p-3 border rounded-lg resize-none ${
                        errorDescripcion ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorDescripcion && (
                      <p className="text-red-500 text-sm">
                        La descripción debe tener al menos 10 caracteres
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Caracteres: {descripcion.length}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Ajustes</h3>
                  
                  {/* Filtro B/N */}
                  <div className="mb-4">
                    <button
                      onClick={() => setEsGrises(!esGrises)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors w-full ${
                        esGrises ? 'bg-gray-800 text-white' : 'bg-white border'
                      }`}
                    >
                      <ImageOff size={20} />
                      Blanco y negro
                    </button>
                  </div>

                  {/* Brillo */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm mb-2">
                      <SunMedium size={16} />
                      Brillo
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brillo}
                      onChange={(e) => setBrillo(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Contraste */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm mb-2">
                      <Contrast size={16} />
                      Contraste
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contraste}
                      onChange={(e) => setContraste(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotación */}
                  <div>
                    <label className="flex items-center gap-2 text-sm mb-2">
                      <RotateCw size={16} />
                      Rotación
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotacion}
                      onChange={(e) => setRotacion(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                * La descripción es obligatoria y aparecerá como pie de imagen en la publicación
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onCancelar}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};