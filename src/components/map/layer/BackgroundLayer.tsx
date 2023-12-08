import React, {PropsWithChildren} from 'react';
import {Map} from 'maplibre-gl';
import {BackgroundLayerSpecification} from '@maplibre/maplibre-gl-style-spec';
import {AbstractLayer} from '@/components/map/layer/AbstractLayer';

interface Props extends Omit<BackgroundLayerSpecification, 'id' | 'type'> {
  map?: Map;
  beforeId?: string;
  id?: string;
}

export const BackgroundLayer: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  return <AbstractLayer {...props} type={'background'} />;
};
