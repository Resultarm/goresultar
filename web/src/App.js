import React from "react";

import Routing from "./containers/Routing";

import "./App.css";
import { Suspense } from "react";
import { Spin } from "antd";

const App = () => (
  <Suspense fallback={<Spin />}>
    <Routing />
  </Suspense>
);

export default App;
