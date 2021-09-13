import { useAPI } from "src/helpers/useFetch";

const { useMemo, useState } = require("react");

function useQuotationToOrder() {
  const [id, setId] = useState();
  const opts = useMemo(() => {
    if (id) return [`/api/v2/orders/${id}/to-order`, { method: "POST" }];

    return [undefined, undefined];
  }, [id]);

  const [, status] = useAPI(...opts);

  return { status, convert: setId };
}

export default useQuotationToOrder;
