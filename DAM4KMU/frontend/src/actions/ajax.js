import axios from 'axios';
import {
    GET_RELATED_COMPONENTS_FROM_PROJECT,
    GET_RELATED_COMPONENTS_FROM_DOWNSHIFT, 
    GET_FILTERED_COMPONENTS_AUTOCOMPLETE_SUGGESTION,
    SAVE_BUTTON_COMPONENT_WIZARD, SUBMIT_REQUIREMENT,
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
    EXTRACT_TEXT, 
    EMPTY_SRL,
    GET_WEB_INFORMATION,
    GET_NLI_RESULTS
} from './types'


/*
#===================================================
#===================================================
#=                      General                    =
#===================================================
#===================================================
*/

export const getRelatedComponentsFromProject = (project_id) => dispatch => {
    console.log(project_id)
    axios.post('axios/getRelatedComponentsFromProject/', project_id)
        .then(res => {
            dispatch({
                type: GET_RELATED_COMPONENTS_FROM_PROJECT,
                payload: res.data
            })
        })
    
}

export const getRelatedComponentsFromDownshift = (comp_id, treeData) => dispatch => {
    console.log(comp_id)
    console.log(treeData)
    axios.post('axios/getRelatedComponentsFromDownshift/', {comp_id, treeData})
        .then(res => {
            dispatch({
                type: GET_RELATED_COMPONENTS_FROM_DOWNSHIFT,
                payload: res.data
            })
        })
    
}

export const getFilteredComponentsAutocompleteSuggestion = () => dispatch => {
    axios.post('axios/getFilteredComponentsAutocompleteSuggestion/')
        .then(res => {
            dispatch({
                type: GET_FILTERED_COMPONENTS_AUTOCOMPLETE_SUGGESTION,
                payload: res.data
            })
        })
    
}

export const saveButtonComponentWizard = (treeData, toBeDeletedRelations, projectId, updateAllReferencesComponent) => dispatch => {
    console.log(treeData)
    console.log(toBeDeletedRelations)
    console.log(projectId)
    axios.post('axios/saveButtonComponentWizard/', {treeData, toBeDeletedRelations, projectId, updateAllReferencesComponent})
        .then(res => {
            dispatch({
                type: SAVE_BUTTON_COMPONENT_WIZARD,
                payload: res.data
            })
        })
    
}

export const submitRequirement = (form, checkedComponents, parentChildCheckedRelations) => dispatch => {
    console.log(form)
    console.log(checkedComponents)
    axios.post('axios/submitRequirement/', {form, checkedComponents, parentChildCheckedRelations})
        .then(res => {
            dispatch({
                type: SUBMIT_REQUIREMENT,
                payload: res.data
            })
        })
    
}

export const submitTask = (form, checkedComponents, parentChildCheckedRelations) => dispatch => {
    console.log(form)
    console.log(checkedComponents)
    axios.post('axios/submitTask/', {form, checkedComponents, parentChildCheckedRelations})
        .then(res => {
            dispatch({
                type: SUBMIT_TASK,
                payload: res.data
            })
        })
    
}

export const editWordInSentence = (word, sentence_id) => dispatch => {
    console.log(word)
    console.log(sentence_id)
    axios.post('axios/editWordInSentence/', {word, sentence_id})
        .then(res => {
            dispatch({
                type: EDIT_WORD_IN_SENTENCE,
                payload: res.data
            })
        })
    
}

export const editReqPriorityAfterEffect = (priority, sentence_id) => dispatch => {
    console.log(priority)
    console.log(sentence_id)
    axios.post('axios/editReqPriorityAfterEffect/', {priority, sentence_id})
        .then(res => {
            dispatch({
                type: EDIT_REQ_PRIORITY_AFTER_EFFECT,
                payload: res.data
            })
        })
    
}

export const editComponentAfterEffect = (comp_name, comp_oldName, comp_id) => dispatch => {
    axios.post('axios/editComponentAfterEffect/', {comp_name, comp_oldName, comp_id})
        .then(res => {
            dispatch({
                type: EDIT_COMPONENT_AFTER_EFFECT,
                payload: res.data
            })
        })
    
}

export const getProjectEffortAndCost = (project_id) => dispatch => {
    console.log(project_id)
    axios.post('axios/getProjectEffortAndCost/', project_id)
        .then(res => {
            dispatch({
                type: GET_PROJECT_EFFORT_AND_COST,
                payload: res.data
            })
        })
    
}

export const getAllRelatedAssets = (asset_ids, layout_type) => dispatch => {
    axios.post('axios/getAllRelatedAssets/', {asset_ids, layout_type})
        .then(res => {
            dispatch({
                type: GET_ALL_RELATED_ASSETS,
                payload: res.data
            })
        })   
}

export const getRelatedAssetFromProject = (active_projects, asset_type) => dispatch => {
    axios.post('axios/getRelatedAssetFromProject/', {active_projects, asset_type})
        .then(res => {
            dispatch({
                type: GET_RELATED_ASSET_FROM_PROJECT,
                payload: res.data
            })
        })
    
}

export const getAssetTextWithNoRelatedProject = (asset_type) => dispatch => {
    axios.post('axios/getAssetTextWithNoRelatedProject/', asset_type)
        .then(res => {
            dispatch({
                type: GET_ASSET_TEXT_WITH_NO_RELATED_PROJECT,
                payload: res.data
            })
        })   
}

export const getOpenTasks = (asset_id) => dispatch => {
    axios.post('axios/getOpenTasks/', asset_id)
        .then(res => {
            dispatch({
                type: GET_OPEN_TASKS,
                payload: res.data
            })
        })   
}

export const getExistingComponentsWithSameName = (comp_names) => dispatch => {
    axios.post('axios/getExistingComponentsWithSameName/', comp_names)
        .then(res => {
            dispatch({
                type: GET_EXISTING_COMPONENTS_WITH_SAME_NAME,
                payload: res.data
            })
        })   
}

/*
#===================================================
#===================================================
#=                   Spacy Parser                  =
#===================================================
#===================================================
*/

export const extractText = (text) => dispatch => {
    axios.post('axios/extractText/', text)
        .then(res => {
            dispatch({
                type: EXTRACT_TEXT,
                payload: res.data
            })
        })
}

export const emptySRL = () => dispatch => {
    dispatch({
        type: EMPTY_SRL
    })
}

/*
#===================================================
#===================================================
#=             OpenIE / Research Assistant         =
#===================================================
#===================================================
*/

export const getWebInformation = (text) => dispatch => {
    axios.post('axios/getWebInformation/', text).then(res => {
      console.log("res: ", res);
      dispatch({
        type: GET_WEB_INFORMATION,
        payload: res.data,
      });
    });
  };

/*
#===================================================
#===================================================
#=                    NLI Module                   =
#===================================================
#===================================================
*/

export const getNLIResults = (text) => dispatch => {
  axios.post('axios/getNLIResults/', text).then(res => {
    console.log("res: ", res);
    dispatch({
      type: GET_NLI_RESULTS,
      payload: res.data,
    });
  });
};



