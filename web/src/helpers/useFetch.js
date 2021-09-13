import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import NS from "./NS";

export const cr = "\n";
export const tab = "\t";

// https://stackoverflow.com/a/2117523
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

const defaultFetchOptions = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

function getType(data) {
  if (data === null) return "Null";
  if (data === undefined) return "Undefined";
  if (typeof data === "string") return "String";
  if (typeof data === "number" && !Number.isNaN(data)) return "Number";
  if (Number.isNaN(data)) return "NaN";
  if (typeof data === "boolean") return "Boolean";
  if (data instanceof Array) return "Array"; // always should be before `Object`
  if (data instanceof Object) return "Object";

  return "";
}

export default function useFetch(url, opts) {
  const organizationId = useContext(OrganizationContext);
  const [[rId, fresh], setParams] = useState(() => ["", false]);
  const [response, setResponse] = useState([undefined, new NS("INIT")]);

  const refresh = useCallback(() => setParams([uuidv4(), true]), []);

  useEffect(() => {
    if (url) {
      setParams([uuidv4(), false]);
    }
  }, [url, opts]);

  useEffect(() => {
    if (!url || !rId) return;

    const abortctrl = new AbortController();

    setResponse(([, s]) => [undefined, s.clone("LOADING")]);
    const startTime = performance.now();

    // recursive merge might be better solution
    const finalopts = {
      ...defaultFetchOptions,
      ...opts,
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        ...defaultFetchOptions.headers,
        ...opts?.headers,
        ...(fresh && { "X-Clear-Cache": true }),
        "X-Request-ID": rId,
        ...(organizationId && { OrganizationID: organizationId }),
      },
    };

    if (finalopts.headers["Content-Type"] === null) {
      delete finalopts.headers["Content-Type"];
    }
    fetch(url, finalopts)
      .then(async (res) => {
        if (abortctrl.signal.aborted) return;

        const responseTime = performance.now() - startTime;
        const cached = !!res.headers.get("X-Browser-Cache");
        const token = res.headers.get("X-Token");
        let body;

        try {
          body = await res.json();
        } catch (e) {
          const message = "Invalid JSON response from API";
          console.error(`${cr}API Error:${cr}${tab}URL: ${url}${cr}${tab}Msg: ${message}${cr}${tab}Code: ${res.status}`);
          setResponse(([, s]) => [undefined, s.clone("ERROR", message, res.status, responseTime, rId, cached)]);
          return;
        }

        if (res.status >= 400) {
          const message = body.error || body.message || "";
          console.log("message :>> ", message);
          setResponse(([, s]) => {
            console.log("s :>> ", s);
            const cloned = s.clone("ERROR", message, res.status, responseTime, rId, cached, false, token);
            console.log("cloned :>> ", cloned);
            return [undefined, s.clone("ERROR", message, res.status, responseTime, rId, cached, false, token)];
          });
          return;
        }
        const dataType = getType(body);
        const hasData = dataType !== "Null" && (dataType === "Array" ? body.length > 0 : true);

        setResponse(([, s]) => [body, s.clone("SUCCESS", "", res.status, responseTime, rId, cached, hasData, token)]);
      })
      .catch((err) => {
        if (abortctrl.signal.aborted) return;
        const responseTime = performance.now() - startTime;
        console.error(`${cr}API Error:${cr}${tab}URL: ${url}${cr}${tab}Msg: ${err.message}${cr}${tab}Code: 0`);
        setResponse(([, s]) => [undefined, s.clone("ERROR", "", 0, responseTime, rId)]);
      });

    return () => abortctrl.abort();
  }, [rId]);

  return [response[0], response[1], refresh];
}

export function useAPI(url, customOptions) {
  const organizationId = useContext(OrganizationContext);
  const options = useMemo(
    () => ({
      ...customOptions,
      headers: {
        OrganizationID: organizationId || "",
        ...customOptions?.headers,
      },
    }),
    [customOptions, organizationId]
  );
  return useFetch(url, options);
}
