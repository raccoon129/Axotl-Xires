// components/FormularioInicioSesion.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import BotonMorado from "@/components/global/genericos/BotonMorado";
import NotificacionChip from '@/components/global/genericos/NotificacionChip';

const FormularioInicioSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const router = useRouter();
  const { updateAuthAfterLogin } = useAuth();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMostrarError(false);

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

        window.location.href = `/perfiles/${datos.usuario.id}`;
      } else {
        setMensajeError(datos.mensaje || 'Credenciales incorrectas, por favor inténtalo de nuevo.');
        setMostrarError(true);
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setMensajeError('Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo más tarde.');
      setMostrarError(true);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-4 w-full max-w-sm">
        <Input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          disabled={cargando}
          className="w-full bg-white/50 backdrop-blur-sm"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          disabled={cargando}
          className="w-full bg-white/50 backdrop-blur-sm"
        />
        <BotonMorado 
          type="submit" 
          cargando={cargando}
          className="w-full"
        >
          {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </BotonMorado>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-[#612c7d] hover:text-[#7d3ba3] font-semibold">
              Regístrate
            </Link>
          </p>
        </div>
      </form>
      {mostrarError && (
        <NotificacionChip
          tipo="excepcion"
          titulo="Error de inicio de sesión"
          contenido={mensajeError}
          onClose={() => setMostrarError(false)}
        />
      )}
    </>
  );
};

export default FormularioInicioSesion;

