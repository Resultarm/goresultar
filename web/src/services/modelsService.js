import callWebApi from "../helpers/webApiHelper";

export const getModels = async (args, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/models",
    type: "GET",
    query: args,
    organizationId,
  });
  return response.json();
};

export const createModel = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/models",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateModel = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/models/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteModel = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/models/${id}`,
    type: "DELETE",
  });
  return response.json();
};
