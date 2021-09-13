import {SET_PRODUCTS} from './actionTypes';

const initialState = {
    products: []
}
export default (state = initialState, action) => {
    console.log(action)

    switch (action.type) {
        case SET_PRODUCTS:
            return {
                ...state,
                products: action.products,
            };
        default:
            return state;
    }
};
