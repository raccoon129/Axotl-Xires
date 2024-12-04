'use client';

import { useState } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, RotateCw, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ElementoTexto } from './types';
import { Switch } from '@/components/ui/switch';

interface PropiedadesEditorTexto {
  elementos: ElementoTexto[];
  onElementosChange: (elementos: ElementoTexto[]) => void;
}

const fuentes = [
  { id: 'crimson', nombre: 'Crimson Text', clase: 'font-crimson' },
  { id: 'helvetica', nombre: 'Helvetica', clase: 'font-sans' },
  { id: 'georgia', nombre: 'Georgia', clase: 'font-serif' },
  { id: 'montserrat', nombre: 'Montserrat', clase: 'font-montserrat' }
];

export function EditorTexto({ elementos, onElementosChange }: PropiedadesEditorTexto) {
  const [elementoActivo, setElementoActivo] = useState<string>(elementos[0].id);

  const actualizarElemento = (id: string, cambios: Partial<ElementoTexto>) => {
    onElementosChange(
      elementos.map(elemento => 
        elemento.id === id ? { ...elemento, ...cambios } : elemento
      )
    );
  };

  const elemento = elementos.find(e => e.id === elementoActivo) || elementos[0];

  return (
    <div className="space-y-6">
      {/* Selector de elemento */}
      <div className="space-y-2">
        <Label>Elemento</Label>
        <Select value={elementoActivo} onValueChange={setElementoActivo}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {elementos.map(e => (
              <SelectItem key={e.id} value={e.id}>
                <div className="flex items-center gap-2">
                  <Grip className="w-4 h-4" />
                  <span>{e.id === 'titulo' ? 'Título' : 'Autor'}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Editor de texto */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Texto</Label>
          <Input
            value={elemento.texto}
            onChange={(e) => actualizarElemento(elemento.id, { texto: e.target.value })}
            className={`${fuentes.find(f => f.id === elemento.fuente)?.clase}`}
            style={{ fontSize: `${elemento.tamano / 3}px` }}
          />
        </div>

        <div className="space-y-2">
          <Label>Fuente</Label>
          <Select 
            value={elemento.fuente}
            onValueChange={(valor) => actualizarElemento(elemento.id, { fuente: valor })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fuentes.map(fuente => (
                <SelectItem 
                  key={fuente.id} 
                  value={fuente.id}
                  className={fuente.clase}
                >
                  {fuente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Tamaño
          </Label>
          <Slider
            value={[elemento.tamano]}
            onValueChange={([valor]) => actualizarElemento(elemento.id, { tamano: valor })}
            min={12}
            max={120}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={elemento.color}
              onChange={(e) => actualizarElemento(elemento.id, { color: e.target.value })}
              className="w-12 h-12 p-1 rounded"
            />
            <Input
              type="text"
              value={elemento.color}
              onChange={(e) => actualizarElemento(elemento.id, { color: e.target.value })}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((alineacion) => (
              <Button
                key={alineacion}
                variant={elemento.alineacion === alineacion ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => actualizarElemento(elemento.id, { alineacion })}
              >
                {alineacion === 'left' && <AlignLeft className="w-4 h-4" />}
                {alineacion === 'center' && <AlignCenter className="w-4 h-4" />}
                {alineacion === 'right' && <AlignRight className="w-4 h-4" />}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Rotación
          </Label>
          <Slider
            value={[elemento.rotacion]}
            onValueChange={([valor]) => actualizarElemento(elemento.id, { rotacion: valor })}
            min={-180}
            max={180}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Posición</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">X (%)</Label>
              <Input
                type="number"
                value={elemento.posicion.x}
                onChange={(e) => actualizarElemento(elemento.id, { 
                  posicion: { ...elemento.posicion, x: Number(e.target.value) }
                })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label className="text-xs">Y (%)</Label>
              <Input
                type="number"
                value={elemento.posicion.y}
                onChange={(e) => actualizarElemento(elemento.id, { 
                  posicion: { ...elemento.posicion, y: Number(e.target.value) }
                })}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección de fondo de texto */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Fondo del texto</Label>
          <Switch
            checked={elemento.fondoActivo}
            onCheckedChange={(checked) => {
              actualizarElemento(elemento.id, { fondoActivo: checked });
            }}
          />
        </div>

        {elemento.fondoActivo && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            {/* Color de fondo */}
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    type="color"
                    value={elemento.colorFondo}
                    onChange={(e) => actualizarElemento(elemento.id, { colorFondo: e.target.value })}
                    className="w-12 h-12 p-1 rounded cursor-pointer"
                  />
                  <div 
                    className="absolute inset-0 rounded border border-gray-200"
                    style={{ backgroundColor: elemento.colorFondo }}
                  />
                </div>
                <Input
                  type="text"
                  value={elemento.colorFondo}
                  onChange={(e) => actualizarElemento(elemento.id, { colorFondo: e.target.value })}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Opacidad del fondo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opacidad del fondo</Label>
                <span className="text-sm text-gray-500">
                  {Math.round(elemento.opacidadFondo * 100)}%
                </span>
              </div>
              <Slider
                value={[elemento.opacidadFondo * 100]}
                onValueChange={([valor]) => actualizarElemento(elemento.id, { opacidadFondo: valor / 100 })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Padding del fondo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Espaciado del fondo</Label>
                <span className="text-sm text-gray-500">
                  {elemento.paddingFondo}px
                </span>
              </div>
              <Slider
                value={[elemento.paddingFondo]}
                onValueChange={([valor]) => actualizarElemento(elemento.id, { paddingFondo: valor })}
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* Vista previa */}
            <div className="mt-4">
              <Label className="text-sm text-gray-500">Vista previa</Label>
              <div className="mt-2 p-4 bg-white rounded border">
                <div
                  className={`inline-block ${fuentes.find(f => f.id === elemento.fuente)?.clase}`}
                  style={{
                    padding: `${elemento.paddingFondo}px`,
                    backgroundColor: elemento.colorFondo,
                    opacity: elemento.opacidadFondo,
                    color: elemento.color,
                    fontSize: `${elemento.tamano / 3}px`,
                  }}
                >
                  {elemento.texto || 'Texto de ejemplo'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 