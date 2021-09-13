import callWebApi from "../helpers/webApiHelper";

export const getCategories = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/categories",
    type: "GET",
    query: args,
  });
  return response.json();
};

export const createCategory = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/categories",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateCategory = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/categories/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteCategory = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/categories/${id}`,
    type: "DELETE",
  });
  return response.json();
};
