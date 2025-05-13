'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { RecortadorImagen } from './RecortadorImagen';
import { toast } from 'react-hot-toast';

interface PropiedadesFotoPerfil {
  fotoPreview: string;
  onFileChange: (file: File) => void;
  hayNuevaFoto: boolean;
  idUsuario: string | null;
  nombreFoto: string | null;
  onImagenParaRecortar: (imagenSrc: string) => void;
  onActualizacionExitosa: () => Promise<void>;
  onNotificacion: (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string) => void;
  fotoRecortada: File | null; // Nueva propiedad para recibir la foto del componente padre
}

export function FotoPerfil({
  fotoPreview,
  onFileChange,
  hayNuevaFoto,
  idUsuario,
  nombreFoto,
  onImagenParaRecortar,
  onActualizacionExitosa,
  onNotificacion,
  fotoRecortada // Recibir la foto recortada directamente del padre
}: PropiedadesFotoPerfil) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagenParaRecortar, setImagenParaRecortar] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [mostrarFotoLocal, setMostrarFotoLocal] = useState(false);

  const obtenerUrlFotoPerfil = () => {
    if (!nombreFoto || !idUsuario) {
      return `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${nombreFoto}?t=${timestamp}`;
  };

  // Reset del estado local cuando cambia nombreFoto (después de actualizar)
  useEffect(() => {
    setMostrarFotoLocal(false);
  }, [nombreFoto]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('La imagen no debe superar 1MB');
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Solo se permiten imágenes JPG y PNG');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImagenParaRecortar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleImagenRecortada = (file: File) => {
    onFileChange(file);
    setImagenParaRecortar(null);
  };

  const handleClickCambiarFoto = () => {
    inputFileRef.current?.click();
  };

  /**
   * Actualiza la foto de perfil del usuario
   * Esta función envía el archivo de imagen al servidor mediante FormData
   */
  const actualizarFotoPerfil = async () => {
    // Verificamos que exista un ID de usuario y un archivo de foto para enviar
    if (!idUsuario || !hayNuevaFoto || !fotoRecortada) {
      // Mensaje de depuración para identificar qué falta
      console.log("No se puede actualizar foto:", { 
        idUsuario, 
        hayNuevaFoto, 
        tieneFotoRecortada: !!fotoRecortada 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Obtenemos el token de autenticación
      const token = localStorage.getItem('token');
      
      // Creamos un objeto FormData para enviar el archivo
      const datosFormulario = new FormData();
      // Utilizamos la foto recortada que viene del componente padre
      datosFormulario.append('foto_perfil', fotoRecortada);
      
      // Realizamos la petición PUT con el archivo
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion/usuarios/${idUsuario}/foto`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // No incluimos 'Content-Type' porque FormData lo establece automáticamente
          },
          body: datosFormulario
        }
      );

      // Procesamos la respuesta del servidor
      const datos = await respuesta.json();
      
      // Si la respuesta no es exitosa, lanzamos un error
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al actualizar foto de perfil');
      }
      
      // Actualizamos el perfil en el contexto de autenticación
      await onActualizacionExitosa();
      
      // Restablecer el estado para mostrar la nueva imagen del servidor
      setMostrarFotoLocal(false);
      
      // Actualizamos el timestamp para forzar la recarga de la imagen
      setTimestamp(Date.now());
      
      // Mostramos notificación de éxito
      onNotificacion(
        "confirmacion",
        "Foto actualizada",
        datos.mensaje || "La foto de perfil se ha actualizado correctamente"
      );
    } catch (error) {
      console.error('Error completo:', error);
      // Manejamos cualquier error que ocurra durante el proceso
      onNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar foto"
      );
    } finally {
      // Finalizamos el estado de carga independientemente del resultado
      setIsLoading(false);
    }
  };

  // Al recibir un archivo recortado, mostrar la vista previa local
  useEffect(() => {
    if (fotoRecortada) {
      setMostrarFotoLocal(true);
    }
  }, [fotoRecortada]);

  return (
    <>
      <section id="foto-perfil" className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Foto de Perfil
          </h2>
          <Button
            onClick={actualizarFotoPerfil}
            disabled={isLoading || !fotoRecortada}
            className="bg-blue-600 text-white"
          >
            {isLoading ? 'Guardando...' : 'Actualizar foto'}
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            <Image
              src={mostrarFotoLocal && hayNuevaFoto ? fotoPreview : obtenerUrlFotoPerfil()}
              alt="Foto de perfil"
              fill
              className="rounded-full object-cover border-2 border-gray-200"
              unoptimized
              key={`foto-perfil-${timestamp}`} // Forzar re-renderizado al cambiar timestamp
            />
          </div>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />
          <Button
            onClick={handleClickCambiarFoto}
            disabled={isLoading}
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Cambiar foto
          </Button>
          <p className="text-sm text-gray-500">
            JPG o PNG. Máximo 1MB.
          </p>
          {fotoRecortada && mostrarFotoLocal && (
            <p className="text-sm text-green-600 font-medium">
              Nueva imagen seleccionada. Haz clic en "Actualizar foto" para guardar.
            </p>
          )}
        </div>
      </section>

      {imagenParaRecortar && (
        <RecortadorImagen
          imagenSrc={imagenParaRecortar}
          onImagenRecortada={handleImagenRecortada}
          onCancelar={() => setImagenParaRecortar(null)}
        />
      )}
    </>
  );
}