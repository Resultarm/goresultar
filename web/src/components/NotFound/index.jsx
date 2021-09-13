import React from "react";
import { Link } from "@reach/router";
import { Header, Icon } from "semantic-ui-react";

const NotFound = () => (
  <Header as="h2" icon textAlign="center" style={{ marginTop: 50 }}>
    <Icon name="frown" circular />
    <Header.Content>
      <div>404 Not Found</div>
      {"Go to "}
      <Link to="/">Home</Link>
      {" page"}
    </Header.Content>
  </Header>
);

export default NotFound;
