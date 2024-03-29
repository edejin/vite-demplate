import React, {CSSProperties, useMemo} from 'react';
import styled from 'styled-components';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Label
} from 'recharts';
import {CustomizedAxisTick} from './CustomizedAxisTick';
import {CustomTooltip} from './CustomTooltip';
import {useMeasureStore} from '@/store/measure';
import {Divider, Space, Typography} from 'antd';
import {useLogging} from '@/utils/customHooks';

const {
  Title,
  Text
} = Typography;

const Wrapper = styled.div`
  width: 455px;
  padding: 17px;

  background: #ffffff;

  display: flex;
  flex-direction: column;

  > div {
    flex: 1 1 auto;
  }
`;



const W = styled.div``;

const Wrapper2 = styled.div`
  width: 455px;

  background: #ffffff;
  
  margin-top: 10px;
  padding: 20px;
`;

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface ChartRecord {
  x: number;
  y: number;
  lon: number;
  lat: number;
}

export const PathAltitudeWidget: React.FC<Props> = (props: Props) => {
  const {
    className,
    style
  } = props;
  const altData = useMeasureStore(s => s.altData);

  const data: ChartRecord[] = [];
  for (let i = 0; i < altData.length; i++) {
    const {
      distance,
      alt,
      lon,
      lat
    } = altData[i]!;
    data.push({
      x: i === 0 ? 0 : distance,
      y: alt,
      lon,
      lat
    });
  }

  const dataFront = useMemo<ChartRecord[]>(() => {
    const res: ChartRecord[] = [];
    for (let i = 0; i < altData.length; i++) {
      const {
        distance,
        alt,
        lon,
        lat,
        visibility
      } = altData[i]!;
      res.push({
        x: i === 0 ? 0 : distance,
        // @ts-ignore
        y: (i === 0) || (altData[i - 1]?.visibility === 1) || (visibility === 1) ? alt : null,
        lon,
        lat
      });
    }
    return res;
  }, [altData]);

  const dataBack = useMemo<ChartRecord[]>(() => {
    const res: ChartRecord[] = [];
    for (let i = 0; i < altData.length; i++) {
      const {
        distance,
        alt,
        lon,
        lat,
        visibility
      } = altData[i]!;
      res.push({
        x: i === 0 ? 0 : distance,
        // @ts-ignore
        y: (altData[i - 1]?.visibility === 2) || (visibility === 2) ? alt : null,
        lon,
        lat
      });
    }
    return res;
  }, [altData]);

  const dataBoth = useMemo<ChartRecord[]>(() => {
    const res: ChartRecord[] = [];
    for (let i = 0; i < altData.length; i++) {
      const {
        distance,
        alt,
        lon,
        lat,
        visibility
      } = altData[i]!;
      res.push({
        x: i === 0 ? 0 : distance,
        // @ts-ignore
        y: (altData[i - 1]?.visibility === 3) || (visibility === 3) ? alt : null,
        lon,
        lat
      });
    }
    return res;
  }, [altData]);

  if (!altData.length) {
    return null;
  }

  return (
    <W className={className} style={style}>
      <Wrapper>
        <Title level={5}>Altitude</Title>
        <Divider/>
        <div style={{height: 206}}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 0,
                bottom: 20,
                left: 0
              }}
            >
              <XAxis
                type="number"
                dataKey="x"
                tickLine={false}
                tick={<CustomizedAxisTick type={'x'}/>}
                // stroke={'#FFEECA'}
              >
                <Label
                  position="insideBottomRight"
                  offset={0}
                  style={{
                    fontFamily: 'Montserrat',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    fontSize: '15px',
                    lineHeight: '18px',
                    // fill: 'rgba(255, 238, 202, 0.6)',
                    transform: 'translateY(14px)'
                  }}
                >
                  Distance(km)
                </Label>
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                name="Altitude"
                tickLine={false}
                tick={<CustomizedAxisTick type={'y'}/>}
                // stroke={'#000000'}
              >
                <Label
                  position="top"
                  offset={0}
                  style={{
                    fontFamily: 'Montserrat',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    fontSize: '15px',
                    lineHeight: '18px',
                    // fill: 'rgba(255, 238, 202, 0.6)',
                    transform: 'translateY(-8px) translateX(33px)'
                  }}
                >
                  Altitude(m)
                </Label>
              </YAxis>
              <ZAxis type="number" range={[1000]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{stroke: '#7ABF0A'}}/>
              {/*
              // @ts-ignore */}
              <Scatter data={data} fill="#000000" strokeWidth={2} line shape={<></>}/>
              {/*
              // @ts-ignore */}
              <Scatter data={dataFront} fill="#B6FE1E" strokeWidth={2} line shape={<></>}/>
              {/*
              // @ts-ignore */}
              <Scatter data={dataBack} fill="#FF5119" strokeWidth={2} line shape={<></>}/>
              {/*
              // @ts-ignore */}
              <Scatter data={dataBoth} fill="#bfa10a" strokeWidth={2} line shape={<></>}/>
              {/*
              // @ts-ignore */}
              <Scatter data={data} fill="rgba(0, 0, 0, 0)" line shape="Dot"/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Wrapper>
      <Wrapper2>
        <Space direction="vertical">
          <Space>
            <Text>Visible from begin</Text>
            <div style={{background: '#B6FE1E', width: 16, height: 16}}/>
          </Space>
          <Space>
            <Text>Visible from end</Text>
            <div style={{background: '#FF5119', width: 16, height: 16}}/>
          </Space>
          <Space>
            <Text>Visible from begin and end</Text>
            <div style={{background: '#bfa10a', width: 16, height: 16}}/>
          </Space>
        </Space>
      </Wrapper2>
    </W>
  );
};
