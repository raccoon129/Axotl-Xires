// components/FormularioInicioSesion.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

const FormularioInicioSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { updateAuthAfterLogin } = useAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;
      const respuesta = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        await updateAuthAfterLogin(datos.token);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente.",
        });

        router.push(`/perfiles/${datos.usuario.id}`);
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: datos.mensaje || 'Credenciales incorrectas, por favor inténtalo de nuevo.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      toast({
        title: "Error de inicio de sesión",
        description: 'Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo más tarde.',
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-4 w-full max-w-sm">
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        disabled={cargando}
        className="w-full"
      />
      <Input
        type="password"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
        disabled={cargando}
        className="w-full"
      />
      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/registro" className="text-blue-600 hover:text-blue-800">
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  );
};

export default FormularioInicioSesion;

