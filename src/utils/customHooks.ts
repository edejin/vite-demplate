import {useEffect, useState} from 'react';
import {log} from '@/utils/index';

export const useLogging = (text: string, ...arg: any[]) => {
  useEffect(() => {
    log(text, ...arg);
  }, [text, ...arg]);
};

export const useScreenSize = (wD: number = 0, hD: number = 0) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth + wD,
        height: window.innerHeight + hD,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [wD, hD]);

  return screenSize;
};
