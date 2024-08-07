import React, {
  CSSProperties,
  useEffect,
  useRef,
} from 'react';
import MB, {Map, MapOptions} from 'mapbox-gl';
import styled from 'styled-components';
import {calculateMapStyle} from '@/middleware/cmd/mapStyles';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useMapStore} from '@/store/map';
import {Minimap} from '@/components/Minimap';
import {MapGrid} from '@/components/MapGrid';

(MB as any).workerUrl = './worker.js';
(MB as any).config.API_URL = '';

const MapElement = styled.div`
  width: 1000px;
  height: 500px;
  position: relative;
`;

interface Props extends Omit<MapOptions, 'container' | 'style'> {
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
  const mapContainer = useRef<HTMLDivElement | null>(null);
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

    map.current!.addControl(new MapGrid(), 'top-right');
    map.current!.addControl(new Minimap(), 'bottom-right');

    let destructor: void | (() => void);
    map.current!.once('style.load', () => {
      map.current!.setTerrain({'source': 'raster-dem', 'exaggeration': 1.0});
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
      map.current = undefined;
    };
  }, [callback]);

  return (
    <MapElement ref={mapContainer} className={className} style={cssStyle}/>
  );
};
