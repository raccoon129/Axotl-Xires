'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import FormularioRestablecimiento from '@/components/autenticacion/FormularioRestablecimiento';
import BloquearLoginRegistro from '@/components/autenticacion/BloquearLoginRegistro';
import FondoAjolote from '@/components/global/genericos/FondoAjolote';

export default function RestablecimientoPage() {
  const params = useParams();
  const token = params.token as string;
  
  // Establecer título de la página
  useEffect(() => {
    document.title = 'Restablecer Contraseña - Axotl Xires';
  }, []);
  
  return (
    <BloquearLoginRegistro>
      <FondoAjolote>
        {/* Capa exterior con blur */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4">
          {/* Capa interior con la animación de escala */}
          <div className="transform transition-transform duration-300 hover:scale-102">
            <h2 className="text-3xl font-bold text-center mb-3 text-[#612c7d]">
              Restablecer contraseña
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
            </p>
            <FormularioRestablecimiento token={token} />
          </div>
        </div>
      </FondoAjolote>
    </BloquearLoginRegistro>
  );
}
