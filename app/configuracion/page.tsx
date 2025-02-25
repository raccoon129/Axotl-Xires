// app/configuracion/page.tsx
'use client';

import { useEffect } from 'react';
import { AuthGuard } from '@/components/autenticacion/AuthGuard';
import ConfiguracionContent from './ConfiguracionContent';
import Head from 'next/head';

const ConfiguracionPage = () => {
  useEffect(() => {
    // Establecer el título al montar el componente
    document.title = 'Configuración de la cuenta - Axotl Xires';

    // Cleanup function para restaurar el título original
    return () => {
      document.title = 'Axotl Xires';
    };
  }, []);

  return (
    <AuthGuard>
      <Head>
        <title>Configuración de la cuenta - Axotl Xires</title>
      </Head>
      <ConfiguracionContent />
    </AuthGuard>
  );
};

export default ConfiguracionPage;