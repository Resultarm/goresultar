import React from "react";

import { Card } from "semantic-ui-react";
import "./styles.css";

const emptyStats = {
  open: {},
  partial: {},

  closed: {},
  quotations: {},
};
const OrderStats = ({ stats = emptyStats }) => {
  return (
    <div className={"stats-container"}>
      <Card.Group itemsPerRow={4}>
        <Card color={"red"}>
          <Card.Content>
            <Card.Header>Open Orders</Card.Header>
            <Card.Description>
              Total Quantidade: <strong>{stats.open.total}</strong>
              <br />
              Total Amount: <strong>{stats.open.value}</strong>
            </Card.Description>
          </Card.Content>
        </Card>
        <Card color={"green"}>
          <Card.Content>
            <Card.Header>Partial Orders</Card.Header>
            <Card.Description>
              Total Quantidade: <strong>{stats.partial.total}</strong>
              <br />
              Total Amount: <strong>{stats.partial.value}</strong>
            </Card.Description>
          </Card.Content>
        </Card>
        <Card color="blue">
          <Card.Content>
            <Card.Header>Closed Orders</Card.Header>
            <Card.Description>
              Total Quantidade: <strong>{stats.closed.total}</strong>
              <br />
              Total Amount: <strong>{stats.closed.value}</strong>
            </Card.Description>
          </Card.Content>
        </Card>
        <Card color="yellow">
          <Card.Content>
            <Card.Header>Quotation Orders</Card.Header>
            <Card.Description>
              Total Quantidade: <strong>{stats.quotations.total}</strong>
              <br />
              Total Amount: <strong>{stats.quotations.value}</strong>
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </div>
  );
};

export default OrderStats;
