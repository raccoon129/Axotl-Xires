'use client';

import { useState, useEffect } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, RotateCw, Grip, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ElementoTexto } from './types';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * EditorTextoPortada - Componente para editar los elementos de texto de la portada
 * 
 * Funcionalidades:
 * 1. Edición de texto para título y autor
 * 2. Configuración de fuente, tamaño, color y alineación
 * 3. Ajuste de posición y rotación mediante sliders
 * 4. Configuración de fondo para el texto (color, opacidad, padding, redondeo)
 */
interface PropiedadesEditorTexto {
  elementos: ElementoTexto[];                          // Elementos de texto (título, autor)
  onElementosChange: (elementos: ElementoTexto[]) => void; // Callback para actualizar elementos
}

// Definición de fuentes disponibles
const fuentes = [
  { id: 'crimson', nombre: 'Crimson Text', clase: 'font-crimson' },
  { id: 'helvetica', nombre: 'Helvetica', clase: 'font-sans' },
  { id: 'georgia', nombre: 'Georgia', clase: 'font-serif' },
  { id: 'montserrat', nombre: 'Montserrat', clase: 'font-montserrat' }
];

export function EditorTexto({ elementos, onElementosChange }: PropiedadesEditorTexto) {
  // Estado para controlar qué elemento se está editando actualmente
  const [elementoActivo, setElementoActivo] = useState<string>(elementos[0].id);

  // Asegurar que la fuente esté seleccionada por defecto
  useEffect(() => {
    // Si el elemento no tiene fuente asignada, asignar la primera por defecto
    const elemento = elementos.find(e => e.id === elementoActivo);
    if (elemento && !elemento.fuente) {
      actualizarElemento(elementoActivo, { fuente: fuentes[0].id });
    }
  }, [elementoActivo, elementos]);

  /**
   * Actualiza las propiedades de un elemento específico
   * @param id - ID del elemento a actualizar
   * @param cambios - Propiedades a modificar
   */
  const actualizarElemento = (id: string, cambios: Partial<ElementoTexto>) => {
    onElementosChange(
      elementos.map(elemento => 
        elemento.id === id ? { ...elemento, ...cambios } : elemento
      )
    );
  };

  // Obtener el elemento actualmente seleccionado
  const elemento = elementos.find(e => e.id === elementoActivo) || elementos[0];

  return (
    <div className="space-y-6">
      {/* Selector de elemento (título o autor) */}
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
                  <Grip className="w-4 h-4 text-gray-400" />
                  {e.id === 'titulo' ? 'Título' : 'Autor'}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Editor de texto */}
      <div className="space-y-4">
        {/* Campo de texto con vista previa de la fuente y tamaño */}
        <div className="space-y-2">
          <Label>Texto</Label>
          <Input
            value={elemento.texto}
            onChange={(e) => actualizarElemento(elemento.id, { texto: e.target.value })}
            className={`${fuentes.find(f => f.id === elemento.fuente)?.clase}`}
            style={{ fontSize: `${Math.min(elemento.tamano / 4, 24)}px` }}
            placeholder={elemento.id === 'titulo' ? 'Título de la publicación' : 'Nombre del autor'}
          />
        </div>

        {/* Selector de fuente */}
        <div className="space-y-2">
          <Label>Fuente</Label>
          <Select 
            value={elemento.fuente || fuentes[0].id} 
            onValueChange={(valor) => actualizarElemento(elemento.id, { fuente: valor })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fuentes.map(fuente => (
                <SelectItem key={fuente.id} value={fuente.id} className={fuente.clase}>
                  {fuente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Control de tamaño */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Tamaño
          </Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[elemento.tamano]}
              onValueChange={([valor]) => actualizarElemento(elemento.id, { tamano: valor })}
              min={12}
              max={72}
              step={1}
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {elemento.tamano}px
            </span>
          </div>
        </div>

        {/* Selector de color */}
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

        {/* Selector de alineación */}
        <div className="space-y-2">
          <Label>Alineación</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={elemento.alineacion === 'left' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => actualizarElemento(elemento.id, { alineacion: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={elemento.alineacion === 'center' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => actualizarElemento(elemento.id, { alineacion: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={elemento.alineacion === 'right' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => actualizarElemento(elemento.id, { alineacion: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
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
              value={[elemento.rotacion]}
              onValueChange={([valor]) => actualizarElemento(elemento.id, { rotacion: valor })}
              min={-180}
              max={180}
              step={1}
            />
            <span className="text-sm text-gray-500 w-12 text-right">
              {elemento.rotacion}°
            </span>
          </div>
        </div>

        {/* Control de posición con sliders para X e Y */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Grip className="w-4 h-4" />
            Posición
          </Label>
          
          {/* Slider para posición horizontal (X) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3 h-3 text-gray-400" />
              <Slider
                value={[elemento.posicion.x]}
                onValueChange={([valor]) => actualizarElemento(elemento.id, { 
                  posicion: { ...elemento.posicion, x: valor } 
                })}
                min={0}
                max={100}
                step={1}
              />
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-500 w-8 text-right">
                {Math.round(elemento.posicion.x)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">Posición horizontal</p>
          </div>
          
          {/* Slider para posición vertical (Y) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3 h-3 text-gray-400" />
              <Slider
                value={[elemento.posicion.y]}
                onValueChange={([valor]) => actualizarElemento(elemento.id, { 
                  posicion: { ...elemento.posicion, y: valor } 
                })}
                min={0}
                max={100}
                step={1}
              />
              <ArrowDown className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-500 w-8 text-right">
                {Math.round(elemento.posicion.y)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">Posición vertical</p>
          </div>
        </div>

        {/* Configuración de fondo */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label>Fondo del texto</Label>
            <Switch
              checked={elemento.fondoActivo}
              onCheckedChange={(valor) => actualizarElemento(elemento.id, { fondoActivo: valor })}
            />
          </div>

          {elemento.fondoActivo && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-100">
              {/* Color de fondo con picker */}
              <div className="space-y-2">
                <Label>Color de fondo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={elemento.colorFondo}
                    onChange={(e) => actualizarElemento(elemento.id, { colorFondo: e.target.value })}
                    className="w-12 h-12 p-1 rounded"
                  />
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

              {/* Redondeo del fondo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Redondeo de esquinas</Label>
                  <span className="text-sm text-gray-500">
                    {elemento.bordeRedondeado || 0}px
                  </span>
                </div>
                <Slider
                  value={[elemento.bordeRedondeado || 0]}
                  onValueChange={([valor]) => actualizarElemento(elemento.id, { bordeRedondeado: valor })}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Vista previa del texto con fondo */}
          <div className="mt-4">
            <Label className="text-sm text-gray-500">Vista previa</Label>
            <div className="mt-2 p-4 bg-white rounded border">
              <div
                className={`inline-block ${fuentes.find(f => f.id === elemento.fuente)?.clase}`}
                style={{
                  padding: `${elemento.paddingFondo}px`,
                  backgroundColor: elemento.fondoActivo ? elemento.colorFondo : 'transparent',
                  opacity: elemento.fondoActivo ? elemento.opacidadFondo : 1,
                  color: elemento.color,
                  fontSize: `${elemento.tamano / 3}px`,
                  borderRadius: `${elemento.bordeRedondeado || 0}px`,
                }}
              >
                {elemento.texto || 'Texto de ejemplo'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 