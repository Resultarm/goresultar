import React from "react";
import { Table } from "antd";
import { useTranslation } from "react-i18next";
import NSHandler from "src/components/NSHandler";
import { nf, cf, filtersFromQueryParams } from "src/helpers";
import { useDepartmentProfits, useAPI } from "src/hooks";

function DepartmentEarnings() {
  const { t } = useTranslation(["translation"]);
  const [departments = [], departmentsStatus] = useAPI(`/api/products-stats${window.location.search}`);
  const { data: departmentProfitMap, status: departmentProfitsStatus } = useDepartmentProfits(filtersFromQueryParams());

  const profitRenderer = (departmentId) => cf(departmentProfitMap[departmentId] || 0);

  return (
    <NSHandler status={[departmentsStatus, departmentProfitsStatus]}>
      {() => (
        <Table dataSource={departments} pagination={false} bordered size="small">
          <Table.Column dataIndex={["department", "title"]} title={t("Title")}></Table.Column>
          <Table.Column dataIndex="total" title={t("Products")} render={nf}></Table.Column>
          <Table.Column dataIndex="worthCost" title={`${t("Worth")} ${t("Cost")}`} render={cf}></Table.Column>
          <Table.Column dataIndex="worthPrice" title={`${t("Worth")} ${t("Price")}`} render={cf}></Table.Column>
          <Table.Column dataIndex={["department", "_id"]} title={__("Profit")} render={profitRenderer}></Table.Column>
        </Table>
      )}
    </NSHandler>
  );
}

export default DepartmentEarnings;
