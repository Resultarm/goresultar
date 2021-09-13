import { useList } from "src/hooks";

const searchFields = "*";

function usePermissions() {
  return useList(`/api/v2/permissions`, searchFields);
}

export default usePermissions;
