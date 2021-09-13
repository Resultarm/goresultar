import callWebApi from "../helpers/webApiHelper";

export const getProductImages = async id => {
    const response = await callWebApi({
        endpoint: `/api/products/${id}/images`,
        type: 'GET',
    });
    return response.json();
};
export const createProductImage = async (id, file) => {
    const response = await callWebApi({
        endpoint: `/api/products/${id}/images`,
        type: 'POST',
        attachment: file,
    });
    return response.json();
};
