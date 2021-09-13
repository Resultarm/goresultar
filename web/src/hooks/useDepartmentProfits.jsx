import { useMemo } from "react";
import { useAPI } from "src/hooks";

function useDepartmentProfits(filters = {}) {
  const searchParams = new URLSearchParams(filters).toString();
  const [{ data: departments = [] } = {}, status] = useAPI(`/api/v2/analytics/department/profits?${searchParams}`);

  const departmentMap = useMemo(() => Object.fromEntries(departments.map(({ _id, profit }) => [_id, profit])), [departments]);

  return { data: departmentMap, status };
}

export default useDepartmentProfits;
