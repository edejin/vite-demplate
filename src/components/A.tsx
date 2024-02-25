import {useEffect} from 'react';
import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button, Typography} from 'antd';
import {log, useSelector} from '@/utils';
import {FieldTimeOutlined} from '@ant-design/icons';
import styled, {css} from 'styled-components';
import {Theme} from '@/store/theme';

const {Text} = Typography;

const Wrapper = styled.div`
  &::before {
    display: block;
  }
  
  ${({theme: {currentTheme}}) => {
    if (currentTheme === Theme.Dark) {
      return css`
        &::before {
          content: 'dark';
          color: #ffffff;
        }
      `;
    }
    return css`
        &::before {
          content: 'light';
          color: #000000;
        }
    `;
  }}
`;

const CustomButton = styled(Button)`
  color: red;
` as typeof Button;

export const A = () => {
  // Incorrect way:
  // const {removeA, addA, a} = useTestStore();

  // Correct way:
  // const a = useTestStore(store => store.a);
  // const removeA = useTestStore(store => store.removeA);
  // const addA = useTestStore(store => store.addA);

  // Other correct way:
  const {a, addA, removeA, addAWithDelay} = useTestStore(useSelector(['a', 'addA', 'removeA', 'addAWithDelay']));

  useEffect(() => {
    log('Rerender A!!!');
  });
  return (
    <Wrapper>
      <Text>
        <T z="text <span>{value}</span>."
           values={{span: (chunks: JSX.Element) => <span>{chunks}</span>, value: a.toString()}}/>
      </Text>
      <CustomButton onClick={addA}>+</CustomButton>
      <CustomButton onClick={removeA}>-</CustomButton>
      <CustomButton onClick={() => addAWithDelay(3000)}>
        <FieldTimeOutlined/>
      </CustomButton>
    </Wrapper>
  );
};
