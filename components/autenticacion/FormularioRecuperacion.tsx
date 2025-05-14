"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BotonMorado from '@/components/global/genericos/BotonMorado';
import NotificacionChip from '@/components/global/genericos/NotificacionChip';
import Link from 'next/link';
import { solicitarRecuperacion } from '@/services/authService';

const FormularioRecuperacion = () => {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);
  
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar envíos duplicados
    if (cargando || isSubmitting.current) return;
    
    isSubmitting.current = true;
    setCargando(true);
    setError(null);
    
    try {
      const resultado = await solicitarRecuperacion(correo);
      
      if (resultado.estado === 'exito') {
        setExito(true);
        // Limpiar el formulario después del éxito
        setCorreo('');
      } else {
        setError(resultado.mensaje || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Ocurrió un error al procesar su solicitud');
      console.error('Error en recuperación:', err);
    } finally {
      setCargando(false);
      isSubmitting.current = false;
    }
  };
  
  return (
    <>
      {exito ? (
        <div className="text-center p-6 bg-purple-50 rounded-lg shadow-sm border border-purple-100">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Correo enviado</h3>
          <p className="text-gray-600 mb-4">
            Se enviaron instrucciones de recuperación a la dirección proporcionada.
            <br />
            Por favor, revise su bandeja de entrada incluyendo spam, y siga los pasos indicados.
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="space-y-5 w-full max-w-sm">
          <div className="space-y-2">
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <Input
              id="correo"
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={cargando}
              className="w-full bg-white/50 backdrop-blur-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Ingrese el correo con el que se registró en Axotl Xires.
            </p>
          </div>
          
          <BotonMorado
            type="submit"
            cargando={cargando}
            disabled={cargando || !correo.trim()}
            className="w-full"
          >
            {cargando ? 'Enviando...' : 'Enviar instrucciones'}
          </BotonMorado>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿Recordó su contraseña?{' '}
              <Link href="/login" className="text-[#612c7d] hover:text-[#7d3ba3] font-semibold">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </form>
      )}
      
      {error && (
        <NotificacionChip
          tipo="excepcion"
          titulo="Error"
          contenido={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};

export default FormularioRecuperacion;
