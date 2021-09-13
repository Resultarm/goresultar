import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useSubcategories() {
  return useListv2(`/api/subcategories?showAll=true`, searchFields);
}

export default useSubcategories;
