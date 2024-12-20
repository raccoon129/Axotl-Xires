// components/EditorTexto.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import MenuEditor from './MenuEditor';
import { useState, useEffect } from 'react';

interface EditorTextoProps {
  onChange?: (content: string) => void;
  initialContent?: string;
  onGuardadoExitoso?: () => void;
}

interface ContadorPalabrasProps {
  palabrasActuales: number;
  maxPalabras: number;
}

const ContadorPalabras: React.FC<ContadorPalabrasProps> = ({ palabrasActuales, maxPalabras }) => {
  const porcentaje = (palabrasActuales / maxPalabras) * 100;
  
  const obtenerColorBarra = () => {
    if (porcentaje <= 60) return 'bg-green-500';
    if (porcentaje <= 85) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="px-4 py-2 border-t">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{palabrasActuales.toLocaleString()} / {maxPalabras.toLocaleString()} palabras</span>
        <span>{Math.round(porcentaje)}%</span>
      </div>
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${obtenerColorBarra()}`}
          style={{ width: `${Math.min(porcentaje, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Estilos CSS para la fuente Crimson Text y listas
const estilosEditor = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

  .ProseMirror {
    font-family: 'Crimson Text', serif;
  }

  .ProseMirror h1 {
    font-size: 2.5em;
    font-weight: 700;
    margin: 1em 0 0.5em;
  }

  .ProseMirror h2 {
    font-size: 2em;
    font-weight: 600;
    margin: 1em 0 0.5em;
  }

  .ProseMirror h3 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1em 0 0.5em;
  }

  .ProseMirror p {
    font-size: 1.125em;
    line-height: 1.6;
    margin: 0.5em 0;
  }

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .ProseMirror li {
    margin: 0.2em 0;
  }

  .ProseMirror table {
    border-collapse: collapse;
    margin: 1em 0;
    width: 100%;
  }

  .ProseMirror td,
  .ProseMirror th {
    border: 1px solid #ccc;
    padding: 0.5em;
  }

  .ProseMirror th {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  /* Estilos para listas anidadas */
  .ProseMirror ul ul,
  .ProseMirror ol ol,
  .ProseMirror ul ol,
  .ProseMirror ol ul {
    margin: 0.2em 0 0.2em 1.5em;
  }
`;

const EditorTexto: React.FC<EditorTextoProps> = ({ 
  onChange, 
  initialContent = '', 
  onGuardadoExitoso 
}) => {
  const [contadorPalabras, setContadorPalabras] = useState(0);
  const MAX_PALABRAS = 5000;

  // Función para contar palabras
  const contarPalabras = (texto: string) => {
    const textoLimpio = texto.replace(/<[^>]*>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
    return textoLimpio ? textoLimpio.split(' ').length : 0;
  };

  // Efecto para inicializar el contador con el contenido inicial
  useEffect(() => {
    if (initialContent) {
      const palabrasIniciales = contarPalabras(initialContent);
      setContadorPalabras(palabrasIniciales);
    }
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: false,  // Desactivamos las listas del StarterKit
        orderedList: false, // para usar nuestras propias configuraciones
        listItem: false
      }),
      // Configuramos las listas de manera independiente
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list'
        }
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list'
        }
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item'
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
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] px-4 py-2'
      }
    },
    onUpdate: ({ editor }) => {
      const contenido = editor.getHTML();
      const numeroPalabras = contarPalabras(contenido);
      setContadorPalabras(numeroPalabras);
      onChange?.(contenido);
    }
  });

  return (
    <div className="editor-contenedor border rounded-lg shadow-sm bg-white">
      <style>{estilosEditor}</style>
      <MenuEditor editor={editor} />
      <EditorContent editor={editor} />
      <ContadorPalabras 
        palabrasActuales={contadorPalabras}
        maxPalabras={MAX_PALABRAS}
      />
    </div>
  );
};

export default EditorTexto;