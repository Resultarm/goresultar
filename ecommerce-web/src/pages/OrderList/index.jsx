import { useAPI, useFormatters } from "shared/hooks";
import { Table } from "antd";
import { useTranslation } from "react-i18next";

const orderProcesses = [
  "None",
  "New",
  "Preparation",
  "Production",
  "Quality",
  "Finishing",
  "Completed",
  "Delivered | Returned",
  "Concluded",
  "Canceled",
];

const paymentStatuses = ["None", "Open", "Partial", "Closed", "Quotation"];

function OrderProductList({ products }) {
  const { t } = useTranslation("translation");
  const { cf, nf } = useFormatters();

  const withQuantityPrefix = (v) => `x ${nf(v)}`;

  return (
    <Table
      dataSource={products}
      size="small"
      showHeader={false}
      pagination={false}
      bordered
      rowKey="title"
    >
      <Table.Column dataIndex="title" title={t("Title")}></Table.Column>
      <Table.Column
        dataIndex="quantity"
        title={t("Quantity")}
        render={withQuantityPrefix}
      ></Table.Column>
      <Table.Column
        dataIndex="price"
        title={t("Price")}
        render={cf}
      ></Table.Column>
    </Table>
  );
}

const productRenderer = (products) => <OrderProductList products={products} />;

const denormalize = (o) => ({
  ...o,
  createdAt: new Date(o.createdAt),
});

const useOrders = () => {
  const { data = [], status } = useAPI("/api/v1/orders");
  return { data: data.map(denormalize), status };
};

function OrderList() {
  const { t } = useTranslation("translation");
  const { cf, df } = useFormatters();
  const { data, status } = useOrders();

  const statusRenderer = (status) => t(orderProcesses[status]);
  const paymentStatusRenderer = (status) => t(paymentStatuses[status]);

  return (
    <Table dataSource={data} pagination={false} bordered rowKey="_id">
      <Table.Column
        dataIndex="createdAt"
        title={t("Date")}
        render={df}
      ></Table.Column>
      <Table.Column
        dataIndex="items"
        title={t("Products")}
        render={productRenderer}
      ></Table.Column>
      <Table.Column
        dataIndex="status"
        title={t("Status")}
        render={statusRenderer}
      ></Table.Column>
      <Table.Column
        dataIndex="paymentStatus"
        title={t("Payment Status")}
        render={paymentStatusRenderer}
      ></Table.Column>
      <Table.Column
        dataIndex="total"
        title={t("Total Amount")}
        render={cf}
      ></Table.Column>
    </Table>
  );
}

export default OrderList;
