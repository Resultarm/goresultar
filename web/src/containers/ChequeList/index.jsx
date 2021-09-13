import React, { useMemo, useEffect } from "react";
import { useState } from "react";
import { Button, Confirm, Icon, Input, Pagination, Table } from "semantic-ui-react";
import { useAPI } from "../../helpers/useFetch";
import ChequeAddModal from "./ChequeAddModal";
import moment from "moment";
import NSHandler from "../../components/NSHandler";
import useList from "src/helpers/useList";
import DropdownConfirmation from "src/components/DropdownConfirmation";
import ChequeImageModal from "./ChequeImageModal";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import currencyFormatterPrefix from "src/helpers/currencyFormatterPrefix";
import ChequeCalenderModal from "./ChequeCalenderModal";
import { useTranslation } from "react-i18next";
import OrgAwareButton from "src/components/OrgAwareButton";

const searchFields = "*";

const statusColors = {
  new: "teal",
  canceled: "orange",
  good: "blue",
  compensated: undefined,
  other: undefined,
  returned: undefined,
};

const statusOptions = [
  { value: "new", text: "New" },
  { value: "good", text: "Good" },
  { value: "compensated", text: "Compensate" },
  { value: "canceled", text: "Cancel", confirm: true },
  { value: "returned", text: "Return" },
  { value: "other", text: "Other", confirmWithComment: true },
];

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => (a === "status change" ? `failed to change status of ${n}` : `failed to ${a} ${n}`),
};

function useCheque() {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "add" && payload) return ["/api/cheques", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/cheques/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/cheques/${id}`, { method: "DELETE" }];

    if (method === "status change" && id && payload)
      return [`/api/cheques/${id}/status`, { method: "POST", body: JSON.stringify(payload) }];
    return [undefined, undefined];
  }, [payload, method, id]);
  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "add"]);
  const edit = (payload, id) => setState([id, payload, "update"]);
  const del = (id) => setState([id, undefined, "delete"]);
  const changeStatus = (payload, id) => setState([id, payload, "status change"]);
  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code]("cheque", method) : "";
  }

  return { add, edit, del, reset, changeStatus, status };
}

function useCheques() {
  const organizationId = useContext(OrganizationContext);

  return useList(`/api/cheques?organizationId=${organizationId || ""}`, searchFields);
}

function ChequeList({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const [cheques, { total, pages }, search, goto, sort, filters, chequesStatus, refresh] = useCheques();
  const { add, edit, del, changeStatus, reset, status: actionStatus } = useCheque();

  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [shouldShowCalender, setShouldShowCalender] = useState(false);
  const [selectedChequeForEdit, setSelectedChequeForEdit] = useState();
  const [selectedChequeForDelete, setSelectedChequeForDelete] = useState();
  const [selectedImages, setSelectedImages] = useState();

  const handleSearch = (e) => search(e.target.value);

  const closeAddModal = () => setShouldShowAddModal(false);
  const showAddModal = () => setShouldShowAddModal(true);

  const closeEditModal = () => setSelectedChequeForEdit(undefined);
  const handleEdit = (cheque) => () => setSelectedChequeForEdit(cheque);

  const handleDelete = (id) => () => setSelectedChequeForDelete(id);
  const closeDeleteConfirmation = () => setSelectedChequeForDelete(undefined);

  const showChequeCalender = () => setShouldShowCalender(true);
  const hideChequeCalender = () => setShouldShowCalender(false);

  const handlePageChange = (_, d) => {
    goto(d.activePage);
  };

  const handleStatusChange = (id) => (_, data) => {
    changeStatus({ status: data.value, comment: data.comment }, id);
  };

  useEffect(() => {
    if (actionStatus.isError || actionStatus.isSuccess) {
      addToast(actionStatus.message, {
        appearance: actionStatus.toString().toLowerCase(),
      });

      if (actionStatus.isSuccess) {
        closeAddModal();
        closeEditModal();
        closeDeleteConfirmation();
        refresh();
      }
    }
  }, [actionStatus]);

  useEffect(() => {
    if (!shouldShowAddModal && actionStatus.action === "add" && actionStatus.isSuccess) {
      reset();
    }
  }, [shouldShowAddModal, actionStatus.action, actionStatus.isSuccess]);

  const translatedStatusOptions = useMemo(() => statusOptions.map((o) => ({ ...o, text: t(o.text) })), [t]);

  return (
    <div className="container">
      <h2>{t("Cheques")}</h2>
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
        <Button onClick={showChequeCalender} icon="calendar alternate outline"></Button>
        <OrgAwareButton type="primary" className="generic-create-btn" onClick={showAddModal}>
          {t("Add")} {t("Cheque")}
        </OrgAwareButton>
      </div>

      <NSHandler status={chequesStatus}>
        {() => (
          <Table sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("Actions")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Status")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Cheque No")}</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={filters.sort.by === "date" ? filters.sort.direction : null}
                  onClick={() => sort("date", filters.sort.direction === "descending" ? "ascending" : "descending")}
                >
                  {t("Cheque Date")}
                </Table.HeaderCell>
                <Table.HeaderCell>{t("Agency No")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Account No")}</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={filters.sort.by === "holder" ? filters.sort.direction : null}
                  onClick={() => sort("holder", filters.sort.direction === "descending" ? "ascending" : "descending")}
                >
                  {t("Holder")}
                </Table.HeaderCell>
                <Table.HeaderCell>{t("To")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Amount")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Destination")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Images")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {cheques.map((cheque) => (
                <Table.Row key={cheque._id}>
                  <Table.Cell>
                    <Button icon="edit" basic onClick={handleEdit(cheque)} size="mini" />
                    <Button icon="trash alternate" negative basic onClick={handleDelete(cheque._id)} size="mini" />
                  </Table.Cell>
                  <Table.Cell style={{ width: 160 }}>
                    <DropdownConfirmation
                      options={translatedStatusOptions}
                      onChange={handleStatusChange(cheque._id)}
                      defaultValue={cheque.status}
                      color={statusColors[cheque.status]}
                      size="mini"
                      basic
                    >
                      {cheque.status.toUpperCase()}
                    </DropdownConfirmation>
                    {cheque.status === "other" && (
                      <>
                        <br />
                        <br />
                        <strong>{t("Comment")}: </strong>
                        {cheque.comment}
                      </>
                    )}
                  </Table.Cell>
                  <Table.Cell>{cheque.no}</Table.Cell>
                  <Table.Cell>{moment(cheque.date * 1000).format("DD/MM/YYYY")}</Table.Cell>
                  <Table.Cell>{cheque.agencyNo}</Table.Cell>
                  <Table.Cell>{cheque.accountNo}</Table.Cell>
                  <Table.Cell>{cheque.holder}</Table.Cell>
                  <Table.Cell>{cheque.to}</Table.Cell>
                  <Table.Cell>{currencyFormatterPrefix.format(cheque.amount)}</Table.Cell>
                  <Table.Cell>
                    <Icon name="user outline" />
                    {cheque.destinationName}
                    <br />
                    <Icon name="building outline" />
                    {cheque.destinationBank}
                    <br />
                    <Icon name="calendar alternate outline" />
                    {moment(cheque.destinationDate * 1000).format("DD/MM/YYYY")}
                  </Table.Cell>
                  <Table.Cell>
                    {(cheque.frontImageUrl || cheque.backImageUrl) && (
                      <Button
                        basic
                        icon="images outline"
                        size="mini"
                        onClick={() => setSelectedImages([cheque.frontImageUrl, cheque.backImageUrl])}
                      />
                    )}
                  </Table.Cell>
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
      {shouldShowAddModal && (
        <ChequeAddModal
          onSave={add}
          okText="Add Cheque"
          okButtonProps={{ disabled: actionStatus.isLoading }}
          onClose={closeAddModal}
        />
      )}
      {selectedChequeForEdit && (
        <ChequeAddModal
          onSave={(payload) => edit(payload, selectedChequeForEdit._id)}
          onClose={closeEditModal}
          initialValues={selectedChequeForEdit}
          okButtonProps={{ disabled: actionStatus.isLoading }}
          okText="Update Cheque"
        />
      )}
      {selectedChequeForDelete && (
        <Confirm
          open
          content="Are you sure you want to DELETE this cheque ?"
          onCancel={closeDeleteConfirmation}
          onConfirm={() => del(selectedChequeForDelete)}
          cancelButton="No"
          confirmButton="Yes, Delete"
        />
      )}
      {selectedImages && <ChequeImageModal urls={selectedImages} onClose={() => setSelectedImages(undefined)} />}
      {shouldShowCalender && <ChequeCalenderModal cheques={cheques} onClose={hideChequeCalender} />}
    </div>
  );
}

export default ChequeList;
