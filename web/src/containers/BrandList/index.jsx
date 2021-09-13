import React, { useEffect, useState } from "react";
import { Confirm } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useBrands, useBrand } from "src/hooks";
import { NSHandler, OrgAwareButton } from "src/components";
import { Table, Input } from "antd";
import BrandFormModal from "./BrandFormModal";
import { editDeleteRenderer } from "src/helpers";
import "./styles.css";

function BrandList(props) {
  const { t } = useTranslation(["translation"]);
  const { all: brands, total, pages, search, goto, sort, filters, status, refresh } = useBrands();
  const { del, status: delStatus } = useBrand();
  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(undefined);
  const [selectedForDelete, setSelectedForDelete] = useState(undefined);

  const showAddModal = () => setShouldShowAddModal(true);
  const closeAddModal = () => setShouldShowAddModal(false);
  const closeEditModal = () => setSelectedForEdit(undefined);
  const closeDeleteConfirm = () => setSelectedForDelete(undefined);

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
      closeDeleteConfirm();
      refresh();
    }
  }, [delStatus, refresh]);

  return (
    <div className="container">
      <h2>{t("Brands")}</h2>
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <Input.Search placeholder={t("Search")} onChange={handleSearch} value={filters.searchText} allowClear />
        </div>
        <OrgAwareButton type="primary" onClick={showAddModal}>
          {t("Add")} {t("Brand")}
        </OrgAwareButton>
      </div>

      <NSHandler status={status}>
        {() => (
          <Table dataSource={brands} rowKey="_id" bordered>
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
        <BrandFormModal
          afterSave={afterSave}
          onClose={handleFormModalClose}
          initialValue={selectedForEdit}
          okText={`${selectedForEdit ? t("Update") : t("Add")} ${t("Brand")}`}
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

export default BrandList;
