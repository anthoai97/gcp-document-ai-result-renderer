'use client';

import { useEffect, useRef } from 'react';
import styles from './Canvas.module.css';

interface CanvasProps {
  // Add any props you need to pass to the component
}

const Canvas: React.FC<CanvasProps> = () => {
  const layer1Ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('canvas init');
    // Add any initialization logic here
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas id="layer1" ref={layer1Ref} width={500} height={600} />
    </div>
  );
};

export default Canvas;
