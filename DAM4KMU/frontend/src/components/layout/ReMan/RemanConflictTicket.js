import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, Button, CardBody, Card, CardText, Modal, ModalHeader, ModalBody} from 'reactstrap';

import RemanConflict from "./RemanConflict";

export class RemanInfoTicket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false
        };
        
    }

    toggle = () => {
        this.setState({ modal: !this.state.modal });
    };

    static propTypes = { 
        nli_results: PropTypes.array.isRequired,
    }

    render() {

      var default_content = "Please use 'Find Conflict' to find conflicts."
      var content = this.props.nli_results.length !== 0 ? " Found " +  this.props.nli_results[0]["conflicts"].length + " conflict(s) with '" + this.props.nli_results[0]["context"] + "'" : default_content
      var modal_header = "Conflict Results"

      var isValid = this.props.nli_results.length !== 0 ? (this.props.nli_results[0]["conflicts"].length !== 0 ? true : false) : false

      return (
        <div className="centered recommendedAssetInfo Conflicts bg-danger text-white border border-white">
          <span>
            <span><i className="fa fa-exclamation-triangle"></i></span> 
            &nbsp; Conflicts
          </span>
          <Button color="secondary" id="toggler2" style={{width: "100%" }}>
              <i className='fa fa-plus-circle'></i>
          </Button>
          <UncontrolledCollapse toggler="#toggler2" style={{width: "100%", color: "black"}}>
              <Card body className="text-left" inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
                  <CardBody>
                        <CardText> {content} </CardText>
                        <Button onClick={this.toggle} disabled={!isValid}> Manage Conflicts </Button>
                  </CardBody>
              </Card>
          </UncontrolledCollapse>

          <Modal isOpen={this.state.modal} toggle={this.toggle} size="lg">
            <ModalHeader toggle={this.toggle}> {modal_header} </ModalHeader>
            <ModalBody>
                <RemanConflict></RemanConflict>
            </ModalBody>
          </Modal>
        </div>
      );
    }
}

const mapStateToProps = state => ({
  nli_results: state.ajax.nli_results
})

export default connect(mapStateToProps, null)(RemanInfoTicket);