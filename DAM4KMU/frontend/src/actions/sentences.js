import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_SENTENCES, DELETE_SENTENCE, ADD_SENTENCE, EDIT_SENTENCE} from './types';

// GET
export const getSentences = () => dispatch => {
    axios.get('/api/sentences/')
        .then(res => {
            dispatch({
                type: GET_SENTENCES,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE
export const deleteSentence = (id) => dispatch => {
    axios.delete(`/api/sentences/${id}/`)
        .then(res => {
            dispatch(createMessage({deleteSentence: 'Sentence succesfully deleted'}));
            dispatch({
                type: DELETE_SENTENCE,
                payload: id
            });
        }).catch(err => console.log(err));
}

// ADD
export const addSentence = (sentence) => dispatch => {
    axios.post("/api/sentences/", sentence)
        .then(res => {
            dispatch(createMessage({addSentence: 'Sentence succesfully created'}));
            dispatch({
                type: ADD_SENTENCE,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT
export const editSentence = (sentence, id) => dispatch => {
    axios.patch(`/api/sentences/${id}/`, sentence)
        .then(res => {
            dispatch(createMessage({editSentence: 'Sentence succesfully updated'}));
            dispatch({
                type: EDIT_SENTENCE,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}