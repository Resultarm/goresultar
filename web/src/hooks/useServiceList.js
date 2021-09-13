import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useServiceList() {
  return useListv2(`/api/v2/services`, searchFields);
}

export default useServiceList;
