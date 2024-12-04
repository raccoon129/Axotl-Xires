'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Crop, RotateCw, ZoomIn, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface PropiedadesEditorImagen {
  onImagenCargada: (imagen: HTMLImageElement) => void;
  posicion: { x: number; y: number };
  escala: number;
  rotacion: number;
  onPosicionChange: (posicion: { x: number; y: number }) => void;
  onEscalaChange: (escala: number) => void;
  onRotacionChange: (rotacion: number) => void;
  onRecorteChange: (activo: boolean) => void;
}

export function EditorImagen({
  onImagenCargada,
  posicion,
  escala,
  rotacion,
  onPosicionChange,
  onEscalaChange,
  onRotacionChange,
  onRecorteChange
}: PropiedadesEditorImagen) {
  const [arrastrandoImagen, setArrastrandoImagen] = useState(false);
  const [imagenCargada, setImagenCargada] = useState(false);

  const validarImagen = (archivo: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const imagen = new Image();
      imagen.onload = () => {
        const cumpleDimensiones = imagen.width >= 500 && imagen.height >= 500;
        URL.revokeObjectURL(imagen.src);
        resolve(cumpleDimensiones);
      };
      imagen.src = URL.createObjectURL(archivo);
    });
  };

  const manejarCargaImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const esValida = await validarImagen(archivo);
    if (!esValida) {
      alert('La imagen debe tener al menos 500x500 píxeles');
      return;
    }

    const imagen = new Image();
    imagen.onload = () => {
      onImagenCargada(imagen);
      setImagenCargada(true);
      onPosicionChange({ x: 50, y: 50 });
      onEscalaChange(1);
      onRotacionChange(0);
    };
    imagen.src = URL.createObjectURL(archivo);
  };

  const manejarArrastre = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!arrastrandoImagen) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPosicionChange({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  }, [arrastrandoImagen, onPosicionChange]);

  return (
    <div className="space-y-6">
      {/* Sección de carga de imagen */}
      <div className="space-y-4">
        <Label>Imagen de portada</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={manejarCargaImagen}
            className="hidden"
            id="cargar-imagen"
          />
          <label
            htmlFor="cargar-imagen"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {imagenCargada ? 'Cambiar imagen' : 'Cargar imagen'}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Mínimo 500x500px, máximo 5MB
            </span>
          </label>
        </div>
      </div>

      {imagenCargada && (
        <>
          {/* Controles de transformación */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Escala
              </Label>
              <Slider
                value={[escala * 100]}
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
                value={[rotacion]}
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
                onMouseMove={manejarArrastre as any}
              >
                <motion.div
                  className="absolute w-4 h-4 bg-blue-500 rounded-full"
                  style={{
                    left: `${posicion.x}%`,
                    top: `${posicion.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onRecorteChange(true)}
                className="w-full"
              >
                <Crop className="w-4 h-4 mr-2" />
                Recortar imagen
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 