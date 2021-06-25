import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_TASKS, DELETE_TASK, ADD_TASK, EDIT_TASK} from './types';

// GET
export const getTasks = () => dispatch => {
    axios.get('/api/tasks/')
        .then(res => {
            dispatch({
                type: GET_TASKS,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE
export const deleteTask = (id) => dispatch => {
    axios.delete(`/api/tasks/${id}/`)
        .then(res => {
            dispatch(createMessage({deleteTask: 'Task succesfully deleted'}));
            dispatch({
                type: DELETE_TASK,
                payload: id
            });
        }).catch(err => console.log(err));
}

// ADD
export const addTask = (task) => dispatch => {
    axios.post("/api/tasks/", task)
        .then(res => {
            dispatch(createMessage({addTask: 'Task succesfully created'}));
            dispatch({
                type: ADD_TASK,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT
export const editTask = (task, id) => dispatch => {
    axios.patch(`/api/tasks/${id}/`, task)
        .then(res => {
            dispatch(createMessage({editTask: 'Task succesfully updated'}));
            dispatch({
                type: EDIT_TASK,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}