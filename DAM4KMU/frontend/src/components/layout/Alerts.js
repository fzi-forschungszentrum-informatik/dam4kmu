import React, { Component, Fragment } from 'react';
import { withAlert } from 'react-alert';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


export class Alerts extends Component {
    static propTypes = {
        error: PropTypes.object.isRequired,
        message: PropTypes.object.isRequired
    }

    componentDidUpdate(prevProps) {
        const {error, alert, message} = this.props;
        if (error !== prevProps.error) {
            if (error.msg.name) {
                alert.error(`Name: ${error.msg.name.join()}`);
            }
            if (error.msg.version) {
                alert.error(`Version: ${error.msg.version.join()}`);
            }
            if (error.msg.subversion) {
                alert.error(`Subversion: ${error.msg.subversion.join()}`);
            }
        }

        if (message !== prevProps.message) {
            if (message.deleteAsset) alert.success(message.deleteAsset);
            if (message.addAsset) alert.success(message.addAsset);
        }
    }
    render() {
        return <Fragment />;
    }
}

const mapStateToProps = state => ({
    error: state.errors,
    message: state.messages
});

export default connect(mapStateToProps)(withAlert()(Alerts));
