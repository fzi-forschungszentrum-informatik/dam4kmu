import React, { Fragment } from "react";

import "./assistanceExample.css";

function fillExample(srl) {
  var srlDict = {
    refObject: "",
    object: "",
    actor: "",
    priority: "",
    processWord: "",
    parentRefObject: "",
    parentObject: "",
    parentActor: "",
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
    } else if (role.type == "object") {
      srlDict["object"] = role.value;
    } else if (role.type == "actor") {
      srlDict["actor"] = role.value;
    } else if (role.type == "priority") {
      srlDict["priority"] = role.value;
    } else if (role.type == "processWord") {
      srlDict["processWord"] = role.value;
    }
  }

  var detectedParentObjects = srl[3].pRefObject.split(", ");

  if (srl[4].length != 0) {
    srlDict["parentRefObject"] = fillParentChildExample(
      srlDict["refObject"],
      detectedParentObjects,
      srl[4]
    );
    srlDict["parentActor"] = fillParentChildExample(
      srlDict["actor"],
      detectedParentObjects,
      srl[4]
    );
    srlDict["parentObject"] = fillParentChildExample(
      srlDict["object"],
      detectedParentObjects,
      srl[4]
    );
  }

  return srlDict;
}

function fillParentChildExample(child, detectedParents, relations) {
  var result = "";
  relations.forEach((rel) => {
    if (child.includes(rel.children[0])) {
      detectedParents.forEach((detParObj) => {
        if (detParObj.includes(rel.parent)) {
          result = " " + detParObj;
        }
      });
    }
  });
  return result;
}

const FunctionalReqExample = ({ srl, inputValue }) => {
  var srlDict = fillExample(srl);
  return (
    <Fragment>
      {/* <p>Functional Requirement Example</p> */}
      <div className="exampleText" id="textF_1">
        <span className="exmpWordF refObject textF_1" id="refObject1">
          {srlDict.refObject}
          {srlDict.parentRefObject}
        </span>{" "}
        <span
          className="exmpWordF parentRefObject textF_1"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF priority textF_1">{srlDict.priority}</span>{" "}
        <span className="exmpWordF object textF_1">
          {srlDict.object}
          {srlDict.parentObject}
        </span>{" "}
        <span
          className="exmpWordF parentObject textF_1"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF processWord textF_1">
          {srlDict.processWord}
        </span>
      </div>
      <div className="exampleText" id="textF_2">
        <span className="exmpWordF refObject" id="refObject1">
          {srlDict.refObject}
          {srlDict.parentRefObject}
        </span>{" "}
        <span
          className="exmpWordF parentRefObject"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF priority textF_1">{srlDict.priority}</span>{" "}
        <span className="exmpWordFFW functionWord1">
          {inputValue.includes("fähig sein") ? "fähig sein" : ""}
        </span>{" "}
        <span className="exmpWordF object">
          {srlDict.object}
          {srlDict.parentObject}
        </span>{" "}
        <span
          className="exmpWordF parentObject"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF processWord">
          {srlDict.processWord ? "zu " + srlDict.processWord : ""}
        </span>
      </div>
      <div className="exampleText" id="textF_3">
        <span className="exmpWordF refObject">
          {srlDict.refObject}
          {srlDict.parentRefObject}
        </span>{" "}
        <span
          className="exmpWordF parentRefObject"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF priority">{srlDict.priority}</span>{" "}
        <span className="exmpWordF actor">
          {srlDict.actor}
          {srlDict.parentActor}
        </span>{" "}
        <span
          className="exmpWordF parentActor"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordFFW functionWord2">
          {inputValue.includes("die Möglichkeit bieten")
            ? "die Möglichkeit bieten"
            : ""}
        </span>{" "}
        <span className="exmpWordF object">
          {srlDict.object}
          {srlDict.parentObject}
        </span>{" "}
        <span
          className="exmpWordF parentObject"
          style={{ display: "none" }}
        ></span>{" "}
        <span className="exmpWordF processWord">{srlDict.processWord}</span>
      </div>
    </Fragment>
  );
};

export default FunctionalReqExample;
