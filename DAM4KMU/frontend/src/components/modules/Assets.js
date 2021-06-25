import React, { Component, Fragment} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getAssets, deleteAsset} from '../../actions/assets'

import Modal from 'react-modal';
import AssetEditForm from './AssetEditForm'

Modal.setAppElement('#app');

const customModalStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '60%',
        transform: 'translate(-50%, -50%)'
    },
    overlay: {zIndex: 1000}
};

export class Assets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalIsOpen: false,
            editProps: {
                name: "",
                description: "",
                version: 0,
                subversion: 0,
                archieved: false,
                id: -1,
            }
        }
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    static propTypes = {
        assets: PropTypes.array.isRequired,
        getAssets: PropTypes.func.isRequired,
        deleteAsset: PropTypes.func.isRequired
    }
    
    openModal(asset) {
        this.setState({
            modalIsOpen: true,
            editProps: {
                name: asset.name,
                description: asset.description,
                archieved: asset.archieved,
                version: asset.version,
                subversion: asset.subversion,
                id: asset.id
            }
        })
    }
        
    afterOpenModal() {
        console.log("abcde");
    }
    
    closeModal(){
        this.setState({modalIsOpen: false})
    }
    
    componentDidMount() {
        this.props.getAssets();
    }
        
        
    render() {
        return (
            <Fragment>
            <h2>Assets</h2>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Archieved</th>
                        <th>Version</th>
                        <th>Subversion</th>
                        <th/>
                        <th/>
                    </tr>
                </thead>
                <tbody>
                    {this.props.assets.map(asset => (
                        <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>{asset.name}</td>
                            <td>{asset.description}</td>
                            <td>{asset.archieved ? "True" : "False"}</td>
                            <td>{asset.version}</td>
                            <td>{asset.subversion}</td>
                            <td><button onClick={() => {this.openModal(asset)}} className="btn btn-secondary btn-sm">Edit</button></td>
                            <td><button onClick={this.props.deleteAsset.bind(this, asset.id)} className="btn btn-danger btn-sm">Delete</button></td>
                        </tr>

                    ))}
                </tbody>

            </table>
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customModalStyles}
                contentLabel="Update current selected Asset"
            >
                
                <AssetEditForm data={this.state.editProps} closeModal={this.closeModal}/>
            
            </Modal>
        </Fragment>
    )
    }
}

const mapStateToProps = state => ({
    assets: state.assets.assets
})

export default connect(mapStateToProps, {getAssets, deleteAsset})(Assets);
