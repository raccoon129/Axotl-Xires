// app/perfiles/[idUsuario]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PerfilUsuarioClient from './PerfilUsuarioClient';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';

const PerfilUsuarioContent = () => {
  const { idUsuario } = useParams();
  const { isLoggedIn, userProfile } = useAuth();

  // Si hay un idUsuario en la URL, mostramos ese perfil
  // Si no hay idUsuario y el usuario está autenticado, mostramos su propio perfil
  const perfilId = idUsuario || (isLoggedIn ? userProfile?.id : null);

  if (!perfilId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No se ha encontrado un perfil para mostrar.</p>
      </div>
    );
  }

  return <PerfilUsuarioClient />;
};

const PerfilUsuarioPage = () => {
  return (
      <PerfilUsuarioContent />
  );
};

export default PerfilUsuarioPage;