import * as productService from '../../services/productService';
import {SET_PRODUCTS} from './actionTypes';


const setProducts = products => async dispatch => {
    dispatch({
        type: SET_PRODUCTS,
        products
    })
};

//todo add sort/filter params
export const getProducts = () => async (dispatch, getRootState) => {
    console.log('getProducts')
    const products = await productService.getProducts();
    console.log(products)
    setProducts(products.products)(dispatch, getRootState);
};




