import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getWords, deleteWord } from '../../actions/words'

import Modal from 'react-modal';
import WordEditForm from './WordEditForm'

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

export class Words extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                text: "",
                sentence: -1,
                type: "",
                entityType: "",
                position: 0,
                id: -1,
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        words: PropTypes.array.isRequired,
        getWords: PropTypes.func.isRequired,
        deleteWord: PropTypes.func.isRequired
    }

    openModal(word) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                text: word.text,
                sentence: word.sentence,
                type: word.type,
                entityType: word.entityType,
                position: word.position,
                id: word.id,
            }
        })
    }
        
    afterOpenModal() {
        console.log("Word Modal is opened.");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }

    componentDidMount() {
        this.props.getWords();
    }


    render() {
        return (
            <Fragment>
                <h2>Words</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Text</th>
                            <th>Sentence</th>
                            <th>Word_Type</th>
                            <th>Entity_Type</th>
                            <th>Position</th>
                            <th/>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.words.map(word => (
                            <tr key={word.id}>
                                <td>{word.id}</td>
                                <td>{word.text}</td>
                                <td>{word.sentence}</td>
                                <td>{word.type}</td>
                                <td>{word.entityType}</td>
                                <td>{word.position}</td>
                                <td><button onClick={() => {this.openModal(word)}} className="btn btn-secondary btn-sm">Edit</button></td>
                                <td><button onClick={this.props.deleteWord.bind(this, word.id)} className="btn btn-danger btn-sm">Delete</button></td>
                            </tr>
                        ))}
                    </tbody>

                </table>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customModalStyles}
                    contentLabel="Update current selected Word"
                >
                    
                    <WordEditForm data={this.state.editProps} closeModal={this.closeModal}/>
                    
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    words: state.words.words
})

export default connect(mapStateToProps, {getWords, deleteWord})(Words);
