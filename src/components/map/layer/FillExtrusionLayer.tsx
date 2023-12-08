import React, {PropsWithChildren} from 'react';
import {Map} from 'maplibre-gl';
import {FillExtrusionLayerSpecification} from '@maplibre/maplibre-gl-style-spec';
import {AbstractLayer} from '@/components/map/layer/AbstractLayer';

interface Props extends Omit<FillExtrusionLayerSpecification, 'id' | 'type' | 'source'> {
  map?: Map;
  parentId?: string;
  beforeId?: string;
  id?: string;
}

export const FillExtrusionLayer: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  return <AbstractLayer {...props} type={'fill-extrusion'} />;
};
