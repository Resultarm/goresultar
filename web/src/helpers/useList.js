import { useState, useMemo, useEffect } from "react";
import sorter from "src/helpers/sorter";
import listsearch from "src/helpers/listsearch";
import { useAPI } from "src/helpers/useFetch";
const perPage = 150;

const initialState = {
  searchText: "",
  currentPage: 1,
  sort: { by: undefined, direction: undefined },
  predicate: undefined,
  values: {},
};

// function useDidUpdate(fn, deps) {
//   const didMount = useRef(false);

//   useEffect(() => {
//     if (!didMount.current) {
//       didMount.current = true;
//       return;
//     }

//     fn();
//   }, deps);
// }

const getComparator = (by, direction) => (a, b) => {
  const fn = sorter(by, typeof a[by]);
  return direction === "descending" ? fn(b, a) : fn(a, b);
};
const defaultResponse = { data: [], pageCount: 0, total: 0 };
function useList(url, searchFields, transform, filterFields = {}, filterPredicate) {
  const [filters, setFilters] = useState(
    filterPredicate ? { ...initialState, values: filterFields, filterer: filterPredicate } : initialState
  );

  const [{ data, total } = defaultResponse, status, refresh] = useAPI(url);
  const search = (searchText) =>
    setFilters((filters) => ({
      ...filters,
      searchText,
      currentPage: 1,
      sort: { by: undefined, direction: undefined },
    }));
  const goto = (pageNo) => setFilters((f) => ({ ...f, currentPage: pageNo }));
  const sort = (by, direction) => setFilters((f) => ({ ...f, currentPage: 1, sort: { by, direction } }));
  const setPredicate = (fn) => setFilters((f) => ({ ...f, predicate: fn }));

  const handlers = useMemo(() => {
    const handlers = {};

    for (const field in filters.values) {
      if (Object.prototype.hasOwnProperty.call(filters.values, field)) {
        handlers[field] = (value) =>
          setFilters((filterConfig) => ({ ...filterConfig, values: { ...filterConfig.values, [field]: value } }));
      }
    }
    return handlers;
  }, [filters.values]);

  const transformed = useMemo(() => (transform ? data.map(transform) : data), [transform, data]);

  const filtered = useMemo(() => {
    if (!filters.filterer) return filters.predicate ? transformed.filter(filters.predicate) : transformed;

    return transformed.filter(filters.filterer(filters.values));
  }, [transformed, filters]);

  const searched = useMemo(
    () => listsearch(filtered, searchFields, filters.searchText),
    [filtered, searchFields, filters.searchText]
  );

  const sorted = useMemo(
    () => (filters.sort.by ? [...searched.sort(getComparator(filters.sort.by, filters.sort.direction))] : searched),
    [searched, filters.sort.by, filters.sort.direction]
  );

  const paginated = useMemo(
    () => sorted.slice((filters.currentPage - 1) * perPage, filters.currentPage * perPage),
    [sorted, filters.currentPage]
  );

  useEffect(() => {
    if (data.length > 0) {
      setFilters(filterPredicate ? { ...initialState, filterer: filterPredicate, values: filterFields } : initialState);
    }
  }, [data, filterPredicate]);

  return [
    paginated,
    { total: total || data.length, pages: Math.ceil(searched.length / perPage), all: sorted },
    search,
    goto,
    sort,
    { ...filters, setPredicate, handlers },
    status,
    refresh,
  ];
}

export default useList;
