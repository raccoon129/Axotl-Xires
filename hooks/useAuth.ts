import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isLoggedIn: boolean;
  userName: string | null;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userName: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decodificar el token para obtener el nombre del usuario
        const decodedToken: any = jwtDecode(token);
        setAuthState({
          isLoggedIn: true,
          userName: decodedToken.nombre || null,
        });
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setAuthState({
          isLoggedIn: false,
          userName: null,
        });
      }
    }
  }, []);

  return authState;
};
