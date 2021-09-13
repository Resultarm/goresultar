import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./styles/reset.scss";
import "semantic-ui-css/semantic.min.css";
import "./styles/common.scss";

import "./i18n";

import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));

// const T = ({children}) => {
//   const [loaded, setLoaded] = useState(false)

//   useEffect(())

// }
