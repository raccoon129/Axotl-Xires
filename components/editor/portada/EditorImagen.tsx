'use client';

import { useState } from 'react';
import { Upload, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/**
 * EditorImagen - Componente para cargar y manipular la imagen de la portada
 * 
 * Funcionalidades:
 * 1. Carga de imagen desde el dispositivo del usuario
 * 2. Validación de dimensiones y tamaño de la imagen
 * 3. Opción para recortar la imagen
 * 
 * Nota: Los controles de transformación (escala, rotación, posición) 
 * ahora están en el componente ControlesImagen
 */
interface PropiedadesEditorImagen {
  onImagenCargada: (imagen: HTMLImageElement) => void; // Callback cuando se carga una imagen
  posicion: { x: number; y: number };                  // Posición actual de la imagen (0-100%)
  escala: number;                                      // Escala actual de la imagen
  rotacion: number;                                    // Rotación actual de la imagen (grados)
  onPosicionChange: (posicion: { x: number; y: number }) => void; // Callback para cambio de posición
  onEscalaChange: (escala: number) => void;            // Callback para cambio de escala
  onRotacionChange: (rotacion: number) => void;        // Callback para cambio de rotación
  onRecorteChange: (activo: boolean) => void;          // Callback para activar el recorte
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
  // Estado para saber si ya se cargó una imagen
  const [imagenCargada, setImagenCargada] = useState(false);

  /**
   * Valida que la imagen cumpla con los requisitos mínimos de dimensiones
   * @param archivo - Archivo de imagen a validar
   * @returns Promise<boolean> - True si la imagen es válida
   */
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

  /**
   * Maneja la carga de una nueva imagen desde el input file
   * Valida tamaño y dimensiones antes de procesarla
   */
  const manejarCargaImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar tamaño máximo (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    // Validar dimensiones mínimas
    const esValida = await validarImagen(archivo);
    if (!esValida) {
      alert('La imagen debe tener al menos 500x500 píxeles');
      return;
    }

    // Cargar la imagen y notificar al componente padre
    const imagen = new Image();
    imagen.onload = () => {
      onImagenCargada(imagen);
      setImagenCargada(true);
      // Resetear posición, escala y rotación
      onPosicionChange({ x: 50, y: 50 });
      onEscalaChange(1);
      onRotacionChange(0);
    };
    imagen.src = URL.createObjectURL(archivo);
  };

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

      {/* Botón para activar el recorte de imagen - Solo visible cuando hay una imagen cargada */}
      {imagenCargada && (
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => onRecorteChange(true)}
            className="w-full"
          >
            <Crop className="w-4 h-4 mr-2" />
            Recortar imagen
          </Button>
        </div>
      )}
    </div>
  );
} 