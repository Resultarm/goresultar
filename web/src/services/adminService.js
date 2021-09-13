import callWebApi from '../helpers/webApiHelper';

export const getAdmins = async args => {
    const response = await callWebApi({
        endpoint: '/api/admins',
        type: 'GET',
        query: args
    });
    return response.json();
};
export const getAdminRoles = async args => {
    const response = await callWebApi({
        endpoint: '/api/admins/roles',
        type: 'GET',
        query: args
    });
    return response.json();
};
export const getAdmin = async id => {
    const response = await callWebApi({
        endpoint: `/api/admins/${id}`,
        type: 'GET',
    });
    return response.json();
};
export const createAdmin = async request => {
    const response = await callWebApi({
        endpoint: '/api/admins',
        type: 'POST',
        request
    });
    return response.json();
};


export const updateAdmin = async (id, request) => {
    const response = await callWebApi({
        endpoint: `/api/admins/${id}`,
        type: 'PUT',
        request
    });
    return response.json();
};


export const deleteAdmin = async id => {
    const response = await callWebApi({
        endpoint: `/api/admins/${id}`,
        type: 'DELETE',
    });
    return response.json();
};


