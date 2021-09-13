import { useMemo, useState } from "react";
import { useAPI } from "src/helpers/useFetch";

const entityName = "department";

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => `failed to ${a} ${n}`,
};

function useDepartment(getID) {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "create" && payload) return ["/api/v2/departments", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload)
      return [`/api/v2/departments/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/departments/${id}`, { method: "DELETE" }];

    return [undefined, undefined];
  }, [payload, method, id]);

  const [{ data } = {}, getStatus] = useAPI(getID ? `/api/tasks/${getID}` : undefined);
 
  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "create"]);
  const edit = (id, payload) => setState([id, payload, "update"]);
  const save = (payload, id) => setState([id, payload, id ? "update" : "create"]);
  const del = (id) => setState([id, undefined, "delete"]);
  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code](entityName, method) + `: ${status.message}` : "";
  }

  return { data, add, edit, save, del, reset, status, getStatus };
}

export default useDepartment;
