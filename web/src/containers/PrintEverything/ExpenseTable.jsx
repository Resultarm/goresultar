import React from "react";
import { Table } from "antd";
import NSHandler from "src/components/NSHandler";
import { useExpenses } from "src/hooks";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { cf, listOptsFromQueryParams } from "src/helpers";
import { GET_EXPENSE_TYPE_LABEL, GET_EXPENSE_FREQUENCY_LABEL } from "../ExpenseList/constants";

function TaskTable() {
  const { t } = useTranslation(["translation"]);
  const { all: data, status } = useExpenses(listOptsFromQueryParams());

  return (
    <NSHandler status={status}>
      {() => (
        <Table dataSource={data} pagination={false} bordered size="small">
          <Table.Column dataIndex="name" title={t("Title")}></Table.Column>
          <Table.Column dataIndex="type" title={t("Type")} render={GET_EXPENSE_TYPE_LABEL}></Table.Column>
          <Table.Column
            dataIndex="issueDate"
            title={t("Issue Date")}
            render={(t) => moment.unix(t).format("DD/MM/YYYY")}
          ></Table.Column>
          <Table.Column
            dataIndex="dueDate"
            title={t("Due Date")}
            render={(t) => moment.unix(t).format("DD/MM/YYYY")}
          ></Table.Column>
          <Table.Column dataIndex="frequency" title={t("Frequency")} render={GET_EXPENSE_FREQUENCY_LABEL}></Table.Column>
          <Table.Column dataIndex="amount" title={t("Amount")} render={cf}></Table.Column>
        </Table>
      )}
    </NSHandler>
  );
}

export default TaskTable;
