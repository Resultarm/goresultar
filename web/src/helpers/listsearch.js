import includes from "./includes";
import safeget from "./safeget";

export default function listsearch(list, fields, searchText) {
  if (!searchText) return list;
  if (fields === "*") return list.filter((item) => includes(item, searchText));
  return list.filter((item) =>
    fields.some((f) => includes(safeget(item, f.split("."), ""), searchText))
  );
}
