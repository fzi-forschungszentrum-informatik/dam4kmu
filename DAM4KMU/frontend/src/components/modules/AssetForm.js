import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { addAsset } from '../../actions/assets';



// todo django user for author and reviewer
export class AssetForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            description: "",
            version: "0",
            subversion: "0",
            archieved: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        addAsset: PropTypes.func.isRequired
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
        const {name, description, version, subversion, archieved} = this.state;
        const asset = {name, description, version, subversion, archieved}
        this.props.addAsset(asset);
        this.setState({
            name: "",
            description: "",
            version: "0",
            subversion: "0",
            archieved: false
        })
    }

    render() {
        // const {name, description, version, subversion, archieved} = this.state;
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Add Asset</h2>
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
                            Submit
                        </button>
                    </div>
                </form>

            </div>
        )
    }
}

export default connect(null, {addAsset})(AssetForm);
