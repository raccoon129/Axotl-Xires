// app/perfiles/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';

const PerfilesContent = () => {
  const router = useRouter();
  const { idUsuario } = useAuth();

  useEffect(() => {
    // Si tenemos el idUsuario, redirigimos al perfil específico
    if (idUsuario) {
      router.replace(`/perfiles/${idUsuario}`);
    }
  }, [idUsuario, router]);

  // No necesitamos mostrar nada aquí ya que esta página
  // solo sirve como redirección
  return null;
};

const PerfilesPage = () => {
  return (
    <AuthGuard>
      <PerfilesContent />
    </AuthGuard>
  );
};

export default PerfilesPage;