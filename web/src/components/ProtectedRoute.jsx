import React from "react";
import { Redirect } from "@reach/router";
import { useContext } from "react";
import { OrganizationContext, UserContext } from "src/contexts";
import { notification } from "antd";

const addToast = (text, options) => {
  notification[options.appearance || "info"]({ message: text, placement: "bottomRight" });
};

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const organizationId = useContext(OrganizationContext);
  const { token } = useContext(UserContext);

  if (!token) return <Redirect from="" to="login" noThrow />;

  return <Component {...rest} addToast={addToast} organizationId={organizationId} />;
};

export default ProtectedRoute;
