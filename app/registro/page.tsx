// app/registro/page.tsx
import { Metadata } from 'next';
import BloquearLoginRegistro from '@/components/autenticacion/BloquearLoginRegistro';
import RegistroClientPage from '@/components/autenticacion/RegistroClientPage';
import RegistroContainer from '@/components/autenticacion/RegistroContainer';

export const metadata: Metadata = {
  title: 'Crear una Cuenta - Axotl Xires',
  description: 'Únete a Axotl Xires para compartir y acceder a artículos académicos y científicos. Crea tu cuenta gratuita hoy.',
  keywords: ['registro', 'cuenta nueva', 'axotl xires', 'publicaciones', 'investigación'],
  robots: 'noindex, nofollow', // Evitar indexación de páginas de autenticación
  openGraph: {
    title: 'Crear una Cuenta - Axotl Xires',
    description: 'Únete a nuestra comunidad de divulgación de artículos científicos y académicos',
    type: 'website',
  }
};

export default function PaginaRegistro() {
  return (
    <div className="flex flex-col gap-8">
      <BloquearLoginRegistro>
        <RegistroClientPage />
      </BloquearLoginRegistro>
      
      <div className="mt-8">
        <RegistroContainer />
      </div>
    </div>
  );
}