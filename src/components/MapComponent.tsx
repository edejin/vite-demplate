import React, {
  CSSProperties,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode, useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ML, {Map, MapOptions, StyleSpecification} from 'maplibre-gl';
import {cancelableFetch, isDef} from '@/utils';
import styled from 'styled-components';

ML.workerUrl = './worker.js';

export enum MapStyle {
  DARK = '/map-styles/style-dark.json',
  LIGHT = '/map-styles/style.json'
}

const MapElement = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
`;

interface Props extends Omit<MapOptions, 'container' | 'style'>, PropsWithChildren {
  mapStyle?: MapStyle;
  callback?: (m?: Map) => () => void;
  className?: string;
  style?: CSSProperties;
}

export const MapComponent: React.FC<Props> = (option: Props) => {
  const {
    mapStyle = MapStyle.LIGHT,
    callback,
    className,
    style: cssStyle,
    children,
    ...props
  } = option;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();
  const [style, setStyle] = useState<StyleSpecification | undefined>(undefined);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (isDef(props.center)) {
      map.current?.setCenter(props.center!);
    }
  }, [props.center]);
  useEffect(() => {
    if (isDef(props.zoom)) {
      map.current?.setZoom(props.zoom!);
    }
  }, [props.zoom]);

  useEffect(() => {
    const f = cancelableFetch(mapStyle);

    f.then((res) => res.text())
      .then((text) => {
        const path = document.location.origin + document.location.pathname;
        return (JSON.parse(text.replaceAll('__REPLACE_ME__', path)) as unknown) as StyleSpecification;
      })
      .then((s) => setStyle(s));

    return () => {
      f.cancel();
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!style) return;
    if (!mapContainer.current) return;

    map.current = new Map({
      ...props,
      container: mapContainer.current,
      style
    });

    let destructor: void | (() => void);
    map.current!.once('style.load', () => {
      if (callback) {
        destructor = callback(map.current);
      }
      setMounted(true);
    });

    return () => {
      setMounted(false);
      if (destructor) {
        destructor();
      }
      map.current?.remove();
    };
  }, [style, callback]);

  const childCb = useCallback((child: ReactNode) => (mounted && React.isValidElement(child)) ? React.cloneElement(child, {map: map.current} as HTMLAttributes<any>) : child, [children, mounted]);
  const childWithProps = useMemo(() => React.Children.map(children, childCb), [childCb]);

  return (
    <MapElement ref={mapContainer} className={className} style={cssStyle}>
      {childWithProps}
    </MapElement>
  );
};
