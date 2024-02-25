import {useEffect} from 'react';
import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button, Typography} from 'antd';
import {log, useSelector} from '@/utils';
import {FieldTimeOutlined} from '@ant-design/icons';

const {Text} = Typography;

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
    <div>
      <Text>
        <T z="text <span>{value}</span>." values={{span: (chunks: JSX.Element) => <span>{chunks}</span>, value: a.toString()}}/>
      </Text>
      <Button onClick={addA}>+</Button>
      <Button onClick={removeA}>-</Button>
      <Button onClick={() => addAWithDelay(3000)}>
        <FieldTimeOutlined/>
      </Button>
    </div>
  );
};
