import React, {HTMLAttributes, PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {Map} from 'maplibre-gl';
import {GeoJSONSourceSpecification} from '@maplibre/maplibre-gl-style-spec';
import {useCustomId} from '@/utils';

interface Props extends Omit<GeoJSONSourceSpecification, 'type'>, PropsWithChildren {
  map?: Map;
  id?: string;
}

export const GeoJsonSource: React.FC<Props> = (props: Props) => {
  const {
    map,
    id: cId,
    children,
    data
  } = props;
  const id = useCustomId(cId);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (map) {
      map?.addSource(id, {
        data,
        type: 'geojson'
      });
      setMounted(true);

      return () => {
        setMounted(false);
        const k = setInterval(() => {
          try {
            if (map?.style) {
              map?.removeSource(id);
              clearInterval(k);
            }
          } catch (e) {
          }
        });
      };
    }
  }, [map, id, data]);


  const childCb = useCallback((child: ReactNode) => (mounted && React.isValidElement(child)) ? React.cloneElement(child, {
    map,
    parentId: id
  } as HTMLAttributes<any>) : child, [children, mounted, map, id]);
  const childWithProps = useMemo(() => React.Children.map(children, childCb), [childCb]);

  return (
    <>
      {childWithProps}
    </>
  );
};
