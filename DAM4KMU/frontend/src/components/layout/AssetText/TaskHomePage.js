import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

import Tasks from "../../modules/Tasks";

export class TaskHomePage extends Component {
  render() {
    return (
      <Fragment>
        <Tasks assetType="Task" />
        <Link
          to={{
            pathname: "taskWizard",
            state: { toEdit: false, assetType: "Task" },
          }}
        >
          <button
            style={{ marginBottom: "15px" }}
            className="btn btn-secondary"
          >
            Create new Task
          </button>
        </Link>
      </Fragment>
    );
  }
}

export default TaskHomePage;
