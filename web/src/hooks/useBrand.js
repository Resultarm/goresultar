import { useMemo, useState } from "react";
import { useAPI } from "src/helpers/useFetch";

const entityName = "brand";

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => `failed to ${a} ${n}`,
};

function useBrand(getID) {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "create" && payload) return ["/api/v2/brands", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/brands/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/brands/${id}`, { method: "DELETE" }];

    return [undefined, undefined];
  }, [payload, method, id]);

  const [{ data } = {}, getStatus] = useAPI(getID ? `/api/brands/${getID}` : undefined);
  console.log("opts :>> ", opts);
  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "create"]);
  const edit = (id, payload) => setState([id, payload, "update"]);
  const save = (id, payload) => setState([id, payload, id ? "update" : "create"]);
  const del = (id) => setState([id, undefined, "delete"]);
  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code](entityName, method) + `: ${status.message}` : "";
  }

  return { data, add, edit, save, del, reset, status, getStatus };
}

export default useBrand;
