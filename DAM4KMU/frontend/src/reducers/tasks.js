import { GET_TASKS, DELETE_TASK, ADD_TASK, EDIT_TASK } from '../actions/types.js';

const initialState = {
    tasks: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_TASKS:
            return {
                ...state,
                tasks: action.payload
            };
        case DELETE_TASK:
            return {
                ...state,
                tasks: state.tasks.filter(task => task.sentence !== action.payload)
            };
        case ADD_TASK:
            return {
                ...state,
                tasks: [...state.tasks, action.payload]
            };
        case EDIT_TASK:
            return {
                ...state,
                tasks: state.tasks.map((item) => {
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