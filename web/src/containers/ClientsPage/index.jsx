import React, { useState } from "react";
import { Button, Input } from "antd";
import { useClient, useClients, useRoles } from "src/hooks";
import { Confirm } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { OrgAwareButton } from "src/components";
import ClientFormModal from "./ClientFormModal";
import { Pagination, Table } from "semantic-ui-react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { Span } from "src/components";
import NumberFormat from "react-number-format";

function ClientsPage({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const { data: clients, total, pages, search, goto, sort, filters, status, refresh } = useClients();
  const roles = useRoles();
  console.log("roles :>> ", roles);
  const { del, status: actionStatus } = useClient();
  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState();
  const [selectedForDelete, setSelectedForDelete] = useState();

  const showAddModal = () => setShouldShowAddModal(true);
  const closeAddModal = () => setShouldShowAddModal(false);

  const handleSearch = (event) => {
    search(event.target.value);
  };

  const closeEditModal = () => setSelectedForEdit(undefined);

  const handleEdit = (item) => () => setSelectedForEdit(item);
  const handleDelete = (id) => () => setSelectedForDelete(id);
  const closeDeleteConfirmation = () => setSelectedForDelete();

  const handleSave = () => {
    closeAddModal();
    closeEditModal();
    refresh();
  };

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
        <OrgAwareButton type="primary" onClick={showAddModal}>
          {t("Add")} {t("Client")}
        </OrgAwareButton>
      </div>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("Actions")}</Table.HeaderCell>
            <Table.HeaderCell>{t("ID")}</Table.HeaderCell>
            <Table.HeaderCell>{t("First Name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Last Name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Email")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Mobile Number")}</Table.HeaderCell>
            <Table.HeaderCell>
              {t("CPF")} / {t("CNPJ")}
            </Table.HeaderCell>
            <Table.HeaderCell>{t("Address")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Zip Code")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {clients.map((record) => (
            <Table.Row key={record._id}>
              <Table.Cell>
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
              </Table.Cell>
              <Table.Cell>{record._id}</Table.Cell>
              <Table.Cell>{record.firstName}</Table.Cell>
              <Table.Cell>{record.lastName}</Table.Cell>
              <Table.Cell>{record.email}</Table.Cell>
              <Table.Cell>
                <NumberFormat customInput={Span} defaultValue={record.mobileNumber} format="(##) #### - ####" readOnly />
              </Table.Cell>
              <Table.Cell>
                <NumberFormat
                  customInput={Span}
                  defaultValue={record.identificationNumber}
                  format={record.identificationType === "pj" ? "##.###.###/####-##" : "###.###.###-##"}
                  readOnly
                />
              </Table.Cell>
              <Table.Cell style={{ whiteSpace: "pre" }}>{record.address}</Table.Cell>
              <Table.Cell>
                <NumberFormat customInput={Span} defaultValue={record.zipCode} format="#####–###" readOnly />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination
                activePage={filters.currentPage}
                totalPages={pages}
                onPageChange={(_, { activePage }) => goto(activePage)}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      {(shouldShowAddModal || selectedForEdit) && (
        <ClientFormModal
          afterSave={handleSave}
          onClose={() => {
            closeAddModal();
            closeEditModal();
          }}
          okText={`${selectedForEdit ? t("Update") : t("Add")} ${t("Client")}`}
          initialValue={selectedForEdit}
        />
      )}

      {selectedForDelete && (
        <Confirm
          open
          content={t("Are you sure you want to delete") + " ?"}
          onCancel={closeDeleteConfirmation}
          onConfirm={() => del(selectedForDelete)}
          cancelButton={t("No")}
          confirmButton={t("Delete")}
        />
      )}
    </div>
  );
}

export default ClientsPage;
