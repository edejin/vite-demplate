import {useEffect} from 'react';
import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button} from 'antd';
import {log} from '@/utils';
import {FieldTimeOutlined} from '@ant-design/icons';
import {useShallow} from 'zustand/react/shallow';

export const A = () => {
  // Incorrect way:
  // const {removeA, addA, a} = useTestStore();

  // Correct way:
  // const a = useTestStore(store => store.a);
  // const removeA = useTestStore(store => store.removeA);
  // const addA = useTestStore(store => store.addA);

  // Other correct way:
  const [a, addA, removeA, addAWithDelay] = useTestStore(useShallow((store) => {
    const {a, addA, removeA, addAWithDelay} = store;
    return [a, addA, removeA, addAWithDelay];
  }));

  useEffect(() => {
    log('Rerender A!!!');
  });
  return (
    <div>
      <T z="text <span>{value}</span>." values={{span: (chunks: JSX.Element) => <span>{chunks}</span>, value: a.toString()}}/>
      <Button onClick={addA}>+</Button>
      <Button onClick={removeA}>-</Button>
      <Button onClick={() => addAWithDelay(3000)}>
        <FieldTimeOutlined/>
      </Button>
    </div>
  );
};
