import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

import Requirements from "../../modules/Requirements";

export class RequirementHomePage extends Component {
  render() {
    return (
      <Fragment>
        <Requirements assetType="Req"/>
        <Link
          to={{
            pathname: "/reqWizard",
            state: {
              toEdit: false,
              assetType: "Req"
            },
          }}
        >
          <button
            style={{ marginBottom: "15px" }}
            className="btn btn-secondary"
          >
            Create new Requirement
          </button>
        </Link>
      </Fragment>
    );
  }
}

export default RequirementHomePage;
