import { Descriptions, Button, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@reach/router";

import NSHandler from "src/components/NSHandler";
import currencyFormatterPrefix from "src/helpers/currencyFormatterPrefix";
import formatMoney from "src/helpers/formatMoney";
import { formatDate } from "src/helpers/formatters";
import { useAPI } from "src/helpers/useFetch";
import MakePaymentModal from "./MakePaymentModal";
import { EXPENSE_FREQUENCY, EXPENSE_TYPE } from "../ExpenseList/constants";

function useGetExpense(id) {
  return useAPI(`/api/expenses/${id}`);
}

function useExpensePayments(id) {
  const [{ data: payments } = { data: [] }, status, refresh] = useAPI(`/api/expenses/${id}/payments`);
  return [payments, status, refresh];
}

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => (a === "status change" ? `failed to change status of ${n}` : `failed to ${a} ${n}`),
};

const URLsWithDate = ({ urls }) =>
  (urls || []).map(({ createdAt, url }) => (
    <a key={url} style={{ display: "block" }} href={url} alt="invoice" target="_blank">
      {formatDate(createdAt)}
    </a>
  ));

const URLAnchors = ({ urls }) =>
  (urls || []).map(({ url }) => (
    <a key={url} style={{ display: "block" }} href={url} alt="invoice" target="_blank">
      {url}
    </a>
  ));

const ChequeAnchor = ({ no, amount }) => (
  <Link to="/cheques">
    {no} ({currencyFormatterPrefix.format(amount)})
  </Link>
);

const ChequeAnchors = ({ cheques = [] }) =>
  cheques.map(({ no, amount }) => (
    <>
      <ChequeAnchor no={no} amount={amount} />
      <br />
    </>
  ));
function useExpensePayment(expenseId) {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "add" && payload)
      return [`/api/expenses/${expenseId}/payments`, { method: "POST", body: JSON.stringify({ ...payload, expenseId }) }];
    if (method === "update" && expenseId && id && payload)
      return [`/api/expenses/${expenseId}/payments/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && expenseId && id) return [`/api/expenses/${expenseId}/payments/${id}`, { method: "DELETE" }];

    return [undefined, undefined];
  }, [payload, expenseId, method, id]);
  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "add"]);
  const edit = (payload, id) => setState([id, payload, "update"]);
  const del = (id) => setState([id, undefined, "delete"]);

  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code]("payment", method) : "";
  }

  return { add, edit, del, reset, status };
}

function ExpenseDetail({ addToast, id }) {
  const { t } = useTranslation(["translation"]);

  const [expense, status] = useGetExpense(id);
  const [payments, paymentsStatus, refreshPayments] = useExpensePayments(id);
  const { add, status: actionStatus } = useExpensePayment(id);
  const [shouldShowMakePaymentModal, setShouldShowMakePaymentModal] = useState(false);
  const showMakePaymentModal = () => setShouldShowMakePaymentModal(true);
  const closeMakePaymentModal = () => setShouldShowMakePaymentModal(false);

  useEffect(() => {
    if (actionStatus.isError || actionStatus.isSuccess) {
      addToast(actionStatus.message, {
        appearance: actionStatus.toString().toLowerCase(),
      });

      if (actionStatus.isSuccess) {
        closeMakePaymentModal();
        refreshPayments();
      }
    }
  }, [actionStatus]);

  const shouldDisablePayment =
    expense && payments.length > 0 ? expense.frequency === "custom" && expense.numTimes <= payments.length : false;
  return (
    <div className="container">
      <NSHandler status={status}>
        {() => (
          <Descriptions title={expense.name} bordered style={{ marginBottom: 32 }}>
            <Descriptions.Item label={t("Type")}>{EXPENSE_TYPE[expense.type]}</Descriptions.Item>
            <Descriptions.Item label={t("Fixed")}>{expense.fixed ? "True" : "False"}</Descriptions.Item>
            <Descriptions.Item label={t("Issue Date")}>{formatDate(expense.issueDate)}</Descriptions.Item>
            <Descriptions.Item label={t("Due Date")}>{formatDate(expense.dueDate)}</Descriptions.Item>
            <Descriptions.Item label={t("Frequency")}>{EXPENSE_FREQUENCY[expense.frequency]}</Descriptions.Item>
            {expense.frequency === "custom" && (
              <Descriptions.Item label={t("Num Of Times")}>{expense.numTimes}</Descriptions.Item>
            )}
            <Descriptions.Item label={t("Amount")}>
              {expense.frequency === "custom"
                ? `${formatMoney(expense.amount)} * ${expense.numTimes} = ${formatMoney(expense.amount * expense.numTimes)}`
                : formatMoney(expense.amount)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Late Fee")}>{formatMoney(expense.lateFee)}</Descriptions.Item>
            {expense.moneySourceId && (
              <Descriptions.Item label={t("Source of Money")}>{expense.moneySourceId}</Descriptions.Item>
            )}
            <Descriptions.Item></Descriptions.Item>
            <Descriptions.Item span={3} label={t("Description")} className="whitespace-pre">
              {expense.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </NSHandler>
      <NSHandler status={paymentsStatus}>
        {() => (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 16,
              }}
            >
              <Button onClick={showMakePaymentModal} disabled={shouldDisablePayment}>
                {t("Make Payment")}
              </Button>
            </div>
            <Table dataSource={payments} rowKey="_id">
              <Table.Column title={t("Date")} dataIndex="createdAt" render={formatDate}></Table.Column>
              <Table.Column title={t("Method")} dataIndex="method"></Table.Column>
              <Table.Column title={t("Amount")} dataIndex="amount" render={currencyFormatterPrefix.format}></Table.Column>
              <Table.Column
                title={t("Cheque")}
                dataIndex="cheques"
                render={(cheques) => <ChequeAnchors cheques={cheques} />}
              ></Table.Column>
              <Table.Column
                title={t("Invoice")}
                dataIndex="invoices"
                render={(urls) => <URLsWithDate urls={urls} />}
              ></Table.Column>
              <Table.Column
                title={t("Receipt")}
                dataIndex="receipts"
                render={(urls) => <URLsWithDate urls={urls} />}
              ></Table.Column>
            </Table>
          </>
        )}
      </NSHandler>
      {shouldShowMakePaymentModal && (
        <MakePaymentModal onSave={add} onClose={closeMakePaymentModal} okText={t("Make Payment")} initialValues={expense} />
      )}
    </div>
  );
}

export default ExpenseDetail;
