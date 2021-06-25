import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { editRequirement } from '../../actions/requirements';
import { getSentences } from '../../actions/sentences'
import { editReqPriorityAfterEffect } from '../../actions/ajax'
import Select from 'react-select';


export class RequirementEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.data.name,
            sentence: this.convertSentencesAsDict()[this.getSelectIndexDefaultValue(this.convertSentencesAsDict(), props.data.sentence)],
            type: reqTypeOptions[this.getSelectIndexDefaultValue(reqTypeOptions, props.data.type)],
            category: reqCategoryOptions[this.getSelectIndexDefaultValue(reqCategoryOptions, props.data.category)],
            status: reqStatusOptions[this.getSelectIndexDefaultValue(reqStatusOptions, props.data.status)],
            priority: reqPriorityOptions[this.getSelectIndexDefaultValue(reqPriorityOptions, props.data.priority)],
            description: props.data.description === null ? "" : props.data.description,
            archieved: props.data.archieved,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    static propTypes = {
        editRequirement: PropTypes.func.isRequired,
        editReqPriorityAfterEffect: PropTypes.func.isRequired,
        sentences: PropTypes.array.isRequired,
        getSentences: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.getSentences();
    }


    handleChange = e => {
       const target = e.target;
       const value = target.name === 'archieved' ? target.checked : target.value;
       const name = target.name;

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
        const category = this.state.category.value.value
        const status = this.state.status.value.value
        const priority = this.state.priority.value.value
        
        const {name, description, archieved, id} = this.state;
        const requirement = {name, sentence, type, category, status, priority, description, archieved}
        
        this.props.editRequirement(requirement, id);
        this.props.editReqPriorityAfterEffect(
            (priority === undefined ? this.props.data.priority : priority), 
            (sentence === undefined ? this.props.data.sentence : sentence)
            )
        this.props.closeModal();
        
        // todo if priority changed, edit sentence text and its words
        
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
            <div>
                <h2>Edit current selected Requirement</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            className="form-control"
                            type="text"
                            name="name"
                            onChange={this.handleChange}
                            value={this.state.name}
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
                            defaultValue={reqTypeOptions[this.getSelectIndexDefaultValue(reqTypeOptions, this.props.data.type)]}
                            name="type"
                            onChange={this.handleSelectChange}
                            options={reqTypeOptions}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <Select
                            defaultValue={reqCategoryOptions[this.getSelectIndexDefaultValue(reqCategoryOptions, this.props.data.category)]}
                            name="category"
                            onChange={this.handleSelectChange}
                            options={reqCategoryOptions}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <Select
                            defaultValue={reqStatusOptions[this.getSelectIndexDefaultValue(reqStatusOptions, this.props.data.status)]}
                            name="status"
                            onChange={this.handleSelectChange}
                            options={reqStatusOptions}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <Select
                            defaultValue={reqPriorityOptions[this.getSelectIndexDefaultValue(reqPriorityOptions, this.props.data.priority)]}
                            name="priority"
                            onChange={this.handleSelectChange}
                            options={reqPriorityOptions}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            className="form-control"
                            type="text"
                            name="description"
                            onChange={this.handleChange}
                            value={this.state.description}
                        />
                    </div>

                    <div className="form-group">
                        <label>Archieved</label>
                        <input
                            className="form-control"
                            type="checkbox"
                            name="archieved"
                            onChange={this.handleChange}
                            checked={this.state.archieved}
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

const reqTypeOptions = [
    { value: 'F-R', label: 'Functional Requirement' },
    { value: 'NF-R', label: 'Non-Functional Requirement' },
    { value: 'FB-R', label: 'Functional Requirement with Condition' },
    { value: 'NFB-R', label: 'Non-Functional Requirement with Condition' },
    { value: 'unknown', label: 'unknown' }
]

const reqCategoryOptions = [
    { value: 'product', label: 'Product' },
    { value: 'business', label: 'Business' },
    { value: 'norm_law', label: 'Norm and Law' },
    { value: 'plc', label: 'PLC' },
    { value: 'design', label: 'Design' }
]

const reqStatusOptions = [
    {value: 'in_examination', label: 'In examination'},
    {value: 'approved', label: 'Approved'}
]

const reqPriorityOptions = [
    {value: 'must', label: 'Must'},
    {value: 'should', label: 'Should'},
    {value: 'will', label: 'Will'},
    {value: 'can', label: 'Can'},
    {value: 'must_not', label: 'Must not'},
    {value: 'should_not', label: 'Should not'},
    {value: 'can_not', label: 'Cannot'},
    {value: 'will_not', label: 'Will not'}
]

const mapStateToProps = state => ({
    sentences: state.sentences.sentences
})

export default connect(mapStateToProps, {editRequirement, getSentences, editReqPriorityAfterEffect})(RequirementEditForm);
