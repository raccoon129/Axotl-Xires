import { Metadata } from 'next';
import RegistroBienvenida from '@/components/autenticacion/RegistroBienvenida';
import { redirect } from 'next/navigation';
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export const metadata: Metadata = {
  title: 'Bienvenido a Axotl Xires',
  description: 'Completa tu perfil para comenzar',
  robots: 'noindex, nofollow',
};

export default async function PaginaBienvenida({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;
  
  if (!token) {
    redirect('/registro');
  }

  return (
    <FondoAjolote className="p-0">
      <RegistroBienvenida />
    </FondoAjolote>
  );
} 