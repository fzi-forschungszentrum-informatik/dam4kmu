import {
  GET_RELATED_COMPONENTS_FROM_PROJECT,
  GET_RELATED_COMPONENTS_FROM_DOWNSHIFT,
  GET_FILTERED_COMPONENTS_AUTOCOMPLETE_SUGGESTION,
  SAVE_BUTTON_COMPONENT_WIZARD,
  SUBMIT_REQUIREMENT,
  EDIT_WORD_IN_SENTENCE,
  EDIT_REQ_PRIORITY_AFTER_EFFECT,
  EDIT_COMPONENT_AFTER_EFFECT,
  GET_PROJECT_EFFORT_AND_COST,
  SUBMIT_TASK,
  GET_ALL_RELATED_ASSETS,
  GET_RELATED_ASSET_FROM_PROJECT,
  GET_ASSET_TEXT_WITH_NO_RELATED_PROJECT,
  GET_OPEN_TASKS,
  GET_EXISTING_COMPONENTS_WITH_SAME_NAME,
  GET_WEB_INFORMATION,
  GET_NLI_RESULTS,
  EMPTY_SRL, 
  EXTRACT_TEXT
} from "../actions/types.js";

const initialState = {
  treeData: [],
  filteredComponents: [],
  projectProperties: [],
  allRelatedAssets: [],
  activeProjectsAllRelatedAssets: [],
  projectFilteredAssets: {
    task: [],
    requirement: [],
  },
  assetTextWithNoRelatedProject: {
    task: [],
    requirement: [],
  },
  openTasks: [],
  existingComponentsWithSameName: [],
  webInfos: [],
  nli_results: [],
  srl: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_RELATED_COMPONENTS_FROM_PROJECT:
      console.log(action.payload);
      return {
        ...state,
        treeData: action.payload,
      };

    case GET_RELATED_COMPONENTS_FROM_DOWNSHIFT:
      console.log(action.payload);
      return {
        ...state,
        treeData: action.payload,
      };

    case GET_FILTERED_COMPONENTS_AUTOCOMPLETE_SUGGESTION:
      console.log(action.payload);
      return {
        ...state,
        filteredComponents: action.payload,
      };

    case SAVE_BUTTON_COMPONENT_WIZARD:
      console.log(action.payload);
      return {
        ...state,
        treeData: [],
        filteredComponents: [],
      };

    case SUBMIT_REQUIREMENT:
      console.log(action.payload);
      return {
        ...state,
      };

    case SUBMIT_TASK:
      console.log(action.payload);
      return {
        ...state,
      };

    case EDIT_WORD_IN_SENTENCE:
      console.log(action.payload);
      return {
        ...state,
      };

    case EDIT_REQ_PRIORITY_AFTER_EFFECT:
      console.log(action.payload);
      return {
        ...state,
      };

    case EDIT_COMPONENT_AFTER_EFFECT:
      console.log(action.payload);
      return {
        ...state,
      };

    case GET_PROJECT_EFFORT_AND_COST:
      var isNew = true;
      var modifiedPayload = state.projectProperties.map((item) => {
        if (item.id !== action.payload.id) {
          return item;
        }
        isNew = false;
        return {
          ...action.payload,
        };
      });
      if (isNew) {
        modifiedPayload.push(action.payload);
      }
      return {
        ...state,
        projectProperties: modifiedPayload,
      };

    case GET_ALL_RELATED_ASSETS:
      console.log(action.payload);
      if (action.payload.type === "active_project") {
        return {
          ...state,
          activeProjectsAllRelatedAssets: action.payload.value,
        };
      } else {
        return {
          ...state,
          allRelatedAssets: action.payload.value,
        };
      }

    case GET_RELATED_ASSET_FROM_PROJECT:
      console.log(action.payload);
      if (action.payload.type === "Req") {
        return {
          ...state,
          projectFilteredAssets: {
            task: [],
            requirement: action.payload.value,
          },
        };
      } else {
        return {
          ...state,
          projectFilteredAssets: {
            requirement: [],
            task: action.payload.value,
          },
        };
      }

    case GET_ASSET_TEXT_WITH_NO_RELATED_PROJECT:
      console.log(action.payload);
      if (action.payload.type === "Req") {
        return {
          ...state,
          assetTextWithNoRelatedProject: {
            task: [],
            requirement: action.payload.value,
          },
        };
      } else {
        return {
          ...state,
          assetTextWithNoRelatedProject: {
            requirement: [],
            task: action.payload.value,
          },
        };
      }

    case GET_OPEN_TASKS:
      console.log(action.payload);
      return {
        ...state,
        openTasks: action.payload,
      };

    case GET_EXISTING_COMPONENTS_WITH_SAME_NAME:
      console.log(action.payload);
      return {
        ...state,
        existingComponentsWithSameName: action.payload,
      };

    case EXTRACT_TEXT:
        console.log(action.payload)
        return {
            ...state,
            srl: action.payload
        };

    case EMPTY_SRL:
        console.log("Emptying SRL");
        return {
            ...state,
            srl: []
        }

    case GET_WEB_INFORMATION:
        console.log(action.payload)
        return {
            ...state,
            webInfos: [action.payload, ...state.webInfos]
        };

    case GET_NLI_RESULTS:
        console.log(action.payload)
        return {
            ...state,
            nli_results: [action.payload, ...state.nli_results]
        };
    default:
        return state;

  }
}
