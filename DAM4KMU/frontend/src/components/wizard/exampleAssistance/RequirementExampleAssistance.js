import React, { Fragment } from "react";
import styled from "styled-components";

import FunctionalReqExample from "./exampleAssistance/FunctionalReqExample";
import NonFunctionalReqExample from "./exampleAssistance/NonFunctionalReqExample";
import TaskExample from "./exampleAssistance/TaskExample";

const ItemLabelHolder = styled.div`
  font-size: 20px;
`;

function showFunctionalReqExample(srl) {
  if (srl === undefined || srl.length == 0) {
    return false;
  }
  if (srl[2].F >= 30) {
    return true;
  }
  return false;
}

function showNonFunctionalReqExample(srl) {
  if (srl === undefined || srl.length == 0) {
    return false;
  }
  if (srl[2].NF >= 25) {
    return true;
  }
  return false;
}

const RequirementExampleAssistance = ({ srl, assetType, inputValue }) => {
  return (
    <Fragment>
      <ItemLabelHolder>Example Template Assistance</ItemLabelHolder>
      {assetType === "Req" ? (
        <>
          {showFunctionalReqExample(srl) ? (
            <FunctionalReqExample srl={srl} inputValue={inputValue} />
          ) : null}
          {showNonFunctionalReqExample(srl) ? (
            <NonFunctionalReqExample srl={srl} />
          ) : null}
        </>
      ) : (
        <TaskExample srl={srl} />
      )}
    </Fragment>
  );
};

export default RequirementExampleAssistance;
