import 'maplibre-gl/dist/maplibre-gl.css';
import {useMapStore} from '@/store/map';
import {Theme, useThemeStore} from '@/store/theme';
import {MapComponent, MapStyle} from '@/components/MapComponent';
import {useCallback, useState} from 'react';
import {Map} from 'maplibre-gl';
import {Button, Slider, Space, Switch, Typography} from 'antd';
import {GeoJsonSource} from '@/components/map/source/GeoJsonSource';
import {GeoJSON} from 'geojson';
import {CircleLayer, FillLayer, LineLayer} from '@/components/map/layer';

const {Title} = Typography;

const exampleData: GeoJSON = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [-122.48369693756104, 37.83381888486939],
      [-122.48348236083984, 37.83317489144141],
      [-122.48339653015138, 37.83270036637107],
      [-122.48356819152832, 37.832056363179625],
      [-122.48404026031496, 37.83114119107971],
      [-122.48404026031496, 37.83049717427869],
      [-122.48348236083984, 37.829920943955045],
      [-122.48356819152832, 37.82954808664175],
      [-122.48507022857666, 37.82944639795659],
      [-122.48610019683838, 37.82880236636284],
      [-122.48695850372314, 37.82931081282506],
      [-122.48700141906738, 37.83080223556934],
      [-122.48751640319824, 37.83168351665737],
      [-122.48803138732912, 37.832158048267786],
      [-122.48888969421387, 37.83297152392784],
      [-122.48987674713133, 37.83263257682617],
      [-122.49043464660643, 37.832937629287755],
      [-122.49125003814696, 37.832429207817725],
      [-122.49163627624512, 37.832564787218985],
      [-122.49223709106445, 37.83337825839438],
      [-122.49378204345702, 37.83368330777276]
    ]
  }
};

export const Page2 = () => {
  const setMap = useMapStore(state => state.setMap);
  const theme = useThemeStore(state => state.theme);
  const callback = useCallback((m?: Map) => {
    setMap(m);
    return () => {
      setMap(undefined);
    };
  }, [setMap]);

  const [showLayer, setShowLayer] = useState<boolean>(false);
  const [center, setCenter] = useState<[number, number]>([-122.486052, 37.830348]);
  const [zoom, setZoom] = useState<number>(15);

  return (
    <>
      <Title level={5}>Page 2</Title>
      <Space direction={'vertical'}>
        <Switch onChange={(v) => setShowLayer(v)}/>
        <Space.Compact>
          <Button onClick={() => setCenter([-122.486052, 37.830348])}>[-122.486052, 37.830348]</Button>
          <Button onClick={() => setCenter([54.4, 24.4])}>[54.4, 24.4]</Button>
          <Button onClick={() => setCenter([33.5, 44.6])}>[33.5, 44.6]</Button>
        </Space.Compact>
        <Slider value={zoom} onChange={(v: number) => setZoom(v)} min={0} max={21} step={0.1}/>
      </Space>
      <MapComponent
        mapStyle={theme === Theme.Light ? MapStyle.LIGHT : MapStyle.DARK}
        callback={callback}
        center={center}
        zoom={zoom}
      >
        {
          showLayer ? (
            <GeoJsonSource data={exampleData} id={'Test Source'}>
              <LineLayer
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round'
                }}
                paint={{
                  'line-color': '#888',
                  'line-width': 8
                }}
              />
              <CircleLayer
                paint={{
                  'circle-radius': 6,
                  'circle-color': '#B42222'
                }}
              />
              <FillLayer
                paint={{
                  'fill-color': '#ab9252',
                  'fill-opacity': 0.4
                }}
              />
            </GeoJsonSource>
          ) : null
        }
      </MapComponent>
    </>
  );
};
