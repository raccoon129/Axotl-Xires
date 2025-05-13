'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion'; // Importamos las herramientas de animación

interface PropiedadesRecortador {
  imagenSrc: string;
  onImagenRecortada: (archivo: File) => void;
  onCancelar: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function RecortadorImagen({ imagenSrc, onImagenRecortada, onCancelar }: PropiedadesRecortador) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const generarRecorte = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imagen = imgRef.current;
    const scaleX = imagen.naturalWidth / imagen.width;
    const scaleY = imagen.naturalHeight / imagen.height;

    canvas.width = 250;
    canvas.height = 250;

    ctx.drawImage(
      imagen,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      250,
      250
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'foto_perfil.jpg', { type: 'image/jpeg' });
      onImagenRecortada(file);
    }, 'image/jpeg', 0.95);
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300, 
            duration: 0.3 
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Recortar imagen de perfil</h3>
          
          <div className="mb-4 max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={imagenSrc}
                alt="Imagen a recortar"
                className="max-w-full"
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancelar}
            >
              Cancelar
            </Button>
            <Button
              onClick={generarRecorte}
              className="bg-blue-600 text-white"
            >
              Aplicar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}