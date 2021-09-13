import callWebApi from "../helpers/webApiHelper";

export const getOrders = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/orders",
    type: "GET",
    query: args,
  });
  return response.json();
};

export const getOrderStatuses = async () => {
  const response = await callWebApi({
    endpoint: "/api/orders/statuses",
    type: "GET",
  });
  return response.json();
};
export const getOrderStats = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/orders-stats",
    type: "GET",
    query: args,
  });
  return response.json();
};
export const getOrder = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}`,
    type: "GET",
  });
  return response.json();
};
export const createOrder = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/orders",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateOrder = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteTransaction = async (id, transactionId) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/payment/${transactionId}`,
    type: "DELETE",
  });
  return response.json();
};

export const updateOrderStatus = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/v2/orders/${id}/to-order`,
    type: "POST",
    request,
  });
  return response.json();
};

export const updateOrderProcessStatus = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/process-status`,
    type: "POST",
    request,
  });
  return response.json();
};

export const deleteOrder = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}`,
    type: "DELETE",
    request,
  });
  return response.text().then((v) => (v ? JSON.parse(v) : undefined));
};

export const uploadProofPayment = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/payment-upload`,
    type: "POST",
    attachment: request,
  });
  return response.json();
};

export const addOrderPayment = async (id, request, organizationId) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/payment`,
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateOrderPayment = async (id, transactionId, request) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/payment/${transactionId}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const getOrderPayments = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/orders/${id}/payment`,
    type: "GET",
  });
  return response.json();
};
