import { GET_SENTENCES, DELETE_SENTENCE, ADD_SENTENCE, EDIT_SENTENCE } from '../actions/types.js';

const initialState = {
    sentences: []
}

export default function(state = initialState, action) {
    switch(action.type) {
        case GET_SENTENCES:
            return {
                ...state,
                sentences: action.payload
            };
        case DELETE_SENTENCE:
            return {
                ...state,
                sentences: state.sentences.filter(sentence => sentence.id !== action.payload)
            };
        case ADD_SENTENCE:
            return {
                ...state,
                sentences: [...state.sentences, action.payload]
            };
        case EDIT_SENTENCE:
            return {
                ...state,
                sentences: state.sentences.map((item) => {
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