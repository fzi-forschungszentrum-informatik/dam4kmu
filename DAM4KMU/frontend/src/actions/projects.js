import axios from "axios";
import { createMessage, returnErrors } from "./messages";
import {GET_PROJECTS, DELETE_PROJECT, ADD_PROJECT, EDIT_PROJECT, ADD_ACTIVE_PROJECT, EDIT_ACTIVE_PROJECT} from "./types";

// GET
export const getProjects = () => (dispatch) => {
  axios
    .get("/api/projects/")
    .then((res) => {
      dispatch({
        type: GET_PROJECTS,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// DELETE
export const deleteProject = (id) => (dispatch) => {
  axios
    .delete(`/api/projects/${id}/`)
    .then((res) => {
      dispatch(createMessage({ deleteProject: "Project succesfully deleted" }));
      dispatch({
        type: DELETE_PROJECT,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

// ADD
export const addProject = (project) => (dispatch) => {
  axios
    .post("/api/projects/", project)
    .then((res) => {
      dispatch(createMessage({ addProject: "Project succesfully created" }));
      dispatch({
        type: ADD_PROJECT,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

// EDIT
export const editProject = (project, id) => (dispatch) => {
  axios
    .patch(`/api/projects/${id}/`, project)
    .then((res) => {
      dispatch(createMessage({ editProject: "Project succesfully updated" }));
      dispatch({
        type: EDIT_PROJECT,
        payload: res.data,
        payload_patchId: id,
      });
    })
    .catch((err) =>
      dispatch(returnErrors(err.response.data, err.response.status))
    );
};

export const addActiveProjects = (projects) => (dispatch) => {
  dispatch({
    type: ADD_ACTIVE_PROJECT,
    payload: projects,
  });
};

export const editActiveProjects = (new_cost, new_effort) => (dispatch) => {
  dispatch({
    type: EDIT_ACTIVE_PROJECT,
    payload_new_cost: new_cost,
    payload_new_effort: new_effort,
  });
};
