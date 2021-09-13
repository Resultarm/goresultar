import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useClients() {
  return useListv2(`/api/clients?showAll=true`, searchFields);
}

export default useClients;
