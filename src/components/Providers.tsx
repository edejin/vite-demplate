import React, { useCallback, useEffect } from 'react';
import { IntlProvider, MissingTranslationError } from 'react-intl';
import { log } from '@/utils';
import { ConfigProvider, theme } from 'antd';
import {StyleSheetManager, ThemeProvider} from 'styled-components';
import rtlPlugin from "stylis-plugin-rtl";
import { Locale, RTLLocales, useLocaleStore } from '@/store/locale';
import { GlobalStyle } from './GlobalStyles';

import enWords from '@/assets/translates/en.json';
import enGB from 'antd/lib/locale/en_GB';

import arWords from '@/assets/translates/ar.json';
import arEG from 'antd/lib/locale/ar_EG';
import {HashRouter} from 'react-router-dom';
import { OnErrorFn } from '@formatjs/intl/src/types';
import { IntlErrorCode } from '@formatjs/intl/src/error';
import {Theme, useThemeStore} from '@/store/theme';
import {StyleProvider} from '@ant-design/cssinjs';
import {MessageFormatElement} from '@formatjs/icu-messageformat-parser';

const vocabulary: Record<Locale, Record<string, string> | Record<string, MessageFormatElement[]>> = {
  // @ts-ignore
  [Locale.EN]: enWords,
  // @ts-ignore
  [Locale.AR]: arWords
};

const antVocabulary = {
  [Locale.EN]: enGB,
  [Locale.AR]: arEG
}

const direction = (locale: Locale) => RTLLocales.includes(locale) ? 'rtl' : 'ltr';

interface Props {

}

export const Providers: React.FC<Props> = ({ children }: React.PropsWithChildren<Props>) => {
  const locale = useLocaleStore(s => s.locale);
  const currentTheme = useThemeStore(v => v.theme);

  const errorHandler = useCallback<OnErrorFn>((data) => {
    const { code } = data;
    if (code === IntlErrorCode.MISSING_TRANSLATION) {
      log(`Cannot find translate "${(data as MissingTranslationError).descriptor?.id}" in "${locale}"`);
    } else {
      log(data);
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.dir = direction(locale);
  }, [locale]);

  return (
    <StyleSheetManager
      {...(direction(locale) === 'rtl' ? { stylisPlugins: [rtlPlugin] } : {})}
    >
      <ThemeProvider theme={{currentTheme}}>
        <>
          <GlobalStyle />
          <StyleProvider hashPriority={'high'}>
            <ConfigProvider
              locale={antVocabulary[locale]}
              direction={direction(locale)}
              theme={{
                algorithm: currentTheme === Theme.Dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                hashed: false
              }}
            >
              <IntlProvider locale={locale} messages={vocabulary[locale]} onError={errorHandler}>
                <HashRouter>
                  {children}
                </HashRouter>
              </IntlProvider>
            </ConfigProvider>
          </StyleProvider>
        </>
      </ThemeProvider>
    </StyleSheetManager>
  );
};
