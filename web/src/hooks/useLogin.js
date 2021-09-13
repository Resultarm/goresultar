import { useMemo } from "react";
import { useState } from "react";
import { useAPI } from "src/hooks";

function useLogin() {
  const [payload, setPayload] = useState();

  const opts = useMemo(
    () => [payload ? "/api/v2/auth/login" : undefined, payload ? { method: "POST", body: JSON.stringify(payload) } : undefined],
    [payload]
  );

  const [data, status] = useAPI(...opts);

  return { data, login: setPayload, status };
}

export default useLogin;
