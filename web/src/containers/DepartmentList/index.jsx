import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDepartments, useDepartment } from "src/hooks";
import { NSHandler, OrgAwareButton } from "src/components";
import { Table, Input, message } from "antd";
import DepartmentFormModal from "./DepartmentFormModal";
import { editDeleteRenderer } from "src/helpers";
import { Confirm } from "semantic-ui-react";

import "./styles.scss";

function DepartmentList() {
  const { t } = useTranslation(["translation"]);
  const { all: departments, total, search, filters, status, refresh } = useDepartments();
  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(undefined);
  const [selectedForDelete, setSelectedForDelete] = useState(undefined);
  const { del, status: delStatus } = useDepartment();

  const showAddModal = () => setShouldShowAddModal(true);
  const closeAddModal = () => setShouldShowAddModal(false);
  const closeEditModal = () => setSelectedForEdit(undefined);

  const handleSearch = (e) => search(e.target.value);

  const afterSave = () => {
    handleFormModalClose();
    refresh();
  };

  const handleFormModalClose = () => {
    closeAddModal();
    closeEditModal();
  };

  useEffect(() => {
    if (delStatus.isSuccess) {
      setSelectedForDelete(undefined);
      refresh();
      message.success(delStatus.message);
    }
  }, [delStatus]);

  const departmentsTree = departments.map((department) => ({
    ...department,
    categories: (department.categories || []).map((category) => ({
      ...category,
      key: category.title,
      children: (category.subcategories || []).map((subcategory) => ({
        ...subcategory,
        isLeaf: true,
        key: `${category.title} ${subcategory.title}`,
      })),
    })),
  }));

  console.log("departmentsTree :>> ", departmentsTree);

  return (
    <div className="container">
      <h2>{t("Departments")}</h2>
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <Input.Search placeholder={t("Search")} onChange={handleSearch} value={filters.searchText} allowClear />
        </div>
        <OrgAwareButton type="primary" onClick={showAddModal}>
          {t("Add")} {t("Department")}
        </OrgAwareButton>
      </div>

      <NSHandler status={status}>
        {() => (
          <Table dataSource={departmentsTree} rowKey="_id" bordered>
            <Table.Column
              key="actions"
              title={t("Actions")}
              render={editDeleteRenderer(setSelectedForEdit, setSelectedForDelete)}
            ></Table.Column>
            <Table.Column dataIndex="_id" title={t("ID")}></Table.Column>
            <Table.Column dataIndex="title" title={t("Title")}></Table.Column>
            <Table.Column dataIndex="description" title={t("Description")}></Table.Column>
          </Table>
        )}
      </NSHandler>

      {(shouldShowAddModal || selectedForEdit) && (
        <DepartmentFormModal
          afterSave={afterSave}
          onClose={handleFormModalClose}
          initialValue={selectedForEdit}
          okText={`${selectedForEdit ? t("Update") : t("Add")} ${t("Department")}`}
        />
      )}

      {selectedForDelete && (
        <Confirm
          open
          content={t("Are you sure you want to delete") + " ?"}
          onCancel={() => setSelectedForDelete()}
          onConfirm={() => del(selectedForDelete)}
          cancelButton={t("No")}
          confirmButton={t("Delete")}
        />
      )}
    </div>
  );
}

export default DepartmentList;
