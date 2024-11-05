// components/AuthGuard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '../../css/AuthGuard.module.css'; // Asegúrate de crear este archivo CSS

interface AuthGuardProps {
    children: React.ReactNode;
  }
  
  export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push('/login');
      }
    }, [isLoggedIn, isLoading, router]);
  
    if (isLoading) {
      return (
        <div className={styles.loaderContainer}>
          <img src={`${process.env.NEXT_PUBLIC_ASSET_URL}/loader1.svg`} alt="Cargando" className={styles.loader} />
        </div>
      );
    }
  
    return isLoggedIn ? <>{children}</> : null;
  };