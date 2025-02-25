'use client';

import { useState } from 'react';
import { Palette, Layout, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ConfiguracionEstilo } from './types';
/**
 * EstilosPortada - Componente para seleccionar y configurar el estilo visual de la portada
 * 
 * Funcionalidades:
 * 1. Selección entre diferentes estilos predefinidos (clásico, moderno, académico)
 * 2. Configuración avanzada de colores y opacidad
 * 3. Vista previa visual de cada estilo
 */
interface PropiedadesEstilosPortada {
  estiloActual: string;
  configuracion: ConfiguracionEstilo;
  onEstiloChange: (estilo: string) => void;
  onConfiguracionChange: (config: ConfiguracionEstilo) => void;
}
// Definición de los estilos disponibles con sus configuraciones predeterminadas
interface EstiloPortada {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  configuracionPredeterminada: ConfiguracionEstilo;
}

const estilosDisponibles: EstiloPortada[] = [
  {
    id: 'clasico',
    nombre: 'Sencillo',
    descripcion: 'Diseño tradicional con imagen superior y texto inferior',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C1.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#1a1a1a',
      colorSecundario: '#ffffff',
      opacidadGradiente: 0.6
    }
  },
  {
    id: 'moderno',
    nombre: 'Moderno',
    descripcion: 'Diseño con franja lateral y gradiente sobre la imagen',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C2.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#612c7d',
      colorSecundario: '#ffffff',
      opacidadGradiente: 0.8
    }
  },
  {
    id: 'academico',
    nombre: 'Académico',
    descripcion: 'Formato formal con marco y disposición centrada',
    preview: `${process.env.NEXT_PUBLIC_ASSET_URL}/img/portadas/C3.gif`,
    configuracionPredeterminada: {
      colorPrimario: '#2c3e50',
      colorSecundario: '#ecf0f1',
      opacidadGradiente: 0.7
    }
  }
];

export function EstilosPortada({
  estiloActual,
  configuracion,
  onEstiloChange,
  onConfiguracionChange
}: PropiedadesEstilosPortada) {
  const [mostrarConfiguracionAvanzada, setMostrarConfiguracionAvanzada] = useState(false);

  const handleEstiloChange = (nuevoEstilo: string) => {
    const estilo = estilosDisponibles.find(e => e.id === nuevoEstilo);
    if (estilo) {
      onEstiloChange(nuevoEstilo);
      onConfiguracionChange(estilo.configuracionPredeterminada);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de estilo */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Estilo de portada
        </Label>
        <RadioGroup
          value={estiloActual}
          onValueChange={handleEstiloChange}
          className="grid grid-cols-1 gap-4"
        >
          {estilosDisponibles.map((estilo) => (
            <div key={estilo.id} className="relative">
              <RadioGroupItem
                value={estilo.id}
                id={estilo.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={estilo.id}
                className="flex flex-col gap-2 p-4 rounded-lg border-2 cursor-pointer
                         transition-all duration-200 hover:border-purple-200
                         peer-checked:border-purple-500 peer-checked:bg-purple-50"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={estilo.preview}
                    alt={estilo.nombre}
                    className="w-24 h-32 object-cover rounded shadow-sm"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{estilo.nombre}</h3>
                    <p className="text-sm text-gray-500">{estilo.descripcion}</p>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Configuración avanzada */}
      <div className="space-y-4">
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

            <div className="space-y-2">
              <Label>Opacidad del gradiente</Label>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 