import { Metadata } from 'next';
import RegistroBienvenida from '@/components/autenticacion/RegistroBienvenida';
import { redirect } from 'next/navigation';
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export const metadata: Metadata = {
  title: 'Bienvenido a Axotl Xires',
  description: 'Completa tu perfil para comenzar',
  robots: 'noindex, nofollow',
};

export default function PaginaBienvenida({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token = searchParams.token as string;
  
  if (!token) {
    redirect('/registro');
  }

  return (
    <FondoAjolote className="p-0">
      <RegistroBienvenida />
    </FondoAjolote>
  );
}