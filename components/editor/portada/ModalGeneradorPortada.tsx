'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/editor/ModalDeslizanteDerecha';
import { GeneradorPortadaAvanzado } from './generadorPortada/GeneradorPortadaAvanzado';
import { useAuth } from '@/hooks/useAuth';

/**
 * ModalGeneradorPortada - Componente contenedor que muestra el generador de portadas
 * en un modal deslizante desde la derecha.
 * 
 * Flujo:
 * 1. Se abre cuando el usuario quiere crear una portada
 * 2. Muestra el GeneradorPortadaAvanzado dentro del modal
 * 3. Cuando el usuario guarda, pasa la imagen generada al callback onGuardar
 */
interface PropiedadesModalGenerador {
  estaAbierto: boolean;        // Controla la visibilidad del modal
  alCerrar: () => void;        // Callback para cerrar el modal
  titulo: string;              // Título de la publicación para mostrar en la portada
  autor?: string;              // Nombre del autor opcional (si no se proporciona, se usa el del usuario autenticado)
  onGuardar: (imagenPortada: string) => void; // Callback que recibe la imagen generada
  dimensiones: {               // Dimensiones de la portada
    ancho: number;
    alto: number;
  };
}

export function ModalGeneradorPortada({
  estaAbierto,
  alCerrar,
  titulo,
  autor,
  onGuardar,
  dimensiones
}: PropiedadesModalGenerador) {
  // Obtener información del usuario autenticado
  const { userName, userProfile, refreshProfile } = useAuth();
  const [nombreAutorFinal, setNombreAutorFinal] = useState<string>(autor || "Autor");
  
  // Efecto para obtener el perfil del usuario cuando se abre el modal
  useEffect(() => {
    if (estaAbierto && !autor) {
      // Si no hay autor proporcionado, intentamos obtener el nombre del usuario
      if (userProfile) {
        // Si ya tenemos el perfil, usamos el nombre completo o el nombre de usuario
        const nombreDelPerfil = userProfile.nombreCompleto || userProfile.nombre || userName;
        if (nombreDelPerfil) {
          setNombreAutorFinal(nombreDelPerfil);
        }
      } else {
        // Si no tenemos el perfil, lo refrescamos
        refreshProfile();
      }
    }
  }, [estaAbierto, autor, userProfile, userName, refreshProfile]);

  // Actualizar el nombre cuando cambia el perfil
  useEffect(() => {
    if (!autor && userProfile) {
      const nombreDelPerfil = userProfile.nombreCompleto || userProfile.nombre || userName;
      if (nombreDelPerfil) {
        setNombreAutorFinal(nombreDelPerfil);
      }
    }
  }, [autor, userProfile, userName]);

  // Eliminar console.log de depuración
  
  return (
    <Modal
      estaAbierto={estaAbierto}
      alCerrar={alCerrar}
      titulo="Crear portada para la publicación"
    >
      <div className="h-[calc(100vh-8rem)] w-full overflow-hidden">
        <GeneradorPortadaAvanzado
          tituloPublicacion={titulo}
          nombreAutor={nombreAutorFinal}
          alGuardar={onGuardar}
        />
      </div>
    </Modal>
  );
}