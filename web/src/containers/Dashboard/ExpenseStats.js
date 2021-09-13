import React from "react";
import { useTranslation } from "react-i18next";
import { Divider } from "semantic-ui-react";
import NSHandler from "src/components/NSHandler";
import currencyFormatterPrefix from "src/helpers/currencyFormatterPrefix";
import { useAPI } from "src/helpers/useFetch";

const labelMap = {
  partial: "Partial",
  paid: "Paid",
  notpaid: "Not Paid",
  nextMonthExpense: "Next Month Expense",
  dues: "Late Payment",
};

const getTotalPayment = (expenses) => {
  return expenses.reduce((acc, e) => {
    return e.payments.reduce((acc, p) => acc + p.amount, 0) + acc;
  }, 0);
};

const getTotalAmount = (expenses) => {
  return expenses.reduce((acc, e) => e.amount + acc, 0);
};

function ExpenseStats() {
  const { t } = useTranslation("translation");
  const [expenseStats = {}, expenseStatsStatus] = useAPI("/api/expenses/stats");
  return (
    <div className="expense-stats-container">
      <h3 style={{ textTransform: "uppercase" }}>{t("Expense Stats")}</h3>
      <NSHandler status={expenseStatsStatus}>
        {() => (
          <div className="expense-stats">
            <div className="card">
              <div className="main">{expenseStats.total}</div>

              <div className="side-by-side">{t("Total Expenses")}</div>
            </div>
            <div className="card">
              <div className="main">{currencyFormatterPrefix.format(getTotalPayment(expenseStats.paid))}</div>
              <div className="below"></div>

              <div className="side-by-side">
                {t(labelMap.paid)}: {expenseStats.paid.length}
              </div>
            </div>
            <div className="card">
              <div className="main">{currencyFormatterPrefix.format(getTotalPayment(expenseStats.partial))}</div>
              <div className="below"></div>

              <div className="side-by-side">
                {t(labelMap.partial)}: {expenseStats.partial.length}
              </div>
            </div>
            <div className="card">
              <div className="main">{currencyFormatterPrefix.format(getTotalAmount(expenseStats.notpaid))}</div>
              <div className="below"></div>

              <div className="side-by-side">
                {t(labelMap.notpaid)}: {expenseStats.notpaid.length}
              </div>
            </div>
            <div className="card">
              <div className="main">{currencyFormatterPrefix.format(getTotalAmount(expenseStats.nextMonthExpense))}</div>
              <div className="below"></div>

              <div className="side-by-side">
                {t(labelMap.nextMonthExpense)}: {expenseStats.nextMonthExpense.length}
              </div>
            </div>
            <div className="card">
              <div className="main">{currencyFormatterPrefix.format(getTotalAmount(expenseStats.dues))}</div>
              <div className="below"></div>

              <div className="side-by-side">
                {t(labelMap.dues)}: {expenseStats.dues.length}
              </div>
            </div>
          </div>
        )}
      </NSHandler>
      <Divider />
    </div>
  );
}

export default ExpenseStats;
