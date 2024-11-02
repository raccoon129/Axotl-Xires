'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type
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

const EditorTexto: React.FC = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] px-4 py-2'
      }
    }
  });

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

  return (
    <div className="editor-contenedor border rounded-lg shadow-sm bg-white">
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
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Título mediano"
          >
            <Type size={20} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Título grande"
          >
            <Type size={24} />
          </MenuButton>
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

        {/* Código */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Código en línea"
        >
          <Code size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Bloque de código"
          className="flex items-center gap-1"
        >
          <Code size={16} />
          <span className="text-sm">Bloque</span>
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

      <EditorContent editor={editor} />
    </div>
  );
};

export default EditorTexto;