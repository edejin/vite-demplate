import type {Map} from 'mapbox-gl';
import {sleep} from '@/utils/index';

export const waitForStyles = async (map?: Map) => {
  while (!map?.isStyleLoaded()) {
    await sleep();
  }
  return;
};
