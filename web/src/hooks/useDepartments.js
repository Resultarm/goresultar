import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useDepartments() {
  return useListv2(`/api/departments?showAll=true`, searchFields);
}

export default useDepartments;
