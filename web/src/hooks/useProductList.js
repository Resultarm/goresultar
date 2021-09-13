import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useProductList(opts, filterFields, filterPredicate) {
  const s = new URLSearchParams(opts);
  s.append("showAll", "true");

  return useListv2(`/api/v2/products?${s.toString()}`, searchFields, undefined, filterFields, filterPredicate);
}

export default useProductList;
