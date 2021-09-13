import React, { useEffect, useState } from "react";
import { Link } from "@reach/router";
import { useVehicleList, useVehicle } from "src/hooks";
import { useTranslation } from "react-i18next";
import { Input, Table, Button } from "antd";
import NSHandler from "src/components/NSHandler";
import VehicleFormModal from "./VehicleFormModal";
import OrgAwareButton from "src/components/OrgAwareButton";
import moment from "moment";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { deleteConfirm } from "src/helpers";

const timestampToDateStr = (t) => (t ? moment.unix(t).format("DD/MM/YYYY") : undefined);

function VehicleList({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const { status: actionStatus, del } = useVehicle();
  const { data: vehicles, total, pages, goto, search, filters, status: vehiclesStatus, refresh } = useVehicleList();

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
          {t("Create")} {t("Vehicle")}
        </OrgAwareButton>
      </div>
      <NSHandler status={vehiclesStatus}>
        {() => (
          <Table dataSource={vehicles} rowKey="_id">
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
              render={(vehicle) => <Link to={`/vehicles/${vehicle._id}`}><b>{vehicle.title}</b></Link>}
            ></Table.Column>
            <Table.Column key="description" dataIndex="description" title={t("Description")} />
            <Table.Column key="purchaseDate" dataIndex="purchaseDate" title={t("Purchase Date")} render={timestampToDateStr} />
            <Table.Column
              key="lastManutences"
              dataIndex="lastManutences"
              title={t("Last Manutences Date")}
              render={timestampToDateStr}
            />
            <Table.Column
              key="assignee"
              dataIndex="assignee"
              render={({ firstName, lastName }) => `${firstName} ${lastName}`}
              title={t("Assignee")}
            />
            <Table.Column
              key="driver"
              title={t("Driver")}
              dataIndex="driver"
              render={({ firstName, lastName }) => `${firstName} ${lastName}`}
            />
             <Table.Column
              key="type"
              dataIndex="type"
              title={t("Type")}
              // render={(v) => v.map(({ type}) => `${firstName} ${lastName}`).join(",")}
            />
            
            <Table.Column
              key="kmNow"
              dataIndex="kmNow"
              title={t("Actual Km")}
             // render={({ firstName = "", lastName = "", address } = {}) => `${firstName} ${lastName} / ${address}`}
            />
          </Table>
        )}
      </NSHandler>
      {(shouldShowCreateModal || selectedForEdit) && (
        <VehicleFormModal
          afterSave={afterSave}
          onClose={handleFormModalClose}
          initialValue={selectedForEdit}
          okText={`${selectedForEdit ? t("Update") : t("Create")} ${t("Vehicle")}`}
        />
      )}
    </div>
  );
}

export default VehicleList;
