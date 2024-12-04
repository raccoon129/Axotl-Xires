'use client';

import { useState } from 'react';
import { Layout, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plantilla } from './types';

interface PropiedadesPlantillas {
  onPlantillaSelect: (plantilla: Plantilla) => void;
}

const plantillasDisponibles: Plantilla[] = [
  {
    id: 'academica-1',
    nombre: 'Tesis Doctoral',
    descripcion: 'Diseño formal para tesis y documentos académicos',
    preview: '/previews/plantilla-tesis.png',
    categoria: 'Académico',
    estilo: 'academico',
    elementosTexto: [
      {
        id: 'titulo',
        texto: 'Título de la Tesis',
        fuente: 'georgia',
        tamano: 48,
        color: '#2c3e50',
        posicion: { x: 50, y: 40 },
        alineacion: 'center',
        rotacion: 0,
        fondoActivo: false,
        colorFondo: '#ffffff',
        opacidadFondo: 0.7,
        paddingFondo: 10
      },
      {
        id: 'autor',
        texto: 'Nombre del Autor',
        fuente: 'helvetica',
        tamano: 24,
        color: '#34495e',
        posicion: { x: 50, y: 85 },
        alineacion: 'center',
        rotacion: 0,
        fondoActivo: false,
        colorFondo: '#ffffff',
        opacidadFondo: 0.7,
        paddingFondo: 8
      }
    ],
    configuracion: {
      colorPrimario: '#2c3e50',
      colorSecundario: '#ecf0f1',
      opacidadGradiente: 0.7
    }
  },
  {
    id: 'moderna-1',
    nombre: 'Artículo Científico',
    descripcion: 'Diseño moderno para artículos de investigación',
    preview: '/previews/plantilla-articulo.png',
    categoria: 'Científico',
    estilo: 'moderno',
    elementosTexto: [
      {
        id: 'titulo',
        texto: 'Título del Artículo',
        fuente: 'montserrat',
        tamano: 42,
        color: '#ffffff',
        posicion: { x: 70, y: 50 },
        alineacion: 'right',
        rotacion: 0,
        fondoActivo: true,
        colorFondo: '#000000',
        opacidadFondo: 0.3,
        paddingFondo: 15
      },
      {
        id: 'autor',
        texto: 'Nombre del Autor',
        fuente: 'helvetica',
        tamano: 24,
        color: '#ffffff',
        posicion: { x: 70, y: 60 },
        alineacion: 'right',
        rotacion: 0,
        fondoActivo: true,
        colorFondo: '#000000',
        opacidadFondo: 0.3,
        paddingFondo: 10
      }
    ],
    configuracion: {
      colorPrimario: '#612c7d',
      colorSecundario: '#ffffff',
      opacidadGradiente: 0.8
    }
  }
  // Puedes añadir más plantillas aquí
];

export function PlantillasPortada({ onPlantillaSelect }: PropiedadesPlantillas) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const categorias = Array.from(
    new Set(plantillasDisponibles.map(p => p.categoria))
  );

  const plantillasFiltradas = plantillasDisponibles.filter(plantilla => {
    const coincideBusqueda = plantilla.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            plantilla.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !categoriaSeleccionada || plantilla.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="space-y-2">
        <Label>Buscar plantilla</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtro por categorías */}
      <div className="flex gap-2">
        <button
          onClick={() => setCategoriaSeleccionada(null)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            !categoriaSeleccionada 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {categorias.map(categoria => (
          <button
            key={categoria}
            onClick={() => setCategoriaSeleccionada(categoria)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              categoriaSeleccionada === categoria
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* Lista de plantillas */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 gap-4">
          {plantillasFiltradas.map((plantilla) => (
            <button
              key={plantilla.id}
              onClick={() => onPlantillaSelect(plantilla)}
              className="w-full text-left p-4 rounded-lg border-2 hover:border-purple-200 
                       transition-all duration-200 hover:shadow-md bg-white"
            >
              <div className="flex gap-4">
                <img
                  src={plantilla.preview}
                  alt={plantilla.nombre}
                  className="w-24 h-32 object-cover rounded shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{plantilla.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-2">{plantilla.descripcion}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {plantilla.categoria}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 