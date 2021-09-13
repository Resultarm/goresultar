import React, { useEffect, useState } from "react";
import { Button, Icon, Input, Pagination, Table } from "semantic-ui-react";
import NSHandler from "src/components/NSHandler";
import { useServiceList, useServiceStatusOptions, useService } from "src/hooks";
import DropdownConfirmation from "src/components/DropdownConfirmation";
import ServiceFormModal from "src/components/ProductComponents/ServiceFormModal";
import currencyFormatterPrefix from "src/helpers/currencyFormatterPrefix";
import { useTranslation } from "react-i18next";

const statusColors = {
  active: "teal",
  inactive: undefined,
  onhold: "blue",
};

function ServiceList({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const { edit, changeStatus, status: actionStatus } = useService();
  const { data: statusOptions } = useServiceStatusOptions();
  const { data, total, pages, goto, search, filters, status, refresh } = useServiceList();
  const [selectedForEdit, setSelectedForEdit] = useState();
  const [selectedForDelete, setSelectedForDelete] = useState();

  const closeEditModal = () => setSelectedForEdit(undefined);

  const handleSearch = (e) => search(e.target.value);
  const handleEdit = (item) => () => setSelectedForEdit(item);
  const handleDelete = (id) => () => setSelectedForDelete(id);

  const handleStatusChange = (id) => (_, data) => {
    changeStatus(id, { status: data.value });
  };

  const handlePageChange = (_, d) => {
    goto(d.activePage);
  };

  const afterSave = () => {
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
        refresh();
      }
    }
  }, [actionStatus]);

  return (
    <>
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <Input
            type="text"
            placeholder={t("Search")}
            onChange={handleSearch}
            value={filters.searchText}
            icon={<Icon name="delete" onClick={() => search("")} circular link />}
          />
        </div>
      </div>

      <NSHandler status={status}>
        {() => (
          <Table sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("Actions")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Name")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Price")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Department")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Category")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Sub Category")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.map((service) => (
                <Table.Row key={service._id}>
                  <Table.Cell>
                    <Button icon="edit" basic onClick={handleEdit(service)} size="mini" />
                  </Table.Cell>
                  <Table.Cell>{service.title}</Table.Cell>
                  <Table.Cell style={{ width: 160 }}>
                    <DropdownConfirmation
                      options={statusOptions}
                      onChange={handleStatusChange(service._id)}
                      defaultValue={service.status}
                      color={statusColors[service.status]}
                      size="mini"
                      basic
                    >
                      {t(service.status)}
                    </DropdownConfirmation>
                  </Table.Cell>

                  <Table.Cell>{currencyFormatterPrefix.format(service.price)}</Table.Cell>
                  <Table.Cell>{service.department?.title}</Table.Cell>
                  <Table.Cell>{service.category?.title}</Table.Cell>
                  <Table.Cell>{service.subcategory?.title}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
                  <Pagination activePage={filters.currentPage} totalPages={pages} onPageChange={handlePageChange} />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        )}
      </NSHandler>
      {selectedForEdit && (
        <ServiceFormModal
          onSave={(payload) => edit(payload, selectedForEdit._id)}
          onClose={closeEditModal}
          initialValue={selectedForEdit}
          okButtonProps={{ disabled: actionStatus.isLoading }}
          okText={t("Update Service")}
          afterSave={afterSave}
        />
      )}
    </>
  );
}

export default ServiceList;
