// app/registro/page.tsx
import FormularioRegistro from '@/components/autenticacion/FormularioRegistro';
import BloquearLoginRegistro from '@/components/autenticacion/BloquearLoginRegistro';

export default function PaginaRegistro() {
  return (
    <BloquearLoginRegistro>
      <main className="min-h-screen bg-[#612c7d]">
        <FormularioRegistro />
      </main>
    </BloquearLoginRegistro>
  );
}