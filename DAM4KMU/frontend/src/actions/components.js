import axios from "axios";
import { createMessage, returnErrors } from "./messages";
import {GET_COMPONENTS, DELETE_COMPONENT, ADD_COMPONENT, EDIT_COMPONENT, GET_COMPONENTS_COST_BY_ID} from "./types";

// GET
export const getComponents = () => (dispatch) => {
  axios
    .get("/api/components/")
    .then((res) => {
      dispatch({
        type: GET_COMPONENTS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE
export const deleteComponent = (id) => (dispatch) => {
  axios
    .delete(`/api/components/${id}/`)
    .then((res) => {
      dispatch(
        createMessage({ deleteComponent: "Component succesfully deleted" })
      );
      dispatch({
        type: DELETE_COMPONENT,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD
export const addComponent = (component) => (dispatch) => {
  axios
    .post("/api/components/", component)
    .then((res) => {
      dispatch(
        createMessage({ addComponent: "Component succesfully created" })
      );
      dispatch({
        type: ADD_COMPONENT,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// EDIT
export const editComponent = (component, id) => (dispatch) => {
  axios
    .patch(`/api/components/${id}/`, component)
    .then((res) => {
      dispatch(
        createMessage({ editComponent: "Component succesfully updated" })
      );
      dispatch({
        type: EDIT_COMPONENT,
        payload: res.data,
        payload_patchId: id,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// GET COST
export const getComponentsCostById = (comps) => (dispatch) => {
  axios.post("axios/getComponentsCostById/", comps).then((res) => {
    dispatch({
      type: GET_COMPONENTS_COST_BY_ID,
      payload: res.data,
    });
  });
};
