import React from "react";
import { Table } from "antd";
import NSHandler from "src/components/NSHandler";
import { useTaskList } from "src/hooks";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { getName, listOptsFromQueryParams } from "src/helpers";

function TaskTable() {
  const { t } = useTranslation(["translation"]);
  const { all: data, status } = useTaskList(listOptsFromQueryParams());

  return (
    <NSHandler status={status}>
      {() => (
        <Table dataSource={data} pagination={false} bordered size="small">
          <Table.Column dataIndex="title" title={t("Title")}></Table.Column>
          <Table.Column dataIndex="description" title={t("Description")}></Table.Column>
          <Table.Column
            dataIndex="startDate"
            title={t("Start Date")}
            render={(t) => moment.unix(t).format("DD/MM/YYYY")}
          ></Table.Column>
          <Table.Column
            dataIndex="estConclusionDate"
            title={t("Est. Conclusion Date")}
            render={(t) => moment.unix(t).format("DD/MM/YYYY")}
          ></Table.Column>
          <Table.Column dataIndex={["order", "orderId"]} title={__("Order ID")}></Table.Column>
          <Table.Column dataIndex="client" title={__("Client")} render={getName}></Table.Column>
          <Table.Column dataIndex="assignee" title={__("Assignee")} render={getName}></Table.Column>
          <Table.Column dataIndex="leader" title={__("Leader")} render={getName}></Table.Column>
          <Table.Column dataIndex="helpers" title={t("Helpers")} render={(hs) => hs.map(getName).join(",")}></Table.Column>
        </Table>
      )}
    </NSHandler>
  );
}

export default TaskTable;
