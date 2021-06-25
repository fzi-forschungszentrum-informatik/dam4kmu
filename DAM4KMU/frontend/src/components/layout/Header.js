import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Form, NavDropdown } from "react-bootstrap";
import Select from "react-select";
import styled from "styled-components";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Modal from "react-modal";

import { getProjects, addActiveProjects } from "../../actions/projects";
import { getAllRelatedAssets } from "../../actions/ajax";
import ProjectForm from "../modules/ProjectForm";


const ProjectOptionSelect = styled(Select)`
  width: 250px;
  padding: 0 2px;
`;

const ProjectLabel = styled.span`
  color: #ffff99;
  font-weight: bold;
  padding: 5px;
  margin-right: 12px;
  font-size: 16px;
`;

const AddProjectButton = styled.button`
  padding: 0 3px;
  font-size: 1.5em;
  color: white;
  background-color: Transparent;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  overflow: hidden;
  outline: none;
`;

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

export class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeProjects: [],
      modalIsOpen: false,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  static propTypes = {
    projects: PropTypes.array.isRequired,
    activeProjects: PropTypes.array.isRequired,
    getProjects: PropTypes.func.isRequired,
    addActiveProjects: PropTypes.func.isRequired,
    getAllRelatedAssets: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.getProjects();
  }

  componentDidUpdate(prevProps) {
    const { activeProjects } = this.props;
    if (activeProjects !== prevProps.activeProjects) {
      if (activeProjects !== null && activeProjects.length !== 0) {
        console.log("activeProjects: ", activeProjects);
        const activeProjectsId = activeProjects.map(
          (activeProject) => activeProject.value
        );
        this.props.getAllRelatedAssets(activeProjectsId, "active_project");
      }
    }
  }

  convertProjectsAsDict() {
    var options = [];
    for (var i = 0; i < this.props.projects.length; i++) {
      var project = this.props.projects[i];
      var projectObj = {
        value: project.id,
        label: project.name + ", id:" + project.id,
        new_effort: 0,
        new_cost: 0,
        cost_per_hour: project.cost_per_hour,
      };
      options.push(projectObj);
    }
    return options;
  }

  handleSelectChange = (value, action) => {
    this.setState({ [action.name]: { value } });
    this.props.addActiveProjects(value);
  };

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    console.log("abcde");
  }

  closeModal() {
    this.props.getProjects();
    this.setState({ modalIsOpen: false });
  }

  render() {
    return (
      <Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">DAM4KMU_V2</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/assetTextHome">
              Asset Text
            </Nav.Link>
            <Nav.Link as={Link} to="/diagram">
              Relation Diagram
            </Nav.Link>
            <Nav.Link as={Link} to="/componentWizard">
              Component Wizard
            </Nav.Link>
            <NavDropdown title="Basic Form" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/assetsTab">
                Assets B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/componentsTab">
                Components B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/relationsTab">
                Relations B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/requirementsTab">
                Requirements B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sentencesTab">
                Sentences B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/wordsTab">
                Words B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/tasksTab">
                Tasks B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/genInfosTab">
                Gen. Infos B-Form
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/projectsTab">
                Projects B-Form
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form inline>
            <ProjectLabel>Active-Project:</ProjectLabel>
            <ProjectOptionSelect
              name="activeProjects"
              closeMenuOnSelect={false}
              isMulti
              onChange={this.handleSelectChange}
              options={this.convertProjectsAsDict()}
              placeholder="Select a project..."
            />
            {/* <AddProjectButton onClick={this.openModal}>
                        <i className="fas fa-plus-square"></i>
                    </AddProjectButton> */}
            {/* <button onClick={() => {this.openModal()}} className="btn btn-secondary btn-sm">Edit</button> */}
          </Form>
        </Navbar>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customModalStyles}
          contentLabel="Add new Project Modal"
        >
          <ProjectForm closeModal={this.closeModal} />
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  projects: state.projects.projects,
  activeProjects: state.projects.activeProjects,
});

export default connect(mapStateToProps, {
  getProjects,
  addActiveProjects,
  getAllRelatedAssets,
})(Header);
