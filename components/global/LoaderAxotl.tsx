import { useRef } from 'react';
import styles from '@/css/AuthGuard.module.css';

const LoaderAxotl = () => {
  const loaderRef = useRef<HTMLObjectElement>(null);

  return (
    <div className={styles.loaderContainer}>
      <object
        ref={loaderRef}
        type="image/svg+xml"
        data={`${process.env.NEXT_PUBLIC_ASSET_URL}/1.svg`}
        className={styles.loader}
        aria-label="Validando..."
      />
    </div>
  );
};

export default LoaderAxotl;