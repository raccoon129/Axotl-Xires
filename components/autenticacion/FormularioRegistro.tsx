// components/FormularioRegistro.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";

const FormularioRegistro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: ''
  });
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const router = useRouter();

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    
    // Validar correo
    const regexCorreo = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regexCorreo.test(formData.correo)) {
      nuevosErrores.correo = 'El formato del correo electrónico no es válido';
    }

    // Validar contraseña
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regexContrasena.test(formData.contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }

    // Validar nombre
    if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

    setCargando(true);
    //const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error en el registro');
      }

      // Guardar el token
      if (datos.token) {
        localStorage.setItem('token', datos.token);
        // Opcional: También podrías guardarlo en una cookie segura
        document.cookie = `auth_token=${datos.token}; path=/; secure; samesite=strict`;
      }

      toast({
        title: "Registro exitoso",
        description: datos.mensaje || "Tu cuenta ha sido creada correctamente.",
      });

      // Redirigir al perfil
      router.push(`/perfiles/${datos.usuario.id}`);
      
    } catch (error) {
      console.error('Error durante el registro:', error);
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : 'Error inesperado durante el registro',
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#612c7d] py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 m-4 transform transition-all hover:scale-105">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#612c7d]">
          Crear Cuenta
        </h2>
        
        <form onSubmit={manejarEnvio} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <Input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Tu nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={cargando}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#612c7d] focus:border-transparent ${
                errores.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.nombre && (
              <p className="text-red-500 text-xs italic mt-1">{errores.nombre}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <Input
              id="correo"
              type="email"
              name="correo"
              placeholder="tucorreo@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              required
              disabled={cargando}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#612c7d] focus:border-transparent ${
                errores.correo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.correo && (
              <p className="text-red-500 text-xs italic mt-1">{errores.correo}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <Input
              id="contrasena"
              type="password"
              name="contrasena"
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={handleChange}
              required
              disabled={cargando}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#612c7d] focus:border-transparent ${
                errores.contrasena ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.contrasena && (
              <p className="text-red-500 text-xs italic mt-1">{errores.contrasena}</p>
            )}
          </div>

          <div className="space-y-2">
            <Button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-[#612c7d] hover:bg-[#4a2161] text-white py-2 px-4 rounded-lg transition-colors duration-300"
            >
              {cargando ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-[#612c7d] hover:text-[#4a2161]">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default FormularioRegistro;