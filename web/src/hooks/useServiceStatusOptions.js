import { useTranslation } from "react-i18next";
import { useAPI } from "src/helpers/useFetch";

function useServiceStatusOptions() {
  const { t } = useTranslation(["translation"]);
  const [data, status] = useAPI("/api/v2/products/statuses");

  return { data: (data || []).map((s) => ({ value: s, text: t(s) })), status };
}

export default useServiceStatusOptions;
