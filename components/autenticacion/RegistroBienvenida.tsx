'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoPerfil } from '../configuracion/FotoPerfil';
import { RecortadorImagen } from '../configuracion/RecortadorImagen';
import { useRouter, useSearchParams } from 'next/navigation';
import NotificacionChip from '../global/NotificacionChip';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import Tooltip from '../global/Tooltip';
import BotonMorado from '../global/genericos/BotonMorado';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

const StepContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`min-h-[400px] flex flex-col ${className}`}>
    {children}
  </div>
);

const capitalizarPalabras = (texto: string) => {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

export default function RegistroBienvenida() {
  const [paso, setPaso] = useState(2);
  const [direction, setDirection] = useState(0);
  const [datosPersonales, setDatosPersonales] = useState({
    nombre: '',
    nombramiento: ''
  });
  const [fotoPreview, setFotoPreview] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accesoConcedido, setAccesoConcedido] = useState(false);
  const [imagenParaRecortar, setImagenParaRecortar] = useState<string | null>(null);
  const [errores, setErrores] = useState({
    nombre: '',
    nombramiento: ''
  });

  useEffect(() => {
    const validarAcceso = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const welcomeToken = sessionStorage.getItem('welcome_token');
      const urlToken = searchParams.get('token');

      if (!token || !userId) {
        router.replace('/registro');
        return;
      }

      if (!welcomeToken || !urlToken || welcomeToken !== urlToken) {
        const tokenUsado = sessionStorage.getItem('welcome_token_used');
        
        if (tokenUsado === urlToken) {
          router.replace('/');
          return;
        }
        
        if (welcomeToken !== urlToken) {
          router.replace('/registro');
          return;
        }
      }

      setAccesoConcedido(true);
    };

    validarAcceso();
  }, [router, searchParams]);

  useEffect(() => {
    if (paso === 4) {
      lanzarConfetti();
    }
  }, [paso]);

  if (!accesoConcedido) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <div className="animate-spin w-8 h-8 border-4 border-[#612c7d] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const mostrarNotificacion = (tipo: "excepcion" | "confirmacion" | "notificacion", titulo: string, contenido: string, callback?: () => void) => {
    const notificacion = document.createElement('div');
    document.body.appendChild(notificacion);

    const handleClose = () => {
      document.body.removeChild(notificacion);
      if (callback) callback();
    };

    return createPortal(
      <NotificacionChip
        tipo={tipo}
        titulo={titulo}
        contenido={contenido}
        onClose={handleClose}
      />,
      notificacion
    );
  };

  const validarCampo = (campo: string, valor: string) => {
    if (valor.length < 2) {
      setErrores(prev => ({
        ...prev,
        [campo]: `El ${campo} debe tener al menos 2 caracteres`
      }));
      return false;
    }
    setErrores(prev => ({
      ...prev,
      [campo]: ''
    }));
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, campo: 'nombre' | 'nombramiento') => {
    const valorCapitalizado = capitalizarPalabras(e.target.value);
    setDatosPersonales(prev => ({
      ...prev,
      [campo]: valorCapitalizado
    }));
    validarCampo(campo, valorCapitalizado);
  };

  const handleSiguiente = async () => {
    if (paso === 2) {
      if (!validarCampo('nombre', datosPersonales.nombre) || 
          !validarCampo('nombramiento', datosPersonales.nombramiento)) {
        mostrarNotificacion(
          "excepcion",
          "Error de validación",
          "Por favor, completa todos los campos correctamente"
        );
        return;
      }

      try {
        setCargando(true);
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          throw new Error('No se encontraron las credenciales necesarias');
        }

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registro/paso2/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: datosPersonales.nombre,
            nombramiento: datosPersonales.nombramiento
          }),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(datos.mensaje || 'Error al actualizar datos personales');
        }

        mostrarNotificacion(
          "confirmacion",
          "¡Excelente!",
          "Tus datos han sido actualizados correctamente"
        );
        
        setDirection(1);
        setPaso(3);
      } catch (error) {
        mostrarNotificacion(
          "excepcion",
          "Error",
          error instanceof Error ? error.message : "No se pudieron actualizar los datos personales"
        );
      } finally {
        setCargando(false);
      }
    }
  };

  const handleFileChange = (file: File) => {
    if (file.size > 1024 * 1024) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        "La imagen no debe superar 1MB"
      );
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        "Solo se permiten imágenes JPG y PNG"
      );
      return;
    }

    setArchivo(file);
    const url = URL.createObjectURL(file);
    setFotoPreview(url);
  };

  const handleGuardarFoto = async () => {
    if (!archivo) return;
    
    try {
      setCargando(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        throw new Error('No se encontraron las credenciales necesarias');
      }

      const formData = new FormData();
      formData.append('foto_perfil', archivo);

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/registro/paso3/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al subir la foto');
      }

      mostrarNotificacion(
        "confirmacion",
        "¡Éxito!",
        "Foto de perfil actualizada correctamente",
        () => {
          sessionStorage.setItem('welcome_token_used', searchParams.get('token') || '');
          router.push(`/perfiles/${userId}`);
        }
      );

    } catch (error) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "No se pudo subir la foto de perfil"
      );
    } finally {
      setCargando(false);
    }
  };

  const handleOmitir = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        "No se encontró la información del usuario"
      );
      return;
    }

    sessionStorage.setItem('welcome_token_used', searchParams.get('token') || '');
    
    mostrarNotificacion(
      "notificacion",
      "Omitiendo paso",
      "Puedes agregar una foto de perfil más tarde",
      () => router.push(`/perfiles/${userId}`)
    );
  };

  const handleImagenParaRecortar = (imagenSrc: string) => {
    setImagenParaRecortar(imagenSrc);
  };

  const handleImagenRecortada = (file: File) => {
    handleFileChange(file);
    setImagenParaRecortar(null);
  };

  const lanzarConfetti = () => {
    const duracion = 3 * 1000;
    const final = Date.now() + duracion;
    let frame: number;

    const lanzar = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#612c7d', '#9f5afd', '#ffffff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#612c7d', '#9f5afd', '#ffffff']
      });

      if (Date.now() < final) {
        frame = requestAnimationFrame(lanzar);
      }
    };

    lanzar();

    return () => {
      cancelAnimationFrame(frame);
    };
  };

  const redirigirAPerfil = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      sessionStorage.setItem('welcome_token_used', searchParams.get('token') || '');
      router.push(`/perfiles/${userId}`);
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-t-xl p-6">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${paso >= 2 ? 'bg-[#612c7d]' : 'bg-gray-300'}`} />
              <div className={`w-16 h-1 ${paso >= 3 ? 'bg-[#612c7d]' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${paso >= 3 ? 'bg-[#612c7d]' : 'bg-gray-300'}`} />
              <div className={`w-16 h-1 ${paso === 4 ? 'bg-[#612c7d]' : 'bg-gray-300'}`} />
              <div className={`w-3 h-3 rounded-full ${paso === 4 ? 'bg-[#612c7d]' : 'bg-gray-300'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-xl overflow-hidden">
          <div className="relative h-[500px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {paso === 2 && (
                <motion.div
                  key="paso2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 p-8"
                >
                  <StepContainer>
                    <h2 className="text-2xl font-bold text-center mb-6">
                      Vamos a conocernos mejor
                    </h2>
                    <div className="space-y-4 flex-grow">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo
                        </label>
                        <Tooltip 
                          message="Ingresa tu nombre completo para que te localicen más fácil."
                        >
                          <Input
                            type="text"
                            value={datosPersonales.nombre}
                            onChange={(e) => handleInputChange(e, 'nombre')}
                            placeholder="¿Cómo te llamas?"
                            className={`w-full ${errores.nombre ? 'border-red-500' : ''}`}
                          />
                        </Tooltip>
                        {errores.nombre && (
                          <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombramiento
                        </label>
                        <Tooltip 
                          message="Describe tu rol académico o profesional (ej: Investigador, Profesor, Estudiante)"
                        >
                          <Input
                            type="text"
                            value={datosPersonales.nombramiento}
                            onChange={(e) => handleInputChange(e, 'nombramiento')}
                            placeholder="¿A qué te dedicas?"
                            className={`w-full ${errores.nombramiento ? 'border-red-500' : ''}`}
                          />
                        </Tooltip>
                        {errores.nombramiento && (
                          <p className="text-red-500 text-xs mt-1">{errores.nombramiento}</p>
                        )}
                      </div>
                    <div className="bg-[#b095be] text-white p-4 rounded-md">
                      <p className="text-center">
                        Rellena estos campos de forma precisa. <br />Se mostrarán en tu perfil de usuario y serán visibles para todos en Axotl Xires.
                      </p>
                    </div>
                    </div>
                    <div className="mt-auto">
                      <BotonMorado
                        onClick={handleSiguiente}
                        anchoCompleto
                        cargando={cargando}
                        disabled={
                          !datosPersonales.nombre || 
                          !datosPersonales.nombramiento || 
                          datosPersonales.nombre.length < 2 || 
                          datosPersonales.nombramiento.length < 2 || 
                          cargando
                        }
                      >
                        Siguiente
                      </BotonMorado>
                    </div>
                  </StepContainer>
                </motion.div>
              )}

              {paso === 3 && (
                <motion.div
                  key="paso3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 p-8"
                >
                  <StepContainer>
                    <h2 className="text-2xl font-bold text-center mb-6">
                      Añade una foto de perfil
                    </h2>
                    <div className="flex-grow">
                      <FotoPerfil
                        fotoPreview={fotoPreview}
                        isLoading={cargando}
                        onFileChange={handleFileChange}
                        onActualizar={handleGuardarFoto}
                        hayNuevaFoto={!!archivo}
                        idUsuario={localStorage.getItem('userId')}
                        nombreFoto={null}
                        onImagenParaRecortar={handleImagenParaRecortar}
                      />
                    </div>
                    <br />
                    <div className="mt-auto space-x-4 flex justify-center">
                      <BotonMorado
                        onClick={() => {
                          handleOmitir();
                          setPaso(4);
                        }}
                        variante="fantasma"
                      >
                        Omitir
                      </BotonMorado>
                      <BotonMorado
                        onClick={async () => {
                          await handleGuardarFoto();
                          setPaso(4);
                        }}
                        cargando={cargando}
                        disabled={!archivo || cargando}
                      >
                        Guardar y continuar
                      </BotonMorado>
                    </div>
                  </StepContainer>
                </motion.div>
              )}

              {paso === 4 && (
                <motion.div
                  key="paso4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 p-8"
                >
                  <StepContainer className="justify-center items-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-[#612c7d] mb-6">
                        ¡Gracias por unirte!
                      </h2>
                      <img src={`${process.env.NEXT_PUBLIC_ASSET_URL}/logoMorado2.png`} alt="Logo Morado" className="mb-4" />
                      <p className="text-gray-600 mb-8">
                        Estamos emocionados de tenerte en nuestra comunidad. 
                        Tu perfil está listo para que empieces a compartir conocimiento.
                      </p>
                      <BotonMorado
                        onClick={redirigirAPerfil}
                        className="px-8 py-3"
                        variante="principal"
                      >
                        Comenzar
                      </BotonMorado>
                    </div>
                  </StepContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {imagenParaRecortar && (
        <RecortadorImagen
          imagenSrc={imagenParaRecortar}
          onImagenRecortada={handleImagenRecortada}
          onCancelar={() => setImagenParaRecortar(null)}
        />
      )}
    </>
  );
} 