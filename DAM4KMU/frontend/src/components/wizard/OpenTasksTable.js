import React, { Fragment, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  ItemLabelHolder,
  GroupTableHolder,
  EditSentenceButton,
} from "./WizardStyledComponents";
import { getOpenTasks, submitTask } from "../../actions/ajax";
import { editTask, deleteTask } from "../../actions/tasks";

const OpenTasksTable = ({
  getOpenTasks,
  openTasks,
  submitTask,
  deleteTask,
  editTask,
  editProps,
  toEdit,
  activeProjects,
}) => {
  const [showOpenTasks, setShowOpenTasks] = useState(false);
  const toggleShowOpenTasks = useCallback(() => {
    setShowOpenTasks(!showOpenTasks);
  }, [showOpenTasks]);

  const removeTask = deleteTask.bind(this);
  const [updateOpenTask, setUpdateOpenTask] = useState(false);

  useEffect(() => {
    if (toEdit) {
      getOpenTasks(editProps.id);
    }
  }, [updateOpenTask]);

  return (
    <Fragment>
      <GroupTableHolder>
        <ItemLabelHolder>Open Tasks (from related-projects)</ItemLabelHolder>
        <EditSentenceButton type="button" onClick={toggleShowOpenTasks}>
          {showOpenTasks ? "Hide" : "Show"}
        </EditSentenceButton>
      </GroupTableHolder>
      {showOpenTasks ? (
        openTasks.length === 0 ? (
          "No open tasks detected that are related to the projects."
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Total Effort</th>
                <th>Completed Eff.</th>
                <th>Remaining Eff.</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {openTasks.map((task) => (
                <tr key={task.sentence}>
                  <td>{task.asset_ptr}</td>
                  <td>{task.name}</td>
                  <td>{task.status}</td>
                  <td>{task.effort}</td>
                  <td>{task.completed_effort}</td>
                  <td>{task.remaining_effort}</td>
                  <td>
                    <Link
                      to={{
                        pathname: "/taskWizard",
                        state: {
                          toEdit: true,
                          editProps: {
                            name: task.name,
                            sentence: task.sentence,
                            start_date: task.start_date.substring(0, 19),
                            end_date: task.end_date.substring(0, 19),
                            effort: task.effort,
                            status: task.status,
                            id: task.asset_ptr,
                          },
                        },
                      }}
                    >
                      <button className="btn btn-secondary btn-sm">Edit</button>
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        task.status = "completed";
                        editTask(task, task.sentence);
                        setTimeout(setUpdateOpenTask(!updateOpenTask), 500);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Mark as done
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        const duplicateTask = {
                          form: {
                            task_effort: task.effort,
                            task_start_date: task.start_date,
                            task_end_date: task.end_date,
                            task_status: task.status,
                            task_id: task.asset_ptr,
                            projects: activeProjects,
                            toDupli: true,
                          },
                        };
                        submitTask(duplicateTask);
                        setTimeout(setUpdateOpenTask(!updateOpenTask), 4000);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Duplicate
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        removeTask(task.sentence);
                        setTimeout(setUpdateOpenTask(!updateOpenTask), 500);
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}
    </Fragment>
  );
};

OpenTasksTable.propTypes = {
  openTasks: PropTypes.array.isRequired,
  getOpenTasks: PropTypes.func.isRequired,
  editTask: PropTypes.func.isRequired,
  submitTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  openTasks: state.ajax.openTasks,
});

export default connect(mapStateToProps, {
  getOpenTasks,
  editTask,
  submitTask,
  deleteTask,
})(OpenTasksTable);
