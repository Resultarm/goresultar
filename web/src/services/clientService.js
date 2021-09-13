import callWebApi from "../helpers/webApiHelper";

export const getClients = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/clients",
    type: "GET",
    query: args,
  });
  return response.json();
};
export const getClient = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/clients/${id}`,
    type: "GET",
  });
  return response.json();
};
export const createClient = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/clients",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateClient = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/clients/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteClient = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/clients/${id}`,
    type: "DELETE",
  });
  return response.json();
};
