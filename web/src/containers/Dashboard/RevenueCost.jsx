import { Link } from "@reach/router";
import React from "react";
import { useTranslation } from "react-i18next";
import currencyFormatter from "../../helpers/currencyFormatterPrefix";

function RevenueCost({ className, revenue, cost, collected, notCollected, label, value, labelLink }) {
  const { t } = useTranslation("translation");
  return (
    <div className={`${className} card`}>
      <div className="main">{currencyFormatter.format(revenue - cost)}</div>
      <div className="below">
        <span style={{ fontSize: 12, color: "gray" }}>
          {t("Revenue")}:
          <br />
          <span className="revenue">{currencyFormatter.format(revenue)}</span>
        </span>
        <span style={{ fontSize: 12, color: "gray" }}>
          {t("Cost")}:
          <br />
          <span className="cost">{currencyFormatter.format(cost)}</span>
        </span>
      </div>
      <div className="below">
        {collected !== undefined && (
          <span style={{ fontSize: 12, color: "gray" }}>
            {t("Collected")}:
            <br />
            <span className="collected">{currencyFormatter.format(collected)}</span>
          </span>
        )}
        {notCollected !== undefined && (
          <span style={{ fontSize: 12, color: "gray" }}>
            {t("Yet to collect")}:
            <br />
            <span className="needtocollect">{currencyFormatter.format(notCollected)}</span>
          </span>
        )}
      </div>
      <div className="side-by-side">
        {labelLink ? (
          <Link to={labelLink}>
            {label}: {value}
          </Link>
        ) : (
          `${label}: ${value}`
        )}
      </div>
    </div>
  );
}

export default RevenueCost;
