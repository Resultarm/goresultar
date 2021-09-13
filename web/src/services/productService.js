import callWebApi from "../helpers/webApiHelper";

export const getProducts = async (args) => {
  const response = await callWebApi({
    endpoint: "/api/products",
    type: "GET",
  });
  return response.json();
};
export const getProductStats = async () => {
  const response = await callWebApi({
    endpoint: "/api/products-stats",
    type: "GET",
  });
  return response.json();
};
export const getProduct = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/products/${id}`,
    type: "GET",
  });
  return response.json();
};
export const getProductImages = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/products/${id}/images`,
    type: "GET",
  });
  return response.json();
};
export const createProduct = async (request, organizationId) => {
  const response = await callWebApi({
    endpoint: "/api/products",
    type: "POST",
    request,
    organizationId,
  });
  return response.json();
};

export const updateProduct = async (id, request) => {
  const response = await callWebApi({
    endpoint: `/api/products/${id}`,
    type: "PUT",
    request,
  });
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await callWebApi({
    endpoint: `/api/products/${id}`,
    type: "DELETE",
  });
  return response.json();
};

export const deleteProductImage = async (prodId, imageId) => {
  const response = await callWebApi({
    endpoint: `/api/products/${prodId}/images/${imageId}`,
    type: "DELETE",
  });
  return response.json();
};

export const updateProductImage = async (prodId, imageId, request) => {
  const response = await callWebApi({
    endpoint: `/api/products/${prodId}/images/${imageId}`,
    type: "PUT",
    request,
  });
  return response.json();
};
