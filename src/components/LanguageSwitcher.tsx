import {Locale, useLocaleStore} from '@/store/locale';
import styled from 'styled-components';
import {TranslationOutlined} from '@ant-design/icons';

const Wrapper = styled.div`
  /*! @noflip */
  border-right: 1px solid red;
  float: right;
  padding: 0 8px;
  font-size: 16px;
  cursor: pointer;
  color: #ffffff;
`;

export const LanguageSwitcher = () => {
  const locale = useLocaleStore(store => store.locale);
  const setLocale = useLocaleStore(store => store.setLocale);

  return (
    <Wrapper onClick={() => setLocale(locale === Locale.EN ? Locale.AR : Locale.EN)}>
      <TranslationOutlined/>
    </Wrapper>
  );
};
