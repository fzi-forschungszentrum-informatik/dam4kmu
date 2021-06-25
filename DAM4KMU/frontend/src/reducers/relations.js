import { GET_RELATIONS, DELETE_RELATION, ADD_RELATION, EDIT_RELATION } from '../actions/types.js';

const initialState = {
    relations: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_RELATIONS:
            return {
                ...state,
                relations: action.payload
            };
        case DELETE_RELATION:
            return {
                ...state,
                relations: state.relations.filter(relation => relation.id !== action.payload)
            };
        case ADD_RELATION:
            return {
                ...state,
                relations: [...state.relations, action.payload]
            };
        case EDIT_RELATION:
            return {
                ...state,
                relations: state.relations.map((item) => {
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