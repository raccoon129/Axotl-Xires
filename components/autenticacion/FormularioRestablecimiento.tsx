"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import BotonMorado from '@/components/global/genericos/BotonMorado';
import NotificacionChip from '@/components/global/genericos/NotificacionChip';
import { verificarTokenRecuperacion, restablecerContrasena } from '@/services/authService';

interface FormularioRestablecimientoProps {
  token: string;
}

const FormularioRestablecimiento = ({ token }: FormularioRestablecimientoProps) => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeTokenInvalido, setMensajeTokenInvalido] = useState<string>('');
  const isSubmitting = useRef(false);
  const router = useRouter();

  // Verificar el token al cargar el componente
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const resultado = await verificarTokenRecuperacion(token);
        if (resultado.estado === 'exito') {
          setTokenValido(true);
        } else {
          setTokenValido(false);
          setMensajeTokenInvalido(resultado.mensaje || 'El enlace de recuperación no es válido');
        }
      } catch (err) {
        console.error('Error al verificar token:', err);
        setTokenValido(false);
        setMensajeTokenInvalido('Ocurrió un error al verificar el token');
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cargando || isSubmitting.current) return;
    
    // Validación simple de contraseñas
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    isSubmitting.current = true;
    setCargando(true);
    setError(null);
    
    try {
      const resultado = await restablecerContrasena(
        token,
        nuevaContrasena,
        confirmarContrasena
      );
      
      if (resultado.estado === 'exito') {
        setExito(true);
        setTimeout(() => {
          router.push('/login');
        }, 5000); // Redirigir al login después de 5 segundos
      } else {
        setError(resultado.mensaje || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Ocurrió un error al restablecer su contraseña');
      console.error('Error en restablecimiento:', err);
    } finally {
      setCargando(false);
      isSubmitting.current = false;
    }
  };

  // Mostrar un indicador de carga mientras se verifica el token
  if (verificando) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mb-4"></div>
        <p className="text-gray-600">Verificando enlace de recuperación...</p>
      </div>
    );
  }

  // Mostrar un mensaje de error si el token no es válido
  if (!tokenValido) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg shadow-sm border border-red-100">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enlace inválido</h3>
        <p className="text-gray-600 mb-4">
          {mensajeTokenInvalido || "El enlace de recuperación no es válido o ha expirado."}
        </p>
        <div className="mt-6">
          <Link href="/login/recuperacion" className="text-purple-600 hover:text-purple-800 font-medium">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de éxito si la contraseña fue restablecida
  if (exito) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg shadow-sm border border-green-100">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contraseña restablecida</h3>
        <p className="text-gray-600 mb-4">
          Su contraseña ha sido actualizada correctamente. Será redirigido a la página de inicio de sesión en unos momentos...
        </p>
        <div className="mt-4">
          <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // Formulario de restablecimiento de contraseña
  return (
    <>
      <form onSubmit={manejarEnvio} className="space-y-5 w-full max-w-sm">
        <div className="space-y-3">
          <div>
            <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <Input
              id="nuevaContrasena"
              type="password"
              placeholder="Ingrese su nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
              disabled={cargando}
              className="w-full bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <Input
              id="confirmarContrasena"
              type="password"
              placeholder="Confirme su nueva contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
              disabled={cargando}
              className="w-full bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>La contraseña debe contener:</p>
            <ul className="list-disc pl-5">
              <li>Al menos 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos un número</li>
            </ul>
          </div>
        </div>
        
        <BotonMorado
          type="submit"
          cargando={cargando}
          disabled={cargando || !nuevaContrasena || !confirmarContrasena}
          className="w-full"
        >
          {cargando ? 'Procesando...' : 'Restablecer contraseña'}
        </BotonMorado>
      </form>
      
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

export default FormularioRestablecimiento;
