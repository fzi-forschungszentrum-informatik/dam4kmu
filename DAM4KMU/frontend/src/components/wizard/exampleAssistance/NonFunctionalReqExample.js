import React, {Fragment} from 'react'

import './assistanceExample.css'

function fillExample(srl) {
    var srlDict = {
        "refObject": "",
        "attribute": "",
        "attValue": "",
        "priority": "",
        "parentRefObject": "",
        "precision": ""
    }
    if (srl === undefined || srl.length == 0) {
        console.log("empty");
        return srlDict;
    }
    
    if (srl[0].value.length == 0) {
        console.log("empty2");
        return srlDict;
    } 
    
    var rolesString = '{"roles":' + srl[0].value.replace(/'/g, '"') + '}'
    
    var rolesObj = JSON.parse(rolesString);
    var roles = rolesObj.roles;
    for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if (role.type == "refObject") {
            srlDict["refObject"] = role.value;
        } else if (role.type == "attribute") {
            srlDict["attribute"] = role.value;
            
        } else if (role.type == "attValue") {
            srlDict["attValue"] = role.value;
            
        } else if (role.type == "priority") {
            srlDict["priority"] = role.value;
            
        } else if (role.type == "pRefObject") {
            srlDict["parentRefObject"] = role.value;
            
        } else if (role.type == "precision") {
            srlDict["precision"] = role.value
        }
    }
    return srlDict;
}

const NonFunctionalReqExample = ({srl}) => {
    var srlDict = fillExample(srl);

    return (
        <Fragment>
            {/* <p>Nicht_Funktionale Anforderung Beispiel</p> */}
            <div className="exampleText" id="textNF_1">
                <span className="exmpWord attribute" id="attribute1">{srlDict.attribute}</span>
                {' '}
                <span className="exmpWord refObject_NF">{srlDict.parentRefObject}</span>
                {' '}
                <span className="exmpWord parentRefObject_NF" style={{display:"none"}}></span>
                {' '}
                <span className="exmpWord priority">{srlDict.priority}</span>
                {' '}
                <span className="exmpWord comparatorWord">{srlDict.precision}</span>
                {' '}
                <span className="exmpWord attValue">{srlDict.attValue}</span>
                {' '}
                <b><span className="fixedWord">sein.</span></b>
            </div>
        </Fragment>
    )
}

export default NonFunctionalReqExample