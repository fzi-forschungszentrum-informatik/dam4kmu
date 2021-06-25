import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { editWord } from '../../actions/words';
import { getSentences } from '../../actions/sentences'
import { editWordInSentence } from '../../actions/ajax'
import Select from 'react-select';

export class WordEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: props.data.text,
            sentence: this.convertSentencesAsDict()[this.getSelectIndexDefaultValue(this.convertSentencesAsDict(), props.data.sentence)],
            type: wordTypeOptions[this.getSelectIndexDefaultValue(wordTypeOptions, props.data.type)],
            entityType: entityTypeOptions[this.getSelectIndexDefaultValue(entityTypeOptions, props.data.entityType)],
            position: props.data.position,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    static propTypes = {
        editWord: PropTypes.func.isRequired,
        editWordInSentence: PropTypes.func.isRequired,
        sentences: PropTypes.array.isRequired,
        getSentences: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.getSentences();
    }

    handleChange = e => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
 
        this.setState({
            [name]: value
        })
    };

    handleSelectChange = (value, action) => {
        console.log("action:" + action.name);
        console.log("value:" + value.value);
        console.log(value);

        this.setState({[action.name]: {value}})
    }

    handleSubmit = e => {
        e.preventDefault();
        const sentence = this.state.sentence.value.value
        const type = this.state.type.value.value
        const entityType = this.state.entityType.value.value
        const {text, position, id} = this.state;
        const word = {text, sentence, type, position, entityType}

        this.props.editWord(word, id);
        this.props.editWordInSentence(word, (sentence === undefined ? this.props.data.sentence : sentence));
        this.props.closeModal();
    }

    convertSentencesAsDict() {
        var options = []
        for (var i = 0; i < this.props.sentences.length; i++) {
            var sentence = this.props.sentences[i];
            var sentenceObj = {
                value: sentence.id,
                label: sentence.text + ",  id:" + sentence.id
            }
            options.push(sentenceObj);
        }
        return options;
    }

    getSelectIndexDefaultValue(array, defValue) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].value === defValue) {
                return i
            }
        }
    }


    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Edit current selected Word</h2>
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
                        <label>Sentence</label>
                        <Select
                            defaultValue={this.convertSentencesAsDict()[this.getSelectIndexDefaultValue(this.convertSentencesAsDict(), this.props.data.sentence)]}
                            name="sentence"
                            onChange={this.handleSelectChange}
                            options={this.convertSentencesAsDict()}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <Select
                            defaultValue={wordTypeOptions[this.getSelectIndexDefaultValue(wordTypeOptions, this.props.data.type)]}
                            name="type"
                            onChange={this.handleSelectChange}
                            options={wordTypeOptions}
                            />   
                    </div>
                    <div className="form-group">
                        <label>Entity Type</label>
                        <Select
                            defaultValue={entityTypeOptions[this.getSelectIndexDefaultValue(entityTypeOptions, this.props.data.entityType)]}
                            name="entityType"
                            onChange={this.handleSelectChange}
                            options={entityTypeOptions}
                        />   
                    </div>
                    <div className="form-group">
                        <label>Position</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="position"
                            onChange={this.handleChange}
                            value={this.state.position}
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


const wordTypeOptions = [
    { value: 'refObject', label: 'Reference Object' },
    { value: 'object', label: 'Object' },
    { value: 'actor', label: 'Actor' },
    { value: 'parent', label: 'Parent' },
    { value: 'attribute', label: 'Attribute' },
    { value: 'attValue', label: 'Attribute Value' },
    { value: 'processWord', label: 'Process Word' },
    { value: 'precision', label: 'Precision' },
    { value: 'condition', label: 'Condition' },
    { value: 'comparisonObject', label: 'ComparisonObject' },
    { value: 'priority', label: 'Priority' }
]

const entityTypeOptions = [
    { value: 'none', label: 'None' },
    { value: 'component', label: 'Component' }
]


const mapStateToProps = state => ({
    sentences: state.sentences.sentences
})

export default connect(mapStateToProps, {editWord, getSentences, editWordInSentence})(WordEditForm);

