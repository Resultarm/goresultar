import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useModels() {
  return useListv2(`/api/models?showAll=true`, searchFields);
}

export default useModels;
