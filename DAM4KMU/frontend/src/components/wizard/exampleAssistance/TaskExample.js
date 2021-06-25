import React, { Fragment } from "react";

import "./assistanceExample.css";

function fillExample(srl) {
  var srlDict = {
    refObject: "",
    priority: "",
    parentRefObject: "",
    processWord: "",
    startDate: "",
    endDate: "",
    person: "",
  };
  if (srl === undefined || srl.length == 0) {
    console.log("empty");
    return srlDict;
  }

  if (srl[0].value.length == 0) {
    console.log("empty2");
    return srlDict;
  }

  var rolesString = '{"roles":' + srl[0].value.replace(/'/g, '"') + "}";

  var rolesObj = JSON.parse(rolesString);
  var roles = rolesObj.roles;
  for (var i = 0; i < roles.length; i++) {
    var role = roles[i];
    if (role.type == "refObject") {
      srlDict["refObject"] = role.value;
    } else if (role.type == "priority") {
      srlDict["priority"] = role.value;
    } else if (role.type == "pRefObject") {
      srlDict["parentRefObject"] = role.value;
    } else if (role.type == "processWord") {
      srlDict["processWord"] = role.value;
    }
  }
  return srlDict;
}

const FunctionalReqExample = ({ srl }) => {
  var srlDict = fillExample(srl);

  return (
    <Fragment>
      <div className="exampleText" id="textT_1">
        <span className="exmpWordT person textT_1">{srlDict.refObject}</span>{" "}
        <span className="exmpWordT priority textT_1">
          {srlDict.priority}
        </span>{" "}
        <b>
          <span className="fixedWord">bis</span>
        </b>
        <span className="exmpWordT endDate textT_1"></span>{" "}
        <span className="exmpWordT refObject textT_1">
          {srlDict.refObject}
        </span>{" "}
        <span className="exmpWordT processWord textT_1">
          {srlDict.processWord}
        </span>
      </div>
      <div className="exampleText" id="textT_2">
        <span className="exmpWordT person textT_2">{srlDict.refObject}</span>{" "}
        <span className="exmpWordT priority textT_2">
          {srlDict.priority}
        </span>{" "}
        <b>
          <span className="fixedWord">ab</span>
        </b>{" "}
        <span className="exmpWordT startDate textT_2"></span>{" "}
        <span className="exmpWordT refObject textT_2">
          {srlDict.refObject}
        </span>{" "}
        <span className="exmpWordT processWord textT_2">
          {srlDict.processWord}
        </span>
      </div>
      <div className="exampleText" id="textT_3">
        <span className="exmpWordT person textT_3">{srlDict.refObject}</span>{" "}
        <span className="exmpWordT priority textT_3">
          {srlDict.priority}
        </span>{" "}
        <b>
          <span className="fixedWord">von</span>
        </b>{" "}
        <span className="exmpWordT startDate textT_3"></span>{" "}
        <b>
          <span className="fixedWord">bis</span>
        </b>{" "}
        <span className="exmpWordT endDate textT_3"></span>{" "}
        <span className="exmpWordT refObject textT_3">
          {srlDict.refObject}
        </span>{" "}
        <span className="exmpWordT processWord textT_3">
          {srlDict.processWord}
        </span>
      </div>
    </Fragment>
  );
};

export default FunctionalReqExample;
