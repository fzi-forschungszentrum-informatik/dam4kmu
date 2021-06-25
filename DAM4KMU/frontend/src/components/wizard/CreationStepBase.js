import React, { Fragment, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import matchSorter from "match-sorter";

import ExampleAssistance from "./RequirementExampleAssistance";
import {
  getFilteredComponentsAutocompleteSuggestion,
  getAllRelatedAssets,
  extractText, 
  getWebInformation, 
  getNLIResults
} from "../../actions/ajax";
import { getSentences } from "../../actions/sentences";
import CustomDownshift from "../CustomDownshift";
import {
  AssistantButton,
  TitleLabelHolder,
  ItemLabelHolder,
  GroupTableHolder,
  ItemHolder,
  RequiredTag,
  CompCandidatesGroupHolder,
  ComponentCandidatesItemHolder,
  CustomHorizontalLine,
  OldSentenceHolder,
  EditSentenceButton,
} from "./WizardStyledComponents";
import RequirementAdditionalInfos from "./RequirementAdditionalInfos";
import TaskAdditionalInfos from "./TaskAdditionalInfos";
import OpenTasksTable from "./OpenTasksTable";
import "./Button.css";

// ##############################################
// ################ Function ####################
// ##############################################

var lastHighlightedIndexClicked = -1;

const CreationStepBase = ({
  srl,
  sentences,
  getSentences,
  allRelatedAssets,
  getAllRelatedAssets,
  updateForm,
  setIsChanged,
  extractText,
  toEdit,
  editProps,
  assetType,
  getFilteredComponentsAutocompleteSuggestion,
  filteredComponents,
  activeProjects,
  getWebInformation,
  getNLIResults,
  reqTypeProbability,
}) => {
  const [inputValue, setInputValue] = useState("");
  const oldSentence =
    toEdit && getSentenceWithId(editProps.sentence)
      ? getSentenceWithId(editProps.sentence).text
      : "";
  const [compCandidatesAC, setCompCandidatesAC] = useState([]);
  const [showEditSentence, setShowEditSentence] = useState(false);
  const toggleShowEditSentence = useCallback(() => {
    setShowEditSentence(!showEditSentence);
  }, [showEditSentence]);

  const [showRelatedAssets, setShowRelatedAssets] = useState(true);
  const toggleShowRelatedAssets = useCallback(() => {
    setShowRelatedAssets(!showRelatedAssets);
  }, [showRelatedAssets]);

  const componentCandidates = transformCompSRLListToHTMLlist(
    removeArticle(getCompCandidateFromSRL(srl))
  );

  const componentCandidatesAutocomplete = getCompCandidateFromAC(
    compCandidatesAC
  );

  const functionalReqProbability = reqTypeProbability
    ? (reqTypeProbability["F"] + reqTypeProbability["F_B"]).toFixed(2)
    : 0;
  const nonFunctionalReqProbability = reqTypeProbability
    ? (reqTypeProbability["NF"] + reqTypeProbability["NF_B"]).toFixed(2)
    : 0;

  function getSelectIndexDefaultValue(array, defValue) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].value === defValue) {
        return i;
      }
    }
  }

  function getSentenceWithId(sentenceId) {
    return sentences.find((sentence) => sentence.id === sentenceId);
  }

  function concatUniqueElements(parentList, toAddList) {
    if (toAddList[0] !== "") {
      for (var i = 0; i < toAddList.length; i++) {
        var toAdd = true;
        toAddList[i].split(" ").map((c) => {
          if (parentList.includes(c)) {
            toAdd = false;
          }
        });
        if (toAdd) {
          parentList.push(toAddList[i]);
        }
      }
      return parentList;
    } else {
      return parentList;
    }
  }
  function removeArticle(components) {
    const articles = ["das ", "der ", "die ", "den ", "des ", "dem "];
    return components.map((component) => {
      if (
        articles.some((article) => component.toLowerCase().includes(article))
      ) {
        return component.substring(4);
      } else {
        return component;
      }
    });
  }
  function getCompCandidateFromSRL(srl) {
    if (srl === undefined || srl.length == 0) {
      return [];
    }
    var combineComps = [];
    var refObjectComps = srl[3].refObject.split(", ");
    var objectComps = srl[3].object.split(", ");
    var parentComps = srl[3].pRefObject.split(", ");
    var attributeComps = srl[3].attribute.split(", ");
    var actorComps = srl[3].actor.split(", ");

    combineComps = concatUniqueElements(combineComps, refObjectComps);
    combineComps = concatUniqueElements(combineComps, objectComps);
    combineComps = concatUniqueElements(combineComps, parentComps);
    combineComps = concatUniqueElements(combineComps, attributeComps);
    combineComps = concatUniqueElements(combineComps, actorComps);

    return combineComps;
  }

  function transformCompSRLListToHTMLlist(list) {
    if (list === undefined || list.length == 0) {
      return "No Component detected";
    } else {
      return list.map((comp, idx) => {
        return <li key={idx}>Comp ID: -1 &nbsp;&nbsp; Comp Name: {comp}</li>;
      });
    }
  }

  function getCompCandidateFromAC(components) {
    if (components === undefined || components.length == 0) {
      return "No Component detected";
    } else {
      return components.map((comp, idx) => {
        return (
          <li key={idx}>
            Comp ID: {comp.comp_id} &nbsp;&nbsp; Comp Name: {comp.value}
          </li>
        );
      });
    }
  }

  function validateComponentsCandidateAC(
    input,
    components,
    toBeAddedComponents
  ) {
    for (var i = 0; i < components.length; i++) {
      // check if the candidate already exists
      if (
        toBeAddedComponents != null &&
        toBeAddedComponents.comp_id === components[i].comp_id
      ) {
        return;
      }
      // check if oldComponent are in input
      if (!input.includes(components[i].value)) {
        components.splice(i, 1);
        updateForm("comp_candidates", components);
      }
    }

    // add the new element
    if (toBeAddedComponents != null) {
      components.push(toBeAddedComponents);
      updateForm("comp_candidates", compCandidatesAC);
    }
  }

  useEffect(() => {
    getFilteredComponentsAutocompleteSuggestion();
    getSentences();
    if (toEdit) {
      getAllRelatedAssets([editProps.id], "single");
      //   triggerUpdateFormReqCategory(
      //     requirementCategory[
      //       getSelectIndexDefaultValue(requirementCategory, editProps.category)
      //     ]
      //   );
      //   triggerUpdateFormReqType(
      //     requirementType[
      //       getSelectIndexDefaultValue(requirementType, editProps.type)
      //     ]
      //   );
      updateForm("toEdit", true);
      updateForm("old_state", editProps);
      updateForm("old_sentence_text", oldSentence);
      updateForm("input_value", oldSentence);
      updateForm("projects", activeProjects);
      updateForm("old_relations", allRelatedAssets);
    }
  }, [oldSentence]);

  useEffect(() => {
    updateForm("projects", activeProjects);
  }, [activeProjects]);

  function getItems(inputValue) {
    const items = filteredComponents.map((c) => ({
      label: c.name + ", id:" + c.id,
      value: c.name,
      comp_id: c.id,
    }));

    var splittedInputValue = inputValue.split(" ");

    return inputValue
      ? matchSorter(items, splittedInputValue[splittedInputValue.length - 1], {
          keys: ["value"],
        })
      : items;
  }

  function isPrevComponentPresentInSentence(component, currentSentence) {
    if (currentSentence.includes(component)) {
      return "True";
    }
    return "False";
  }

  return (
    <Fragment>
      {toEdit ? (
        <TitleLabelHolder>
          Editing {assetType} [id:{editProps.id}]
        </TitleLabelHolder>
      ) : (
        <TitleLabelHolder>Create new {assetType}</TitleLabelHolder>
      )}
      <br />
      {assetType === "Req" ? (
        <RequirementAdditionalInfos
          updateForm={updateForm}
          editProps={editProps}
          setIsChanged={setIsChanged}
          functionalReqProbability={functionalReqProbability}
          nonFunctionalReqProbability={nonFunctionalReqProbability}
        />
      ) : assetType === "Task" ? (
        <TaskAdditionalInfos
          updateForm={updateForm}
          editProps={editProps}
          setIsChanged={setIsChanged}
        />
      ) : null}
      <ItemLabelHolder>
        Sentence<RequiredTag>*</RequiredTag>
      </ItemLabelHolder>
      {toEdit ? (
        <ItemHolder>
          <EditSentenceButton type="button" onClick={toggleShowEditSentence}>
            {showEditSentence ? "Cancel" : "Edit"}
          </EditSentenceButton>
          <OldSentenceHolder>{oldSentence}</OldSentenceHolder>
        </ItemHolder>
      ) : null}
      {!toEdit || showEditSentence ? (
        <>
          <CustomDownshift
            initialInputValue={toEdit ? oldSentence : inputValue}
            assetType={assetType}
            getItems={getItems}
            selectedItem={inputValue}
            onStateChange={(changes, state) => {
              if (
                changes.hasOwnProperty("highlightedIndex") &&
                changes.highlightedIndex !== null
              ) {
                lastHighlightedIndexClicked = changes.highlightedIndex;
              }
              if (changes.hasOwnProperty("inputValue")) {
                setIsChanged(true);
                if (changes.hasOwnProperty("selectedItem")) {
                  var splittedInputValue = inputValue.split(/ \s*/);
                  var itemQuery = splittedInputValue.pop();
                  setInputValue(
                    splittedInputValue.join(" ") + " " + changes.selectedItem
                  );
                  validateComponentsCandidateAC(
                    inputValue,
                    compCandidatesAC,
                    getItems(itemQuery)[lastHighlightedIndexClicked]
                  );
                } else {
                  setInputValue(changes.inputValue);
                }
                if (
                  changes.inputValue.substr(-1) == " " ||
                  changes.inputValue.substr(-1) == "."
                ) {
                  validateComponentsCandidateAC(
                    state.inputValue,
                    compCandidatesAC,
                    null
                  );
                  extractText({ text: state.inputValue });
                  updateForm("srl", srl);
                  updateForm("input_value", inputValue);
                  updateForm(
                    "req_type",
                    functionalReqProbability > nonFunctionalReqProbability
                      ? { value: "F-R", label: "Functional Requirement" }
                      : { value: "NF-R", label: "Non-Functional Requirement" }
                  );

                  if (!(srl === undefined || srl.length == 0)) {
                    updateForm(
                      "comp_candidates_srl",
                      removeArticle(getCompCandidateFromSRL(srl))
                    );
                  }
                }
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary btn-large mr-1 custombutton"
            disabled={inputValue.length == 0 || activeProjects.length == 0}
            onClick={() => {
              getWebInformation({ text: inputValue });
            }}
          >
            Start Research Assistant
          </button>
          <button
            type="button"
            className="btn btn-primary btn-large custombutton"
            disabled={inputValue.length == 0 || activeProjects.length == 0}
            onClick={() => {
              getNLIResults({ text: inputValue });
            }}
          >
            Find Conflicts / Entailments
          </button>
        </>
      ) : null}
      <br />
      {toEdit ? (
        <>
          <GroupTableHolder>
            <ItemLabelHolder>Related Assets</ItemLabelHolder>
            <EditSentenceButton type="button" onClick={toggleShowRelatedAssets}>
              {showRelatedAssets ? "Hide" : "Show"}
            </EditSentenceButton>
          </GroupTableHolder>
          {showRelatedAssets ? (
            allRelatedAssets.length === 0 ? (
              "No Assets detected that are related."
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>First Asset</th>
                    <th>Relation Type</th>
                    <th>Second Asset</th>
                    <th>Is Present</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {allRelatedAssets.map((t_asset) =>
                    t_asset.asset_id === editProps.id
                      ? t_asset.related_assets.map((asset) => (
                          <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>
                              {asset.first_asset + asset.first_asset_type}
                            </td>
                            <td>{asset.type}</td>
                            <td>
                              {asset.second_asset + asset.second_asset_type}
                            </td>
                            <td>
                              {asset.first_asset_type === "[Comp]"
                                ? isPrevComponentPresentInSentence(
                                    asset.first_asset,
                                    inputValue ? inputValue : oldSentence
                                  )
                                : asset.second_asset_type === "[Comp]"
                                ? isPrevComponentPresentInSentence(
                                    asset.second_asset,
                                    inputValue ? inputValue : oldSentence
                                  )
                                : "Not a component"}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                onChange={(event) => {
                                  asset.delete = event.target.checked;
                                  updateForm("old_relations", allRelatedAssets);
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      : null
                  )}
                </tbody>
              </table>
            )
          ) : null}
        </>
      ) : null}
      <br />
      {assetType === "Req" && toEdit ? (
        <OpenTasksTable
          editProps={editProps}
          toEdit={toEdit}
          activeProjects={activeProjects}
        />
      ) : null}
      <br />
      <CustomHorizontalLine />
      <ExampleAssistance
        srl={srl}
        assetType={assetType}
        inputValue={inputValue}
      />

      <CompCandidatesGroupHolder>
        <ComponentCandidatesItemHolder>
          <ItemLabelHolder>Comp. Candidate SRL</ItemLabelHolder>
          <ul>{componentCandidates}</ul>
        </ComponentCandidatesItemHolder>
        <ComponentCandidatesItemHolder>
          <ItemLabelHolder>Comp. Candidate Autocomplete</ItemLabelHolder>
          <ul>{componentCandidatesAutocomplete}</ul>
        </ComponentCandidatesItemHolder>
      </CompCandidatesGroupHolder>
    </Fragment>
  );
};

CreationStepBase.propTypes = {
  srl: PropTypes.array.isRequired,
  sentences: PropTypes.array.isRequired,
  allRelatedAssets: PropTypes.array.isRequired,
  filteredComponents: PropTypes.array.isRequired,
  extractText: PropTypes.func.isRequired,
  getFilteredComponentsAutocompleteSuggestion: PropTypes.func.isRequired,
  getSentences: PropTypes.func.isRequired,
  getAllRelatedAssets: PropTypes.func.isRequired,
  getWebInformation: PropTypes.func.isRequired,
  getNLIResults: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  srl: state.ajax.srl,
  sentences: state.sentences.sentences,
  filteredComponents: state.ajax.filteredComponents,
  allRelatedAssets: state.ajax.allRelatedAssets,
});

export default connect(mapStateToProps, {
  extractText,
  getFilteredComponentsAutocompleteSuggestion,
  getSentences,
  getAllRelatedAssets,
  getWebInformation,
  getNLIResults,
})(CreationStepBase);
