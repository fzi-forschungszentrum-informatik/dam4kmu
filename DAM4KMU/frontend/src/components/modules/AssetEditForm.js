import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { editAsset } from '../../actions/assets';



// todo django user for author and reviewer
export class AssetEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.data.name,
            description: props.data.description,
            version: props.data.version,
            subversion: props.data.subversion,
            archieved: props.data.archieved,
            id: props.data.id
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        editAsset: PropTypes.func.isRequired
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
        const {name, description, version, subversion, archieved, id} = this.state;
        const asset = {name, description, version, subversion, archieved}
        this.props.editAsset(asset, id);
        this.props.closeModal();
    }

    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Edit current selected Asset</h2>
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
                            Save
                        </button>
                        <button className="btn btn-secondary" onClick={this.props.closeModal}>Cancel</button>
                    </div>
                </form>

            </div>
        )
    }
}

export default connect(null, {editAsset})(AssetEditForm);
