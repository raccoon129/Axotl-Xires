// components/AuthGuard.tsx
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '../../css/AuthGuard.module.css';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const loaderRef = useRef<HTMLObjectElement>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoading) {
      const script = document.createElement('script');
      script.src = "https://cdn.svgator.com/js/player-SVGATOR-VERSION.min.js";
      script.async = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading && loaderRef.current) {
      const svgDocument = loaderRef.current.contentDocument;
      if (svgDocument) {
        const svgElement = svgDocument.documentElement;
        if (svgElement) {
          // Optimizar el SVG
          svgElement.setAttribute('shape-rendering', 'geometricPrecision');
          svgElement.setAttribute('text-rendering', 'geometricPrecision');
          svgElement.setAttribute('image-rendering', 'optimizeQuality');
          svgElement.setAttribute('color-rendering', 'optimizeQuality');
        }
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <object
          ref={loaderRef}
          type="image/svg+xml"
          data={`${process.env.NEXT_PUBLIC_ASSET_URL}/1.svg`}
          className={styles.loader}
          aria-label="Cargando"
        />
      </div>
    );
  }

  return isLoggedIn ? <>{children}</> : null;
};