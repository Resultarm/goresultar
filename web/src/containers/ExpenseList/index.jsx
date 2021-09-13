import React, { useMemo, useEffect } from "react";
import { useState } from "react";
import { Button, Confirm, Icon, Input, Pagination, Table } from "semantic-ui-react";
import NSHandler from "../../components/NSHandler";
import { useAPI } from "../../helpers/useFetch";
import ExpenseAddModal from "./ExpenseAddModal";
import moment from "moment";
import currencyFormatterPrefix from "../../helpers/currencyFormatterPrefix";
import { Link } from "@reach/router";
import { useExpenses } from "src/hooks";
import OrgAwareButton from "src/components/OrgAwareButton";
import { useTranslation } from "react-i18next";
import { EXPENSE_FREQUENCY, EXPENSE_TYPE } from "./constants";

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => (a === "status change" ? `failed to change status of ${n}` : `failed to ${a} ${n}`),
};

function useExpense() {
  const [[id, payload, method], setPayload] = useState([]);
  const opts = useMemo(() => {
    if (method === "add" && payload) return ["/api/expenses", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/expenses/${id}`, { method: "DELETE" }];

    return [undefined, undefined];
  }, [payload, method, id]);
  const [, status] = useAPI(...opts);

  const add = (payload) => setPayload([undefined, payload, "add"]);
  const edit = (payload, id) => setPayload([id, payload, "update"]);
  const del = (id) => setPayload([id, undefined, "delete"]);
  const changeStatus = (payload, id) => setPayload([id, payload, "status change"]);

  status.action = method;
  status.message = msgTemplate[status.code] ? msgTemplate[status.code]("expense", method) : "";

  return { add, edit, del, changeStatus, status };
}

const getInitialAddValues = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("create")
    ? {
        name: searchParams.get("name"),
        type: searchParams.get("type"),
        description: searchParams.get("description"),
        amount: Number(searchParams.get("amount")),
        numTimes: Number(searchParams.get("numTimes")),
        frequency: searchParams.get("frequency"),
        shouldAdd: !!searchParams.get("create"),
        fixed: searchParams.get("fixed") === "true",
      }
    : undefined;
};

function ExpenseList({ addToast }) {
  const { t } = useTranslation(["translation"]);
  const { data: expenses, total, pages, search, goto, sort, filters, status: expensesStatus, refresh } = useExpenses();

  const initialAddValues = getInitialAddValues();

  const { add, edit, del, changeStatus, status: actionStatus } = useExpense();

  const [shouldShowAddModal, setShouldShowAddModal] = useState(!!initialAddValues?.shouldAdd);
  const [selectedChequeForEdit, setSelectedChequeForEdit] = useState();
  const [selectedChequeForDelete, setSelectedChequeForDelete] = useState();

  const handleSearch = (e) => search(e.target.value);

  const closeAddModal = () => setShouldShowAddModal(false);
  const showAddModal = () => setShouldShowAddModal(true);

  const closeEditModal = () => setSelectedChequeForEdit(undefined);
  const handleEdit = (cheque) => () => setSelectedChequeForEdit(cheque);

  const handleDelete = (id) => () => setSelectedChequeForDelete(id);
  const closeDeleteConfirmation = () => setSelectedChequeForDelete(undefined);

  const handlePageChange = (_, d) => {
    goto(d.activePage);
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

  return (
    <div className="container">
      <h2>{t("Expenses")}</h2>
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div style={{ marginLeft: 16 }}>
          <Input
            type="text"
            placeholder={t("Search")}
            onChange={handleSearch}
            value={filters.searchText}
            icon={<Icon name="delete" onClick={() => search("")} circular link />}
          />
        </div>
        <OrgAwareButton type="primary" className="generic-create-btn" onClick={showAddModal}>
          {t("Add")} {t("Expense")}
        </OrgAwareButton>
      </div>

      <NSHandler status={expensesStatus}>
        {() => (
          <Table sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("Actions")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Title")}</Table.HeaderCell>
                <Table.HeaderCell
                  sorted={filters.sort.by === "issueDate" ? filters.sort.direction : null}
                  onClick={() => sort("issueDate", filters.sort.direction === "descending" ? "ascending" : "descending")}
                >
                  {t("Issue Date")}
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={filters.sort.by === "dueDate" ? filters.sort.direction : null}
                  onClick={() => sort("dueDate", filters.sort.direction === "descending" ? "ascending" : "descending")}
                >
                  {t("Due Date")}
                </Table.HeaderCell>
                <Table.HeaderCell>{t("Frequency")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Source")}</Table.HeaderCell>
                <Table.HeaderCell>{t("Cheque")}</Table.HeaderCell>
                <Table.HeaderCell>{"Amount"}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {expenses.map((expense) => (
                <Table.Row key={expense._id}>
                  <Table.Cell>
                    <Button icon="edit" basic onClick={handleEdit(expense)} size="mini" />
                    <Button icon="trash alternate" negative basic onClick={handleDelete(expense._id)} size="mini" />
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/expenses/${expense._id}`}>
                      ({EXPENSE_TYPE[expense.type]}) {expense.name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{moment(expense.issueDate * 1000).format("DD/MM/YYYY")}</Table.Cell>
                  <Table.Cell>{moment(expense.dueDate * 1000).format("DD/MM/YYYY")}</Table.Cell>
                  <Table.Cell>{EXPENSE_FREQUENCY[expense.frequency]}</Table.Cell>
                  <Table.Cell>{expense.moneySource?.title}</Table.Cell>
                  <Table.Cell>
                    {expense.cheques.map(({ no, amount }) => (
                      <a key={no} style={{ display: "block" }} target="_blank" href="/cheques">
                        ({no}) {currencyFormatterPrefix.format(amount)}
                      </a>
                    ))}
                  </Table.Cell>
                  <Table.Cell>
                    {currencyFormatterPrefix.format(expense.amount)}
                    <br />
                    {t("Late Fee")}: {currencyFormatterPrefix.format(expense.lateFee)}
                    <br />
                    {expense.fixed ? `(${t("Fixed")})` : `(${t("Variable")})`}
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
        <ExpenseAddModal
          onSave={add}
          okText={`${t("Add")} ${t("Expense")}`}
          okButtonProps={{ disabled: actionStatus.isLoading }}
          onClose={closeAddModal}
          initialValues={initialAddValues}
        />
      )}
      {selectedChequeForEdit && (
        <ExpenseAddModal
          onSave={(payload) => edit(payload, selectedChequeForEdit._id)}
          onClose={closeEditModal}
          initialValues={selectedChequeForEdit}
          okButtonProps={{ disabled: actionStatus.isLoading }}
          okText={`${t("Update")} ${t("Expense")}`}
        />
      )}
      {selectedChequeForDelete && (
        <Confirm
          open
          content={`${t("Are you sure you want to delete")} ?`}
          onCancel={closeDeleteConfirmation}
          onConfirm={() => del(selectedChequeForDelete)}
          cancelButton={t("No")}
          confirmButton={t("Delete")}
        />
      )}
    </div>
  );
}

export default ExpenseList;
