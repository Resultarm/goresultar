import { useOrders } from "src/hooks";
import { getName } from "src/helpers";

const getOrderOption = ({ _id, orderId, client, clientId }) => ({
  value: _id,
  label: `${orderId} (${getName(client)})`,
  clientId: clientId || undefined, // in testing vps , there are orders with no clientId
});

const filterOpenAndPartialOrders = (o) => o.status === 1 || o.status === 2;

function useOrderOptions() {
  const { all: orders, status } = useOrders();
  const options = orders.filter(filterOpenAndPartialOrders).map(getOrderOption);
  return { options, data: options, status };
}

export default useOrderOptions;
