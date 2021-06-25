import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';

import RemanConflictTicket from "./RemanConflictTicket";
import RemanInfoTicket from "./RemanInfoTicket";
import RemanParentChildTicket from "./RemanParentChildTicket";
import RemanEntailmentTicket from "./RemanEntailmentTicket";

export class RemanTickets extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    static propTypes = { 
        nli_results: PropTypes.array.isRequired,
        webInfos: PropTypes.array.isRequired,
    }

    insertParentChild() {
        let showParentChild = this.props.webInfos.length !== 0 ? <RemanParentChildTicket></RemanParentChildTicket> : "";
        return showParentChild;
    }

    insertInfo() {
        let showInfo= this.props.webInfos.length !== 0 ? <RemanInfoTicket></RemanInfoTicket> : "";
        return showInfo;
    }

    insertPotentialConflicts(nli_results) {

        let showConflict;
        if (nli_results.length !== 0){
            console.log("Is unequal ")
            if (nli_results[0]["conflicts"].length > 0){
                showConflict = <RemanConflictTicket></RemanConflictTicket>
            }
            else{
                showConflict = <Alert color="success"> No conflict(s) found for <br></br> '{nli_results[0]["context"]}'! </Alert>
            }
        }
        else{
            showConflict = "";
        }

        return showConflict;
    }

    insertPotentialEntailments(nli_results) {

        let showRelations;
        if (nli_results.length !== 0){
            console.log("Is unequal ")
            if (nli_results[0]["entailments"].length > 0){
                showRelations = <RemanEntailmentTicket></RemanEntailmentTicket>
            }
            else{
                showRelations = <Alert color="secondary"> No potential entailments found for <br></br> '{nli_results[0]["context"]}'! </Alert>
            }
        }
        else{
            showRelations = "";
        }

        return showRelations;
    }

    render() {
        var nli_results = this.props.nli_results;
        return (
            <div>
                <p><b>Research Assistant</b></p>
                {this.insertParentChild()}
                {this.insertInfo()}
                <hr className="remanBody"/>
                <p><b>Potential Conflicts</b></p>
                {this.insertPotentialConflicts(nli_results)}
                <hr className="remanBody"/>
                <p><b>Potential Entailments</b></p>
                {this.insertPotentialEntailments(nli_results)}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    webInfos: state.ajax.webInfos,
    nli_results: state.ajax.nli_results
})

export default connect(mapStateToProps, null)(RemanTickets);