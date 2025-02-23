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
import { useState, useEffect, useCallback } from 'react';
import NotificacionChip from '@/components/global/NotificacionChip';
import { motion } from "framer-motion";
import { ModalEdicionImagen } from './ModalEdicionImagen';
// Este componente maneja el editor de texto enriquecido con soporte para imágenes
// Incluye funcionalidades para:
// 1. Cargar imágenes (drag & drop, pegado, botón)
// 2. Eliminar imágenes automáticamente cuando se quitan del contenido
// 3. Mantener sincronizadas las imágenes entre el editor y el servidor
interface EditorTextoProps {
  onChange?: (content: string) => void;
  initialContent?: string;
  onGuardadoExitoso?: () => void;
  idPublicacion?: number | null;
  borradorGuardado: boolean;
  onGuardar?: () => void;
  onIniciarEdicionImagen?: (
    imagen: File, 
    callback: (imagenEditada: File, descripcion: string) => void
  ) => void;
}

interface ContadorPalabrasProps {
  palabrasActuales: number;
  maxPalabras: number;
}

interface ImagenResponse {
  status: string;
  mensaje: string;
  datos: {
    id_imagen: number;
    url: string;
    descripcion?: string;
    orden?: number;
  };
}

interface ImagenPublicacion {
  id_imagen: number;      // ID único de la imagen en la base de datos
  url: string;           // Nombre del archivo en el servidor (ej: "publicacion-abc123.jpg")
  descripcion: string;   // Descripción opcional de la imagen
  orden: number;         // Orden de aparición en la publicación
}
// Ejemplo de respuesta del servidor al subir una imagen:
// {
//   "status": "success",
//   "mensaje": "Imagen subida exitosamente",
//   "datos": {
//     "id_imagen": 123,
//     "url": "publicacion-abc123.jpg",
//     "descripcion": "Imagen insertada en el editor",
//     "orden": 1
//   }
// }
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
    table-layout: fixed;
  }

  .ProseMirror td,
  .ProseMirror th {
    border: 2px solid #dee2e6;
    padding: 0.75em;
    position: relative;
    vertical-align: top;
  }

  .ProseMirror th {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  .ProseMirror .selectedCell {
    background-color: #e9ecef;
  }

  /* Estilos para el redimensionamiento de columnas */
  .ProseMirror .column-resize-handle {
    background-color: #4299e1;
    bottom: 0;
    position: absolute;
    right: -2px;
    pointer-events: none;
    top: 0;
    width: 4px;
  }

  .ProseMirror table p {
    margin: 0;
  }

  /* Estilos para listas anidadas */
  .ProseMirror ul ul,
  .ProseMirror ol ol,
  .ProseMirror ul ol,
  .ProseMirror ol ul {
    margin: 0.2em 0 0.2em 1.5em;
  }

  .ProseMirror figure.image-figure {
    margin: 2em 0;
    text-align: center;
  }

  .ProseMirror figure.image-figure img {
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }

  .ProseMirror figure.image-figure figcaption {
    margin-top: 0.5em;
    color: grey;
    font-size: 0.9em;
    font-style: italic;
    text-align: center;
    user-select: none;
    pointer-events: none;
  }
`;

// Extendemos la interfaz ImageOptions para incluir uploadImage
declare module '@tiptap/extension-image' {
  interface ImageOptions {
    uploadImage?: (file: File) => Promise<string>;
  }
}

const EditorTexto: React.FC<EditorTextoProps> = ({ 
  onChange, 
  initialContent = '', 
  onGuardadoExitoso,
  idPublicacion,
  borradorGuardado,
  onGuardar,
  onIniciarEdicionImagen
}) => {
  const [contadorPalabras, setContadorPalabras] = useState(0);
  const MAX_PALABRAS = 5000;
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string | null>(null);
  const [tipoNotificacion, setTipoNotificacion] = useState<"excepcion" | "confirmacion" | "notificacion" | null>(null);
  const [imagenesActivas, setImagenesActivas] = useState<ImagenPublicacion[]>([]); // Estado para mantener la lista de imágenes activas en la publicación
  const [editorInstance, setEditorInstance] = useState<ReturnType<typeof useEditor> | null>(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);

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

  // Función para obtener las imágenes de la publicación
   // Obtiene todas las imágenes asociadas a la publicación
  const obtenerImagenesPublicacion = useCallback(async () => {
    if (!idPublicacion) return;
    // Ejemplo de respuesta:
    // {
    //   "status": "success",
    //   "mensaje": "Imágenes recuperadas exitosamente",
    //   "datos": [
    //     { id_imagen: 1, url: "imagen1.jpg", ... },
    //     { id_imagen: 2, url: "imagen2.jpg", ... }
    //   ]
    // }
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/imagenes/publicacion/${idPublicacion}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setImagenesActivas(datos.datos);
      }
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
    }
  }, [idPublicacion]);

  // Cargar imágenes iniciales
  useEffect(() => {
    if (borradorGuardado && idPublicacion) {
      obtenerImagenesPublicacion();
    }
  }, [borradorGuardado, idPublicacion, obtenerImagenesPublicacion]);

  // Componente de barra de progreso
  const BarraCarga = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Cargando imagen</h3>
          <p className="text-sm text-gray-500">Por favor, espere...</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );

  // Manejador principal de carga de imágenes
  // Coordina todo el proceso de carga, edición e inserción de imágenes
  const manejarCargaImagen = useCallback(async (archivo: File): Promise<string> => {
    if (!borradorGuardado || !idPublicacion) {
      setTipoNotificacion("excepcion");
      setMensajeNotificacion("Debes guardar la publicación como borrador antes de añadir imágenes");
      throw new Error("Publicación no guardada");
    }

    return new Promise((resolve, reject) => {
      if (onIniciarEdicionImagen) {
        // Iniciamos el proceso de edición de la imagen
        onIniciarEdicionImagen(archivo, async (imagenEditada, descripcion) => {
          try {
            setCargandoImagen(true);
            if (editorInstance) {
              editorInstance.setEditable(false);
            }
            
            // Preparamos los datos para enviar al servidor
            const formData = new FormData();
            formData.append('imagen', imagenEditada);
            formData.append('descripcion', descripcion);
            
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No hay token de autenticación");
            
            // Subimos la imagen al servidor
            const respuesta = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/imagenes/upload/${idPublicacion}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              }
            );
            
            if (!respuesta.ok) {
              throw new Error("Error al cargar la imagen");
            }
            
            const datos: ImagenResponse = await respuesta.json();
            const urlImagen = `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/imagenes/${datos.datos.url}`;
            
            // Insertamos la imagen con su figura y descripción
            const descripcionAjustada = descripcion.trim();
            if (editorInstance) {
              const figureHtml = `
                <figure class="image-figure" contenteditable="false">
                  <img src="${urlImagen}" alt="${descripcionAjustada}">
                  <figcaption>${descripcionAjustada}</figcaption>
                </figure>
              `;
              // Insertamos el contenido HTML en la posición actual del cursor
              editorInstance.commands.insertContent(figureHtml);
            }
            
            await obtenerImagenesPublicacion();
            setTipoNotificacion("confirmacion");
            setMensajeNotificacion("Imagen cargada exitosamente");
            
            resolve(urlImagen);
          } catch (error) {
            reject(error);
          } finally {
            setCargandoImagen(false);
            if (editorInstance) {
              editorInstance.setEditable(true);
            }
          }
        });
      }
    });
  }, [idPublicacion, borradorGuardado, obtenerImagenesPublicacion, editorInstance, onIniciarEdicionImagen]);

  // Función para verificar qué imágenes han sido eliminadas
  const verificarImagenesEliminadas = useCallback(async () => {
        // 1. Obtiene el HTML actual del editor
    // 2. Extrae todas las URLs de imágenes presentes
    // 3. Compara con la lista de imágenes activas
    // 4. Elimina las imágenes que ya no se usan
    // 5. Actualiza la lista de imágenes activas
    if (!editorInstance || !idPublicacion) return;

    const contenidoActual = editorInstance.getHTML();
    const imagenesEnContenido = new Set<string>();

    // Extraer URLs de imágenes del contenido actual
    const regex = /src="([^"]+)"/g;
    let match;
    while ((match = regex.exec(contenidoActual)) !== null) {
      imagenesEnContenido.add(match[1]);
    }

    // Identificar imágenes que ya no están en el contenido
    const imagenesParaEliminar = imagenesActivas.filter(img => {
      const urlCompleta = `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/imagenes/${img.url}`;
      return !imagenesEnContenido.has(urlCompleta);
    });

    // Eliminar imágenes que ya no están en uso
    for (const imagen of imagenesParaEliminar) {
      try {
        const token = localStorage.getItem('token');
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/editor/publicaciones/imagenes/${idPublicacion}/${imagen.id_imagen}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
      }
    }

    // Actualizar lista de imágenes activas
    if (imagenesParaEliminar.length > 0) {
      await obtenerImagenesPublicacion();
    }
  }, [editorInstance, idPublicacion, imagenesActivas, obtenerImagenesPublicacion]);

  // Configuración del editor
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
        allowBase64: true,
        uploadImage: manejarCargaImagen,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        }
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
      },
      // Manejador para arrastrar y soltar imágenes
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const archivo = event.dataTransfer.files[0];
          const esImagen = archivo.type.startsWith('image/');
          
          if (esImagen) {
            event.preventDefault();
            manejarCargaImagen(archivo).catch(console.error);
            return true;
          }
        }
        return false;
      },
      // Manejador para pegar imágenes desde el portapapeles
      handlePaste: (view, event) => {
        const elementos = Array.from(event.clipboardData?.items || []);
        const elementoImagen = elementos.find(item => item.type.startsWith('image/'));
        
        if (elementoImagen) {
          event.preventDefault();
          const archivo = elementoImagen.getAsFile();
          if (archivo) {
            manejarCargaImagen(archivo).catch(console.error);
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const contenido = editor.getHTML();
      const numeroPalabras = contarPalabras(contenido);
      setContadorPalabras(numeroPalabras);
      onChange?.(contenido);

      // Verificar imágenes eliminadas cuando se actualiza el contenido
      if (borradorGuardado) {
        verificarImagenesEliminadas();
      }
    }
  });

  // Efecto para actualizar la referencia del editor
  useEffect(() => {
    setEditorInstance(editor);
  }, [editor]);

  return (
    <div className="editor-contenedor border rounded-lg shadow-sm bg-white relative">
      <style>{estilosEditor}</style>
      
      <MenuEditor 
        editor={editor} 
        onImageUpload={manejarCargaImagen}
        disabled={cargandoImagen} // Deshabilitar menú durante la carga
      />
      <EditorContent 
        editor={editor} 
        className={cargandoImagen ? 'pointer-events-none opacity-50' : ''} 
      />
      <ContadorPalabras 
        palabrasActuales={contadorPalabras}
        maxPalabras={MAX_PALABRAS}
      />
      {cargandoImagen && <BarraCarga />}
      {mensajeNotificacion && tipoNotificacion && (
        <NotificacionChip
          tipo={tipoNotificacion}
          titulo={tipoNotificacion === "confirmacion" ? "Éxito" : "Error"}
          contenido={mensajeNotificacion}
          onClose={() => {
            setMensajeNotificacion(null);
            setTipoNotificacion(null);
          }}
        />
      )}
    </div>
  );
};

export default EditorTexto;

// Añadir la declaración del tipo global para la función de resolución
declare global {
  interface Window {
    resolveImageUpload?: (imagenEditada: File, descripcion: string) => void;
  }
}