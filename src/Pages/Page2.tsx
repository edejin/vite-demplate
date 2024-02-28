import {MapStyles, useMapStore} from '@/store/map';
import {MapComponent} from '@/components/MapComponent';
import {useCallback} from 'react';
import {Map} from 'mapbox-gl';
import {Space, Switch, Typography} from 'antd';
import {T} from '@/components/Translate';
import {useSelector} from '@/utils';

const {Title} = Typography;

export const Page2 = () => {
  const {
    setMap,
    style,
    setStyle
  } = useMapStore(useSelector(['setMap', 'style', 'setStyle']));
  const callback = useCallback((m?: Map) => {
    setMap(m);
    return () => {
      setMap(undefined);
    };
  }, [setMap]);

  return (
    <>
      <Title level={5}>Page 2</Title>
      <Space>
        <Switch
          checked={style === MapStyles.Satellite}
          onChange={(v) => setStyle(v ? MapStyles.Satellite : MapStyles.Vector)}
        />
        <T z="Satellite or Vector"/>
      </Space>
      <MapComponent callback={callback}/>
    </>
  );
};
