import {
  GET_PROJECTS,
  DELETE_PROJECT,
  ADD_PROJECT,
  EDIT_PROJECT,
  ADD_ACTIVE_PROJECT,
  EDIT_ACTIVE_PROJECT
} from "../actions/types.js";

const initialState = {
  projects: [],
  activeProjects: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
      };
    case DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
      };
    case ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    case EDIT_PROJECT:
      return {
        ...state,
        projects: state.projects.map((item) => {
          if (item.id !== action.payload_patchId) {
            return item;
          }
          return {
            ...action.payload,
          };
        }),
      };

    case ADD_ACTIVE_PROJECT:
      console.log(action.payload);
      return {
        ...state,
        activeProjects: action.payload,
      };

    case EDIT_ACTIVE_PROJECT:
      return Object.assign({}, state, {
        ...state,
        activeProjects: state.activeProjects.map((item) => {
          item.new_cost = action.payload_new_cost;
          item.new_effort = action.payload_new_effort;
          return item;
        }),
      });

    default:
      return state;
  }
}
