'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Tooltip from '@/components/global/Tooltip';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import NotificacionChip from '@/components/global/NotificacionChip';

interface ProfileFormData {
  nombre: string;
  nombramiento: string;
  correo: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

const ConfiguracionContent = () => {
  const { userProfile, refreshProfile, idUsuario } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [notificacion, setNotificacion] = useState<{
    mostrar: boolean;
    tipo: "excepcion" | "confirmacion" | "notificacion";
    titulo: string;
    contenido: string;
  } | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error('Solo se permiten imágenes JPG y PNG');
        return;
      }

      setFotoPerfil(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (formData.nuevaContrasena || formData.contrasenaActual) {
      if (!formData.contrasenaActual) {
        toast.error('Debes ingresar tu contraseña actual');
        return false;
      }
      if (!formData.nuevaContrasena) {
        toast.error('Debes ingresar la nueva contraseña');
        return false;
      }
      if (formData.nuevaContrasena !== formData.confirmarContrasena) {
        toast.error('Las contraseñas no coinciden');
        return false;
      }
      if (formData.nuevaContrasena.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }

    return true;
  };

  // Funciones específicas para cada sección
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
      setNotificacion({
        mostrar: true,
        tipo: "confirmacion",
        titulo: "Actualización exitosa",
        contenido: data.mensaje || "La información básica se ha actualizado correctamente"
      });
    } catch (error) {
      setNotificacion({
        mostrar: true,
        tipo: "excepcion",
        titulo: "Error",
        contenido: error instanceof Error ? error.message : "Error al actualizar información"
      });
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
      setNotificacion({
        mostrar: true,
        tipo: "confirmacion",
        titulo: "Foto actualizada",
        contenido: data.mensaje || "La foto de perfil se ha actualizado correctamente"
      });
    } catch (error) {
      setNotificacion({
        mostrar: true,
        tipo: "excepcion",
        titulo: "Error",
        contenido: error instanceof Error ? error.message : "Error al actualizar foto"
      });
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
        `${process.env.NEXT_PUBLIC_API_URL}/usuarios/actualizacion/${idUsuario}/password`,
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

      setNotificacion({
        mostrar: true,
        tipo: "confirmacion",
        titulo: "Contraseña actualizada",
        contenido: data.mensaje || "La contraseña se ha actualizado correctamente"
      });
    } catch (error) {
      setNotificacion({
        mostrar: true,
        tipo: "excepcion",
        titulo: "Error",
        contenido: error instanceof Error ? error.message : "Error al actualizar contraseña"
      });
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
      const yOffset = -100; // Ajuste para el header fijo
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
            {/* Información Básica */}
            <section id="informacion-basica" className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Información Básica
                </h2>
                <Button
                  onClick={actualizarInformacionBasica}
                  disabled={isLoading}
                  className="bg-blue-600 text-white"
                >
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <Tooltip message="Ingresa tu nombre completo">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombramiento
                  </label>
                  <Tooltip message="Ej: Profesor, Investigador, Estudiante">
                    <input
                      type="text"
                      name="nombramiento"
                      value={formData.nombramiento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            {/* Foto de Perfil */}
            <section id="foto-perfil" className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Foto de Perfil
                </h2>
                <Button
                  onClick={actualizarFotoPerfil}
                  disabled={isLoading || !fotoPerfil}
                  className="bg-blue-600 text-white"
                >
                  {isLoading ? 'Guardando...' : 'Actualizar foto'}
                </Button>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32">
                  <Image
                    src={fotoPreview}
                    alt="Foto de perfil"
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="foto-perfil"
                  disabled={isLoading}
                />
                <label
                  htmlFor="foto-perfil"
                  className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Cambiar foto
                </label>
                <p className="text-sm text-gray-500">
                  JPG o PNG. Máximo 5MB.
                </p>
              </div>
            </section>

            {/* Seguridad */}
            <section id="seguridad" className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Cambiar Contraseña
                </h2>
                <Button
                  onClick={actualizarContrasena}
                  disabled={isLoading || !formData.contrasenaActual || !formData.nuevaContrasena || formData.nuevaContrasena !== formData.confirmarContrasena}
                  className="bg-blue-600 text-white"
                >
                  {isLoading ? 'Guardando...' : 'Actualizar contraseña'}
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="contrasenaActual"
                    value={formData.contrasenaActual}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="nuevaContrasena"
                    value={formData.nuevaContrasena}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            {/* Estadísticas */}
            <section 
              id="estadisticas" 
              className="bg-white p-6 rounded-lg shadow-lg transition-all transform hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Estadísticas
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-semibold">
                    Publicaciones: {userProfile?.total_publicaciones || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    Miembro desde: {new Date(userProfile?.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-purple-700 font-semibold">
                    Último acceso: {userProfile?.ultimo_acceso 
                      ? new Date(userProfile.ultimo_acceso).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Renderizar NotificacionChip cuando haya una notificación */}
      {notificacion?.mostrar && (
        <NotificacionChip
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          contenido={notificacion.contenido}
        />
      )}
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