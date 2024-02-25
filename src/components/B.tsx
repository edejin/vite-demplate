import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button, Typography} from 'antd';
import {useSelector} from '@/utils';

const {Text} = Typography;

export const B = () => {
  const {b, addB, clearB} = useTestStore(useSelector(['b', 'addB', 'clearB']));
  return (
    <div>
      <Text><T z="{value, plural, one {{value} item} other {{value} items}}" values={{value: b.toString()}}/></Text>
      <Button onClick={addB}>+</Button>
      <Button onClick={clearB}>0</Button>
    </div>
  );
};
