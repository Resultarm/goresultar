import callWebApi from "../helpers/webApiHelper";

export const getBrands = async (args, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/brands",
    type: "GET",
    query: args,
    organizationId,
  });
  return response.json();
};

export const createBrand = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/brands",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateBrand = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/brands/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteBrand = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/brands/${id}`,
    type: "DELETE",
    request,
  });
  return response.json();
};
