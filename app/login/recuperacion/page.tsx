import { Metadata } from 'next';
import FormularioRecuperacion from '@/components/autenticacion/FormularioRecuperacion';
import BloquearLoginRegistro from '@/components/autenticacion/BloquearLoginRegistro';
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña - Axotl Xires',
  description: 'Recupera el acceso a tu cuenta de Axotl Xires',
  keywords: ['recuperar contraseña', 'olvidé contraseña', 'axotl xires', 'acceso'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Recuperar Contraseña - Axotl Xires',
    description: 'Recupera el acceso a tu cuenta de Axotl Xires',
    type: 'website',
  }
};

export default function RecuperacionPage() {
  return (
    <BloquearLoginRegistro>
      <FondoAjolote>
        {/* Capa exterior con blur */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4">
          {/* Capa interior con la animación de escala */}
          <div className="transform transition-transform duration-300 hover:scale-102">
            <h2 className="text-3xl font-bold text-center mb-3 text-[#612c7d]">
              Recuperar contraseña
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña.
            </p>
            <FormularioRecuperacion />
          </div>
        </div>
      </FondoAjolote>
    </BloquearLoginRegistro>
  );
}
