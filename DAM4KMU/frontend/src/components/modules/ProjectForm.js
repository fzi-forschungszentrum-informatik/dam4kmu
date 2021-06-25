import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { addProject } from '../../actions/projects';


export class ProjectForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            description: "",
            start_date: getDateTimeNow(),
            end_date: getDateTimeNow(),
            budget: 0,
            manpower: 0,
            cost_per_hour: 10,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        addProject: PropTypes.func.isRequired
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
         const {name, description, start_date, end_date, budget, manpower, cost_per_hour} = this.state;
         const project = {name, description, start_date, end_date, budget, manpower, cost_per_hour}
         this.props.addProject(project);
         this.setState({
            name: "",
            description: "",
            start_date: getDateTimeNow(),
            end_date: getDateTimeNow(),
            budget: 0,
            manpower: 0,
            cost_per_hour: 10
         })
     }

    

    render() {
        return (
            <div>
                <h2>Add new Project</h2>
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
                            Submit
                        </button>
                    </div>
                </form>

            </div>
        )
    }
}

function getDateTimeNow() {
    var d = new Date;
    var n = d.toISOString().substring(0, 19);
    return n;
}

export default connect(null, {addProject})(ProjectForm);
