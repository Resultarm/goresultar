import callWebApi from "../helpers/webApiHelper";

export const getOrganizations = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/v2/organizations",
    type: "GET",
    query: args,
  });
  return response.json();
};

export const createOrganization = async (request) => {
  const response = await callWebApi({
    endpoint: "/api/orgs",
    type: "POST",
    request,
  });
  return response.json();
};

export const updateOrganization = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/orgs/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteOrganization = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/orgs/${id}`,
    type: "DELETE",
  });
  return response.json();
};
