// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface AuthState {
  isLoggedIn: boolean;
  userName: string | null;
  idUsuario: string | null;
  userProfile: any | null;
  isLoading: boolean; // Nuevo estado para controlar la carga inicial
}

interface DecodedToken {
  nombre: string;
  id: string;
  exp: number;
}

// Hook personalizado para manejar la autenticación

// El hook proporciona:
// - Estado de autenticación (isLoggedIn)
// - Información del usuario (userName, idUsuario, userProfile)
// - Estado de carga (isLoading)
// - Métodos para gestionar la autenticación (logout, refreshProfile, updateAuthAfterLogin)

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userName: null,
    idUsuario: null,
    userProfile: null,
    isLoading: true // Inicialmente true mientras verificamos el token
  });

  // Función para verificar si el token ha expirado
  const isTokenExpired = (decodedToken: DecodedToken): boolean => {
    if (!decodedToken.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  };

  // Función para obtener el perfil del usuario
  // Esta función se llama automáticamente después del login
  // y cuando se necesita refrescar la información del perfil
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      // Realiza la petición al endpoint de perfil con el token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Actualiza el estado con la información del perfil
        setAuthState(prev => ({
          ...prev,
          userProfile: data.datos
        }));
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      isLoggedIn: false,
      userName: null,
      idUsuario: null,
      userProfile: null,
      isLoading: false
    });
    router.push('/login');
  }, [router]);

  // Función para verificar y actualizar el estado de autenticación
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setAuthState(prev => ({ ...prev, isLoading: false, isLoggedIn: false }));
      return;
    }

    try {
      const decodedToken = jwtDecode(token) as DecodedToken;

      if (isTokenExpired(decodedToken)) {
        logout();
        return;
      }

      setAuthState({
        isLoggedIn: true,
        userName: decodedToken.nombre || null,
        idUsuario: decodedToken.id || null,
        userProfile: null,
        isLoading: false
      });
      
      if (decodedToken.id) {
        fetchUserProfile(decodedToken.id);
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      logout();
    }
  }, [fetchUserProfile, logout]);

  // Efecto inicial para verificar la autenticación
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Función para actualizar el estado después del login
  const updateAuthAfterLogin = useCallback(async (token: string) => {
    localStorage.setItem('token', token);
    await checkAuth();
  }, [checkAuth]);

  return { 
    ...authState, 
    logout,
    refreshProfile: () => authState.idUsuario && fetchUserProfile(authState.idUsuario),
    updateAuthAfterLogin
  };
};
