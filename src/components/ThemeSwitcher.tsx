import styled from 'styled-components';
import {Switch} from 'antd';
import LightIcon from '@/assets/icons/light.svg?react';
import DarkIcon from '@/assets/icons/dark.svg?react';
import {Theme, useThemeStore} from '@/store/theme';
import {useShallow} from 'zustand/react/shallow';

const Wrapper = styled.div`
  float: right;
  padding: 0 8px;
  font-size: 16px;
  cursor: pointer;
`;

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useThemeStore(useShallow((store) => {
    const {theme, setTheme} = store;
    return [theme, setTheme];
  }));

  const changeHandler = (dark: boolean) => {
    setTheme(dark ? Theme.Dark : Theme.Light);
  };

  return (
    <Wrapper>
      <Switch
        checkedChildren={<LightIcon/>}
        unCheckedChildren={<DarkIcon/>}
        checked={theme === Theme.Dark}
        onChange={changeHandler}
      />
    </Wrapper>
  );
};
