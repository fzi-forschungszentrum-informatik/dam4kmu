import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getTasks, deleteTask } from "../../actions/tasks";

import Modal from "react-modal";
import TaskEditForm from "./TaskEditForm";
import { Link } from "react-router-dom";

import {
  getAssetTextWithNoRelatedProject,
  getRelatedAssetFromProject,
} from "../../actions/ajax";

Modal.setAppElement("#app");

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    width: "60%",
    transform: "translate(-50%, -50%)",
  },
  overlay: { zIndex: 1000 },
};

function customRenderCell(list, props, openModal) {
  console.log("list: ", list);
  return list.map((task) => (
    <tr key={task.sentence}>
      <td>{task.asset_ptr}</td>
      <td>{task.name}</td>
      <td>{task.sentence}</td>
      <td>{task.start_date}</td>
      <td>{task.end_date}</td>
      <td>{task.effort}</td>
      <td>{task.status}</td>
      <td>{task.priority}</td>
      <td>{task.description}</td>
      <td>{task.archieved ? "True" : "False"}</td>
      <td>
        <Link
          to={{
            pathname: "/taskWizard",
            state: {
              toEdit: true,
              assetType: "Task",
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
          <button className="btn btn-secondary btn-sm">Go to Wizard</button>
        </Link>
      </td>
      <td>
        <button
          onClick={() => {
            openModal(task);
          }}
          className="btn btn-secondary btn-sm"
        >
          Edit
        </button>
      </td>
      <td>
        <button
          onClick={props.deleteTask.bind(this, task.sentence)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  ));
}

export class Tasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      editProps: {
        name: "",
        sentence: -1,
        start_date: "",
        end_date: "",
        effort: 0,
        status: "",
        priority: "",
        description: "",
        archieved: false,
        id: -1,
      },
      showUnboundTask: true,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleShowUnboundTask = this.toggleShowUnboundTask.bind(this);
  }

  static propTypes = {
    tasks: PropTypes.array.isRequired,
    projectFilteredAssets: PropTypes.object.isRequired,
    assetTextWithNoRelatedProject: PropTypes.object.isRequired,
    activeProjects: PropTypes.array.isRequired,
    getTasks: PropTypes.func.isRequired,
    deleteTask: PropTypes.func.isRequired,
    getAssetTextWithNoRelatedProject: PropTypes.func.isRequired,
    getRelatedAssetFromProject: PropTypes.func.isRequired,
  };

  openModal(task) {
    this.setState({
      modalIsOpen: true,
      editProps: {
        name: task.name,
        sentence: task.sentence,
        start_date: task.start_date.substring(0, 19),
        end_date: task.end_date.substring(0, 19),
        effort: task.effort,
        status: task.status,
        priority: task.priority,
        description: task.description,
        archieved: task.archieved,
        id: task.sentence,
      },
    });
  }

  toggleShowUnboundTask() {
    this.setState({
      showUnboundTask: !this.state.showUnboundTask,
    });
  }

  afterOpenModal() {
    console.log("Task Modal is opened.");
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  componentDidMount() {
    this.props.getTasks();
    if (this.props.assetType) {
      this.props.getAssetTextWithNoRelatedProject(this.props.assetType);
    }

    if (this.props.activeProjects.length !== 0) {
      this.setState({
        showUnboundTask: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      activeProjects,
      getRelatedAssetFromProject,
      assetType,
      tasks,
    } = this.props;
    if (
      activeProjects !== prevProps.activeProjects ||
      tasks !== prevProps.tasks
    ) {
      if (activeProjects !== null) {
        getRelatedAssetFromProject(activeProjects, assetType);
      }
    }
  }

  render() {
    return (
      <Fragment>
        <h2>Tasks</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sentence</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Effort</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Archieved</th>
              <th />
              <th />
              <th />
            </tr>
          </thead>

          {this.props.assetType ? (
            <tbody>
              {this.props.activeProjects
                ? customRenderCell(
                    this.props.projectFilteredAssets.task,
                    this.props,
                    this.openModal
                  )
                : null}
              {this.props.assetTextWithNoRelatedProject.task.length !== 0 ? (
                <tr>
                  <td colSpan="2">
                    <b>Global / Unbound Task:</b>
                  </td>
                  <td></td>
                  <td>
                    <button
                      onClick={() => {
                        this.toggleShowUnboundTask();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {this.state.showUnboundTask ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ) : null}
              {this.state.showUnboundTask
                ? customRenderCell(
                    this.props.assetTextWithNoRelatedProject.task,
                    this.props,
                    this.openModal
                  )
                : null}
            </tbody>
          ) : (
            <tbody>
              {customRenderCell(this.props.tasks, this.props, this.openModal)}
            </tbody>
          )}
        </table>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customModalStyles}
          contentLabel="Update current selected Task"
        >
          <TaskEditForm
            data={this.state.editProps}
            closeModal={this.closeModal}
          />
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  tasks: state.tasks.tasks,
  activeProjects: state.projects.activeProjects,
  projectFilteredAssets: state.ajax.projectFilteredAssets,
  assetTextWithNoRelatedProject: state.ajax.assetTextWithNoRelatedProject,
});

export default connect(mapStateToProps, {
  getTasks,
  deleteTask,
  getAssetTextWithNoRelatedProject,
  getRelatedAssetFromProject,
})(Tasks);
