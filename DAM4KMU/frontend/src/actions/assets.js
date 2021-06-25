import axios from 'axios';
import { createMessage, returnErrors } from './messages';
import { GET_ASSETS, DELETE_ASSET, ADD_ASSET, EDIT_ASSET} from './types';

// GET ASSETS
export const getAssets = () => dispatch => {
    axios.get('/api/assets/')
        .then(res => {
            dispatch({
                type: GET_ASSETS,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// DELETE ASSET
export const deleteAsset = (id) => dispatch => {
    axios.delete(`/api/assets/${id}/`)
        .then(res => {
            dispatch(createMessage({deleteAsset: 'Asset succesfully deleted'}));
            dispatch({
                type: DELETE_ASSET,
                payload: id
            });
        }).catch(err => console.log(err));
}

// ADD ASSET
export const addAsset = (asset) => dispatch => {
    axios.post("/api/assets/", asset)
        .then(res => {
            dispatch(createMessage({addAsset: 'Asset succesfully created'}));
            dispatch({
                type: ADD_ASSET,
                payload: res.data
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}

// EDIT ASSET
export const editAsset = (asset, id) => dispatch => {
    axios.patch(`/api/assets/${id}/`, asset)
        .then(res => {
            dispatch(createMessage({editAsset: 'Asset succesfully updated'}));
            dispatch({
                type: EDIT_ASSET,
                payload: res.data,
                payload_patchId: id
            });
        }).catch(err => dispatch(returnErrors(err.response.data, err.response.status)));
}