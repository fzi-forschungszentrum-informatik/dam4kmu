import {
  GET_COMPONENTS,
  DELETE_COMPONENT,
  ADD_COMPONENT,
  EDIT_COMPONENT,
  GET_COMPONENTS_COST_BY_ID,
} from "../actions/types.js";

const initialState = {
  components: [],
  currentComponentsCost: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_COMPONENTS:
      return {
        ...state,
        components: action.payload,
      };
    case DELETE_COMPONENT:
      return {
        ...state,
        components: state.components.filter(
          (component) => component.id !== action.payload
        ),
      };
    case ADD_COMPONENT:
      return {
        ...state,
        components: [...state.components, action.payload],
      };

    case EDIT_COMPONENT:
      return {
        ...state,
        components: state.components.map((item) => {
          if (item.id !== action.payload_patchId) {
            return item;
          }
          return {
            ...action.payload,
          };
        }),
      };

    case GET_COMPONENTS_COST_BY_ID:
      return {
        ...state,
        currentComponentsCost: action.payload,
      };
    default:
      return state;
  }
}
