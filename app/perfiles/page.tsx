// app/perfiles/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const PerfilesPage = () => {
  const router = useRouter();
  const { isLoggedIn, idUsuario } = useAuth();

  useEffect(() => {
    if (isLoggedIn && idUsuario) {
      router.replace(`/perfiles/${idUsuario}`);
    } else {
      router.replace('/');
    }
  }, [isLoggedIn, idUsuario, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <img
          src={`${process.env.NEXT_PUBLIC_ASSET_URL}/loader1.svg`}
          alt="Lo estamos preparando"
          width={500}
          height={500}
        />
      </div>
    </div>
  );
};

export default PerfilesPage;
