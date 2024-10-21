// app/login/page.tsx
import FormularioInicioSesion from '@/components/FormularioInicioSesion';

export default function PaginaInicioSesion() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <FormularioInicioSesion />
    </div>
  );
}