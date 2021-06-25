import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { UncontrolledCollapse, Button, CardBody, Card, CardText, Modal, ModalHeader, ModalBody} from 'reactstrap';

import RemanParentChild from "./RemanParentChild";

export class RemanParentChildTicket extends Component {
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
        webInfos: PropTypes.array.isRequired
    }

    render() {
      var default_content = "Please use 'Start Research Assistant' to get new components and new relations."
      var content = this.props.webInfos.length !== 0 ? " Found " + Object.keys(this.props.webInfos[0]["parent_child"]).length + " new component(s) for '" + this.props.webInfos[0]["context"] + "'" : default_content
      var modal_header = "Web Scraping Results"

      var isValid = this.props.webInfos.length !== 0 ? true : false

      return (
        <div className="centered recommendedAssetInfo Components bg-success text-white border border-white">
          <span>
            <span><i className="fa fa-plug"></i></span> 
            &nbsp; Components
          </span>
          <Button color="secondary" id="toggler1" style={{width: "100%" }}>
              <i className='fa fa-plus-circle'></i>
          </Button>
          <UncontrolledCollapse toggler="#toggler1" style={{width: "100%", color: "black"}}>
              <Card body className="text-left" inverse style={{ backgroundColor: '#333', borderColor: '#333' }}>
                  <CardBody>
                        <CardText> {content} </CardText>
                        <Button onClick={this.toggle} disabled={!isValid}> Manage Parent-Child </Button>
                  </CardBody>
              </Card>
          </UncontrolledCollapse>

          <Modal isOpen={this.state.modal} toggle={this.toggle} size="lg">
            <ModalHeader toggle={this.toggle}> {modal_header} </ModalHeader>
            <ModalBody>
                <RemanParentChild></RemanParentChild>
            </ModalBody>
          </Modal>
        </div>
      );
    }
}

const mapStateToProps = state => ({
    webInfos: state.ajax.webInfos
})

export default connect(mapStateToProps, null)(RemanParentChildTicket);