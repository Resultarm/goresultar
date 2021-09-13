import { useAPI } from "src/helpers/useFetch";

const { useMemo, useState } = require("react");

const entityName = "task";
//const entityName = "vehicle";

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => `failed to ${a} ${n}`,
};

function useOrganization() {
  const [[id, payload, method], setState] = useState([]);
  const opts = useMemo(() => {
    if (method === "create" && payload) return ["/api/orgs", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/orgs/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/orgs/${id}`, { method: "DELETE" }];

    return [undefined, undefined];
  }, [payload, method, id]);

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

  return { add, edit, save, del, reset, status };
}

export default useOrganization;
