import React from "react";
import { Card } from "semantic-ui-react";
import "./styles.css";
import { formatNumber } from "../../../helpers/formatters";

const emptyStats = [];
const ProductStats = ({ stats = emptyStats }) => {
  const totalProducts = stats
    .map((stat) => stat.total)
    .reduce((prev, next) => prev + next, 0);
  const totalWorthPrice = stats
    .map((stat) => stat.worthPrice)
    .reduce((prev, next) => prev + next, 0);
  const totalWorthCost = stats
    .map((stat) => stat.worthCost)
    .reduce((prev, next) => prev + next, 0);
  return (
    <div className={"stats-container"}>
      <Card.Group itemsPerRow={3}>
        <Card color={"red"}>
          <Card.Content>
            <Card.Header>Total Produtos</Card.Header>
            <Card.Description>
              Total Quantidade: <strong>{formatNumber(totalProducts)}</strong>
              <br />
              Total worth price:{" "}
              <strong>{formatNumber(totalWorthPrice)}</strong>
              <br />
              Total worth cost: <strong>{formatNumber(totalWorthCost)}</strong>
            </Card.Description>
          </Card.Content>
        </Card>
        <Card color={"green"}>
          <Card.Content>
            <Card.Header>
              Total Produtos Valor do Estoque/Cost by Dep
            </Card.Header>
            <Card.Description>
              {stats.map((statItem) => (
                <>
                  <span>
                    {statItem.department.title}:
                    <strong>
                      {formatNumber(statItem.worthPrice)}/
                      {formatNumber(statItem.worthCost)}
                    </strong>
                  </span>
                  <br />
                </>
              ))}
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </div>
  );
};

export default ProductStats;
