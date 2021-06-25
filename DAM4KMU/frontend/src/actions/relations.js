import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_RELATIONS, DELETE_RELATION, ADD_RELATION, EDIT_RELATION} from './types';

// GET
export const getRelations = () => dispatch => {
    axios.get('/api/relations/')
        .then(res => {
            dispatch({
                type: GET_RELATIONS,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE
export const deleteRelation = (id) => dispatch => {
    axios.delete(`/api/relations/${id}/`)
        .then(res => {
            dispatch(createMessage({deleteRelation: 'Relation succesfully deleted'}));
            dispatch({
                type: DELETE_RELATION,
                payload: id
            });
        }).catch(err => console.log(err));
}

// ADD
export const addRelation = (relation) => dispatch => {
    axios.post("/api/relations/", relation)
        .then(res => {
            dispatch(createMessage({addRelation: 'Relation succesfully created'}));
            dispatch({
                type: ADD_RELATION,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT
export const editRelation = (relation, id) => dispatch => {
    axios.patch(`/api/relations/${id}/`, relation)
        .then(res => {
            dispatch(createMessage({editRelation: 'Relation succesfully updated'}));
            dispatch({
                type: EDIT_RELATION,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}