import ML, {Map, MapOptions, StyleSpecification} from 'maplibre-gl';
import {RefObject, useEffect, useRef, useState} from 'react';

ML.workerUrl = './worker.js';

export enum MapStyle {
  DARK = '/map-styles/style-dark.json',
  LIGHT = '/map-styles/style.json'
}

interface Options extends Omit<MapOptions, 'container' | 'style'> {
  mapStyle?: MapStyle;
}

export function useMap(option: Options, cb: (m: Map) => (() => void) | void): RefObject<HTMLDivElement> {
  const container = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<StyleSpecification | undefined>(undefined);
  const {
    mapStyle = MapStyle.DARK,
    ...props
  } = option;

  useEffect(() => {
    fetch(mapStyle)
      .then((res) => res.text())
      .then((text) => {
        const path = document.location.origin + document.location.pathname;
        return (JSON.parse(text.replaceAll('__REPLACE_ME__', path)) as unknown) as StyleSpecification;
      })
      .then((s) => setStyle(s));
  }, [mapStyle]);

  useEffect(() => {
    if (container.current && style) {
      const m = new Map({
        ...props,
        container: container.current,
        style
      });

      let destructor: void | (() => void);
      m.once('style.load', () => destructor = cb(m));

      return () => {
        if (destructor) {
          destructor();
        }
        m.remove();
      }
    }
  }, [container, style, props, cb]);

  return container;
}
