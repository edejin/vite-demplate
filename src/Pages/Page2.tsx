import styled from 'styled-components';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useMapStore} from '@/store/map';
import {MapStyle, useMap} from '@/utils/hooks';
import {Theme, useThemeStore} from '@/store/theme';

const MapElement = styled.div`
  width: 500px;
  height: 500px;
  position: relative;
`;

export const Page2 = () => {
  const setMap = useMapStore(state => state.setMap);
  const theme = useThemeStore(state => state.theme);
  const element = useMap({
    center: [54.32313290648384, 24.46175140019264],
    zoom: 14,
    mapStyle: theme === Theme.Light ? MapStyle.LIGHT : MapStyle.DARK
  }, (m) => {
    setMap(m);
    return () => {
      setMap(undefined);
    }
  });

  return (
    <>
      <p>Page 2</p>
      <MapElement ref={element}/>
    </>
  );
};
