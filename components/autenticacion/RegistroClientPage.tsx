"use client";

import dynamic from "next/dynamic";
import FormularioRegistro from "@/components/autenticacion/FormularioRegistro";

const RegistroContainer = dynamic(
  () => import("@/components/autenticacion/RegistroContainer"),
  { ssr: false }
);

export default function RegistroClientPage() {
  return (
    <>
      <div 
        className="min-h-screen bg-[#612c7d] py-16 flex items-center justify-center"
        style={{
          backgroundImage: `url(${process.env.NEXT_PUBLIC_ASSET_URL}/MitadAjoloteBlanco.png)`,
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "40% auto",
          backgroundAttachment: "fixed",
          backgroundOrigin: "border-box",
          backgroundClip: "border-box",
        }}
      >
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 m-4 transform transition-all hover:scale-105">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
            Crear Cuenta
          </h2>
          <FormularioRegistro />
        </div>
      </div>
      <div className="bg-white">
        <RegistroContainer />
      </div>
    </>
  );
}
