// app/login/page.tsx
import { Metadata } from 'next';
import FormularioInicioSesion from "@/components/autenticacion/FormularioInicioSesion";
import BloquearLoginRegistro from "@/components/autenticacion/BloquearLoginRegistro";
import FondoAjolote from "@/components/global/genericos/FondoAjolote";

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Axotl Xires',
  description: 'Accede a tu cuenta de Axotl Xires para gestionar tus publicaciones y participar en la divulgación de artículos científicos y académicos.',
  keywords: ['inicio sesión', 'login', 'axotl xires', 'acceso'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Iniciar Sesión - Axotl Xires',
    description: 'Accede a tu cuenta de Axotl Xires - Plataforma para la divulgación de artículos científicos y académicos.',
    type: 'website',
  }
};

export default function PaginaInicioSesion() {
  return (
    <BloquearLoginRegistro>
      <FondoAjolote>
        {/* Capa exterior con blur */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4">
          {/* Capa interior con la animación de escala */}
          <div className="transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
              Iniciar Sesión
            </h2>
            <FormularioInicioSesion />
          </div>
        </div>
      </FondoAjolote>
    </BloquearLoginRegistro>
  );
}
