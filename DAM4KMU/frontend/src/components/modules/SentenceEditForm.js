import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { editSentence } from '../../actions/sentences';

export class SentenceEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.data.text,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        editSentence: PropTypes.func.isRequired,
    };

    handleChange = e => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
 
        this.setState({
            [name]: value
        })
    };

    handleSubmit = e => {
        e.preventDefault();
        const {text, id} = this.state;
        const sentence = {text}
        this.props.editSentence(sentence, id);
        this.props.closeModal();
    }


    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Edit current selected Sentence</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>Text</label>
                        <input
                            className="form-control"
                            type="text"
                            name="text"
                            onChange={this.handleChange}
                            value={this.state.text}
                        />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary">
                            Save
                        </button>
                        <button className="btn btn-secondary" onClick={this.props.closeModal}>Cancel</button>
                    </div>
                </form>

            </div>
        )
    }
}

export default connect(null, {editSentence})(SentenceEditForm);

