// components/BarraHerramientas.tsx
import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, ImagePlus, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, Link as LinkIcon,
  Type, Table, Quote
} from 'lucide-react';

interface MenuButtonProps {
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
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

interface BarraHerramientasProps {
  editor: Editor | null;
}

const BarraHerramientas: React.FC<BarraHerramientasProps> = ({ editor }) => {
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
    // Usar createTable en lugar de insertTable
    editor.chain()
      .focus()
      .insertContent({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: Array(3).fill(0).map(() => ({
              type: 'tableHeader',
              content: [{ type: 'paragraph', content: [] }]
            }))
          },
          ...Array(2).fill(0).map(() => ({
            type: 'tableRow',
            content: Array(3).fill(0).map(() => ({
              type: 'tableCell',
              content: [{ type: 'paragraph', content: [] }]
            }))
          }))
        ]
      })
      .run();
  };

  // Definir los niveles de encabezado permitidos
  const headingLevels = [1, 2, 3] as const;
  type HeadingLevel = typeof headingLevels[number];

  return (
    <div className="barra-herramientas border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-10">
      {/* Tamaños de texto */}
      <div className="flex gap-1 mr-2">
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
          title="Texto normal"
        >
          <Type size={16} />
        </MenuButton>
        {headingLevels.map((level) => (
          <MenuButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Título ${level}`}
          >
            <Type size={16 + (4 - level) * 4} />
          </MenuButton>
        ))}
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Formato básico */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrita"
      >
        <Bold size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Cursiva"
      >
        <Italic size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Subrayado"
      >
        <UnderlineIcon size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough size={16} />
      </MenuButton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Listas */}
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Lista con viñetas"
      >
        <List size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListOrdered size={16} />
      </MenuButton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Alineación */}
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinear a la izquierda"
      >
        <AlignLeft size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centrar"
      >
        <AlignCenter size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinear a la derecha"
      >
        <AlignRight size={16} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justificar"
      >
        <AlignJustify size={16} />
      </MenuButton>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      {/* Elementos especiales */}
      <MenuButton
        onClick={insertarTabla}
        title="Insertar tabla"
      >
        <Table size={16} />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Cita"
      >
        <Quote size={16} />
      </MenuButton>

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

      <MenuButton
        onClick={insertarEnlace}
        active={editor.isActive('link')}
        title="Insertar enlace"
      >
        <LinkIcon size={16} />
      </MenuButton>
    </div>
  );
};

export default BarraHerramientas;