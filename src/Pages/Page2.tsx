import {MapStyles, Projections, useMapStore} from '@/store/map';
import {MapComponent} from '@/components/MapComponent';
import {useCallback} from 'react';
import {Map} from 'mapbox-gl';
import {Space, Switch, Typography} from 'antd';
import {T} from '@/components/Translate';
import {useSelector} from '@/utils';
import {MeasureToolbar} from '@/components/MeasureToolbar';
import {PathAltitudeWidget} from '@/components/PathAltitudeWidget';
import {MouseData} from '@/components/MouseData';

const {Title} = Typography;

export const Page2 = () => {
  const {
    setMap,
    style,
    setStyle,
    projection,
    setProjection
  } = useMapStore(useSelector(['setMap', 'style', 'setStyle', 'projection', 'setProjection']));
  const callback = useCallback((m?: Map) => {
    setMap(m);
    return () => {
      setMap(undefined);
    };
  }, [setMap]);

  return (
    <>
      <Title level={5}>Page 2</Title>
      <Space direction="vertical">
        <Space>
          <Switch
            checked={style === MapStyles.Satellite}
            onChange={(v) => setStyle(v ? MapStyles.Satellite : MapStyles.Vector)}
          />
          <T z="Satellite or Vector"/>
        </Space>
        <Space>
          <Switch
            checked={projection === Projections.Globe}
            onChange={(v) => setProjection(v ? Projections.Globe : Projections.Mercator)}
          />
          <T z="Mercator or Globe"/>
        </Space>
      </Space>
      <MapComponent callback={callback}/>
      <MouseData/>
      <MeasureToolbar/>
      <PathAltitudeWidget style={{position: 'fixed', top: 20, left: 20}}/>
    </>
  );
};
