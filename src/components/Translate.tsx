import {FormattedMessage} from 'react-intl';

interface Props {
  z: string;
  values?: Record<string, string | ((arg: JSX.Element) => JSX.Element)>;
}

// @ts-ignore
export const T: React.FC<Props> = ({z, values}: Props) => (<FormattedMessage id={z} values={values}/>);
