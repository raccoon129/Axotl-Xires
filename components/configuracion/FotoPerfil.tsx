'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { RecortadorImagen } from './RecortadorImagen';
import { toast } from 'react-hot-toast';

interface PropiedadesFotoPerfil {
  fotoPreview: string;
  isLoading: boolean;
  onFileChange: (file: File) => void;
  onActualizar: () => void;
  hayNuevaFoto: boolean;
  idUsuario: string | null;
  nombreFoto: string | null;
  onImagenParaRecortar: (imagenSrc: string) => void;
}

export function FotoPerfil({
  fotoPreview,
  isLoading,
  onFileChange,
  onActualizar,
  hayNuevaFoto,
  idUsuario,
  nombreFoto,
  onImagenParaRecortar
}: PropiedadesFotoPerfil) {
  const [imagenParaRecortar, setImagenParaRecortar] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  const obtenerUrlFotoPerfil = () => {
    if (!nombreFoto || !idUsuario) {
      return `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/foto-perfil/${nombreFoto}?t=${timestamp}`;
  };

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

  const handleActualizar = async () => {
    await onActualizar();
    setTimestamp(Date.now());
  };

  return (
    <>
      <section id="foto-perfil" className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Foto de Perfil
          </h2>
          <Button
            onClick={handleActualizar}
            disabled={isLoading || !hayNuevaFoto}
            className="bg-blue-600 text-white"
          >
            {isLoading ? 'Guardando...' : 'Actualizar foto'}
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            <Image
              src={hayNuevaFoto ? fotoPreview : obtenerUrlFotoPerfil()}
              alt="Foto de perfil"
              fill
              className="rounded-full object-cover border-2 border-gray-200"
              unoptimized
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