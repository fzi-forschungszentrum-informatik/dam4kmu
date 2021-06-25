import React, { Fragment, useEffect} from "react";
import { editActiveProjects } from "../../actions/projects";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  ItemLabelHolder,
  GroupHolder,
  CustomSelect,
  RequiredTag,
  ItemContentHolder,
  ItemHolder,
} from "./WizardStyledComponents";

const TaskAdditionalInfos = ({
  updateForm,
  editProps,
  setIsChanged,
  editActiveProjects,
}) => {
  function getSelectIndexDefaultValue(array, defValue) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].value === defValue) {
        return i;
      }
    }
  }

  useEffect(() => {
    updateForm("task_start_date", new Date().toISOString().substr(0, 19))
    updateForm("task_end_date", new Date().toISOString().substr(0, 19))
    updateForm("task_status", taskStatusOptions[0])
    updateForm("task_effort", 0)
  }, []);

  return (
    <Fragment>
      <GroupHolder>
        <ItemHolder>
          <ItemLabelHolder>Start Date:</ItemLabelHolder>
          <ItemContentHolder>
            <input
              type="datetime-local"
              name="startDate"
              defaultValue={
                editProps
                  ? editProps.start_date
                  : new Date().toISOString().substr(0, 19)
              }
              onChange={(e) => updateForm("task_start_date", e.target.value)}
            />
          </ItemContentHolder>
        </ItemHolder>
        <ItemHolder>
          <ItemLabelHolder>End Date:</ItemLabelHolder>
          <ItemContentHolder>
            <input
              type="datetime-local"
              name="endDate"
              defaultValue={
                editProps
                  ? editProps.end_date
                  : new Date().toISOString().substr(0, 19)
              }
              onChange={(e) => updateForm("task_end_date", e.target.value)}
            />
          </ItemContentHolder>
        </ItemHolder>
      </GroupHolder>
      <GroupHolder>
        <ItemHolder>
          <ItemLabelHolder>
            Effort<RequiredTag>*</RequiredTag>:
          </ItemLabelHolder>
          <ItemContentHolder>
            <input
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              name="effort"
              onChange={(e) => {
                setIsChanged(true);
                updateForm("task_effort", e.target.value);
                editActiveProjects(0, parseInt(e.target.value));
              }}
              defaultValue={editProps ? editProps.effort : 0}
            />{" "}
            hour
          </ItemContentHolder>
        </ItemHolder>
        <ItemHolder>
          <ItemLabelHolder>
            Status<RequiredTag>*</RequiredTag>:
          </ItemLabelHolder>
          <CustomSelect
            options={taskStatusOptions}
            onChange={(changes) => {
              updateForm("task_status", changes);
              setIsChanged(true);
            }}
            placeholder={"Select a status..."}
            defaultValue={
              editProps
                ? taskStatusOptions[
                    getSelectIndexDefaultValue(
                      taskStatusOptions,
                      editProps.status
                    )
                  ]
                : taskStatusOptions[0]
            }
          />
        </ItemHolder>
      </GroupHolder>
    </Fragment>
  );
};

TaskAdditionalInfos.propTypes = {
  editActiveProjects: PropTypes.func.isRequired,
};

export default connect(null, {
  editActiveProjects,
})(TaskAdditionalInfos);

const taskStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in_processing", label: "In processing" },
  { value: "in_examination", label: "In examination" },
  { value: "completed", label: "Completed" },
];
