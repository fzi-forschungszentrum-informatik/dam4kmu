import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { getRequirements, deleteRequirement } from "../../actions/requirements";
import {
  getAssetTextWithNoRelatedProject,
  getRelatedAssetFromProject,
} from "../../actions/ajax";

import Modal from "react-modal";
import RequirementEditForm from "./RequirementEditForm";

import { Link } from "react-router-dom";

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
  return list.map((requirement) => (
    <tr key={requirement.sentence}>
      <td>{requirement.asset_ptr}</td>
      <td>{requirement.name}</td>
      <td>{requirement.sentence}</td>
      <td>{requirement.type}</td>
      <td>{requirement.category}</td>
      <td>{requirement.status}</td>
      <td>{requirement.priority}</td>
      <td>{requirement.description}</td>
      <td>{requirement.archieved ? "True" : "False"}</td>
      <td>
        <Link
          to={{
            pathname: "/reqWizard",
            state: {
              toEdit: true,
              assetType: "Req",
              editProps: {
                name: requirement.name,
                sentence: requirement.sentence,
                type: requirement.type,
                category: requirement.category,
                id: requirement.asset_ptr,
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
            openModal(requirement);
          }}
          className="btn btn-secondary btn-sm"
        >
          Edit
        </button>
      </td>
      <td>
        <button
          onClick={props.deleteRequirement.bind(this, requirement.sentence)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  ));
}

export class Requirements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      editProps: {
        name: "",
        sentence: -1,
        type: "",
        category: "",
        status: "",
        priority: "",
        description: "",
        archieved: false,
        id: -1,
      },
      showUnboundReq: true,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.toggleShowUnboundReq = this.toggleShowUnboundReq.bind(this);
  }

  static propTypes = {
    requirements: PropTypes.array.isRequired,
    projectFilteredAssets: PropTypes.object.isRequired,
    assetTextWithNoRelatedProject: PropTypes.object.isRequired,
    activeProjects: PropTypes.array.isRequired,
    getRequirements: PropTypes.func.isRequired,
    deleteRequirement: PropTypes.func.isRequired,
    getAssetTextWithNoRelatedProject: PropTypes.func.isRequired,
    getRelatedAssetFromProject: PropTypes.func.isRequired,
  };

  openModal(req) {
    this.setState({
      modalIsOpen: true,
      editProps: {
        name: req.name,
        sentence: req.sentence,
        type: req.type,
        category: req.category,
        status: req.status,
        priority: req.priority,
        description: req.description,
        archieved: req.archieved,
        id: req.sentence,
      },
    });
  }

  toggleShowUnboundReq() {
    this.setState({
      showUnboundReq: !this.state.showUnboundReq,
    });
  }

  afterOpenModal() {
    console.log("Requirement Modal is opened.");
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  componentDidMount() {
    this.props.getRequirements();
    if (this.props.assetType) {
      this.props.getAssetTextWithNoRelatedProject(this.props.assetType);
    }
    
    if (this.props.activeProjects.length !== 0) {
      this.setState({
        showUnboundReq: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      activeProjects,
      getRelatedAssetFromProject,
      assetType,
      requirements,
    } = this.props;
    if (
      activeProjects !== prevProps.activeProjects ||
      requirements !== prevProps.requirements
    ) {
      if (activeProjects !== null) {
        getRelatedAssetFromProject(activeProjects, assetType);
      }
    }
  }

  render() {
    return (
      <Fragment>
        <h2>Requirements</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Sentence</th>
              <th>Type</th>
              <th>Category</th>
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
                    this.props.projectFilteredAssets.requirement,
                    this.props,
                    this.openModal
                  )
                : null}
              {this.props.assetTextWithNoRelatedProject.requirement.length !==
              0 ? (
                <tr>
                  <td colSpan="2">
                    <b>Global / Unbound Requirement:</b>
                  </td>
                  <td></td>
                  <td>
                    <button
                      onClick={() => {
                        this.toggleShowUnboundReq();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {this.state.showUnboundReq ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
              ) : null}
              {this.state.showUnboundReq
                ? customRenderCell(
                    this.props.assetTextWithNoRelatedProject.requirement,
                    this.props,
                    this.openModal
                  )
                : null}
            </tbody>
          ) : (
            <tbody>
              {customRenderCell(
                this.props.requirements,
                this.props,
                this.openModal
              )}
            </tbody>
          )}
        </table>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customModalStyles}
          contentLabel="Update current selected Requirement"
        >
          <RequirementEditForm
            data={this.state.editProps}
            closeModal={this.closeModal}
          />
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  requirements: state.requirements.requirements,
  activeProjects: state.projects.activeProjects,
  projectFilteredAssets: state.ajax.projectFilteredAssets,
  assetTextWithNoRelatedProject: state.ajax.assetTextWithNoRelatedProject,
});

export default connect(mapStateToProps, {
  getRequirements,
  deleteRequirement,
  getAssetTextWithNoRelatedProject,
  getRelatedAssetFromProject,
})(Requirements);
