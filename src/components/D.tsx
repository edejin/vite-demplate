import React, {CSSProperties} from 'react';
import {useTestStore} from '@/store/test';
import {Typography} from 'antd';
import {useDeepSelector} from '@/utils';
import {useLogging} from '@/utils/customHooks';

const {Text} = Typography;

interface Props {
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const D: React.FC<Props> = (props: Props) => {
  const {
    className,
    style
  } = props;

  const {
    a,
    b,
    computed: {
      c
    }
  } = useTestStore(useDeepSelector(['a', 'b', 'computed.c']));

  useLogging('Value of A:', a);
  useLogging('Value of A, B, C:', a, b, c);

  return (
    <Text className={className} style={style}>
      (useDeepSelector example) a = {a}, b = {b}, c = {c}
    </Text>
  );
};
