import { GET_REQUIREMENTS, DELETE_REQUIREMENT, ADD_REQUIREMENT, EDIT_REQUIREMENT } from '../actions/types.js';

const initialState = {
    requirements: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_REQUIREMENTS:
            return {
                ...state,
                requirements: action.payload
            };
        case DELETE_REQUIREMENT:
            return {
                ...state,
                requirements: state.requirements.filter(requirement => requirement.sentence !== action.payload)
            };
        case ADD_REQUIREMENT:
            console.log(action.payload)
            return {
                ...state,
                requirements: [...state.requirements, action.payload]
            };
        case EDIT_REQUIREMENT:
            return {
                ...state,
                requirements: state.requirements.map((item) => {
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