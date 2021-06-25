import React, { Component, Fragment} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getProjects, deleteProject} from '../../actions/projects'

import Modal from 'react-modal';
import ProjectEditForm from './ProjectEditForm'

Modal.setAppElement('#app');

const customModalStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '60%',
        transform: 'translate(-50%, -50%)'
    },
    overlay: {zIndex: 1000}
};

export class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                name: "",
                description: "",
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
                budget: 0,
                manpower: 0,
                cost_per_hour: 10,
                id: -1,
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        projects: PropTypes.array.isRequired,
        getProjects: PropTypes.func.isRequired,
        deleteProject: PropTypes.func.isRequired
    }
    
    openModal(project) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                name: project.name,
                description: project.description,
                start_date: project.start_date.substring(0, 19),
                end_date: project.end_date.substring(0, 19),
                budget: project.budget,
                manpower: project.manpower,
                cost_per_hour: project.cost_per_hour,
                id: project.id
            }
        })
    }
        
    afterOpenModal() {
        console.log("Project modal is opened");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }
    
    componentDidMount() {
        this.props.getProjects();
    }
        
        
    render() {
        return (
            <Fragment>
            <h2>Projects</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Budget</th>
                        <th>Manpower</th>
                        <th>Cost per Hour</th>
                        <th/>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                    {this.props.projects.map(project => (
                        <tr key={project.id}>
                            <td>{project.id}</td>
                            <td>{project.name}</td>
                            <td>{project.description}</td>
                            <td>{project.start_date}</td>
                            <td>{project.end_date}</td>
                            <td>{project.budget}</td>
                            <td>{project.manpower}</td>
                            <td>{project.cost_per_hour}</td>
                            <td><button onClick={() => {this.openModal(project)}} className="btn btn-secondary btn-sm">Edit</button></td>
                            <td><button onClick={this.props.deleteProject.bind(this, project.id)} className="btn btn-danger btn-sm">Delete</button></td>
                        </tr>

                    ))}
                </tbody>

            </table>
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customModalStyles}
                contentLabel="Update current selected Project"
            >
                
                <ProjectEditForm data={this.state.editProps} closeModal={this.closeModal}/>
            
            </Modal>
        </Fragment>
    )
    }
}

const mapStateToProps = state => ({
    projects: state.projects.projects
})

export default connect(mapStateToProps, {getProjects, deleteProject})(Projects);
