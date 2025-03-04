'use client';

import { useState } from 'react';
import { Palette, Layout, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ConfiguracionEstilo, EstiloPortada, TipoEstilo } from './typesGeneradorPortada';
import { estilosDisponibles } from './configuraciones/configuracionesEstilos';

/**
 * EstilosPortada - Componente para seleccionar y configurar el estilo visual de la portada
 */
interface PropiedadesEstilosPortada {
  estiloActual: TipoEstilo;
  configuracion: ConfiguracionEstilo;
  onEstiloChange: (estilo: TipoEstilo) => void;
  onConfiguracionChange: (config: ConfiguracionEstilo) => void;
}

export function EstilosPortada({
  estiloActual,
  configuracion,
  onEstiloChange,
  onConfiguracionChange
}: PropiedadesEstilosPortada) {
  const [mostrarConfiguracionAvanzada, setMostrarConfiguracionAvanzada] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Selecciona un estilo</h3>
        <div className="grid grid-cols-1 gap-4">
          {estilosDisponibles.map((estilo) => (
            <div 
              key={estilo.id}
              className={`flex items-center border p-4 rounded-lg hover:bg-gray-50 cursor-pointer ${
                estiloActual === estilo.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onEstiloChange(estilo.id as TipoEstilo)}
            >
              {/* Imagen de vista previa del estilo */}
              <div className="w-32 h-304 overflow-hidden rounded-md border bg-white mr-4">
                <img 
                  src={estilo.preview} 
                  alt={`Vista previa del estilo ${estilo.nombre}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium">{estilo.nombre}</div>
                <div className="text-sm text-gray-500">{estilo.descripcion}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Configuración avanzada
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarConfiguracionAvanzada(!mostrarConfiguracionAvanzada)}
          >
            {mostrarConfiguracionAvanzada ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        {mostrarConfiguracionAvanzada && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label>Color primario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={configuracion.colorPrimario}
                  onChange={(e) => onConfiguracionChange({
                    ...configuracion,
                    colorPrimario: e.target.value
                  })}
                  className="w-12 h-12 p-1 rounded"
                />
                <Input
                  type="text"
                  value={configuracion.colorPrimario}
                  onChange={(e) => onConfiguracionChange({
                    ...configuracion,
                    colorPrimario: e.target.value
                  })}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color secundario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={configuracion.colorSecundario}
                  onChange={(e) => onConfiguracionChange({
                    ...configuracion,
                    colorSecundario: e.target.value
                  })}
                  className="w-12 h-12 p-1 rounded"
                />
                <Input
                  type="text"
                  value={configuracion.colorSecundario}
                  onChange={(e) => onConfiguracionChange({
                    ...configuracion,
                    colorSecundario: e.target.value
                  })}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Mostrar opacidad del gradiente solo para el estilo moderno */}
            {estiloActual === 'moderno' && (
              <div className="space-y-2">
                <Label>Opacidad del gradiente</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[configuracion.opacidadGradiente * 100]}
                    onValueChange={([valor]) => onConfiguracionChange({
                      ...configuracion,
                      opacidadGradiente: valor / 100
                    })}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {Math.round(configuracion.opacidadGradiente * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Control de ancho de franja (solo visible para estilo moderno) */}
            {estiloActual === 'moderno' && (
              <div className="space-y-2">
                <Label>Ancho de franja lateral</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[(configuracion.anchoFranja || 0.8) * 100]}
                    onValueChange={([valor]) => onConfiguracionChange({
                      ...configuracion,
                      anchoFranja: valor / 100
                    })}
                    min={20}
                    max={100}
                    step={1}
                  />
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {Math.round((configuracion.anchoFranja || 0.8) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 