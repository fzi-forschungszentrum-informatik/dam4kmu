import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_REQUIREMENTS, DELETE_REQUIREMENT, ADD_REQUIREMENT, EDIT_REQUIREMENT} from './types';

// GET
export const getRequirements = () => dispatch => {
    axios.get('/api/requirements/')
        .then(res => {
            dispatch({
                type: GET_REQUIREMENTS,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE
export const deleteRequirement = (sentence_id) => dispatch => {
    axios.delete(`/api/requirements/${sentence_id}/`)
        .then(res => {
            dispatch(createMessage({deleteRequirement: 'Requirement succesfully deleted'}));
            dispatch({
                type: DELETE_REQUIREMENT,
                payload: sentence_id
            });
        }).catch(err => console.log(err));
}

// ADD
export const addRequirement = (requirement) => dispatch => {
    axios.post("/api/requirements/", requirement)
        .then(res => {
            dispatch(createMessage({addRequirement: 'Requirement succesfully created'}));
            dispatch({
                type: ADD_REQUIREMENT,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT
export const editRequirement = (requirement, id) => dispatch => {
    axios.patch(`/api/requirements/${id}/`, requirement)
        .then(res => {
            dispatch(createMessage({editRequirement: 'Requirement succesfully updated'}));
            dispatch({
                type: EDIT_REQUIREMENT,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}