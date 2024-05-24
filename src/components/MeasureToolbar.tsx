import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Map,
  AnyLayer,
  AnySourceData,
  EventData,
  GeoJSONSource,
  SymbolLayer,
  MapTouchEvent,
  LineLayer
} from 'mapbox-gl';
import {DCircle, DPoint, DPolygon} from 'dgeoutils';
import {useMapStore} from '@/store/map';
import {Button, Space} from 'antd';
import {cancelableFetch} from '@/utils';
import {RespData, useMeasureStore} from '@/store/measure';
import {createGlobalStyle} from 'styled-components';
import type {FeatureCollection, Geometry, Feature} from 'geojson';

const GlobalStyles = createGlobalStyle`
  .no-cursor .mapboxgl-canvas {
    cursor: crosshair!important;
  }
`;

enum ToolTypes {
  None,
  Line,
  Area,
  Circle,
  Point,
  AltitudeLine,
  CircleAlt
}

const textStyles: Partial<SymbolLayer> = {
  'layout': {
    "text-font": [
      "Roboto Regular"
    ],
    'text-field': ['get', 'value'],
    'text-size': 10,
    'text-allow-overlap': true
  },
  'paint': {
    'text-color': '#000000',
    "text-opacity": 1,
    "text-opacity-transition": {
      "duration": 0
    },
    'text-halo-color': "#ffffff",
    'text-halo-width': 2
  }
};

const LAYERS_AND_SOURCE_PREFIX = 'measure-tools-';

export const formatLength = (lengthInMeters: number, withText: boolean = true): string => {
  return (lengthInMeters / 1000).toFixed(3) + (withText ? ' km' : '');
};

export const formatArea = (areaInMeters: number, withText: boolean = true): string => {
  return (areaInMeters / 1000000).toFixed(3) + (withText ? ' km²' : '');
};

const removeSource = (map: Map | undefined, id: string) => {
  if (map?.getSource(LAYERS_AND_SOURCE_PREFIX + id)) {
    map?.removeSource(LAYERS_AND_SOURCE_PREFIX + id);
  }
};
const removeLayer = (map: Map | undefined, id: string) => {
  if (map?.getLayer(LAYERS_AND_SOURCE_PREFIX + id)) {
    map?.removeLayer(LAYERS_AND_SOURCE_PREFIX + id);
  }
};
const addSource = (map: Map | undefined, id: string, props: AnySourceData) => {
  if (!map?.getSource(LAYERS_AND_SOURCE_PREFIX + id)) {
    map?.addSource(LAYERS_AND_SOURCE_PREFIX + id, props);
  }
};
const addLayer = (map: Map | undefined, props: AnyLayer) => {
  if (!map?.getLayer(LAYERS_AND_SOURCE_PREFIX + props.id)) {
    map?.addLayer({
      ...props,
      id: LAYERS_AND_SOURCE_PREFIX + props.id,
      source: LAYERS_AND_SOURCE_PREFIX + (props as LineLayer).source
    } as AnyLayer);
  }
};
const setData = (map: Map | undefined, id: string, data: FeatureCollection<Geometry>) => {
  (map?.getSource(LAYERS_AND_SOURCE_PREFIX + id) as GeoJSONSource).setData(data);
}

export const MeasureToolbar: React.FC = () => {
  const map = useMapStore(s => s.map);

  const [currentTool, setCurrentTool] = useState<ToolTypes>(ToolTypes.None);

  const distanceLines = useRef<DPolygon[]>([new DPolygon()]);
  const areaPolygons = useRef<DPolygon[]>([new DPolygon()]);
  const directionPolygons = useRef<DPolygon[]>([new DPolygon()]);
  const directionAreaVisPolygons = useRef<DPolygon[]>([new DPolygon()]);
  const directionAreaVisPolygonCurrent = useRef<string>('');
  const directionAltPolygons = useRef<DPolygon[]>([new DPolygon()]);
  const geoPints = useRef<DPoint[]>([]);

  const prevTool = useRef<ToolTypes>(ToolTypes.None);
  const movePoint = useRef<boolean>(false);

  const calculationCache = useRef<Record<string, any>>({});
  const calculationCache2 = useRef<Record<string, any>>({});

  useEffect(() => {
    if (currentTool === ToolTypes.None) {
      useMeasureStore.getState().setAltData([]);
    }
  }, [currentTool]);

  const updatePointsGeometries = useCallback(() => {
    setData(map, 'points', {
      "type": "FeatureCollection",
      features: geoPints.current.map((p: DPoint) => p
        .setProperties((r: DPoint) => {
          const {
            x,
            y
          } = r.toDegreesMinutesSeconds();
          return {
            value: `Lon: ${x}
Lat: ${y}`
          };
        }).toGeoJSONFeature())
    })
  }, [map]);

  const updateDistanceGeometries = useCallback(() => {
    if (distanceLines.current[distanceLines.current.length - 1].length > 1) {
      map?.getContainer().classList.add('no-cursor');
    } else {
      map?.getContainer().classList.remove('no-cursor');
    }
    setData(map, 'distance-polygon', {
      "type": "FeatureCollection",
      features: [
        ...distanceLines.current.map((e) => e.clone().removeDuplicates()).map((l) => {
          return l.length ? l.toGeoJSONFeature() : undefined;
        }).filter(r => r) as Feature[],
        ...distanceLines.current.map((e) => e.clone().removeDuplicates()).reduce((a: Feature[], v) => {
          if (v.length < 2) {
            return a;
          }
          const k = v
            .clone()
            .loop()
            .degreeToMeters()
            .run();

          useMeasureStore.getState().setDistanceValue(v.fullLengthLatLon);

          for (let i = 1; i < k.length; i++) {
            const p1 = k.at(i - 1).clone();
            const p2 = k.at(i).clone();
            const p1v = v.at(i - 1).clone();
            const p2v = v.at(i).clone();
            const distance = p1v.distanceLatLon(p2v);
            const center = p1
              .move(
                p2
                  .move(
                    p1
                      .clone()
                      .minus()
                  )
                  .divide(2)
              )
              .metersToDegree();
            center.properties.value = `Distance: ${formatLength(distance)}`;
            a.push(center.toGeoJSONFeature());
          }
          if (v.last && v.length > 2) {
            a.push(
              v
                .last
                .clone()
                .setProperties({
                  value: `Full length: ${formatLength(v.fullLengthLatLon)}`
                })
                .toGeoJSONFeature()
            );
          }
          return a;
        }, [])
      ]
    })
  }, [map]);

  const updateAreaGeometries = useCallback(() => {
    if (areaPolygons.current[areaPolygons.current.length - 1].length > 1) {
      map?.getContainer().classList.add('no-cursor');
    } else {
      map?.getContainer().classList.remove('no-cursor');
    }
    const features = [
      ...areaPolygons.current.reduce((a: Feature[], l) => {
        const key = l.toString();
        if (calculationCache.current[key]) {
          a.push(...calculationCache.current[key]);
          return a;
        }
        const res = [];
        const o = l.clone().open();
        if (o.length) {
          res.push(o.toGeoJSONFeature());
          res.push(new DPolygon([o.first, o.last]).toGeoJSONFeature());
          if (l.length > 2) {
            res.push(l.clone().filledDeintersection.noHoles.close().toGeoJSONFeature());
          }
        }
        if (res.length) {
          a.push(...res);
          calculationCache.current[key] = res;
        }
        return a;
      }, []),
      ...areaPolygons.current.reduce((a: Feature[], p) => {
        const key = p.toString();
        if (calculationCache2.current[key]) {
          a.push(calculationCache2.current[key]);
          return a;
        }
        if (p.length < 3) {
          return a;
        }
        const u = p
          .clone()
          .loop()
          .degreeToMeters()
          .run();
        const {
          center
        } = u;
        const {
          area
        } = u.clone().filledDeintersection.noHoles.close();

        useMeasureStore.getState().setAreaValue(area);

        let c = center;
        if (u.length > 3 && !u.contain(c)) {
          const r = [];
          for (let i = 0; i < u.length; i++) {
            const p0 = u.at(i);
            const p1 = u.at(i + 1);
            const p2 = u.at(i + 2);
            const tCenter = p0
              .clone()
              .move(p1)
              .move(p2)
              .divide(3);
            if (u.contain(tCenter)) {
              r.push(tCenter);
            }
          }
          const closes = r.sort((a, b) => b.distance(c) - a.distance(c)).pop();
          if (closes) {
            c = closes;
          }
        }
        const res = c
          .metersToDegree()
          .setProperties({
            value: `Area: ${formatArea(area)}`
          })
          .toGeoJSONFeature();
        a.push(res);
        calculationCache2.current[key] = res;
        return a;
      }, []).filter(r => r)
    ];
    setData(map, 'area-polygon', {
      "type": "FeatureCollection",
      features
    });
  }, [map]);

  const updateDirectionGeometries = useCallback(() => {
    if (directionPolygons.current[directionPolygons.current.length - 1].length > 1) {
      map?.getContainer().classList.add('no-cursor');
    } else {
      map?.getContainer().classList.remove('no-cursor');
    }
    const features = [
      ...directionPolygons.current.map(l => {
        return l.length ? l.toGeoJSONFeature() : undefined;
      }).filter(r => r) as Feature[],
      ...directionPolygons.current.reduce((a: Feature[], p) => {
        if (p.length < 2) {
          return a;
        }
        const {
          fullLengthLatLon: radius,
          first: center
        } = p;
        const {
          first,
          last
        } = p
          .clone()
          .loop()
          .degreeToMeters()
          .run();
        const fi = (first.findLine(last).getFi() / Math.PI * 180 + 90) % 360;
        const mPoly =
          new DCircle(center, radius)
            .findPolygonInsideOnSphere();
        a.push(
          mPoly
            .toGeoJSONFeature(),
          p
            .first
            .clone()
            .setProperties({
              value: `Area: ${formatArea(Math.PI * radius * radius)}`
            })
            .toGeoJSONFeature(),
          p
            .last
            .clone()
            .setProperties({
              value: `Direction: ${fi.toFixed(2)}°`
            })
            .toGeoJSONFeature(),
          p
            .center
            .clone()
            .setProperties({
              value: `Radius: ${formatLength(radius)}`
            })
            .toGeoJSONFeature()
        );

        useMeasureStore.getState().setArcValue([
          Math.PI * radius * radius,
          radius,
          fi
        ]);

        return a;
      }, [])
    ];
    setData(map, 'direction-polygon', {
      "type": "FeatureCollection",
      features
    });
  }, [map]);

  const updateDirectionAreaVisGeometries = useCallback(() => {
    if (directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].length > 1) {
      map?.getContainer().classList.add('no-cursor');
    } else {
      map?.getContainer().classList.remove('no-cursor');
    }

    try {
      const {
        first: {
          lat,
          lon
        }
      } = directionAreaVisPolygons.current[0].clone();
      useMeasureStore.getState().setObserverPosition({
        lon,
        lat
      });
    } catch (e) {
    }

    if (directionAreaVisPolygons.current[0].length > 1 && directionAreaVisPolygons.current[1] && directionAreaVisPolygons.current[0].toString() !== directionAreaVisPolygonCurrent.current) {
      directionAreaVisPolygonCurrent.current = directionAreaVisPolygons.current[0].toString();


      {
        const {
          first
        } = directionAreaVisPolygons.current[0].clone();
        const {
          lon,
          lat
        } = first;
        const fInM = first.clone().degreeToMeters();
        const {
          fullLength
        } = directionAreaVisPolygons.current[0].clone()
          .loop()
          .degreeToMeters()
          .run();

        removeLayer(map, 'direction-area-vis-raster');
        removeSource(map, 'direction-area-vis-raster');

        const coordinates = new DPolygon([
          fInM.clone().move(-fullLength, fullLength).metersToDegree(),
          fInM.clone().move(fullLength, fullLength).metersToDegree(),
          fInM.clone().move(fullLength, -fullLength).metersToDegree(),
          fInM.clone().move(-fullLength, -fullLength).metersToDegree()
        ]).toArrayOfCoords('xy');

        addSource(map, 'direction-area-vis-raster', {
          type: 'image',
          url: `http://localhost:8088/?type=api&api=areaVis&lon=${lon}&lat=${lat}&r=${fullLength}`,
          coordinates
        });
        addLayer(map, {
          id: 'direction-area-vis-raster',
          type: 'raster',
          source: 'direction-area-vis-raster',
          paint: {
            'raster-opacity': 0.5
          }
        });

      }
    }

    const features = [
      ...directionAreaVisPolygons.current.reduce((a: Feature[], p) => {
        if (p.length < 2) {
          return a;
        }
        const {
          fullLength: radius,
          first
        } = p
          .clone()
          .loop()
          .degreeToMeters()
          .run();
        const mPoly =
          new DCircle(first, radius)
            .findPolygonInside();
        a.push(
          mPoly
            .loop()
            .metersToDegree()
            .run()
            .toGeoJSONFeature()
        );

        return a;
      }, [])
    ];
    setData(map, 'direction-area-vis-polygon', {
      "type": "FeatureCollection",
      features
    });
  }, [map]);

  const updateDirectionAltGeometries = useCallback(() => {
    if (directionAltPolygons.current[directionAltPolygons.current.length - 1].length > 1) {
      map?.getContainer().classList.add('no-cursor');
    } else {
      map?.getContainer().classList.remove('no-cursor');
    }
    const features = [
      ...directionAltPolygons.current.map(l => {
        return l.length ? l.toGeoJSONFeature() : undefined;
      }).filter(r => r) as Feature[],
      ...directionAltPolygons.current.reduce((a: Feature[], p) => {
        if (p.length < 2) {
          return a;
        }
        const {
          fullLength: radius
        } = p
          .clone()
          .loop()
          .degreeToMeters()
          .run();
        a.push(
          p
            .center
            .clone()
            .setProperties({
              value: `Length: ${formatLength(radius)}`
            })
            .toGeoJSONFeature()
        );

        return a;
      }, [])
    ];
    setData(map, 'direction-alt-polygon', {
      "type": "FeatureCollection",
      features
    })
  }, [map]);

  useEffect(() => {
    map?.getContainer().classList.remove('no-cursor');
    switch (prevTool.current) {
      case ToolTypes.Circle:
        map?.getContainer().classList.remove('no-cursor');
        break;
      case ToolTypes.CircleAlt:
        map?.getContainer().classList.remove('no-cursor');
        break;
      case ToolTypes.AltitudeLine:
        map?.getContainer().classList.remove('no-cursor');
        break;
      case ToolTypes.Area:
        map?.getContainer().classList.remove('no-cursor');
        break;
      case ToolTypes.Line:
        map?.getContainer().classList.remove('no-cursor');
        break;
      case ToolTypes.Point:
        map?.getContainer().classList.remove('no-cursor');
        if (movePoint.current) {
          geoPints.current.pop();
          movePoint.current = false;
        }
        updatePointsGeometries();
        break;
    }

    const {
      setAreaValue,
      setDistanceValue,
      setArcValue
    } = useMeasureStore.getState();

    setAreaValue(undefined);
    setDistanceValue(undefined);
    setArcValue(undefined);

    switch (currentTool) {
      case ToolTypes.None:
        removeLayer(map, 'distance-polygon');
        removeLayer(map, 'distance-polygon-points');
        removeSource(map, 'distance-polygon');

        removeLayer(map, 'area-polygon-lines');
        removeLayer(map, 'area-polygon-points');
        removeLayer(map, 'area-polygon');
        removeSource(map, 'area-polygon');

        removeLayer(map, 'direction-polygon-lines');
        removeLayer(map, 'direction-polygon-points');
        removeLayer(map, 'direction-polygon');
        removeSource(map, 'direction-polygon');

        removeLayer(map, 'direction-area-vis-polygon-lines');
        removeLayer(map, 'direction-area-vis-polygon-points');
        removeSource(map, 'direction-area-vis-polygon');
        removeLayer(map, 'direction-area-vis-raster');
        removeSource(map, 'direction-area-vis-raster');

        removeLayer(map, 'direction-alt-polygon-lines');
        removeLayer(map, 'direction-alt-polygon-points');
        removeLayer(map, 'direction-alt-polygon');
        removeSource(map, 'direction-alt-polygon');

        removeLayer(map, 'points');
        removeLayer(map, 'points2');
        removeSource(map, 'points');

        distanceLines.current = [new DPolygon()];
        areaPolygons.current = [new DPolygon()];
        calculationCache.current = {};
        calculationCache2.current = {};
        directionPolygons.current = [new DPolygon()];
        directionAreaVisPolygons.current = [new DPolygon()];
        directionAltPolygons.current = [new DPolygon()];
        geoPints.current = [];
        map?.doubleClickZoom.enable();
        break;
      case ToolTypes.Line:
        map?.doubleClickZoom.disable();
        addSource(map, 'distance-polygon', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          id: "distance-polygon",
          'type': 'line',
          'source': 'distance-polygon',
          'layout': {},
          'paint': {
            'line-color': '#FF511A',
            'line-width': 3
          },
          "filter": [
            "==",
            "$type",
            "LineString"
          ]
        });
        addLayer(map, {
          id: "distance-polygon-points",
          'type': 'symbol',
          'source': 'distance-polygon',
          ...textStyles,
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
      case ToolTypes.Area:
        map?.doubleClickZoom.disable();
        addSource(map, 'area-polygon', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          'id': 'area-polygon',
          'type': 'fill',
          'source': 'area-polygon',
          'layout': {},
          'paint': {
            'fill-color': '#FF511A',
            'fill-opacity': 0.2
          },
          "filter": [
            "==",
            "$type",
            "Polygon"
          ]
        });
        addLayer(map, {
          id: "area-polygon-lines",
          'type': 'line',
          'source': 'area-polygon',
          'layout': {},
          'paint': {
            'line-color': '#FF511A',
            'line-width': 2
          }
        });
        addLayer(map, {
          id: "area-polygon-points",
          'type': 'symbol',
          'source': 'area-polygon',
          ...textStyles,
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
      case ToolTypes.Circle:
        map?.doubleClickZoom.disable();
        addSource(map, 'direction-polygon', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          'id': 'direction-polygon',
          'type': 'fill',
          'source': 'direction-polygon',
          'layout': {},
          'paint': {
            'fill-color': '#F6FA35',
            'fill-opacity': 0.2
          },
          "filter": [
            "==",
            "$type",
            "Polygon"
          ]
        });
        addLayer(map, {
          id: "direction-polygon-lines",
          'type': 'line',
          'source': 'direction-polygon',
          'layout': {},
          'paint': {
            'line-color': '#F6FA35',
            'line-width': 2
          }
        });
        addLayer(map, {
          id: "direction-polygon-points",
          'type': 'symbol',
          'source': 'direction-polygon',
          ...textStyles,
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
      case ToolTypes.CircleAlt:
        map?.doubleClickZoom.disable();
        addSource(map, 'direction-area-vis-polygon', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          id: "direction-area-vis-polygon-lines",
          'type': 'line',
          'source': 'direction-area-vis-polygon',
          'layout': {},
          'paint': {
            'line-color': '#2ed18a',
            'line-width': 2
          }
        });
        addLayer(map, {
          id: "direction-area-vis-polygon-points",
          'type': 'symbol',
          'source': 'direction-area-vis-polygon',
          ...textStyles,
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
      case ToolTypes.AltitudeLine:
        map?.doubleClickZoom.disable();
        addSource(map, 'direction-alt-polygon', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          'id': 'direction-alt-polygon',
          'type': 'fill',
          'source': 'direction-alt-polygon',
          'layout': {},
          'paint': {
            'fill-color': '#ffc100',
            'fill-opacity': 0.2
          },
          "filter": [
            "==",
            "$type",
            "Polygon"
          ]
        });
        addLayer(map, {
          id: "direction-alt-polygon-lines",
          'type': 'line',
          'source': 'direction-alt-polygon',
          'layout': {},
          'paint': {
            'line-color': '#2EEAC8',
            'line-width': 3
          }
        });
        addLayer(map, {
          id: "direction-alt-polygon-points",
          'type': 'symbol',
          'source': 'direction-alt-polygon',
          ...textStyles,
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
      case ToolTypes.Point:
        addSource(map, 'points', {
          type: "geojson",
          data: {
            "type": "FeatureCollection",
            "features": []
          }
        });
        addLayer(map, {
          id: "points",
          'type': 'symbol',
          'source': 'points',
          ...textStyles,
          layout: {
            ...textStyles.layout,
            'text-variable-anchor': ['top-left'],
            'text-padding': 6,
            'text-justify': 'left'
          },
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        addLayer(map, {
          id: "points2",
          'type': 'circle',
          'source': 'points',
          'paint': {
            'circle-radius': 6,
            'circle-color': '#2ED18A'
          },
          "filter": [
            "==",
            "$type",
            "Point"
          ]
        });
        break;
    }
    prevTool.current = currentTool;
  }, [currentTool, map]);

  const mapClickHandler = useCallback((e: EventData) => {
    switch (currentTool) {
      case ToolTypes.Line:
        distanceLines.current[distanceLines.current.length - 1].push(DPoint.parse(e.lngLat));
        updateDistanceGeometries();
        break;
      case ToolTypes.Area:
        areaPolygons.current[areaPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        updateAreaGeometries();
        break;
      case ToolTypes.Circle:
        directionPolygons.current[directionPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        if (directionPolygons.current[directionPolygons.current.length - 1].length >= 3) {
          while (directionPolygons.current[directionPolygons.current.length - 1].length > 3) {
            directionPolygons.current[directionPolygons.current.length - 1].pop();
          }
          directionPolygons.current.push(new DPolygon());
        }
        updateDirectionGeometries();
        break;
      case ToolTypes.CircleAlt:
        directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        if (directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].length >= 3) {
          while (directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].length > 3) {
            directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].pop();
          }
          directionAreaVisPolygons.current.push(new DPolygon());
        }
        if (directionAreaVisPolygons.current.length > 2) {
          directionAreaVisPolygons.current.shift();
        }

        updateDirectionAreaVisGeometries();
        break;
      case ToolTypes.AltitudeLine:
        directionAltPolygons.current[directionAltPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        if (directionAltPolygons.current[directionAltPolygons.current.length - 1].length >= 3) {
          while (directionAltPolygons.current[directionAltPolygons.current.length - 1].length > 3) {
            directionAltPolygons.current[directionAltPolygons.current.length - 1].pop();
          }

          const target = directionAltPolygons.current[directionAltPolygons.current.length - 1].clone();
          target.pop();
          useMeasureStore.getState().setAltData([]);
          cancelableFetch('http://localhost:8088/?type=api&api=pathAlt', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              path: target.toGeoJSONFeature()
            })
          }).then(e => e.json()).then((d: RespData[]) => {
            useMeasureStore.getState().setAltData(d);
          });

          directionAltPolygons.current.push(new DPolygon());
        }
        if (directionAltPolygons.current.length > 2) {
          directionAltPolygons.current.shift();
        }

        updateDirectionAltGeometries();
        break;
      case ToolTypes.Point:
        geoPints.current.push(DPoint.parse(e.lngLat));
        updatePointsGeometries();
        break;
    }
  }, [currentTool]);

  const mapMoveHandler = useCallback((e: EventData) => {
    switch (currentTool) {
      case ToolTypes.Line:
        distanceLines.current[distanceLines.current.length - 1].pop();
        distanceLines.current[distanceLines.current.length - 1].push(DPoint.parse(e.lngLat));
        updateDistanceGeometries();
        break;
      case ToolTypes.Area:
        areaPolygons.current[areaPolygons.current.length - 1].pop();
        areaPolygons.current[areaPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        updateAreaGeometries();
        break;
      case ToolTypes.Circle:
        directionPolygons.current[directionPolygons.current.length - 1].pop();
        directionPolygons.current[directionPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        updateDirectionGeometries();
        break;
      case ToolTypes.CircleAlt:
        directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].pop();
        directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        updateDirectionAreaVisGeometries();
        break;
      case ToolTypes.AltitudeLine:
        directionAltPolygons.current[directionAltPolygons.current.length - 1].pop();
        directionAltPolygons.current[directionAltPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        updateDirectionAltGeometries();
        break;
      case ToolTypes.Point:
        if (movePoint.current) {
          geoPints.current.pop();
        }
        geoPints.current.push(DPoint.parse(e.lngLat));
        updatePointsGeometries();
        movePoint.current = true;
        break;
    }
  }, [currentTool]);

  const mapDblClickHandler = useCallback(() => {
    switch (currentTool) {
      case ToolTypes.Line:
        distanceLines.current[distanceLines.current.length - 1].pop();
        distanceLines.current[distanceLines.current.length - 1].pop();
        distanceLines.current.push(new DPolygon());
        updateDistanceGeometries();
        break;
      case ToolTypes.Area:
        areaPolygons.current[areaPolygons.current.length - 1].pop();
        areaPolygons.current[areaPolygons.current.length - 1].pop();
        areaPolygons.current.push(new DPolygon());
        updateAreaGeometries();
        break;
    }
  }, [currentTool]);

  const toucheStartTime = useRef<number>(0);
  const mapTouchStartHandler = useCallback((e: MapTouchEvent) => {
    switch (currentTool) {
      case ToolTypes.Line:
        map?.dragPan.disable();
        distanceLines.current[distanceLines.current.length - 1].push(DPoint.parse(e.lngLat));
        break;
      case ToolTypes.Area:
        map?.dragPan.disable();
        areaPolygons.current[areaPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        break;
      case ToolTypes.Circle:
        map?.dragPan.disable();
        directionPolygons.current[directionPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        mapClickHandler(e);
        toucheStartTime.current = Date.now();
        break;
      case ToolTypes.CircleAlt:
        map?.dragPan.disable();
        directionAreaVisPolygons.current[directionAreaVisPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        mapClickHandler(e);
        toucheStartTime.current = Date.now();
        break;
      case ToolTypes.AltitudeLine:
        map?.dragPan.disable();
        directionAltPolygons.current[directionAltPolygons.current.length - 1].push(DPoint.parse(e.lngLat));
        mapClickHandler(e);
        toucheStartTime.current = Date.now();
        break;
    }
  }, [map, currentTool]);

  const mapTouchEndHandler = useCallback((e: MapTouchEvent) => {
    switch (currentTool) {
      case ToolTypes.Line:
        mapClickHandler(e);
        map?.dragPan.enable();
        break;
      case ToolTypes.Area:
        mapClickHandler(e);
        map?.dragPan.enable();
        break;
      case ToolTypes.Circle:
        if (Date.now() - toucheStartTime.current > 500) {
          mapClickHandler(e);
          map?.dragPan.enable();
        } else {
          directionPolygons.current = directionPolygons.current.map(r => r.removeDuplicates()).filter(r => r.length);
          updateDirectionGeometries();
        }
        break;
      case ToolTypes.CircleAlt:
        if (Date.now() - toucheStartTime.current > 500) {
          mapClickHandler(e);
          map?.dragPan.enable();
        } else {
          directionAreaVisPolygons.current = directionAreaVisPolygons.current.map(r => r.removeDuplicates()).filter(r => r.length);
          updateDirectionAreaVisGeometries();
        }
        break;
      case ToolTypes.AltitudeLine:
        if (Date.now() - toucheStartTime.current > 500) {
          mapClickHandler(e);
          map?.dragPan.enable();
        } else {
          directionAltPolygons.current = directionAltPolygons.current.map(r => r.removeDuplicates()).filter(r => r.length);
          updateDirectionAltGeometries();
        }
        break;
    }
  }, [map, currentTool]);

  const mapTouchMoveHandler = useCallback((e: MapTouchEvent) => {
    switch (currentTool) {
      case ToolTypes.Area:
        mapMoveHandler(e);
        break;
      case ToolTypes.Line:
        mapMoveHandler(e);
        break;
      case ToolTypes.Circle:
        mapMoveHandler(e);
        break;
      case ToolTypes.CircleAlt:
        mapMoveHandler(e);
        break;
      case ToolTypes.AltitudeLine:
        mapMoveHandler(e);
        break;
    }
  }, [map, currentTool]);

  useEffect(() => {
    if (map) {
      map.on('touchstart', mapTouchStartHandler);

      return () => {
        if (map) {
          map.off('touchstart', mapTouchStartHandler);
        }
      };
    }
  }, [map, mapTouchStartHandler]);

  useEffect(() => {
    if (map) {
      map.on('touchend', mapTouchEndHandler);

      return () => {
        if (map) {
          map.off('touchend', mapTouchEndHandler);
        }
      };
    }
  }, [map, mapTouchEndHandler]);

  useEffect(() => {
    if (map) {
      map.on('touchmove', mapTouchMoveHandler);

      return () => {
        if (map) {
          map.off('touchmove', mapTouchMoveHandler);
        }
      };
    }
  }, [map, mapTouchMoveHandler]);

  useEffect(() => {
    if (map) {
      map.on('click', mapClickHandler);

      return () => {
        if (map) {
          map.off('click', mapClickHandler);
        }
      };
    }
  }, [map, mapClickHandler]);

  useEffect(() => {
    if (map) {
      map.on('mousemove', mapMoveHandler);

      return () => {
        if (map) {
          map.off('mousemove', mapMoveHandler);
        }
      };
    }
  }, [map, mapMoveHandler]);

  useEffect(() => {
    if (map) {
      map.on('dblclick', mapDblClickHandler);

      return () => {
        if (map) {
          map.off('dblclick', mapDblClickHandler);
        }
      };
    }
  }, [map, mapDblClickHandler]);

  const tools: {
    tooltip: string;
    key: ToolTypes
  }[] = [
    {
      tooltip: 'Measure distances between points',
      key: ToolTypes.Line
    }, {
      tooltip: 'Measure areas of shapes',
      key: ToolTypes.Area
    }, {
      tooltip: 'Measure areas and radiuses of circles and directions of the mouse relative to circle centers',
      key: ToolTypes.Circle
    }, {
      tooltip: 'Show path altitude',
      key: ToolTypes.AltitudeLine
    }, {
      tooltip: 'Show visibility of area',
      key: ToolTypes.CircleAlt
    }
  ];

  return (
    <>
      <GlobalStyles/>
      <Space direction="vertical">
        {tools.map(({tooltip, key}) => (
          <Button
            type={currentTool === key ? 'primary' : 'default'}
            key={tooltip}
            onClick={() => setCurrentTool((v) => v === key ? ToolTypes.None : key)}
          >
            {tooltip}
          </Button>
        ))}
      </Space>
    </>
  );
};
