//Pendiente solucionar problemas al mostrar el toast cuando se guarden los datos y mejoras del comportamiento
// cuando se accede a esta pagina si no se ha iniciado sesion (redirigir)
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Tooltip from '@/components/Tooltip';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileFormData {
  nombre: string;
  nombramiento: string;
  correo: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

const ConfiguracionPage = () => {
  const router = useRouter();
  const { userProfile, refreshProfile, isLoggedIn, idUsuario } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  // Redireccionar si no hay sesión
  /*
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);
*/
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

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const toastId = toast.loading('Guardando cambios...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('nombramiento', formData.nombramiento);
      formDataToSend.append('correo', formData.correo);
      
      if (formData.nuevaContrasena && formData.contrasenaActual) {
        formDataToSend.append('contrasenaActual', formData.contrasenaActual);
        formDataToSend.append('nuevaContrasena', formData.nuevaContrasena);
      }
      
      if (fotoPerfil) {
        formDataToSend.append('foto_perfil', fotoPerfil);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${idUsuario}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al actualizar el perfil');
      }

      setFormData(prev => ({
        ...prev,
        contrasenaActual: '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      }));

      await refreshProfile();
      
      toast.success('Perfil actualizado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar el perfil',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return <LoadingSkeleton />;
  }

  if (!isLoggedIn) {
    return null; // La redirección se maneja en el useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-8">
            {/* Información básica */}
            <section className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Información Básica
              </h2>
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

            {/* Foto de perfil */}
            <section className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Foto de Perfil
              </h2>
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
          </div>

          {/* Columna derecha */}
          <div className="space-y-8">
            {/* Cambio de contraseña */}
            <section className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Cambiar Contraseña
              </h2>
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
            <section className="bg-white p-6 rounded-lg shadow-lg">
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

            {/* Botón guardar */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el skeleton loader
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda skeleton */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
  
          {/* Columna derecha skeleton */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
  
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
  
            <div className="flex justify-end">
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  export default ConfiguracionPage;