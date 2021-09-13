import React, { useMemo, useState, Suspense, useEffect } from "react";
import { Router } from "@reach/router";
import { ConfigProvider, Spin } from "antd";
import jwt from "jwt-simple";
import enUS from "antd/es/locale/en_US";
import ptBR from "antd/es/locale/pt_BR";
import i18n from "i18next";
import Dashboard from "./Dashboard";
import Login from "pages/Login";
import { NotFound } from "shared/components";
import OrderList from "pages/OrderList";
import { ProtectedRoute } from "shared/components";
import { AuthContext, LocaleContext } from "shared/contexts";

import "./App.css";

const localeFileMap = { "en-US": enUS, "pt-BR": ptBR };
const localeOpts = [
  { label: "🇧🇷 Português", value: "pt-BR" },
  { label: "🇺🇸 English", value: "en-US" },
];

const LS_TOKEN_KEY = "token";

const getTokenFromStorage = () => localStorage.getItem(LS_TOKEN_KEY);

function App() {
  const [token, setToken] = useState(getTokenFromStorage);
  const [locale, setLocale] = useState([localeOpts[0].value]);

  const handleLogin = (token) => {
    localStorage.setItem(LS_TOKEN_KEY, token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem(LS_TOKEN_KEY);
    setToken(undefined);
  };

  const auth = useMemo(
    () => ({
      user: token ? jwt.decode(token, "", true) : undefined,
      token,
      logout,
    }),
    [token]
  );

  useEffect(() => {
    i18n.changeLanguage(locale);
    localStorage.setItem("locale", locale);
  }, [locale]);

  return (
    <Suspense fallback={<Spin />}>
      <ConfigProvider locale={localeFileMap[locale]}>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <AuthContext.Provider value={auth}>
            <Router id="router">
              <Login path="login" onLogin={handleLogin} />
              <ProtectedRoute
                user={auth.user}
                component={Dashboard}
                logout={logout}
                path="/"
              >
                <OrderList path="orders" />
                <NotFound default />
              </ProtectedRoute>
              <NotFound default />
            </Router>
          </AuthContext.Provider>
        </LocaleContext.Provider>
      </ConfigProvider>
    </Suspense>
  );
}

export default App;
