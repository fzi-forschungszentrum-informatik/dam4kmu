import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import { addComponent } from '../../actions/components';


export class ComponentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            cost: "0",
            description: "",
            version: "0",
            subversion: "0",
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        addComponent: PropTypes.func.isRequired
    };

    handleChange = e => {
        const target = e.target;
        const value = target.name === 'archieved' ? target.checked : target.value;
        const name = target.name;
 
        this.setState({
            [name]: value
        })
 
     };
     
     handleSubmit = e => {
         e.preventDefault();
         const {name, cost, description, version, subversion} = this.state;
         const component = {name, cost, description, version, subversion}
         this.props.addComponent(component);
         this.setState({
            name: "",
            cost: "0",
            description: "",
            version: "0",
            subversion: "0",
         })
     }

    

    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Add new Component</h2>
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
                        <label>Cost</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="cost"
                            onChange={this.handleChange}
                            value={this.state.cost}
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
                        <label>Version</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="version"
                            onChange={this.handleChange}
                            value={this.state.version}
                        />
                    </div>
                    <div className="form-group">
                        <label>Subversion</label>
                        <input
                            className="form-control"
                            type="number"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            name="subversion"
                            onChange={this.handleChange}
                            value={this.state.subversion}
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


export default connect(null, {addComponent})(ComponentForm);