// app/login/page.tsx
import FormularioInicioSesion from '@/components/FormularioInicioSesion';

export default function PaginaInicioSesion() {
  return (
    <div className="min-h-screen bg-[#612c7d] py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 m-4 transform transition-all hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
          Iniciar Sesión
        </h2>
        <FormularioInicioSesion />
      </div>
    </div>
  );
}
