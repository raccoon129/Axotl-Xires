'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import NotificacionChip from '@/components/global/NotificacionChip';
import { InformacionBasica } from '@/components/configuracion/InformacionBasica';
import { FotoPerfil } from '@/components/configuracion/FotoPerfil';
import { CambiarContrasena } from '@/components/configuracion/CambiarContrasena';
import { Estadisticas } from '@/components/configuracion/Estadisticas';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Estados para el formulario
  const [formData, setFormData] = useState<ProfileFormData>({
    nombre: '',
    nombramiento: '',
    correo: '',
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });

  // Estados para la foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState('');

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      setIsPageLoading(true);
      try {
        if (userProfile) {
          setFormData(prev => ({
            ...prev,
            nombre: userProfile.nombre || '',
            nombramiento: userProfile.nombramiento || '',
            correo: userProfile.correo || ''
          }));
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
      loadProfile();
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

  // Funciones de actualización
  const actualizarInformacionBasica = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${idUsuario}/info-basica`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            nombramiento: formData.nombramiento,
            correo: formData.correo
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar información básica');
      }

      await refreshProfile();
      mostrarNotificacion(
        "confirmacion",
        "Actualización exitosa",
        data.mensaje || "La información básica se ha actualizado correctamente"
      );
    } catch (error) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar información"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarFotoPerfil = async () => {
    if (!fotoPerfil) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('foto_perfil', fotoPerfil);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${idUsuario}/foto`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar foto de perfil');
      }

      await refreshProfile();
      mostrarNotificacion(
        "confirmacion",
        "Foto actualizada",
        data.mensaje || "La foto de perfil se ha actualizado correctamente"
      );
    } catch (error) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar foto"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarContrasena = async () => {
    if (!formData.contrasenaActual || !formData.nuevaContrasena) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${idUsuario}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contrasenaActual: formData.contrasenaActual,
            nuevaContrasena: formData.nuevaContrasena,
            confirmarContrasena: formData.confirmarContrasena
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar contraseña');
      }

      setFormData(prev => ({
        ...prev,
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      }));

      mostrarNotificacion(
        "confirmacion",
        "Contraseña actualizada",
        data.mensaje || "La contraseña se ha actualizado correctamente"
      );
    } catch (error) {
      mostrarNotificacion(
        "excepcion",
        "Error",
        error instanceof Error ? error.message : "Error al actualizar contraseña"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const secciones = [
    { id: 'informacion-basica', titulo: 'Información Básica' },
    { id: 'foto-perfil', titulo: 'Foto de Perfil' },
    { id: 'seguridad', titulo: 'Seguridad' },
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

  if (isPageLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          {/* Barra de navegación lateral */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h2>
              <nav className="space-y-2">
                {secciones.map(seccion => (
                  <button
                    key={seccion.id}
                    onClick={() => scrollToSection(seccion.id)}
                    className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  >
                    {seccion.titulo}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 space-y-8">
            <InformacionBasica
              formData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onGuardar={actualizarInformacionBasica}
            />

            <FotoPerfil
              fotoPreview={fotoPreview}
              isLoading={isLoading}
              onFileChange={handleFileChange}
              onActualizar={actualizarFotoPerfil}
              hayNuevaFoto={!!fotoPerfil}
              idUsuario={idUsuario || null}
              nombreFoto={userProfile?.foto_perfil || null}
            />

            <CambiarContrasena
              formData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onActualizar={actualizarContrasena}
            />

            <Estadisticas
              totalPublicaciones={userProfile?.total_publicaciones || 0}
              fechaCreacion={userProfile?.fecha_creacion || ''}
              ultimoAcceso={userProfile?.ultimo_acceso}
            />
          </div>
        </div>
      </div>

      {/* Renderizar todas las notificaciones activas */}
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
    </div>
  );
};

// Componente para el skeleton loader
const LoadingSkeleton = () => (
  <div className="min-h-screen py-8">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex gap-8">
        {/* Barra lateral skeleton */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-lg shadow-lg p-4">
            <Skeleton className="h-8 w-36 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal skeleton */}
        <div className="flex-1 space-y-8">
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

          {/* Foto de Perfil skeleton */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          </section>

          {/* Seguridad skeleton */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item}>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </section>

          {/* Estadísticas skeleton */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-6 w-48" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default ConfiguracionContent;