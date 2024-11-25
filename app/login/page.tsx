// app/login/page.tsx
import { Metadata } from 'next';
import FormularioInicioSesion from "@/components/autenticacion/FormularioInicioSesion";
import BloquearLoginRegistro from "@/components/autenticacion/BloquearLoginRegistro";

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Axotl Xires',
  description: 'Accede a tu cuenta de Axotl Xires para gestionar tus publicaciones y participar en la divulgación de artículos científicos y académicos.',
  keywords: ['inicio sesión', 'login', 'axotl xires', 'acceso'],
  robots: 'noindex, nofollow', // Evitar indexación de páginas de autenticación
  openGraph: {
    title: 'Iniciar Sesión - Axotl Xires',
    description: 'Accede a tu cuenta de Axotl Xires - Plataforma para la divulgación de artículos científicos y académicos.',
    type: 'website',
  }
};

export default function PaginaInicioSesion() {
  return (
    <BloquearLoginRegistro>
      <div 
        className="min-h-screen bg-[#612c7d] py-16 flex items-center justify-center"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_ASSET_URL}/MitadAjoloteBlanco.png)`,
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '40% auto',
          backgroundAttachment: 'fixed',
          backgroundOrigin: 'border-box',
          backgroundClip: 'border-box'
        }}
      >
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4 transform transition-all hover:scale-105">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
            Iniciar Sesión
          </h2>
          <FormularioInicioSesion />
        </div>
      </div>
    </BloquearLoginRegistro>
  );
}
