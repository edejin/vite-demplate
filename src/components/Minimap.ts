import {GeoJSONSource, Map, MapMouseEvent, SourcesSpecification, StyleSpecification, GeoJSONSourceSpecification} from 'mapbox-gl';
import {sleep} from '@/utils';
import type {Position} from 'geojson';
import {waitForStyles} from '@/utils/map';

const addData = (src: Map, target: Map, c?: Position[][]) => {
  let lon1, lat1, lon2, lat2;
  if (!c) {
    const bounds = src.getBounds();
    if (bounds) {
      [[lon1, lat1], [lon2, lat2]] = bounds.toArray();
    }
  }
  const coordinates = (c ?? [
    [
      [lon1, lat1],
      [lon1, lat2],
      [lon2, lat2],
      [lon2, lat1],
      [lon1, lat1]
    ]
  ]) as Position[][];
  target.addSource('target-json', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "coordinates": coordinates,
            "type": "Polygon"
          }
        }
      ]
    }
  } as GeoJSONSourceSpecification);
  target.addLayer({
    id: 'target-json',
    source: 'target-json',
    type: 'line',
    layout: {
      visibility: "visible"
    },
    paint: {
      "line-width": 3,
      "line-color": "rgb(226,123,18)"
    }
  });
  return coordinates;
};

const getStyleKey = (map?: Map): string => {
  const styles = map?.getStyle();

  return JSON.stringify({
    ...styles,
    sources: Object.keys(styles?.sources ?? {}).reduce((a: SourcesSpecification, k: string) => {
      if (!k.includes('graticule') && !k.includes('measure-tools-')) {
        a[k] = (styles?.sources ?? {})[k];
      }
      return a;
    }, {} as SourcesSpecification),
    layers: (styles?.layers ?? []).filter(e => !e.id.includes('graticule') && !e.id.includes('measure-tools-'))
  });
};

export class Minimap {
  private unsubscribe?: () => void;
  private map?: Map;

  onAdd(map: Map) {
    const div = document.createElement("div");
    div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    div.style.pointerEvents = 'none';
    div.style.border = '4px solid white';
    const container = document.createElement("div");
    container.style.width = '200px';
    container.style.height = '200px';
    div.appendChild(container);

    let coordinates: undefined | Position[][];

    ;(async () => {
      await waitForStyles(map);

      const initialStyle = map.getStyle();
      const initialProjection = map.getProjection();

      let currentStyleKey = getStyleKey(map);
      let currentProjectionKey = JSON.stringify(initialProjection);

      this.map = new Map({
        container,
        style: {
          ...initialStyle,
          version: 8,
          sources: initialStyle?.sources ?? {},
          layers: (initialStyle?.layers ?? []).filter(e => !e.id.includes('graticule') && !e.id.includes('measure-tools-'))
        },
        projection: initialProjection
      });

      await waitForStyles(this.map);

      addData(map, this.map);
      const bounds = map.getBounds();
      if (bounds) {
        this.map.fitBounds(
          bounds,
          {
            animate: false,
            padding: {
              top: 30,
              bottom: 30,
              right: 30,
              left: 30
            }
          }
        );
      }

      const move = (e: MapMouseEvent) => {
        const tSource = this.map?.getSource('target-json') as GeoJSONSource;
        const bounds = e.target.getBounds();
        if (bounds) {
          if (tSource) {
            const [[lon1, lat1], [lon2, lat2]] = bounds.toArray();
            coordinates = [
              [
                [lon1, lat1],
                [lon1, lat2],
                [lon2, lat2],
                [lon2, lat1],
                [lon1, lat1]
              ]
            ];
            tSource.setData({
              type: 'FeatureCollection',
              features: [
                {
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "coordinates": coordinates,
                    "type": "Polygon"
                  }
                }
              ]
            });
          }
          this.map?.fitBounds(
            bounds,
            {
              animate: false,
              padding: {
                top: 30,
                left: 30,
                right: 30,
                bottom: 30
              }
            }
          );
        }
      };

      map.on('move', move);

      let loop = true;
      this.unsubscribe = () => {
        loop = false;
        map.off('move', move);
      };

      while (loop) {
        await waitForStyles(map);
        await sleep();

        const tStyle = getStyleKey(map);
        if (currentStyleKey !== tStyle) {
          currentStyleKey = tStyle;
          const style = map.getStyle();
          if (style) {
            const {version = 8, sources ={}, layers = [], ...t} = style;
            this.map.setStyle({
              ...t,
              version,
              sources,
              layers: layers.filter(e => !e.id.includes('graticule') && !e.id.includes('measure-tools-'))
            } as StyleSpecification);

            await waitForStyles(this.map);
            this.map.addSource('target-json', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: coordinates ? [{
                  "type": "Feature",
                  "properties": {},
                  "geometry": {
                    "coordinates": coordinates,
                    "type": "Polygon"
                  }
                }] : []
              }
            } as GeoJSONSourceSpecification);
            this.map.addLayer({
              id: 'target-json',
              source: 'target-json',
              type: 'line',
              layout: {
                visibility: "visible"
              },
              paint: {
                "line-width": 3,
                "line-color": "rgb(226,123,18)"
              }
            });
          }
        }
        const tProjection = JSON.stringify(map.getProjection());
        if (currentProjectionKey !== tProjection) {
          currentProjectionKey = tProjection;
          this.map.setProjection(map.getProjection());
        }
      }
    })();

    return div;
  }

  onRemove() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.map?.remove();
  }
}
