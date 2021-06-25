import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSentences, deleteSentence } from '../../actions/sentences'

import Modal from 'react-modal';
import SentenceEditForm from './SentenceEditForm'

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

export class Sentences extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                text: "",
                id: -1       
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        sentences: PropTypes.array.isRequired,
        getSentences: PropTypes.func.isRequired,
        deleteSentence: PropTypes.func.isRequired
    }

    openModal(sentence) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                text: sentence.text,
                id: sentence.id,
            }
        })
    }
        
    afterOpenModal() {
        console.log("Sentence Modal is opened.");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }

    componentDidMount() {
        this.props.getSentences();
    }


    render() {
        return (
            <Fragment>
                <h2>Sentences</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Text</th>
                            <th/>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.sentences.map(sentence => (
                            <tr key={sentence.id}>
                                <td>{sentence.id}</td>
                                <td>{sentence.text}</td>
                                <td><button onClick={() => {this.openModal(sentence)}} className="btn btn-secondary btn-sm">Edit</button></td>
                                <td><button onClick={this.props.deleteSentence.bind(this, sentence.id)} className="btn btn-danger btn-sm">Delete</button></td>
                            </tr>
                        ))}
                    </tbody>

                </table>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customModalStyles}
                    contentLabel="Update current selected Sentence"
                >
                    
                    <SentenceEditForm data={this.state.editProps} closeModal={this.closeModal}/>
                
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    sentences: state.sentences.sentences
})

export default connect(mapStateToProps, {getSentences, deleteSentence})(Sentences);
