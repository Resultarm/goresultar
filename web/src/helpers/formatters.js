import React from "react";
import moment from "moment";

export const formatNumber = (number) => {
  const f = Number(number);
  return f.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};

export const formatDate = (timestamp) => {
  return timestamp ? moment(timestamp * 1000).format("DD/MM/YYYY") : "-";
};

function AlertWrapper({ style, alert, children }) {
  return (
    <span
      style={{
        ...(alert && {
          backgroundColor: alert ? "yellow" : "none",
          fontWeight: "bold",
          padding: 4,
        }),
        ...style,
      }}
    >
      {alert ? "⚠️  " : ""}
      {children}
    </span>
  );
}

export const stringifyOrderStatus = (t, status, alert = false) => {
  switch (status) {
    case 1:
      return (
        <AlertWrapper alert={alert} style={{ color: "green" }}>
          {t("Open")}
        </AlertWrapper>
      );
    case 2:
      return (
        <AlertWrapper alert={alert} style={{ color: "orange" }}>
          {t("Partial")}
        </AlertWrapper>
      );
    case 3:
      return (
        <AlertWrapper alert={alert} style={{ color: "blue" }}>
          {t("Closed")}
        </AlertWrapper>
      );
    case 4:
      return (
        <AlertWrapper alert={alert} style={{ color: "violet" }}>
          {t("Quotation")}
        </AlertWrapper>
      );
    default:
      return <p>{t("Unknown")}</p>;
  }
};
