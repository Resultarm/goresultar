import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useBrands() {
  return useListv2(`/api/brands?showAll=true`, searchFields);
}

export default useBrands;
