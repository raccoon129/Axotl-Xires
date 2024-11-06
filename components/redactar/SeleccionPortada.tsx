// components/redactar/SeccionPortada.tsx
import { useState } from 'react';
import Image from "next/image";

interface SeccionPortadaProps {
  vistaPrevia: string | null;
  dimensionesPortada: { ancho: number; alto: number };
  nombrePublicacion: string;
  onPortadaChange: (file: File) => void;
  onModalOpen: () => void;
}

export const SeccionPortada: React.FC<SeccionPortadaProps> = ({
  vistaPrevia,
  dimensionesPortada,
  nombrePublicacion,
  onPortadaChange,
  onModalOpen
}) => {
  const validarDimensionesImagen = async (archivo: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const imagen = new window.Image();
      imagen.onload = () => {
        const dimensionesValidas =
          (imagen.width === 612 && imagen.height === 792) ||
          (imagen.width === 918 && imagen.height === 1188) ||
          (imagen.width === 1224 && imagen.height === 1584);
        resolve(dimensionesValidas);
      };
      imagen.src = URL.createObjectURL(archivo);
    });
  };

  const validarTamanoArchivo = (archivo: File): boolean => {
    const tamanoMaximo = 3 * 1024 * 1024; // 3MB en bytes
    return archivo.size <= tamanoMaximo;
  };

  const manejarCambioPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const dimensionesCorrectas = await validarDimensionesImagen(archivo);
      const tamanoValido = validarTamanoArchivo(archivo);

      if (!dimensionesCorrectas) {
        alert("La imagen debe tener dimensiones de 612x792, 918x1188 o 1224x1584 píxeles");
        return;
      }

      if (!tamanoValido) {
        alert("El tamaño del archivo no debe superar los 3MB");
        return;
      }

      if (archivo.type === "image/png" || archivo.type === "image/jpeg") {
        onPortadaChange(archivo);
      } else {
        alert("Solo se permiten archivos PNG o JPG");
      }
    }
  };

  return (
    <div className="portada-section">
      <label className="block font-medium text-gray-600 mb-2">Portada</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => document.getElementById("inputPortada")?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const archivo = e.dataTransfer.files[0];
          const input = document.getElementById("inputPortada") as HTMLInputElement;
          if (input) {
            input.files = e.dataTransfer.files;
            manejarCambioPortada({ target: input } as any);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          id="inputPortada"
          type="file"
          accept="image/png, image/jpeg"
          onChange={manejarCambioPortada}
          className="hidden"
        />
        {vistaPrevia ? (
          <Image
            src={vistaPrevia}
            alt="Vista previa de portada"
            width={dimensionesPortada.ancho / 2}
            height={dimensionesPortada.alto / 2}
            className="rounded shadow-md"
          />
        ) : (
          <>
            <svg
              className="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Arrastra una imagen aquí o haz clic para seleccionar</span>
            <span className="text-sm mt-2 text-gray-400">
              (Dimensiones admitidas: 612x792, 918x1188 o 1224x1584 px, máx. 3MB)
            </span>
          </>
        )}
      </div>
      <label className="mt-4 block font-medium text-gray-600">
        Si no cuentas con una portada, crea una a continuación:
      </label>
      <button
        onClick={onModalOpen}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!nombrePublicacion}
      >
        Crear portada
      </button>
    </div>
  );
};