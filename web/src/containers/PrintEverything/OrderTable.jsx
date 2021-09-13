import React from "react";
import { Table } from "antd";
import NSHandler from "src/components/NSHandler";
import { useOrders } from "src/hooks";
import { useTranslation } from "react-i18next";
import currencyFormatter from "../../helpers/currencyFormatterPrefix";
import { getName, listOptsFromQueryParams, measurementValueDisplay } from "src/helpers";
import moment from "moment";

const cf = currencyFormatter.format;

function ProductTable({ products }) {
  const { t } = useTranslation(["translation"]);
  return (
    <Table dataSource={products} showHeader={false} size="small" pagination={false}>
      <Table.Column dataIndex="title" title={t("Title")} width="40%"></Table.Column>
      <Table.Column
        dataIndex="measurementValue"
        title={t("Dimensions")}
        width="30%"
        render={measurementValueDisplay}
      ></Table.Column>
      <Table.Column render={(p) => `(${p.amount} x ${cf(p.price)})`}></Table.Column>
    </Table>
  );
}

const getOrderTotal = (products) => cf(products.reduce((acc, p) => acc + p.amount * p.price, 0));

function OrderTable() {
  const { t } = useTranslation(["translation"]);
  const { all: data, status } = useOrders(listOptsFromQueryParams());

  return (
    <NSHandler status={status}>
      {() => (
        <Table dataSource={data} pagination={false} bordered size="small">
          <Table.Column dataIndex="orderId" title={t("ID")}></Table.Column>
          <Table.Column
            dataIndex="createdAt"
            title={t("Created At")}
            width="100px"
            render={(t) => moment(t * 1000).format("DD/MM/YY")}
          ></Table.Column>
          <Table.Column
            dataIndex="items"
            title={`${__("Products")} | ${__("Dimensions")} | ${__("Quantity")} * ${__("Price")}`}
            render={(products) => <ProductTable products={products} />}
          ></Table.Column>
          <Table.Column dataIndex="items" title={t("Total")} render={getOrderTotal}></Table.Column>
          <Table.Column dataIndex="client" title={t("Client")} render={getName}></Table.Column>
          <Table.Column dataIndex="_status" title={t("Status")} width="100px"></Table.Column>
          <Table.Column dataIndex="_processStatus" title={t("Process Status")} width="120px"></Table.Column>
        </Table>
      )}
    </NSHandler>
  );
}

export default OrderTable;
