import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { editProject } from '../../actions/projects';


export class ProjectEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.data.name,
            description: props.data.description,
            start_date: props.data.start_date,
            end_date: props.data.end_date,
            budget: props.data.budget,
            manpower: props.data.manpower,
            cost_per_hour: props.data.cost_per_hour,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        editProject: PropTypes.func.isRequired
    };

    handleChange = e => {
        const target = e.target;
        const value = target.value;
        const name = target.name;
 
        this.setState({
            [name]: value
        })
 
     };
     
     handleSubmit = e => {
         e.preventDefault();
         const {name, description, start_date, end_date, budget, manpower, cost_per_hour, id} = this.state;
         const project = {name, description, start_date, end_date, budget, manpower, cost_per_hour}
         this.props.editProject(project, id);
         this.closeModal();
     }

    

    render() {
        return (
            <div>
                <h2>Edit current selected Project</h2>
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
                        <label>Budget</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="budget"
                            onChange={this.handleChange}
                            value={this.state.budget}
                        /> Euro
                    </div>
                    <div className="form-group">
                        <label>Manpower</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="manpower"
                            onChange={this.handleChange}
                            value={this.state.manpower}
                        /> person
                    </div>
                    <div className="form-group">
                        <label>Cost per hour</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="cost_per_hour"
                            onChange={this.handleChange}
                            value={this.state.cost_per_hour}
                        /> Euro
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

export default connect(null, {editProject})(ProjectEditForm);
