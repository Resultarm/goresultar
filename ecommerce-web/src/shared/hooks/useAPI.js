import { useMemo } from "react";
import useFetch from "./useFetch";

export default function useAPI(url, customOptions) {
  const options = useMemo(
    () => ({
      ...customOptions,
      headers: {
        ...customOptions?.headers,
      },
    }),
    [customOptions]
  );
  return useFetch(url, options);
}
