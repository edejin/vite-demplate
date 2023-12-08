import React, {PropsWithChildren} from 'react';
import {Map} from 'maplibre-gl';
import {HeatmapLayerSpecification} from '@maplibre/maplibre-gl-style-spec';
import {AbstractLayer} from '@/components/map/layer/AbstractLayer';

interface Props extends Omit<HeatmapLayerSpecification, 'id' | 'type' | 'source'> {
  map?: Map;
  parentId?: string;
  beforeId?: string;
  id?: string;
}

export const HeatmapLayer: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  return <AbstractLayer {...props} type={'heatmap'} />;
};
