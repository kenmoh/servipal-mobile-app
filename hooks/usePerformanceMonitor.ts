import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime?: number;
  mountTime?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef<number>();
  const renderStartTime = useRef<number>();

  useEffect(() => {
    // Component mounted
    mountTime.current = Date.now();
    
    return () => {
      // Component unmounted
      if (mountTime.current) {
        const totalMountTime = Date.now() - mountTime.current;
        console.log(`🔍 ${componentName} was mounted for ${totalMountTime}ms`);
      }
    };
  }, [componentName]);

  const startRenderTimer = () => {
    renderStartTime.current = Date.now();
  };

  const endRenderTimer = () => {
    if (renderStartTime.current) {
      const renderTime = Date.now() - renderStartTime.current;
      if (renderTime > 16) { // Only log if render took longer than 16ms (60fps threshold)
        console.log(`⚡ ${componentName} render took ${renderTime}ms`);
      }
    }
  };

  return { startRenderTimer, endRenderTimer };
};
