
import { useState, useEffect, ReactNode } from 'react';
import { PageLoading } from '@/components/ui/page-loading';

interface AppInitializerProps {
  children: ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Give providers time to initialize
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return <PageLoading />;
  }

  return <>{children}</>;
};
