import useList from "./useList";

function useListv2(url, searchFields, transform, filterFields, filterPredicate) {
  const [data, { total, pages, all }, search, goto, sort, filters, status, refresh] = useList(
    url,
    searchFields,
    transform,
    filterFields,
    filterPredicate
  );
  return { data, total, pages, all, search, goto, sort, filters, status, refresh };
}

export default useListv2;
