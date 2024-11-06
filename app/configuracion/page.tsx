// app/configuracion/page.tsx
'use client';

import { AuthGuard } from '@/components/autenticacion/AuthGuard';
import ConfiguracionContent from './ConfiguracionContent';

const ConfiguracionPage = () => {
  return (
    <AuthGuard>
      <ConfiguracionContent />
    </AuthGuard>
  );
};

export default ConfiguracionPage;