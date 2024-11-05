// components/MenuEditor.tsx
'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { Level } from '@tiptap/extension-heading';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, ImagePlus, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, Link as LinkIcon, Type,
  Table
} from 'lucide-react';

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
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
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
      <MenuBoton
        onClick={insertarTabla}
        title="Insertar tabla"
      >
        <Table size={16} />
      </MenuBoton>

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