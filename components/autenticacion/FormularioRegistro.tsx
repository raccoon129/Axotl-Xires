// components/FormularioRegistro.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import NotificacionChip from '../global/genericos/NotificacionChip';
import { createPortal } from 'react-dom';
import BotonMorado from '../global/genericos/BotonMorado';

const FormularioRegistro = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const router = useRouter();

  const mostrarNotificacion = (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string, callback?: () => void) => {
    const notificacion = document.createElement('div');
    document.body.appendChild(notificacion);

    const handleClose = () => {
      document.body.removeChild(notificacion);
      if (callback) callback();
    };

    const elemento = createPortal(
      <NotificacionChip
        tipo={tipo}
        titulo={titulo}
        contenido={contenido}
        onClose={handleClose}
      />,
      notificacion
    );

    return elemento;
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    
    const regexCorreo = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!regexCorreo.test(formData.correo)) {
      nuevosErrores.correo = 'El formato del correo electrónico no es válido';
    }

    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regexContrasena.test(formData.contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
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
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aceptaTerminos) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        "Debes aceptar los términos y condiciones"
      );
      return;
    }

    if (!validarFormulario()) {
      mostrarNotificacion(
        "excepcion", 
        "Error de validación",
        "Por favor, corrige los errores en el formulario"
      );
      return;
    }

    setBotonDeshabilitado(true);
    setCargando(true);

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registro/paso1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo: formData.correo,
          contrasena: formData.contrasena
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.status === 409) {
        setFormData(prev => ({
          ...prev,
          correo: ''
        }));
        setErrores(prev => ({
          ...prev,
          correo: 'Este correo ya está registrado'
        }));
        mostrarNotificacion(
          "excepcion",
          "Error en el registro",
          "Este correo electrónico ya está registrado. Por favor, utiliza otro correo o inicia sesión."
        );
        setBotonDeshabilitado(false);
        setCargando(false);
        return;
      }

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error en el registro');
      }

      if (!datos.token || !datos.usuario?.id) {
        throw new Error('Respuesta del servidor incompleta');
      }

      localStorage.setItem('token', datos.token);
      localStorage.setItem('userId', datos.usuario.id);
      
      const tokenBienvenida = btoa(Date.now().toString());
      sessionStorage.setItem('welcome_token', tokenBienvenida);

      setRegistroExitoso(true);

      mostrarNotificacion(
        "confirmacion",
        "¡Bienvenido!",
        "Tu cuenta ha sido creada. Completemos tu perfil..."
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.href = `/registro/bienvenida?token=${tokenBienvenida}`;
      
    } catch (error) {
      console.error('Error durante el registro:', error);
      
      let mensajeError = 'Error inesperado durante el registro';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          mensajeError = 'Error de conexión. Por favor, verifica tu internet';
        } else {
          mensajeError = error.message;
        }
      }
      
      mostrarNotificacion(
        "excepcion",
        "Error en el registro",
        mensajeError
      );
      
    } finally {
      setBotonDeshabilitado(false);
      setCargando(false);
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-8">
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

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terminos"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="h-4 w-4 text-[#612c7d] focus:ring-[#612c7d] border-gray-300 rounded"
        />
        <label htmlFor="terminos" className="text-sm text-gray-600">
          Acepto los{' '}
          <a href="/terminos" className="text-[#612c7d] hover:underline" target="_blank">
            términos y condiciones
          </a>
        </label>
      </div>

      <BotonMorado 
        type="submit" 
        disabled={cargando || !aceptaTerminos || botonDeshabilitado}
        anchoCompleto
        cargando={cargando}
        className={registroExitoso ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        {registroExitoso ? (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ¡Hecho!
          </div>
        ) : (
          'Crear Cuenta'
        )}
      </BotonMorado>

      <p className="mt-8 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" className="font-medium text-[#612c7d] hover:text-[#4a2161]">
          Inicia sesión
        </a>
      </p>
    </form>
  );
};

export default FormularioRegistro;