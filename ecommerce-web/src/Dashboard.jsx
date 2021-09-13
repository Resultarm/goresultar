import React from "react";
import { Link } from "@reach/router";
import { Layout, Menu } from "antd";
import { useTranslation } from "react-i18next";

const { Content, Header } = Layout;

function Dashboard({ children, logout }) {
  const { t } = useTranslation("translation");
  return (
    <Layout className="dashboard-layout">
      <Header>
        <Menu className="navigation" theme="dark" mode="horizontal">
          <Menu.Item key="home">
            <Link to="/">{t("Home")}</Link>
          </Menu.Item>
          <Menu.Item key="orders">
            <Link to="orders">{t("Orders")}</Link>
          </Menu.Item>
          <Menu.Item key="logout" onClick={logout}>
            {t("Logout")}
          </Menu.Item>
        </Menu>
      </Header>
      <Layout className="site-layout">
        <Content style={{ padding: "32px 16px 16px 16px" }} id="main">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
