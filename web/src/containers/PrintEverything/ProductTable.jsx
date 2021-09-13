import React from "react";
import { Table } from "antd";
import NSHandler from "src/components/NSHandler";
import { useProductList, useProductProfits } from "src/hooks";
import { useTranslation } from "react-i18next";
import currencyFormatterPrefix from "../../helpers/currencyFormatterPrefix";
import { filtersFromQueryParams, nf } from "src/helpers";

const getTotalUnits = (p) => (p.isService ? undefined : nf(p.totalUnits));

const cf = currencyFormatterPrefix.format;

function ProductTable() {
  const { t } = useTranslation(["translation"]);
  const globalFilters = filtersFromQueryParams();
  const { all: data, status } = useProductList(globalFilters);
  const { data: productProfitMap, status: productProfitsStatus } = useProductProfits(globalFilters);

  const profitRenderer = (productId) => cf(productProfitMap[productId]);

  return (
    <NSHandler status={[status, productProfitsStatus]}>
      {() => (
        <Table dataSource={data} pagination={false} bordered size="small">
          <Table.Column dataIndex="title" title={t("Title")}></Table.Column>
          <Table.Column dataIndex="description" title={t("Description")}></Table.Column>
          <Table.Column title={t("Total Units")} render={getTotalUnits}></Table.Column>
          <Table.Column dataIndex="cost" title={t("Cost")} render={cf}></Table.Column>
          <Table.Column dataIndex="price" title={t("Price")} render={cf}></Table.Column>
          <Table.Column dataIndex="status" title={t("Status")}></Table.Column>
          <Table.Column dataIndex="_id" title={t("Profit")} render={profitRenderer}></Table.Column>
        </Table>
      )}
    </NSHandler>
  );
}

export default ProductTable;
