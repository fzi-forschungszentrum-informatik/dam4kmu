import { GET_ASSETS, DELETE_ASSET, ADD_ASSET, EDIT_ASSET } from '../actions/types.js';

const initialState = {
    assets: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_ASSETS:
            return {
                ...state,
                assets: action.payload
            };
        case DELETE_ASSET:
            return {
                ...state,
                assets: state.assets.filter(asset => asset.id !== action.payload)
            };
        case ADD_ASSET:
            return {
                ...state,
                assets: [...state.assets, action.payload]
            };
        case EDIT_ASSET:
            return {
                ...state,
                assets: state.assets.map((item) => {
                    if (item.id !== action.payload_patchId) {
                        return item
                    }
                    return {
                        ...action.payload
                    }
                })
            };
        default:
            return state;
    }
}