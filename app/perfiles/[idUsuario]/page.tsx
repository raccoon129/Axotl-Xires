// app/perfiles/[idUsuario]/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PerfilUsuarioClient from './PerfilUsuarioClient';

const PerfilUsuarioPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { idUsuario } = useParams();

  useEffect(() => {
    // Redirige solo si no hay `idUsuario` y el usuario no está autenticado
    if (!idUsuario && !isLoggedIn) {
      router.replace('/');
    }
  }, [idUsuario, isLoggedIn, router]);

  if (!isLoggedIn && !idUsuario) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <img
            src={`${process.env.NEXT_PUBLIC_ASSET_URL}/loader1.svg`}
            alt="Espera un momento"
            width={500}
            height={500}
          />
        </div>
      </div>
    );
  }

  return <PerfilUsuarioClient />;
};

export default PerfilUsuarioPage;
