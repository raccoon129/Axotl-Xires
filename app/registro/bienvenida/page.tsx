import { Metadata } from 'next';
import RegistroBienvenida from '@/components/autenticacion/RegistroBienvenida';
import { redirect } from 'next/navigation';
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export const metadata: Metadata = {
  title: 'Bienvenido a Axotl Xires',
  description: 'Completa tu perfil para comenzar',
  robots: 'noindex, nofollow',
};

interface PageProps {
  params?: Promise<{ [key: string]: string | string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaginaBienvenida({ searchParams }: PageProps) {
  // Esperar a que se resuelva la Promise de searchParams
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token as string;
  
  if (!token) {
    redirect('/registro');
  }

  return (
    <FondoAjolote className="p-0">
      <RegistroBienvenida />
    </FondoAjolote>
  );
}