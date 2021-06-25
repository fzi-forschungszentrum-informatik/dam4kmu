import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_WORDS, DELETE_WORD, ADD_WORD, EDIT_WORD} from './types';

// GET
export const getWords = () => dispatch => {
    axios.get('/api/words/')
        .then(res => {
            dispatch({
                type: GET_WORDS,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE
export const deleteWord = (id) => dispatch => {
    axios.delete(`/api/words/${id}/`)
        .then(res => {
            dispatch(createMessage({deleteWord: 'Word succesfully deleted'}));
            dispatch({
                type: DELETE_WORD,
                payload: id
            });
        }).catch(err => console.log(err));
}

// ADD
export const addWord = (word) => dispatch => {
    axios.post("/api/words/", word)
        .then(res => {
            dispatch(createMessage({addWord: 'Word succesfully created'}));
            dispatch({
                type: ADD_WORD,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT
export const editWord = (word, id) => dispatch => {
    axios.patch(`/api/words/${id}/`, word)
        .then(res => {
            dispatch(createMessage({editWord: 'Word succesfully updated'}));
            dispatch({
                type: EDIT_WORD,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}