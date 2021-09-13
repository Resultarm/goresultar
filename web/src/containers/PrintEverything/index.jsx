import { Button, Descriptions } from "antd";
import React from "react";
import OrderTable from "./OrderTable";
import ProductTable from "./ProductTable";
import { PrinterOutlined } from "@ant-design/icons";
import NSHandler from "src/components/NSHandler";
import TaskTable from "./TaskTable";
import ExpenseTable from "./ExpenseTable";
import { useTranslation } from "react-i18next";
import DepartmentEarnings from "./DepartmentEarnings";
import { useAPI } from "src/hooks";
import { cf, nf } from "src/helpers";

function Stats() {
  const { t } = useTranslation(["translation"]);
  const [data = {}, orderStatsStatus] = useAPI(`/api/orders-stats${window.location.search}`);
  const [dashboard = {}, dashboardStatus] = useAPI(`/api/dashboard${window.location.search}`);

  let totalRevenue = 0;
  let totalCost = 0;
  let totalQuantity = 0;
  let totalCollected = 0;
  let totalNeedsToCollect = 0;
  let profit = 0;
  let realProfit = 0;
  if (orderStatsStatus.isSuccess && dashboardStatus.isSuccess) {
    totalRevenue = data.open.revenue + data.closed.revenue + data.partial.revenue;
    totalCost = data.open.cost + data.closed.cost + data.partial.cost;
    totalQuantity = data.open.orders + data.closed.orders + data.partial.orders;
    totalCollected = data.closed.revenue + data.partial.collected;
    totalNeedsToCollect = data.open.revenue + (data.partial.revenue - data.partial.collected);
    profit = data.partial.revenue + data.closed.revenue - data.partial.cost - data.closed.cost;
    realProfit = profit - dashboard.totalexpenses;
  }
  return (
    <NSHandler status={orderStatsStatus}>
      {() => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 }}>
          <Descriptions title={t("Placed Orders")} bordered size="small">
            <Descriptions.Item label={t("Profit")} span={3}>
              {cf(totalRevenue - totalCost)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Placed Orders")} span={3}>
              {nf(totalQuantity)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Revenue")} span={1.5}>
              {cf(totalRevenue)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Cost")} span={1.5}>
              {cf(totalCost)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Collected")} span={1.5}>
              {cf(totalCollected)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Yet to collect")} span={1.5}>
              {cf(totalNeedsToCollect)}
            </Descriptions.Item>
          </Descriptions>
          <Descriptions title={t("Real Profits")} bordered size="small">
            <Descriptions.Item label={t("Real Profits")} span={3}>
              {cf(realProfit)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Profit")} span={1.5}>
              {cf(profit)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Expense")} span={1.5}>
              {cf(dashboard.totalexpenses)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </NSHandler>
  );
}

function PrintEverything() {
  const { t } = useTranslation(["translation"]);

  return (
    <>
      <Stats />
      <h3 style={{ margin: "16px 0" }}>{t("Departments")}</h3>
      <DepartmentEarnings />
      <h3 style={{ margin: "16px 0" }}>{t("Orders")}</h3>
      <OrderTable />
      <h3 style={{ margin: "16px 0" }}>{t("Products")}</h3>
      <ProductTable />
      <h3 style={{ margin: "16px 0" }}>{t("Expenses")}</h3>
      <ExpenseTable />
      /*<h3 style={{ margin: "16px 0" }}>{t("Tasks")}</h3>
      <TaskTable /> 
      */
      <Button
        className="noprint"
        icon={<PrinterOutlined />}
        type="primary"
        style={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => window.print()}
      >
        {t("Print")}
      </Button>
    </>
  );
}

export default PrintEverything;
