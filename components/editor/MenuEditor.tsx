// components/MenuEditor.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Level } from '@tiptap/extension-heading';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, ImagePlus, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, Link as LinkIcon, Type,
  Table as TableIcon, Plus, Trash, ChevronDown
} from 'lucide-react';
import Tooltip from '@/components/global/Tooltip';

interface MenuEditorProps {
  editor: Editor | null;
}

interface MenuBotonProps {
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

const MenuBoton: React.FC<MenuBotonProps> = ({
  onClick,
  active = false,
  className = '',
  children,
  title
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      active ? 'bg-blue-100 text-blue-600' : ''
    } ${className}`}
    type="button"
  >
    {children}
  </button>
);

const MenuEditor: React.FC<MenuEditorProps> = ({ editor }) => {
  const [mostrarMenuTabla, setMostrarMenuTabla] = useState(false);
  const [filasInput, setFilasInput] = useState('3');
  const [columnasInput, setColumnasInput] = useState('3');
  const menuTablaRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuTablaRef.current && !menuTablaRef.current.contains(event.target as Node)) {
        setMostrarMenuTabla(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  if (!editor) return null;

  const manejarSubidaImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(archivo);
    }
  };

  const insertarEnlace = () => {
    const url = window.prompt('Ingrese la URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertarTabla = () => {
    const filas = parseInt(filasInput);
    const columnas = parseInt(columnasInput);
    if (editor && filas > 0 && columnas > 0) {
      editor.chain().focus().insertTable({ rows: filas, cols: columnas }).run();
      setMostrarMenuTabla(false);
    }
  };

  const agregarFila = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const eliminarFila = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const agregarColumna = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const eliminarColumna = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const eliminarTabla = () => {
    editor?.chain().focus().deleteTable().run();
  };

  // Función para manejar el cambio de encabezado
  const cambiarEncabezado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    if (valor === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      // Convertir el valor string a number y luego a Level
      const level = Number(valor) as Level;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className="barra-herramientas border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-10">
      {/* Encabezados y párrafo */}
      <div className="flex gap-1 mr-2">
        <select
          onChange={cambiarEncabezado}
          className="px-2 py-1 rounded border"
          value={
            editor.isActive('heading', { level: 1 })
              ? '1'
              : editor.isActive('heading', { level: 2 })
              ? '2'
              : editor.isActive('heading', { level: 3 })
              ? '3'
              : 'paragraph'
          }
        >
          <option value="paragraph">Párrafo</option>
          <option value="1">Encabezado 1</option>
          <option value="2">Encabezado 2</option>
          <option value="3">Encabezado 3</option>
        </select>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Formato básico */}
      <MenuBoton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrita"
      >
        <Bold size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Cursiva"
      >
        <Italic size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Subrayado"
      >
        <UnderlineIcon size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough size={16} />
      </MenuBoton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Alineación */}
      <MenuBoton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinear a la izquierda"
      >
        <AlignLeft size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centrar"
      >
        <AlignCenter size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinear a la derecha"
      >
        <AlignRight size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justificar"
      >
        <AlignJustify size={16} />
      </MenuBoton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Listas mejoradas */}
      <MenuBoton
        onClick={() => {
          // Aseguramos que estamos en un párrafo antes de aplicar la lista
          if (!editor.isActive('bulletList')) {
            editor.chain()
              .focus()
              .toggleBulletList()
              .run();
          } else {
            editor.chain()
              .focus()
              .liftListItem('listItem')
              .run();
          }
        }}
        active={editor.isActive('bulletList')}
        title="Lista con viñetas"
      >
        <List size={16} />
      </MenuBoton>
      <MenuBoton
        onClick={() => {
          // Aseguramos que estamos en un párrafo antes de aplicar la lista
          if (!editor.isActive('orderedList')) {
            editor.chain()
              .focus()
              .toggleOrderedList()
              .run();
          } else {
            editor.chain()
              .focus()
              .liftListItem('listItem')
              .run();
          }
        }}
        active={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </MenuBoton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Tabla */}
      <div className="relative" ref={menuTablaRef}>
        <Tooltip message="Insertar o editar tabla">
          <button
            onClick={() => setMostrarMenuTabla(!mostrarMenuTabla)}
            className={`p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1 ${
              editor?.isActive('table') ? 'bg-blue-100 text-blue-600' : ''
            }`}
          >
            <TableIcon size={16} />
            <ChevronDown size={14} className="mt-0.5" />
          </button>
        </Tooltip>

        {mostrarMenuTabla && (
          <div className="absolute z-50 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 right-0">
            {!editor?.isActive('table') ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Insertar tabla</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Filas:</label>
                    <input
                      type="number"
                      min="1"
                      value={filasInput}
                      onChange={(e) => setFilasInput(e.target.value)}
                      className="w-full p-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Columnas:</label>
                    <input
                      type="number"
                      min="1"
                      value={columnasInput}
                      onChange={(e) => setColumnasInput(e.target.value)}
                      className="w-full p-1.5 border rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={insertarTabla}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Insertar tabla
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-1">
                <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">
                  Editar tabla
                </div>
                <div className="divide-y">
                  <div className="py-1">
                    <Tooltip message="Agregar una nueva fila después de la selección">
                      <button
                        onClick={agregarFila}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-sm"
                      >
                        <Plus size={16} className="mr-2" /> Agregar fila
                      </button>
                    </Tooltip>
                    <Tooltip message="Eliminar la fila seleccionada">
                      <button
                        onClick={eliminarFila}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-sm"
                      >
                        <Trash size={16} className="mr-2" /> Eliminar fila
                      </button>
                    </Tooltip>
                  </div>
                  <div className="py-1">
                    <Tooltip message="Agregar una nueva columna después de la selección">
                      <button
                        onClick={agregarColumna}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-sm"
                      >
                        <Plus size={16} className="mr-2" /> Agregar columna
                      </button>
                    </Tooltip>
                    <Tooltip message="Eliminar la columna seleccionada">
                      <button
                        onClick={eliminarColumna}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-sm"
                      >
                        <Trash size={16} className="mr-2" /> Eliminar columna
                      </button>
                    </Tooltip>
                  </div>
                  <div className="py-1">
                    <Tooltip message="Eliminar la tabla completa">
                      <button
                        onClick={eliminarTabla}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash size={16} className="mr-2" /> Eliminar tabla
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Color, Imagen y Enlaces */}
      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-8 h-8 p-1 rounded cursor-pointer"
        title="Color de texto"
      />
      
      <label className="cursor-pointer" title="Insertar imagen">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={manejarSubidaImagen}
        />
        <div className="p-2 rounded hover:bg-gray-100">
          <ImagePlus size={16} />
        </div>
      </label>

      <MenuBoton
        onClick={insertarEnlace}
        active={editor.isActive('link')}
        title="Insertar enlace"
      >
        <LinkIcon size={16} />
      </MenuBoton>
    </div>
  );
};

export default MenuEditor;