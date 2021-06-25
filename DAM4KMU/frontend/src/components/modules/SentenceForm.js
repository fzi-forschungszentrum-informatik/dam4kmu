import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { addSentence } from '../../actions/sentences';

export class SentenceForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        addSentence: PropTypes.func.isRequired,
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
        const {text} = this.state;
        const sentence = {text}
        this.props.addSentence(sentence);
        
        this.setState({
            text: ""
        })
    }


    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Add Sentence</h2>
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
                            Submit
                        </button>
                    </div>
                </form>

            </div>
        )
    }
}

export default connect(null, {addSentence})(SentenceForm);

