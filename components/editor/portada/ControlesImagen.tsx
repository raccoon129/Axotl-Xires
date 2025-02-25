'use client';

import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, RotateCw, Move } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

/**
 * ControlesImagen - Componente independiente para los controles de transformación de imagen
 * 
 * Proporciona controles para:
 * 1. Ajustar la escala de la imagen
 * 2. Rotar la imagen
 * 3. Posicionar la imagen horizontal y verticalmente
 * 
 * Este componente se mantiene visible independientemente de la pestaña seleccionada
 */
interface PropiedadesControlesImagen {
  posicion: { x: number; y: number };          // Posición actual (0-100%)
  escala: number;                              // Escala actual (proporción)
  rotacion: number;                            // Rotación actual (grados)
  onPosicionChange: (posicion: { x: number; y: number }) => void;
  onEscalaChange: (escala: number) => void;
  onRotacionChange: (rotacion: number) => void;
}

export function ControlesImagen({
  posicion,
  escala,
  rotacion,
  onPosicionChange,
  onEscalaChange,
  onRotacionChange
}: PropiedadesControlesImagen) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4 mb-4">
      <h3 className="font-medium text-sm text-gray-700">Ajustes de imagen</h3>
      <div className="space-y-4">
        {/* Control de escala */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            Escala
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[escala * 100]}
              onValueChange={([valor]) => onEscalaChange(valor / 100)}
              min={50}
              max={150}
              step={1}
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {Math.round(escala * 100)}%
            </span>
          </div>
        </div>

        {/* Control de rotación */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Rotación
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[rotacion]}
              onValueChange={([valor]) => onRotacionChange(valor)}
              min={-180}
              max={180}
              step={1}
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {rotacion}°
            </span>
          </div>
        </div>

        {/* Control de posición con sliders para X e Y */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Move className="w-4 h-4" />
            Posición
          </Label>
          
          {/* Slider para posición horizontal (X) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <Slider
                value={[posicion.x]}
                onValueChange={([valor]) => onPosicionChange({ ...posicion, x: valor })}
                min={0}
                max={100}
                step={1}
              />
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-500 w-8 text-right">
                {Math.round(posicion.x)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">Posición horizontal</p>
          </div>
          
          {/* Slider para posición vertical (Y) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3 h-3 text-gray-400" />
              <Slider
                value={[posicion.y]}
                onValueChange={([valor]) => onPosicionChange({ ...posicion, y: valor })}
                min={0}
                max={100}
                step={1}
              />
              <ArrowDown className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-500 w-8 text-right">
                {Math.round(posicion.y)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">Posición vertical</p>
          </div>
        </div>
      </div>
    </div>
  );
} 