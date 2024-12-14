"use client";

import FormularioRegistro from "@/components/autenticacion/FormularioRegistro";
import FondoAjolote from "@/components/global/genericos/FondoAjolote";

export default function RegistroClientPage() {
  return (
    <FondoAjolote>
      {/* Capa exterior con blur */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4">
        {/* Capa interior con la animación de escala */}
        <div className="transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
            Crear Cuenta
          </h2>
          <FormularioRegistro />
        </div>
      </div>
    </FondoAjolote>
  );
}
