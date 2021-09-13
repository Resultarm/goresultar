import callWebApi from "../helpers/webApiHelper";

export const getSubcategories = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/subcategories",
    type: "GET",
    query: args,
  });
  return response.json();
};

export const createSubcategory = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/subcategories",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateSubcategory = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/subcategories/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteSubcategory = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/subcategories/${id}`,
    type: "DELETE",
  });
  return response.json();
};
