import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isLoggedIn: boolean;
  userName: string | null;
  idUsuario: string | null;
  userProfile: any | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userName: null,
    idUsuario: null,
    userProfile: null
  });

  const fetchUserProfile = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthState(prev => ({
          ...prev,
          userProfile: data.datos // Cambiamos a data.datos, que contiene el perfil en la respuesta
        }));
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setAuthState({
          isLoggedIn: true,
          userName: decodedToken.nombre || null,
          idUsuario: decodedToken.id || null,
          userProfile: null
        });
        
        if (decodedToken.id) {
          fetchUserProfile(decodedToken.id);
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setAuthState({
          isLoggedIn: false,
          userName: null,
          idUsuario: null,
          userProfile: null
        });
      }
    }
  }, []);

  return { ...authState, refreshProfile: () => authState.idUsuario && fetchUserProfile(authState.idUsuario) };
};