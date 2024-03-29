import React from 'react';
import styled from 'styled-components';
import {Space, Typography} from 'antd';

const {
  Text
} = Typography;

const Wrapper = styled.div`
  background: #fff;
  border: 1px solid #000;
  padding: 7px;
`;

interface Props {
  active?: boolean;
  payload?: {
    payload: {
      y: number;
      lon: number;
      lat: number;
    }
  }[]
}

export const CustomTooltip = (props: Props) => {
  const {
    active = false,
    payload = []
  } = props;
  if (active && payload && payload.length) {
    return (
      <Wrapper>
        <Space direction="vertical">
          <Space>
            <Text>Altitude:</Text>
            <Text>{payload[0].payload.y.toFixed(2)}m</Text>
          </Space>
          <Space>
            <Text>Longitude:</Text>
            <Text>{payload[0].payload.lon.toFixed(6)}</Text>
          </Space>
          <Space>
            <Text>Latitude:</Text>
            <Text>{payload[0].payload.lat.toFixed(6)}</Text>
          </Space>
        </Space>
      </Wrapper>
    );
  }

  return null;
};
