import { GET_WORDS, DELETE_WORD, ADD_WORD, EDIT_WORD } from '../actions/types.js';

const initialState = {
    words: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_WORDS:
            return {
                ...state,
                words: action.payload
            };
        case DELETE_WORD:
            return {
                ...state,
                words: state.words.filter(word => word.id !== action.payload)
            };
        case ADD_WORD:
            return {
                ...state,
                words: [...state.words, action.payload]
            };
        case EDIT_WORD:
            return {
                ...state,
                words: state.words.map((item) => {
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