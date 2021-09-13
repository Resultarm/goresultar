import useListv2 from "src/helpers/useListv2";

const searchFields = "*";

function useVehicleList(opts) {
  const s = new URLSearchParams(opts);
  s.append("showAll", "true");
  return useListv2(`/api/v2/vehicles?${s.toString()}`, searchFields);
}

export default useVehicleList;
