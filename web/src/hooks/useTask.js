import { useAPI } from "src/helpers/useFetch";

const { useMemo, useState } = require("react");

const entityName = "task";

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => `failed to ${a} ${n}`,
};

function useTask(getID) {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "create" && payload) return ["/api/v2/tasks", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/v2/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/v2/tasks/${id}`, { method: "DELETE" }];
    if (method === "status change" && payload && id)
      return [`/api/v2/tasks/${id}/status`, { method: "POST", body: JSON.stringify(payload) }];

    return [undefined, undefined];
  }, [payload, method, id]);

  const [{ data } = {}, getStatus] = useAPI(getID ? `/api/v2/tasks/${getID}` : undefined);
  const [, status] = useAPI(...opts);

  const add = (payload) => setState([undefined, payload, "create"]);
  const edit = (id, payload) => setState([id, payload, "update"]);
  const save = (id, payload) => setState([id, payload, id ? "update" : "create"]);
  const changeStatus = (id, payload) => setState([id, payload, "status change"]);
  const del = (id) => setState([id, undefined, "delete"]);
  const reset = () => setState([]);

  if (method) {
    status.action = method;
    status.message = msgTemplate[status.code] ? msgTemplate[status.code](entityName, method) + `: ${status.message}` : "";
  }

  return { data, add, edit, save, del, reset, changeStatus, status, getStatus };
}

export default useTask;
