// components/FormularioInicioSesion.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const FormularioInicioSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // URL de la API obtenida de la variable de entorno
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;

      // Cuerpo de la petición con la estructura correcta
      const body = {
        correo,
        contrasena,
      };

      const respuesta = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), // Enviamos los datos en el cuerpo de la solicitud
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente.",
        });

        // Guardar el token en localStorage o cookies
        localStorage.setItem('token', datos.token);

        // Redirigir a la página de inicio o al perfil del usuario
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
    <form onSubmit={manejarEnvio} className="space-y-4">
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        disabled={cargando}
      />
      <Input
        type="password"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
        disabled={cargando}
      />
      <Button type="submit" className="w-full" disabled={cargando}>
        {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};

export default FormularioInicioSesion;
