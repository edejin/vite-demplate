import React, {CSSProperties, useEffect, useState} from 'react';
import styled from 'styled-components';
import {useMapStore} from '@/store/map';
import {Space, Typography} from 'antd';
import {MapMouseEvent} from 'mapbox-gl';

const {Text} = Typography;

const Wrapper = styled.div``;

interface GeoData {
  lng?: number;
  lat?: number;
  alt?: null | number; // meters from water level
}

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const MouseData: React.FC<Props> = (props: Props) => {
  const {
    className,
    style
  } = props;
  const map = useMapStore(s => s.map);
  const [data, setData] = useState<GeoData>({})

  useEffect(() => {
    if (map) {
      const f = (e: MapMouseEvent) => {
        setData({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          alt: e.target.queryTerrainElevation(e.lngLat)
        })
      };
      map.on('mousemove', f);

      return () => {
        map.off('mousemove', f);
      };
    }
  }, [map]);

  return (
    <Wrapper className={className} style={style}>
      <Space direction="vertical">
        <Space><Text>lng</Text><Text>{data?.lng}</Text></Space>
        <Space><Text>lat</Text><Text>{data?.lat}</Text></Space>
        <Space><Text>alt</Text><Text>{data?.alt}</Text></Space>
      </Space>
    </Wrapper>
  );
};
