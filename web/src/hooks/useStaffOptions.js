import { useAPI } from "src/helpers/useFetch";

function useStaffOptions(organizationId) {
  const [{ data } = { data: [] }, status] = useAPI("/api/admins");

  return {
    data: data
      .filter(
        ({ organizationIds, roleNumber }) =>
          (organizationId ? organizationIds.includes(organizationId) : true) && roleNumber === 3
      )
      .map(({ _id, firstName, lastName }) => ({ value: _id, label: `${firstName} ${lastName}` })),
    status,
  };
}

export default useStaffOptions;
