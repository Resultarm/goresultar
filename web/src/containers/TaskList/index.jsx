import React, { useEffect, useState } from "react";
import { Link } from "@reach/router";
import { useTaskList, useTask } from "src/hooks";
import { useTranslation } from "react-i18next";
import { Input, Table, Button } from "antd";
import NSHandler from "src/components/NSHandler";
import TaskFormModal from "./TaskFormModal";
import OrgAwareButton from "src/components/OrgAwareButton";
import moment from "moment";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { deleteConfirm } from "src/helpers";

const timestampToDateStr = (t) => (t ? moment.unix(t).format("DD/MM/YYYY") : undefined);

function TaskList({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const { status: actionStatus, del } = useTask();
  const { data: tasks, total, pages, goto, search, filters, status: tasksStatus, refresh } = useTaskList();

  const [selectedForEdit, setSelectedForEdit] = useState();
  const [selectedForDelete, setSelectedForDelete] = useState();
  const [shouldShowCreateModal, setShouldShowCreateModal] = useState(false);

  const showCreateModal = () => setShouldShowCreateModal(true);
  const closeCreateModal = () => setShouldShowCreateModal(false);

  const closeEditModal = () => setSelectedForEdit(undefined);

  const handleEdit = (item) => () => setSelectedForEdit(item);

  const handleSearch = (e) => search(e.target.value);

  const afterSave = () => {
    refresh();
  };

  const handleFormModalClose = () => {
    closeCreateModal();
    closeEditModal();
  };

  const handleDelete = (id) => () => deleteConfirm({ onOk: () => del(id), afterClose: refresh });
  const closeDeleteConfirmation = () => setSelectedForDelete(undefined);

  useEffect(() => {
    if (actionStatus.isError || actionStatus.isSuccess) {
      addToast(actionStatus.message, {
        appearance: actionStatus.toString().toLowerCase(),
      });

      if (actionStatus.isSuccess) {
        closeEditModal();
        closeDeleteConfirmation();
        refresh();
      }
    }
  }, [actionStatus]);

  return (
    <div className="container">
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <Input.Search placeholder={t("Search")} onChange={handleSearch} value={filters.searchText} allowClear />
        </div>
        <OrgAwareButton type="primary" onClick={showCreateModal}>
          {t("Create Task")}
        </OrgAwareButton>
      </div>
      <NSHandler status={tasksStatus}>
        {() => (
          <Table dataSource={tasks} rowKey="_id">
            <Table.Column
              title={t("Action")}
              key="action"
              render={(_, record) => (
                <>
                  <Button
                    className="margin-right"
                    icon={<DeleteOutlined />}
                    type="danger"
                    onClick={handleDelete(record._id)}
                    size="small"
                    ghost
                  />
                  <Button className="margin-right" icon={<EditOutlined />} onClick={handleEdit(record)} size="small" />
                </>
              )}
            />
            <Table.Column
              key="title"
              dataIndex=""
              title={t("Title")}
              render={(task) => <Link to={`/tasks/${task._id}`}><b>{task.title}</b></Link>}
            ></Table.Column>
            <Table.Column key="description" dataIndex="description" title={t("Description")} />
            <Table.Column key="startDate" dataIndex="startDate" title={t("Start Date")} render={timestampToDateStr} />
            <Table.Column
              key="estConclusionDate"
              dataIndex="estConclusionDate"
              title={t("Conlusion Date")}
              render={timestampToDateStr}
            />
            <Table.Column
              key="assignee"
              dataIndex="assignee"
              render={({ firstName, lastName }) => `${firstName} ${lastName}`}
              title={t("Assignee")}
            />
            <Table.Column
              key="leader"
              title={t("Leader")}
              dataIndex="leader"
              render={({ firstName, lastName }) => `${firstName} ${lastName}`}
            />
            <Table.Column
              key="helpers"
              dataIndex="helpers"
              title={t("Helpers")}
              render={(v) => v.map(({ firstName, lastName }) => `${firstName} ${lastName}`).join(",")}
            />
            <Table.Column
              key="order"
              title={__("Order ID")}
              dataIndex="order"
              render={({ orderId = "" } = {}) => `${orderId}`}
            />
            <Table.Column
              key="client"
              dataIndex="client"
              title={t("Client")}
              render={({ firstName = "", lastName = "", address } = {}) => `${firstName} ${lastName} / ${address}`}
            />
          </Table>
        )}
      </NSHandler>
      {(shouldShowCreateModal || selectedForEdit) && (
        <TaskFormModal
          afterSave={afterSave}
          onClose={handleFormModalClose}
          initialValue={selectedForEdit}
          okText={`${selectedForEdit ? t("Update") : t("Create")} ${t("Task")}`}
        />
      )}
    </div>
  );
}

export default TaskList;
