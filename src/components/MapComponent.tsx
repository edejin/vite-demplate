import React, {
  CSSProperties,
  useEffect,
  useRef,
} from 'react';
import MB, {Map, MapboxOptions} from 'mapbox-gl';
import styled from 'styled-components';
import {calculateMapStyle} from '@/middleware/cmd/mapStyles';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useMapStore} from '@/store/map';

(MB as any).workerUrl = './worker.js';
(MB as any).config.API_URL = '';

const MapElement = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
`;

interface Props extends Omit<MapboxOptions, 'container' | 'style'> {
  callback?: (m?: Map) => void;
  className?: string;
  style?: CSSProperties;
}

export const MapComponent: React.FC<Props> = (option: Props) => {
  const {
    callback,
    className,
    style: cssStyle,
    ...props
  } = option;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new Map({
      ...props,
      container: mapContainer.current!,
      style: calculateMapStyle(),
      projection: {
        name: useMapStore.getState().projection
      }
    });

    let destructor: void | (() => void);
    map.current!.once('style.load', () => {
      if (callback) {
        destructor = callback(map.current);
      }
    });

    map.current!.on('click', (e) => {
      console.log(e.features);
    })

    return () => {
      if (destructor) {
        destructor();
      }
      map.current?.remove();
      map.current = null;
    };
  }, [callback]);

  return (
    <MapElement ref={mapContainer} className={className} style={cssStyle}/>
  );
};
