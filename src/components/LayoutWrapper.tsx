import React, {PropsWithChildren} from 'react';
import {Breadcrumb, Menu, MenuProps, Layout} from 'antd';
import {T} from '@/components/Translate';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {LaptopOutlined, NotificationOutlined, UserOutlined} from '@ant-design/icons';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {Link} from 'react-router-dom';
import {ThemeSwitcher} from '@/components/ThemeSwitcher';

const { Header, Content, Footer, Sider } = Layout;

const items1: MenuProps['items'] = ['1', '2'].map(key => ({
  key,
  label: (
    <Link to={`/Page${key}`}>{`nav ${key}`}</Link>
  ),
}));

const Logo = styled.div`
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
`;

interface Props {

}

export const LayoutWrapper: React.FC<Props> = ({children}: PropsWithChildren<Props>) => {
  const {
    formatMessage
  } = useIntl();

  const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
    (icon, index) => {
      const key = String(index + 1);

      return {
        key: `sub${key}`,
        icon: React.createElement(icon),
        label: formatMessage({id: 'subnav {value}'}, {value: key}),

        children: new Array(4).fill(null).map((_, j) => {
          const subKey = index * 4 + j + 1;
          return {
            key: subKey,
            label: formatMessage({id: 'option {value}'}, {value: subKey}),
          };
        }),
      };
    },
  );

  return (
    <Layout>
      <Header>
        <Logo/>
        <LanguageSwitcher/>
        <ThemeSwitcher/>
        <Menu mode="horizontal" defaultSelectedKeys={['1']} items={items1} theme='dark' />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb
          style={{margin: '16px 0'}}
          items={[
            {
              title: <T z="Home"/>
            },
            {
              title: <T z="List"/>
            },
            {
              title: <T z="App"/>
            }
          ]}
        />
        <Layout className="site-layout-background" style={{ padding: '24px 0' }}>
          <Sider className="site-layout-background" width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%' }}
              items={items2}
            />
          </Sider>
          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
  )
}
