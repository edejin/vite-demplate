import 'maplibre-gl/dist/maplibre-gl.css';
import {useMapStore} from '@/store/map';
import {Theme, useThemeStore} from '@/store/theme';
import {MapComponent, MapStyle} from '@/components/MapComponent';
import {useCallback} from 'react';
import {Map} from 'maplibre-gl';
import {Typography} from 'antd';

const {Title} = Typography;

export const Page2 = () => {
  const setMap = useMapStore(state => state.setMap);
  const theme = useThemeStore(state => state.theme);
  const callback = useCallback((m?: Map) => {
    setMap(m);
    return () => {
      setMap(undefined);
    };
  }, [setMap]);

  return (
    <>
      <Title level={5}>Page 2</Title>
      <MapComponent mapStyle={theme === Theme.Light ? MapStyle.LIGHT : MapStyle.DARK} callback={callback}/>
    </>
  );
};
