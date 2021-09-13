import useListv2 from "src/helpers/useListv2";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const searchFields = "*";

export const orderProcesses = [
  "None",
  "New",
  "Preparation",
  "Production",
  "Quality",
  "Finishing",
  "Completed",
  "Delivered | Returned",
  "Concluded",
  "Canceled",
];

export const paymentStatuses = ["None", "Open", "Partial", "Closed", "Quotation"];

export const statuses = {
  1: "Open",
  2: "Partial",
  3: "Closed",
  4: "Quotation",
};

function useOrders(opts) {
  const { t } = useTranslation(["translation"]);
  // allows searching by processStatus and status
  const transform = useCallback(
    (o) => ({ ...o, _processStatus: t(orderProcesses[o.processStatus]), _status: t(statuses[o.status]) }),
    [t]
  );

  const s = new URLSearchParams(opts);
  s.append("showAll", "true");
  return useListv2(`/api/orders?${s.toString()}`, searchFields, transform);
}

export default useOrders;
