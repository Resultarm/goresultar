import { useAPI } from "src/helpers/useFetch";

function useClientOptions() {
  const [{ data: users } = { data: [] }, status, refresh] = useAPI(`/api/clients?showAll=true`);
  const clients = users.map(({ _id, firstName, lastName}) => ({ value: _id, label: `${firstName} ${lastName}` }));
  return { options: clients, data: clients, status, refresh };
}

export default useClientOptions;
