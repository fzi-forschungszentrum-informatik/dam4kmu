import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getRelations, deleteRelation } from '../../actions/relations'

import Modal from 'react-modal';
import RelationEditForm from './RelationEditForm'

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

export class Relations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                first_asset: 0,
                type: "",
                second_asset: 0,
                description: "",
                archieved: false,
                id: -1,
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        relations: PropTypes.array.isRequired,
        getRelations: PropTypes.func.isRequired,
        deleteRelation: PropTypes.func.isRequired
    }

    openModal(relation) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                first_asset: relation.first_asset,
                type: relation.type,
                second_asset: relation.second_asset,
                description: relation.description,
                archieved: relation.archieved,
                id: relation.id,
            }
        })
    }
        
    afterOpenModal() {
        console.log("Relation Modal is opened.");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }

    componentDidMount() {
        this.props.getRelations();
    }

    render() {
        return (
            <Fragment>
                <h2>Relations</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Asset</th>
                            <th>Relation Type</th>
                            <th>Second Asset</th>
                            <th>Description</th>
                            <th>Archieved</th>
                            <th/>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.relations.map(relation => (
                            <tr key={relation.id}>
                                <td>{relation.id}</td>
                                <td>{relation.first_asset}</td>
                                <td>{relation.type}</td>
                                <td>{relation.second_asset}</td>
                                <td>{relation.description}</td>
                                <td>{relation.archieved ? "True" : "False"}</td>
                                <td><button onClick={() => {this.openModal(relation)}} className="btn btn-secondary btn-sm">Edit</button></td>
                                <td><button onClick={this.props.deleteRelation.bind(this, relation.id)} className="btn btn-danger btn-sm">Delete</button></td>
                            </tr>

                        ))}
                    </tbody>

                </table>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customModalStyles}
                    contentLabel="Update current selected Relation"
                >
                    
                    <RelationEditForm data={this.state.editProps} closeModal={this.closeModal}/>
                
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    relations: state.relations.relations
})

export default connect(mapStateToProps, {getRelations, deleteRelation})(Relations);
