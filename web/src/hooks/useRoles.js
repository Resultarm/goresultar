import { useAPI } from "src/hooks";

function useRoles() {
  return useAPI("/api/v2/roles");
}

export default useRoles;
