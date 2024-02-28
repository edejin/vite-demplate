import {MapStyles, useMapStore} from '@/store/map';
import {Style} from 'mapbox-gl';
import lightMapStyle from '@/assets/map-styles/style-light.json';
import darkMapStyle from '@/assets/map-styles/style-dark.json';
import {Theme, useThemeStore} from '@/store/theme';
import lightSatMapStyle from '@/assets/map-styles/style-sat-light.json';
import darkSatMapStyle from '@/assets/map-styles/style-sat-dark.json';

export const calculateMapStyle = (): Style => {
  const {
    theme
  } = useThemeStore.getState();
  const {
    style
  } = useMapStore.getState();
  let resultTheme;
  switch (style) {
    case MapStyles.Satellite:
      switch (theme) {
        case Theme.Dark:
          resultTheme = darkSatMapStyle;
          break;
        default:
        case Theme.Light:
          resultTheme = lightSatMapStyle;
          break;
      }
      break;
    case MapStyles.Vector:
      switch (theme) {
        case Theme.Dark:
          resultTheme = darkMapStyle;
          break;
        default:
        case Theme.Light:
          resultTheme = lightMapStyle;
          break;
      }
      break;
  }
  const path = document.location.origin + document.location.pathname;
  if (resultTheme.glyphs) {
    resultTheme.glyphs = resultTheme.glyphs.replaceAll('__REPLACE_ME__', path);
  }
  if (resultTheme.sprite) {
    resultTheme.sprite = resultTheme.sprite.replaceAll('__REPLACE_ME__', path);
  }
  return resultTheme;
};

export const changeMapStyle = () => {
  const {
    map
  } = useMapStore.getState();
  map?.setStyle(calculateMapStyle());
};
