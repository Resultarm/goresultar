import callWebApi from "../helpers/webApiHelper";

export const getDepartments = async (args, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/departments",
    type: "GET",
    query: args,
    organizationId,
  });
  return response.json();
};

export const createDepartment = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/departments",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateDepartment = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/departments/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteDepartment = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/departments/${id}`,
    type: "DELETE",
  });
  return response.json();
};
