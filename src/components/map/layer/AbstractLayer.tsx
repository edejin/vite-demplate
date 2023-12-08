import React, {PropsWithChildren, useEffect} from 'react';
import {Map} from 'maplibre-gl';
import {LayerSpecification} from '@maplibre/maplibre-gl-style-spec';
import {useCustomId} from '@/utils';

interface Props extends Omit<LayerSpecification, 'id' | 'source'> {
  map?: Map;
  parentId?: string;
  beforeId?: string;
  id?: string;
}

export const AbstractLayer: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  const {
    map,
    parentId,
    beforeId,
    id: cId,
    ...args
  } = props;
  const id = useCustomId(cId);

  useEffect(() => {
    if (map && parentId) {
      map.addLayer({
        id,
        source: parentId,
        ...args
      } as LayerSpecification, beforeId);

      return () => {
        try {
          if (map?.style) {
            map?.removeLayer(id);
          }
        } catch (e) {
        }
      };
    }
  }, [map, parentId, beforeId, args]);

  return null;
};
