import React, { useCallback, useMemo } from "react";

import { navigate, Router } from "@reach/router";
import Login from "../LoginPage";
import ProductsPage from "../ProductsPage";
import SubcategoriesPage from "../SubcategoriesPage";
import CategoriesPage from "../CategoriesPage";
import { ProtectedRoute } from "src/components";
import ChequeList from "../ChequeList";
import ExpenseList from "../ExpenseList";
import Dashboard from "../Dashboard/index";
import Header from "../../components/Header";
import NotFound from "../../components/NotFound";

import ModelsPage from "../ModelsPage";
import ProductViewPage from "src/components/ProductComponents/ProductView";
import OrdersPage from "../OrdersPage";
import ClientsPage from "../ClientsPage";
import AdminsPage from "../AdminsPage";
import OrderViewPage from "src/components/OrderComponents/OrderView";
import OrganizationsPage from "../OrganizationsPage";
import ExpenseDetail from "src/containers/ExpenseDetail";
import WoodCalculator from "src/containers/WoodCalculator";
import TaskList from "src/containers/TaskList";
import TaskDetail from "src/containers/TaskDetail";
import VehicleList from "src/containers/VehicleList";
import VehicleDetail from "src/containers/VehicleDetail";
import PrintEverything from "src/containers/PrintEverything";
import { useState } from "react";
import { OrganizationContext, UserContext } from "src/contexts";
import { useEffect } from "react";
import InitialOnboarding from "../InitialOnboarding";

import BrandList from "src/containers/BrandList";
import DepartmentList from "src/containers/DepartmentList";
import RolesAndPermissions from "src/containers/RolesAndPermissions";
import { useAPI } from "src/hooks";
import { ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import ptBR from "antd/es/locale/pt_BR";
import i18n from "i18next";
import { useTranslation } from "react-i18next";

function ResetCache() {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("onboarded");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("locale");
  }, []);
  return <div>DONE</div>;
}

const localeFileMap = { "en-US": enUS, "pt-BR": ptBR };

const defaultGlobalFormConfig = {
  validateMessages: {
    required: "field is required",
  },
};

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const getInitialState = () => localStorage.getItem("token");
const getOnboardedFromLS = () => !!localStorage.getItem("onboarded");

const Routing = () => {
  const { t } = useTranslation("translation");
  const [organizationId, setOrganizationId] = useState(localStorage.getItem("organizationId") ?? undefined);
  const [token, setToken] = useState(getInitialState);
  const [locale, setLocale] = useState(localStorage.getItem("locale") || "pt-BR");
  const [{ onboarded: onboardedFromAPI = false } = {}, onboardedStatus] = useAPI(
    getOnboardedFromLS() ? undefined : "/api/check-onboarded"
  );

  const onboarded = useMemo(() => getOnboardedFromLS() || onboardedFromAPI, [onboardedFromAPI]);

  const handleLogin = useCallback((token) => {
    localStorage.setItem("token", token);
    setToken(token);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setToken();
  };

  const { user } = useMemo(() => (token ? decodeJWT(token) : {}), [token]);

  const authContext = useMemo(() => {
    return { ...(token ? { token, user } : {}), logout };
  }, [token, user]);

  useEffect(() => {
    if (organizationId) {
      localStorage.setItem("organizationId", organizationId);
    } else {
      localStorage.removeItem("organizationId");
    }
  }, [organizationId]);

  useEffect(() => {
    if (onboardedStatus.isSuccess) {
      localStorage.setItem("onboarded", onboardedFromAPI);
    }
  }, [onboardedStatus, onboardedFromAPI]);

  useEffect(() => {
    if (!onboarded && onboardedStatus.isSuccess) {
      navigate("/onboard");
    }
  }, [onboarded, onboardedStatus]);

  useEffect(() => {
    i18n.changeLanguage(locale);
    localStorage.setItem("locale", locale);
  }, [locale]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  const shouldShowNavigation = new URLSearchParams(window.location.search).get("nav") !== "false";

  const globalFormConfig = useMemo(
    () => ({
      ...defaultGlobalFormConfig,
      validateMessages: Object.fromEntries(
        Object.entries(defaultGlobalFormConfig.validateMessages).map(([k, msg]) => [k, t(msg)])
      ),
    }),
    [t]
  );

  return (
    <UserContext.Provider value={authContext}>
      <OrganizationContext.Provider value={organizationId}>
        <ConfigProvider form={globalFormConfig} locale={localeFileMap[locale]}>
          <div className="fill">
            {token && shouldShowNavigation && (
              <header className="noprint">
                <Header
                  admin={user}
                  logout={logout}
                  onOrganizationChange={setOrganizationId}
                  onLocaleChange={setLocale}
                  locale={locale}
                />
              </header>
            )}
            <main className="fill">
              <Router id="router">
                <Login path="login" onLogin={handleLogin} />
                <ResetCache path="reset-cache" />
                <InitialOnboarding path="/onboard" />
                <ProtectedRoute path="/" component={Dashboard} />
                <ProtectedRoute path="/products" component={ProductsPage} />

                <ProtectedRoute path="/products/view/:id" component={ProductViewPage} />

                <ProtectedRoute path="/departments" component={DepartmentList} />
                <ProtectedRoute path="/categories" component={CategoriesPage} />
                <ProtectedRoute path="/subcategories" component={SubcategoriesPage} />
                <ProtectedRoute path="/brands" component={BrandList} />
                <ProtectedRoute path="/models" component={ModelsPage} />
                <ProtectedRoute path="/orders" component={OrdersPage} />
                <ProtectedRoute path="/orders/view/:id" admin={user} component={OrderViewPage} />
                <ProtectedRoute path="/clients" component={ClientsPage} />

                {[1, 2, 3].includes(user?.roleNumber) && (
                <>
                <ProtectedRoute path="/cheques" component={ChequeList} />
                <ProtectedRoute path="/expenses" component={ExpenseList} />
                <ProtectedRoute path="/expenses/:id" component={ExpenseDetail} />
                </>
                )}
                <ProtectedRoute path="/tasks" component={TaskList} />
                <ProtectedRoute path="/tasks/:id" component={TaskDetail} />            
                {[1, 2].includes(user?.roleNumber) && (
                  <>
                    <ProtectedRoute path="/orgs" component={OrganizationsPage} />
                    <ProtectedRoute path="/wood-price-calculator" component={WoodCalculator} />
                    <ProtectedRoute path="/roles-permissions" component={RolesAndPermissions} />
                    <ProtectedRoute path="/vehicles" component={VehicleList} />
                    <ProtectedRoute path="/vehicles/:id" component={VehicleDetail} />
                    </>
                )}
                 {[1, 2, 3].includes(user?.roleNumber) && (
                  <>
                    <ProtectedRoute path="/admins" component={AdminsPage} />
                    <ProtectedRoute path="/print-everything" component={PrintEverything} />
                  </>
                )}

                {[1, 2, 3].includes(user?.roleNumber) && (
                  <>
                    <ProtectedRoute exact path="/wood-price-calculator" component={WoodCalculator} />
                  </>
                )}

                {/* redirect to login won't work without those*/}
                {/* <PrivateRoute exact path="/orgs" component={() => null} />
                <PrivateRoute exact path="/admins" component={() => null} /> */}
                <NotFound default />
              </Router>
            </main>
          </div>
        </ConfigProvider>
      </OrganizationContext.Provider>
    </UserContext.Provider>
  );
};

export default Routing;
