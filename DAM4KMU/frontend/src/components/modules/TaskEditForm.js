import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { editTask } from '../../actions/tasks';
import { getSentences } from '../../actions/sentences'
import Select from 'react-select';


export class TaskEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.data.name,
            sentence: this.convertSentencesAsDict()[this.getSelectIndexDefaultValue(this.convertSentencesAsDict(), props.data.sentence)],
            start_date: props.data.start_date,
            end_date: props.data.end_date,
            effort: props.data.effort,
            status: taskStatusOptions[this.getSelectIndexDefaultValue(taskStatusOptions, props.data.status)],
            priority: taskPriorityOptions[this.getSelectIndexDefaultValue(taskPriorityOptions, props.data.priority)],
            description: props.data.description === null ? "" : props.data.description,
            archieved: props.data.archieved,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    static propTypes = {
        editTask: PropTypes.func.isRequired,
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
        console.log(value);
        this.setState({[action.name]: {value}})
    }
    
    handleSubmit = e => {
        e.preventDefault();
        const sentence = this.state.sentence.value.value
        const status = this.state.status.value.value
        const priority = this.state.priority.value.value
        
        const {name, description, start_date, end_date, effort, archieved, id} = this.state;
        const task = {name, sentence, start_date, end_date, effort, status, priority, description, archieved}
        this.props.editTask(task, id);
        
        // todo task priority change after effect
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
            <div>
                <h2>Edit current selected Task</h2>
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
                    <label>Start Date</label>
                        <input
                            className="form-control"
                            type="datetime-local"
                            name="start_date"
                            onChange={this.handleChange}
                            value={this.state.start_date}
                        />
                    </div>
                    <div className="form-group">
                    <label>End Date</label>
                        <input
                            className="form-control"
                            type="datetime-local"
                            name="end_date"
                            onChange={this.handleChange}
                            value={this.state.end_date}
                        />
                    </div>
                    <div className="form-group">
                        <label>Effort</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="effort"
                            onChange={this.handleChange}
                            value={this.state.effort}
                        /> hour
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <Select
                            defaultValue={taskStatusOptions[this.getSelectIndexDefaultValue(taskStatusOptions, this.props.data.status)]}
                            name="status"
                            onChange={this.handleSelectChange}
                            options={taskStatusOptions}
                        />   
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <Select
                            defaultValue={taskPriorityOptions[this.getSelectIndexDefaultValue(taskPriorityOptions, this.props.data.priority)]}
                            name="priority"
                            onChange={this.handleSelectChange}
                            options={taskPriorityOptions}
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

const taskStatusOptions = [
    {value: 'open', label: 'Open'},
    {value: 'in_processing', label: 'In processing'},
    {value: 'in_examination', label: 'In examination'},
    {value: 'completed', label: 'Completed'}
]

const taskPriorityOptions = [
    {value: 'must', label: 'Must'},
    {value: 'should', label: 'Should'},
    {value: 'will', label: 'Will'},
    {value: 'can', label: 'Can'}    
]

const mapStateToProps = state => ({
    sentences: state.sentences.sentences
})

export default connect(mapStateToProps, {editTask, getSentences})(TaskEditForm);
