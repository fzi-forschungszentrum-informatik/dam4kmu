import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Alert } from 'reactstrap';

import { addSentence, getSentences, editSentence, deleteSentence } from '../../../actions/sentences'
import { getNLIResults } from "../../../actions/ajax";
import ConflictSentenceEditForm from '../../modules/ConflictSentenceEditForm'

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
    overlay: {zIndex: 9999}
};

export class RemanConflict extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Conflict
            n_conflicts: 999999,
            n_sents: 999999,
            all_initial_conflict_ids: [],
            all_initial_conflict_sentences: [],
            conflict_sentences_text: [],
            resolved_conflict_ids: [],
            id2old: {},
            id2new: {},
            deleted_sentence_ids: [],
            deleted_sentences: [],
            alert: <p></p>,
            // Modal
            modalIsOpen: false,
            editProps: {
                text: "",
                id: -1       
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.performDeleteSentence = this.performDeleteSentence.bind(this);
        this.oneLastCall = this.oneLastCall.bind(this);
    }

    static propTypes = {
        sentences: PropTypes.array.isRequired,
        addSentence: PropTypes.func.isRequired,
        getSentences: PropTypes.func.isRequired,
        editSentence: PropTypes.func.isRequired,
        deleteSentence: PropTypes.func.isRequired,
        getNLIResults: PropTypes.func.isRequired,
        nli_results: PropTypes.array.isRequired
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
        // Get new sentences
        this.props.getSentences();
        // Get new NLI results
        this.props.getNLIResults({text: this.props.nli_results[0]["context"]});
        //Close Modal
        this.setState({modalIsOpen: false})
    }

    undoChanges(sentence){
        console.log("Change sentence to ", this.state.id2old[sentence.id])
        this.setState({alert: <Alert color="secondary"> Changes are undone. </Alert>})
        let new_resolved_ids = this.state.resolved_conflict_ids.filter(sent_id => sent_id !== sentence.id)
        this.setState({resolved_conflict_ids: new_resolved_ids});
        this.props.editSentence({text: this.state.id2old[sentence.id]}, sentence.id);
        // Get new sentences
        this.props.getSentences();
        // Find new NLI results
        this.props.getNLIResults({text: this.props.nli_results[0]["context"]});
    }

    performDeleteSentence(sentence){
        // Perform Deletion
        this.props.deleteSentence(sentence.id)
        // Get new sentences
        this.props.getSentences();
        // Find new NLI Results
        this.props.getNLIResults({text: this.props.nli_results[0]["context"]});
    }

    oneLastCall(){
        this.props.getNLIResults({text: this.props.nli_results[0]["context"]});
    }

    componentDidMount() {
        this.props.getSentences();
    }

    componentDidUpdate() {
        console.log("Current sentences: ", this.props.sentences)

        // Get all_initial_conflict_ids and conflict_sentences – Runs only once in the beginning
        var conflict_ids_string = this.props.nli_results.length !== 0 ? this.props.nli_results[0]["conflict_ids"] : this.props.nli_results[0]["conflict_ids"]
        var conflict_ids = conflict_ids_string.map(Number)
        if (this.state.all_initial_conflict_ids.length == 0){
            this.setState({all_initial_conflict_ids: conflict_ids})
            console.log("The initial conflicts are: ", this.state.all_initial_conflict_ids)
            var sents = [];
            var sents_text = [];
            this.props.sentences.map((sentence) => {
                if (conflict_ids.includes(sentence.id)) {
                    sents.push(sentence)
                    sents_text.push(sentence.text)
                }
            })
            this.setState({all_initial_conflict_sentences: sents})
            this.setState({conflict_sentences_text: sents_text})
        }

        // CASE EDIT: Get all resolved conflicts, if changes are detected
        var resolved_ids = this.state.all_initial_conflict_ids.filter(conflict_id => !conflict_ids.includes(conflict_id));
        console.log("Resolved IDs", resolved_ids)
        if (this.state.resolved_conflict_ids.length !== resolved_ids.length){
            this.setState({resolved_conflict_ids: resolved_ids})
            let new_id2new = this.state.id2new
            let new_id2old = this.state.id2old
            this.props.sentences.map((sentence) => {
                if (resolved_ids.includes(sentence.id)) {
                    // Find corresponding orignal sentence
                    for (var i = 0; i < this.state.all_initial_conflict_sentences.length; i++){
                        if (sentence.id == this.state.all_initial_conflict_sentences[i].id){
                            var original_sentence = this.state.all_initial_conflict_sentences[0].text
                            new_id2new[sentence.id] = sentence.text
                            new_id2old[sentence.id] = original_sentence
                        }
                    }
                }
            })
            this.setState({id2new: new_id2new})
            this.setState({id2old: new_id2old})
        }

        // CASE EDIT: Get alert 
        console.log("Number of Conflicts", this.state.n_conflicts)
        if (this.state.n_conflicts > this.props.nli_results[0]["conflicts"].length) {
            if (this.state.n_conflicts != 999999){
                this.setState({alert: <Alert color="success"> Edit resolved conflict successfully! </Alert>})
            }
            this.setState({n_conflicts: this.props.nli_results[0]["conflicts"].length})
            console.log("New number of conflicts.");
        }

        // Check if changes were made, but conflicts did not decrease
        var sents_text = [];
        this.props.sentences.map((sentence) => {
            if (conflict_ids.includes(sentence.id)) {
                sents_text.push(sentence.text)
            }
        })

        // Check if conflict was not resolved.
        console.log("Conflict text ", sents_text)
        console.log("Init Sentences", this.state.conflict_sentences_text)

        var test = this.state.conflict_sentences_text.filter(conflict_text => !sents_text.includes(conflict_text));
        console.log("There is a difference?", test)
        if (test.length > 0 && sents_text.length == this.state.n_conflicts){
            this.setState({alert: <Alert color="danger"> Edit did not resolved conflict! Please try again. </Alert>})
            this.setState({conflict_sentences_text: sents_text})
        }

        if (this.state.n_conflicts == 1 && sents_text.length == 0){
            this.oneLastCall()
        }
    }

    render() {
        return (
            <Fragment>
                <h2>Conflicts</h2>
                <p>Found Conflicts for the following context:</p>
                <p>"{this.props.nli_results[0]["context"]}"</p>
                {this.state.alert}
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Text</th>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.sentences.map((sentence) => {
                            if (this.state.all_initial_conflict_ids.includes(sentence.id) && !this.state.resolved_conflict_ids.includes(sentence.id))
                            return <tr key={sentence.id}>
                                <td>{sentence.id}</td>
                                <td>{sentence.text}</td>
                                <td><button onClick={() => {this.openModal(sentence)}} className="btn btn-secondary btn-sm">Edit</button></td>
                                <td><button onClick={() => {this.performDeleteSentence(sentence)}} className="btn btn-danger btn-sm">Delete</button></td>
                            </tr>
                        })}
                    </tbody>
                </table>

                <h2>Solved Conflicts</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>New Text</th>
                            <th>Original Text</th>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.sentences.map((sentence) => {
                            if (this.state.resolved_conflict_ids.includes(sentence.id))
                            return  <tr>
                                        <td>{sentence.id}</td>
                                        <td>{this.state.id2new[sentence.id]}</td>
                                        <td>{this.state.id2old[sentence.id]}</td>
                                        <td><button onClick={() => {this.undoChanges(sentence)}} className="btn btn-secondary btn-sm">Undo Changes</button></td>
                                    </tr>})}
                    </tbody>
                </table>

                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customModalStyles}
                    contentLabel="Update current selected Sentence"
                >                
                    <ConflictSentenceEditForm data={this.state.editProps} closeModal={this.closeModal}/>
                </Modal>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    sentences: state.sentences.sentences,
    nli_results: state.ajax.nli_results,
})

export default connect(mapStateToProps, {addSentence, getSentences, editSentence, deleteSentence, getNLIResults})(RemanConflict);    