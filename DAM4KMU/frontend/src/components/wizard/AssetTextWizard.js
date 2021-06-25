import React, { Fragment, useState, useEffect } from "react";
import StepWizard from "react-step-wizard";
import { Link } from "react-router-dom";
import Select from "react-select";
import { connect } from "react-redux";
import { Prompt } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";

import { editActiveProjects } from "../../actions/projects";
import { getComponentsCostById } from "../../actions/components";
import { submitRequirement, submitTask, getExistingComponentsWithSameName, emptySRL } from "../../actions/ajax";

import CreationStepBase from "./CreationStepBase";

const ItemContentHolder = styled.div`
  width: 30%;
  padding: 0 4px;
`;

const CustomSelect = styled(Select)`
  max-width: 75px;
  width: 100%;
  margin-left: 2px;
`;

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: 30,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 4,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: variables.colorPrimaryLighter,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0px 6px",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
};

const SmallItemContentHolder = styled.div`
    width: 16%;
    padding 0 4px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
`;

const ItemRowHolder = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const AssetTextWizard = ({
  props,
  submitRequirement,
  submitTask,
  getExistingComponentsWithSameName,
  existingComponentsWithSameName,
  getComponentsCostById,
  currentComponentsCost,
  editActiveProjects,
  activeProjects,
  emptySRL,
}) => {
  const toEdit = props.location.state.toEdit;
  const assetType = props.location.state.assetType;
  const editProps = toEdit ? props.location.state.editProps : null;

  const [state, updateState] = useState({
    form: {},
  });

  const [isChanged, setIsChanged] = useState(false);

  const updateForm = (key, value) => {
    const { form } = state;

    form[key] = value;
    updateState({
      ...state,
      form,
    });
    console.log(form);
  };

  const onStepChange = (stats) => {
    if ("comp_candidates" in state.form) {
      getComponentsCostById(state.form.comp_candidates);
    }
    if ("comp_candidates_srl" in state.form) {
      getExistingComponentsWithSameName(state.form.comp_candidates_srl);
    }
  };

  const setInstance = (SW) =>
    updateState({
      ...state,
      SW,
    });

  const { SW, demo } = state;

  return (
    <div className="container">
      <Prompt
        when={isChanged}
        message={(location) => {
          // reset srl and comp_cost
          editActiveProjects(0, 0);
          emptySRL();
          return location.pathname.startsWith("/app")
            ? true
            : `Are you sure you want to go to ${location.pathname}?`;
        }}
      />
      <h4>Asset Text Wizard</h4>
      <hr />
      <StepWizard onStepChange={onStepChange} instance={setInstance}>
        <AssetTextStepContainer
          updateForm={updateForm}
          form={state.form}
          setIsChanged={setIsChanged}
          activeProjects={activeProjects}
          toEdit={toEdit}
          assetType={assetType}
          editProps={editProps}
        />
        <RelationDialogStepContainer
          form={state.form}
          submitRequirement={submitRequirement}
          submitTask={submitTask}
          existingComponentsWithSameName={existingComponentsWithSameName}
          assetType={assetType}
          getComponentsCostById={getComponentsCostById}
          currentComponentsCost={currentComponentsCost}
          editActiveProjects={editActiveProjects}
          setIsChanged={setIsChanged}
        />
      </StepWizard>
      {demo && SW && <InstanceDemo SW={SW} />}
    </div>
  );
};

/** Demo of using instance */
const InstanceDemo = ({ SW }) => (
  <Fragment>
    <h4>Control from outside component</h4>
    <button className={"btn btn-secondary"} onClick={SW.previousStep}>
      Previous Step
    </button>
    &nbsp;
    <button className={"btn btn-secondary"} onClick={SW.nextStep}>
      Next Step
    </button>
  </Fragment>
);

/**
 * Stats Component - to illustrate the possible functions
 * Could be used for nav buttons or overview
 */
const Stats = ({
  nextStep,
  previousStep,
  totalSteps,
  step,
  isValid,
  assetType,
  hasPriority,
}) => (
  <div>
    <hr />
    {step > 1 && (
      <button className="btn btn-default btn-block" onClick={previousStep}>
        Go Back
      </button>
    )}
    {step < totalSteps ? (
      <button
        className="btn btn-primary btn-block"
        disabled={!isValid}
        onClick={nextStep}
        title={
          hasPriority
            ? null
            : "Priority is missing in text! To continue please type a priority.(muss, sollte, kann, oder wird)"
        }
      >
        Continue
      </button>
    ) : assetType === "Req" ? (
      <Link to="/reqTextHome">
        <button className="btn btn-success btn-block" onClick={nextStep}>
          Submit Requirement
        </button>
      </Link>
    ) : assetType === "Task" ? (
      <Link to="/taskTextHome">
        <button className="btn btn-success btn-block" onClick={nextStep}>
          Submit Task
        </button>
      </Link>
    ) : null}
    <hr />
  </div>
);

// /** Steps */

const AssetTextStepContainer = (props) => {
  const hasPriority = () => {
    if (
      "srl" in props.form &&
      props.form.srl[3] !== undefined &&
      props.form.srl[3].priority !== ""
    ) {
      return true;
    }
    return false;
  };
  const validate = () => {
    if (props.toEdit) {
      return true;
    }

    if (
      (("req_category" in props.form && "req_type" in props.form) ||
        ("task_effort" in props.form && "task_status" in props.form)) &&
      "projects" in props.form
    ) {
      if (props.form.input_value != "" && props.form.projects.length >= 1) {
        if (hasPriority()) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div>
      <CreationStepBase
        updateForm={props.updateForm}
        setIsChanged={props.setIsChanged}
        activeProjects={props.activeProjects}
        toEdit={props.toEdit}
        editProps={props.editProps}
        assetType={props.assetType}
        reqTypeProbability={"srl" in props.form ? props.form["srl"][2] : null}
      />

      <Stats
        step={1}
        isValid={validate()}
        hasPriority={hasPriority()}
        {...props}
      />
    </div>
  );
};

const RelationDialogStepContainer = (props) => {
  const [parentChildCheckedRelations, setParentChildCheckedRelation] = useState(
    []
  );
  const [relationToBeAddedSRL, setRelationToBeAddedSRL] = useState([]);
  const [relationToBeAddedAC, setRelationToBeAddedAC] = useState([]);
  const [combinedComponents, setCombinedComponents] = useState([]);
  const compsCheckbox = createCombineComponentsCheckbox(props.form);

  useEffect(() => {
    if ("srl" in props.form && props.form.srl.length !== 0) {
      if (props.form.srl[4].length !== 0) {
        setParentChildCheckedRelation(
          props.form.srl[4].map((parChildRelation) => {
            return { ...parChildRelation, isExcluded: false };
          })
        );
      } else {
        setParentChildCheckedRelation([]);
      }
    }

    if (
      "comp_candidates_srl" in props.form &&
      props.form.comp_candidates_srl.length !== 0
    ) {
      setRelationToBeAddedSRL(
        props.form.comp_candidates_srl.map((comp) => {
          return {
            comp_name: comp,
            comp_id: -1,
            cost: 0,
            isExcluded: false,
            id_option: getExistingComponentOptionByName(comp),
          };
        })
      );
    } else {
      setRelationToBeAddedSRL([]);
    }

    if (
      "comp_candidates" in props.form &&
      props.form.comp_candidates.length !== 0
    ) {
      setRelationToBeAddedAC(
        props.form.comp_candidates.map((comp) => {
          return {
            comp_name: comp.value,
            comp_id: comp.comp_id,
            cost: getComponentCostById(comp.comp_id),
            isExcluded: false,
            id_option: null,
          };
        })
      );
    } else {
      setRelationToBeAddedAC([]);
    }
  }, [props.form.srl, props.existingComponentsWithSameName]);

  useEffect(() => {
    setCombinedComponents(getCombinedComponents());
  }, [relationToBeAddedSRL, relationToBeAddedAC]);

  const submit = () => {
    if (props.assetType === "Req") {
      props.submitRequirement(
        props.form,
        combinedComponents,
        parentChildCheckedRelations
      );
    } else if (props.assetType === "Task") {
      props.submitTask(
        props.form,
        combinedComponents,
        parentChildCheckedRelations
      );
    }
    props.setIsChanged(false);
    props.editActiveProjects(0, 0);
    alert(`New ${props.assetType} has been created succesfully.`);
  };

  function transformParentChildListToHTMLList(list) {
    if (list !== []) {
      return list.map((elem, idx) => {
        return (
          <li key={idx}>
            Parent: {elem.parent} &nbsp;&nbsp; Children:{" "}
            {elem.children.toString()} &nbsp;&nbsp; IsExcluded: &nbsp;
            <input
              type="checkbox"
              onChange={(event) => {
                let currentCheckedComponents = [...parentChildCheckedRelations];
                currentCheckedComponents[idx].isExcluded = event.target.checked;
                setParentChildCheckedRelation(currentCheckedComponents);
                console.log(parentChildCheckedRelations);
              }}
            />
          </li>
        );
      });
    }
  }

  function getExistingComponentOptionByName(comp_name) {
    var options = null;
    props.existingComponentsWithSameName.map((comp) => {
      if (comp.name === comp_name) {
        options = comp.existing_comps;
      }
    });
    return options;
  }

  function getComponentCostById(comp_id) {
    var cost = 0;
    props.currentComponentsCost.map((comp) => {
      if (comp.comp_id === comp_id) {
        cost = comp.cost;
      }
    });
    return cost;
  }

  function getNewComponentsTotalCost(components) {
    var total_cost = 0;
    components.map((comp) => {
      if (comp.isExcluded === false) {
        total_cost += comp.cost;
      }
    });
    return total_cost;
  }

  function getCombinedComponents() {
    let comb_comps = [];
    if (relationToBeAddedSRL.length !== 0) {
      comb_comps = relationToBeAddedSRL.slice();
    }
    if (relationToBeAddedAC.length !== 0) {
      var toAdd = false;
      for (var i = 0; i < relationToBeAddedAC.length; i++) {
        toAdd = true;
        for (var j = 0; j < comb_comps.length; j++) {
          if (relationToBeAddedAC[i].comp_name === comb_comps[j].comp_name) {
            comb_comps[j] = relationToBeAddedAC[i];
            toAdd = false;
            break;
          }
        }
        if (toAdd) {
          comb_comps.push(relationToBeAddedAC[i]);
        }
      }
    }
    return comb_comps;
  }

  function createCombineComponentsCheckbox(form) {
    if (combinedComponents.length !== 0) {
      return combinedComponents.map((comp, idx) => {
        return (
          <li key={idx}>
            <ItemRowHolder>
              {comp.id_option && comp.id_option.length !== 0 ? (
                <SmallItemContentHolder>
                  Comp ID:
                  <CustomSelect
                    options={[
                      { value: { id: -1, cost: 0 }, label: -1 },
                      ...comp.id_option.map((innerComp) => {
                        return { value: innerComp, label: innerComp.id };
                      }),
                    ]}
                    onChange={(value) => {
                      let currentCheckedComponents = [...combinedComponents];
                      currentCheckedComponents[idx].comp_id = value.value.id;
                      currentCheckedComponents[idx].cost = value.value.cost;
                      props.editActiveProjects(
                        getNewComponentsTotalCost(combinedComponents),
                        "task_effort" in form ? parseInt(form.task_effort) : 0
                      );
                    }}
                    placeholder={"Select an Id..."}
                    defaultValue={{ value: { id: -1 }, label: -1 }}
                    styles={customStyles}
                  />
                </SmallItemContentHolder>
              ) : (
                <SmallItemContentHolder>
                  Comp ID: {comp.comp_id}
                </SmallItemContentHolder>
              )}
              <ItemContentHolder>
                Comp Name: {comp.comp_name} &nbsp;&nbsp;
              </ItemContentHolder>
              <SmallItemContentHolder>
                IsExcluded: &nbsp;
                <input
                  type="checkbox"
                  onChange={(event) => {
                    let currentCheckedComponents = [...combinedComponents];
                    currentCheckedComponents[idx].isExcluded =
                      event.target.checked;
                    props.editActiveProjects(
                      getNewComponentsTotalCost(combinedComponents),
                      "task_effort" in form ? parseInt(form.task_effort) : 0
                    );
                  }}
                />
              </SmallItemContentHolder>
              {comp.comp_id === -1 ? (
                <ItemContentHolder>
                  Cost: &nbsp;
                  <input
                    style={{ width: "100px" }}
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    onChange={(event) => {
                      var currentCheckedComponents = [...combinedComponents];
                      currentCheckedComponents[idx].cost =
                        event.target.value === ""
                          ? 0
                          : parseInt(event.target.value);
                      props.editActiveProjects(
                        getNewComponentsTotalCost(combinedComponents),
                        "task_effort" in form ? parseInt(form.task_effort) : 0
                      );
                      console.log(combinedComponents);
                    }}
                    defaultValue={0}
                  />
                  &euro;
                </ItemContentHolder>
              ) : (
                <ItemContentHolder>Cost: {comp.cost}&euro;</ItemContentHolder>
              )}
            </ItemRowHolder>
          </li>
        );
      });
    } else {
      return "No Component Detected";
    }
  }

  return (
    <div>
      <h4>Relation to be added:</h4>
      <ul>{compsCheckbox}</ul>
      <hr />
      <h4>Parent-Child relation to be added:</h4>
      <ul>{transformParentChildListToHTMLList(parentChildCheckedRelations)}</ul>
      <hr />

      <Stats
        step={2}
        assetType={props.assetType}
        {...props}
        nextStep={submit}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  currentComponentsCost: state.components.currentComponentsCost,
  activeProjects: state.projects.activeProjects,
  existingComponentsWithSameName: state.ajax.existingComponentsWithSameName,
});

AssetTextWizard.propTypes = {
  currentComponentsCost: PropTypes.array.isRequired,
  submitRequirement: PropTypes.func.isRequired,
  getComponentsCostById: PropTypes.func.isRequired,
  existingComponentsWithSameName: PropTypes.func.isRequired,
  editActiveProjects: PropTypes.func.isRequired,
  emptySRL: PropTypes.func.isRequired,
  activeProjects: PropTypes.array.isRequired,
  submitTask: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, {
  submitRequirement,
  submitTask,
  editActiveProjects,
  emptySRL,
  getComponentsCostById,
  getExistingComponentsWithSameName,
})(AssetTextWizard);
