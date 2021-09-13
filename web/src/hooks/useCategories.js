import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useCategories() {
  return useListv2(`/api/categories?showAll=true`, searchFields);
}

export default useCategories;
