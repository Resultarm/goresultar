import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useExpenses(opts) {
  const s = new URLSearchParams(opts);
  s.append("showAll", "true");
  return useListv2(`/api/expenses?${s.toString()}`, searchFields);
}

export default useExpenses;
