import React, {CSSProperties} from 'react';
import {useTestStore} from '@/store/test';
import {Typography} from 'antd';

const {Text} = Typography;

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const C: React.FC<Props> = (props: Props) => {
  const {
    className,
    style
  } = props;
  const c = useTestStore(s => s.computed.c);
  return (
    <Text className={className} style={style}>
      a * b = {c}
    </Text>
  );
};
