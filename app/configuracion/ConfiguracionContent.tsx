'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import NotificacionChip from '@/components/global/genericos/NotificacionChip';
import { InformacionBasica } from '@/components/configuracion/InformacionBasica';
import { FotoPerfil } from '@/components/configuracion/FotoPerfil';
import { CambiarContrasena } from '@/components/configuracion/CambiarContrasena';
import { Estadisticas, type EstadisticasUsuario } from '@/components/configuracion/Estadisticas';
import { PreferenciasNotificaciones } from '@/components/configuracion/PreferenciasNotificaciones';
import { motion } from 'framer-motion';
import { RecortadorImagen } from '@/components/configuracion/RecortadorImagen';
import ModalDeslizanteDerecha from '@/components/editor/ModalDeslizanteDerecha';

interface ProfileFormData {
  nombre: string;
  nombramiento: string;
  correo: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

interface Notificacion {
  id: number;
  mostrar: boolean;
  tipo: "excepcion" | "confirmacion" | "notificacion";
  titulo: string;
  contenido: string;
}

const ConfiguracionContent = () => {
  const { userProfile, refreshProfile, idUsuario } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [imagenParaRecortar, setImagenParaRecortar] = useState<string | null>(null);
  
  // Estado para el modal de actividad reciente
  const [modalActividadAbierto, setModalActividadAbierto] = useState<boolean>(false);
  const [estadisticasUsuario, setEstadisticasUsuario] = useState<EstadisticasUsuario | null>(null);
  const [cargandoActividadReciente, setCargandoActividadReciente] = useState<boolean>(false);

  // Estados para el formulario
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    nombramiento: '',
    correo: '',
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  
  // Guardamos una copia de los datos iniciales para detectar cambios
  const [initialFormData, setInitialFormData] = useState<Partial<ProfileFormData>>({
    nombre: '',
    nombramiento: '',
    correo: ''
  });

  // Estados para la foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState('');

  // Cargar datos del perfil
  useEffect(() => {
    const cargarDatosPerfil = async () => {
      setIsPageLoading(true);
      try {
        if (userProfile) {
          const datosIniciales = {
            nombre: userProfile.nombre || '',
            nombramiento: userProfile.nombramiento || '',
            correo: userProfile.correo || ''
          };
          
          setFormData(prev => ({
            ...prev,
            ...datosIniciales
          }));
          
          setInitialFormData(datosIniciales);
          
          setFotoPreview(userProfile.foto_perfil
            ? `${process.env.NEXT_PUBLIC_ASSET_URL}/uploads/${userProfile.foto_perfil}`
            : `${process.env.NEXT_PUBLIC_ASSET_URL}/thumb_who.jpg`
          );
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
        toast.error('Error al cargar los datos del perfil');
      } finally {
        setIsPageLoading(false);
      }
    };

    if (userProfile) {
      cargarDatosPerfil();
    }
  }, [userProfile]);

  // Manejadores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (file: File) => {
    setFotoPerfil(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImagenParaRecortar = (imagenSrc: string) => {
    setImagenParaRecortar(imagenSrc);
  };

  const handleImagenRecortada = (file: File) => {
    handleFileChange(file);
    setImagenParaRecortar(null);
  };

  const handleLimpiarCamposContrasena = () => {
    setFormData(prev => ({
      ...prev,
      contrasenaActual: '',
      nuevaContrasena: '',
      confirmarContrasena: ''
    }));
  };

  const mostrarNotificacion = (
    tipo: "excepcion" | "confirmacion" | "notificacion",
    titulo: string,
    contenido: string
  ) => {
    const audio = new Audio(`${process.env.NEXT_PUBLIC_ASSET_URL}/sonidos/${tipo}.ogg`);
    audio.play();

    const nuevaNotificacion: Notificacion = {
      id: Date.now(),
      mostrar: true,
      tipo,
      titulo,
      contenido
    };
    setNotificaciones(prev => [...prev, nuevaNotificacion]);

    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotificacion.id));
    }, 3000);
  };

  const secciones = [
    { id: 'informacion-basica', titulo: 'Información Básica' },
    { id: 'foto-perfil', titulo: 'Foto de Perfil' },
    { id: 'seguridad', titulo: 'Seguridad' },
    { id: 'notificaciones', titulo: 'Notificaciones' },
    { id: 'estadisticas', titulo: 'Estadísticas' }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Wrapper para refreshProfile que siempre devuelve una Promise<void>
  const handleRefreshProfile = async (): Promise<void> => {
    await refreshProfile();
    return Promise.resolve();
  };

  // Función para obtener las estadísticas detalladas cuando se necesiten
  const obtenerActividadReciente = async () => {
    if (!idUsuario) return;
    
    setCargandoActividadReciente(true);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idUsuario}/estadisticas`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!respuesta.ok) {
        const error = await respuesta.json();
        throw new Error(error.mensaje || 'Error al obtener estadísticas');
      }
      
      const datos = await respuesta.json();
      setEstadisticasUsuario(datos.datos);
      setModalActividadAbierto(true);
      
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      mostrarNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al cargar actividad reciente"
      );
    } finally {
      setCargandoActividadReciente(false);
    }
  };

  // Agrupar actividades por fecha
  const agruparPorFecha = (actividades: EstadisticasUsuario['actividadReciente']) => {
    if (!actividades) return {};
    
    const grupos: Record<string, typeof actividades> = {};
    
    actividades.forEach(actividad => {
      const fecha = new Date(actividad.fecha);
      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);
      
      let claveFecha;
      if (fecha.toDateString() === hoy.toDateString()) {
        claveFecha = 'Hoy';
      } else if (fecha.toDateString() === ayer.toDateString()) {
        claveFecha = 'Ayer';
      } else {
        claveFecha = formatearFecha(actividad.fecha, { dia: true });
      }
      
      if (!grupos[claveFecha]) {
        grupos[claveFecha] = [];
      }
      
      grupos[claveFecha].push(actividad);
    });
    
    return grupos;
  };

  // Formatear fecha para mostrar con opciones
  const formatearFecha = (fecha: string | null, opciones?: { dia?: boolean }) => {
    if (!fecha) return 'N/A';
    
    if (opciones?.dia) {
      return new Date(fecha).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
    }
    
    return new Date(fecha).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Formatear hora solamente
  const formatearHora = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  // Generar clase CSS según el tipo de actividad
  const obtenerClaseActividad = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'favorito':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'publicación':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Mapear ícono según tipo de actividad
  const obtenerIconoActividad = (tipo: string) => {
    switch (tipo) {
      case 'comentario':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'favorito':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      case 'publicación':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  // Contenido del modal de actividad reciente
  const ContenidoModalActividad = () => {
    const gruposActividades = agruparPorFecha(estadisticasUsuario?.actividadReciente || []);
    
    return (
      <div className="h-full flex flex-col">
          <p className="text-gray-600">
            Se muestran los últimos 25 eventos de actividad reciente.
          </p>
          <br />
        {cargandoActividadReciente ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !estadisticasUsuario?.actividadReciente?.length ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No hay actividad reciente para mostrar.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {Object.entries(gruposActividades).map(([fecha, actividades]) => (
              <div key={`grupo-${fecha}`} className="mb-6">
                <div className="px-4 py-3 bg-purple-50 sticky top-0 z-10 border-b">
                  <h3 className="text-sm font-medium text-purple-800">{fecha}</h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {actividades.map((actividad, index) => (
                    <div 
                      key={`actividad-${actividad.id_referencia}-${index}`}
                      className="p-4 hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <div className="flex">
                        <div className="mr-4 flex-shrink-0">
                          {obtenerIconoActividad(actividad.tipo_actividad)}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">
                            {actividad.titulo}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {formatearHora(actividad.fecha)}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2"></span>
                            <span className="text-xs font-medium capitalize text-gray-600">
                              {actividad.tipo_actividad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isPageLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
          Configuración de la cuenta
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Barra de navegación lateral */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Secciones</h2>
              <nav className="space-y-2">
                {secciones.map(seccion => (
                  <button
                    key={seccion.id}
                    onClick={() => scrollToSection(seccion.id)}
                    className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 
                             hover:text-gray-900 transition-colors duration-200"
                  >
                    {seccion.titulo}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InformacionBasica
                formData={formData}
                initialFormData={initialFormData as any}
                idUsuario={idUsuario}
                onInputChange={handleInputChange}
                onActualizacionExitosa={handleRefreshProfile}
                onNotificacion={mostrarNotificacion}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <FotoPerfil
                fotoPreview={fotoPreview}
                onFileChange={handleFileChange}
                hayNuevaFoto={!!fotoPerfil}
                idUsuario={idUsuario}
                nombreFoto={userProfile?.foto_perfil || null}
                onImagenParaRecortar={handleImagenParaRecortar}
                onActualizacionExitosa={handleRefreshProfile}
                onNotificacion={mostrarNotificacion}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CambiarContrasena
                formData={formData}
                idUsuario={idUsuario}
                onInputChange={handleInputChange}
                onLimpiarCamposContrasena={handleLimpiarCamposContrasena}
                onNotificacion={mostrarNotificacion}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <PreferenciasNotificaciones
                idUsuario={idUsuario}
                onNotificacion={mostrarNotificacion}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Estadisticas
                totalPublicaciones={userProfile?.total_publicaciones || 0}
                fechaCreacion={userProfile?.fecha_creacion || ''}
                ultimoAcceso={userProfile?.ultimo_acceso}
                idUsuario={idUsuario}
                onVerActividadReciente={obtenerActividadReciente}
              />
            </motion.section>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      {notificaciones.map(notificacion => (
        <NotificacionChip
          key={notificacion.id}
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          contenido={notificacion.contenido}
          onClose={() => {
            setNotificaciones(prev => 
              prev.filter(n => n.id !== notificacion.id)
            );
          }}
        />
      ))}

      {/* Modal de actividad reciente */}
      <ModalDeslizanteDerecha
        estaAbierto={modalActividadAbierto}
        alCerrar={() => setModalActividadAbierto(false)}
        titulo="Actividad Reciente"
      >
        <ContenidoModalActividad />
      </ModalDeslizanteDerecha>

      {imagenParaRecortar && (
        <RecortadorImagen
          imagenSrc={imagenParaRecortar}
          onImagenRecortada={handleImagenRecortada}
          onCancelar={() => setImagenParaRecortar(null)}
        />
      )}
    </div>
  );
};

// Componente para el skeleton loader
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-100">
    <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
      <Skeleton className="h-8 w-64 mb-6" />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Barra lateral skeleton */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-lg shadow-lg p-4">
            <Skeleton className="h-8 w-36 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal skeleton */}
        <div className="flex-1 space-y-6">
          {/* Información Básica skeleton */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item}>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </section>

          {/* ...otros skeletons... */}
        </div>
      </div>
    </div>
  </div>
);

export default ConfiguracionContent;