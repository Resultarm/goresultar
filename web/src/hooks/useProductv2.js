import { useAPI } from "src/helpers/useFetch";

const { useMemo, useState } = require("react");

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => `failed to ${a} ${n}`,
};

function useProductv2() {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "add" && payload) return ["/api/v2/products", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload)
      return [`/api/v2/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/products/${id}`, { method: "DELETE" }];
    if (method === "status change" && payload && id)
      return [`/api/v2/products/${id}/status`, { method: "POST", body: JSON.stringify(payload) }];

    return [undefined, undefined];
  }, [payload, method, id]);

  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "add"]);
  const edit = (id, payload) => setState([id, payload, "update"]);
  const save = (payload, id) => setState([id, payload, id ? "update" : "add"]);
  const changeStatus = (id, payload) => setState([id, payload, "status change"]);
  const del = (id) => setState([id, undefined, "delete"]);
  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code]("product", method) + `: ${status.message}` : "";
  }

  return { add, edit, save, del, reset, changeStatus, status };
}

export default useProductv2;
