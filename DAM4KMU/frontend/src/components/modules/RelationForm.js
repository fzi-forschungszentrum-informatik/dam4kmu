import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { addRelation } from '../../actions/relations';
import { getAssets } from '../../actions/assets'
import Select from 'react-select';



export class RelationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first_asset: {value:null},
            type: {
                value: relTypeOptions[0],
                relTypeOptions
            },
            second_asset: {value:null},
            description: "",
            archieved: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    static propTypes = {
        addRelation: PropTypes.func.isRequired,
        assets: PropTypes.array.isRequired,
        getAssets: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.getAssets();
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
        const first_asset = this.state.first_asset.value.value
        const second_asset = this.state.second_asset.value.value
        const type = this.state.type.value.value
        
        const {description, archieved} = this.state;
        const relation = {first_asset, type, second_asset, description, archieved}
        this.props.addRelation(relation);
        
        this.setState({
            first_asset: {value: null},
            type: {
                value: relTypeOptions[0],
                relTypeOptions
            },
            second_asset: {value: null},
            description: "",
            archieved: false
        })
    }

    convertAssetsAsDict() {
        var options = []
        for (var i = 0; i < this.props.assets.length; i++) {
            var asset= this.props.assets[i];
            var assetObj = {
                value: asset.id,
                label: asset.name + ",  id:" + asset.id
            }
            options.push(assetObj);
        }
        return options;
    }

    render() {
        return (
            <div className="card card-body mt-4 mb-4">
                <h2>Add Relation</h2>
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>First Asset</label>
                        <Select
                            value={this.state.first_asset.value}
                            name="first_asset"
                            onChange={this.handleSelectChange}
                            options={this.convertAssetsAsDict()}
                        />
                        
                    </div>

                    <div className="form-group">
                        <label>Type</label>
                        <Select
                            value={this.state.type.value}
                            name="type"
                            onChange={this.handleSelectChange}
                            options={relTypeOptions}
                        />
                        
                    </div>

                    <div className="form-group">
                        <label>Second Asset</label>
                        <Select
                            value={this.state.second_asset.value}
                            name="second_asset"
                            onChange={this.handleSelectChange}
                            options={this.convertAssetsAsDict()}
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
                            Submit
                        </button>
                    </div>
                </form>

            </div>
        )
    }
}

const relTypeOptions = [
    {value: 'contains', label: 'contains'},
    {value: 'dependsOn', label: 'depends on'},
    {value: 'restricts', label: 'restricts'},
    {value: 'isCopyOf', label: 'is copy of'},
    {value: 'extends', label: 'extends'},
    {value: 'revises', label: 'revises'},
    {value: 'hasChild', label: 'has child'},
    {value: 'hasAttribute', label: 'has attribute'},
    {value: 'isReferenceOf', label: 'is reference of'}
]

const mapStateToProps = state => ({
    assets: state.assets.assets
})

export default connect(mapStateToProps, {addRelation, getAssets})(RelationForm);
