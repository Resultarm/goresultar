import { Redirect } from "@reach/router";
import NotFound from "shared/components/NotFound";
import React from "react";

function ProtectedRoute({
  component: Component,
  user,
  adminOnly = false,
  ...rest
}) {
  // Not using `noThrow` causing UI to break. Don't know why
  if (!user) return <Redirect from="" to="login" noThrow />;

  // Ofcourse forbidden page also makes sense
  if (adminOnly && user?.team?.roleId !== "Admin") return <NotFound />;

  return <Component {...rest} />;
}

export default ProtectedRoute;
