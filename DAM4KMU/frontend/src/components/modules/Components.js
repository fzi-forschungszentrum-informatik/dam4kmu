import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getComponents, deleteComponent } from '../../actions/components'

import Modal from 'react-modal';
import ComponentEditForm from './ComponentEditForm'

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


export class Components extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                name: "",
                cost: 0,
                description: "",
                version: 0,
                subversion: 0,
                id: -1,
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        components: PropTypes.array.isRequired,
        getComponents: PropTypes.func.isRequired,
        deleteComponent: PropTypes.func.isRequired
    }

    openModal(component) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                name: component.name,
                cost: component.cost,
                description: component.description,
                version: component.version,
                subversion: component.subversion,
                id: component.id
            }
        })
    }
        
    afterOpenModal() {
        console.log("Component modal opened.");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }

    componentDidMount() {
        this.props.getComponents();
    }

    render() {
        return (
            <Fragment>
                <h2>Components</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Cost</th>
                            <th>Description</th>
                            <th>Version</th>
                            <th>Subversion</th>
                            <th/>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.components.map(component => (
                            <tr key={component.id}>
                                <td>{component.id}</td>
                                <td>{component.name}</td>
                                <td>{component.cost}</td>
                                <td>{component.description}</td>
                                <td>{component.version}</td>
                                <td>{component.subversion}</td>
                                <td><button onClick={() => {this.openModal(component)}} className="btn btn-secondary btn-sm">Edit</button></td>
                                <td><button onClick={this.props.deleteComponent.bind(this, component.id)} className="btn btn-danger btn-sm">Delete</button></td>
                            </tr>

                        ))}
                    </tbody>

                </table>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customModalStyles}
                    contentLabel="Update current selected Component"
                >
                    
                    <ComponentEditForm data={this.state.editProps} closeModal={this.closeModal}/>
            
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    components: state.components.components
})

export default connect(mapStateToProps, {getComponents, deleteComponent})(Components);