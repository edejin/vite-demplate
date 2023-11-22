import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button, Typography} from 'antd';
import {useShallow} from 'zustand/react/shallow';

const {Text} = Typography;

export const B = () => {
  const [b, addB, clearB] = useTestStore(useShallow((store) => {
    const {b, addB, clearB} = store;
    return [b, addB, clearB];
  }));
  return (
    <div>
      <Text><T z="{value, plural, one {{value} item} other {{value} items}}" values={{value: b.toString()}}/></Text>
      <Button onClick={addB}>+</Button>
      <Button onClick={clearB}>0</Button>
    </div>
  );
};
