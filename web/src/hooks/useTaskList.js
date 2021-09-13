import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useTaskList(opts) {
  const s = new URLSearchParams(opts);
  s.append("showAll", "true");
  return useListv2(`/api/v2/tasks?${s.toString()}`, searchFields);
}

export default useTaskList;
