import React from "react";

import {
  ItemLabelHolder,
  GroupHolder,
  ItemHolder,
  CustomSelect,
  RequiredTag,
} from "./WizardStyledComponents";

const RequirementAdditionalInfos = ({
  updateForm,
  editProps,
  setIsChanged,
  functionalReqProbability,
  nonFunctionalReqProbability,
}) => {
  function triggerUpdateFormReqCategory(value) {
    updateForm("req_category", value);
    setIsChanged(true);
  }

  function getSelectIndexDefaultValue(array, defValue) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].value === defValue) {
        return i;
      }
    }
  }

  return (
    <GroupHolder>
      <ItemHolder>
        <ItemLabelHolder>
          Category<RequiredTag>*</RequiredTag>:
        </ItemLabelHolder>
        <CustomSelect
          options={requirementCategory}
          onChange={triggerUpdateFormReqCategory}
          placeholder={"Select a category..."}
          defaultValue={
            editProps
              ? requirementCategory[
                  getSelectIndexDefaultValue(
                    requirementCategory,
                    editProps.category
                  )
                ]
              : null
          }
        />
      </ItemHolder>
      <ItemHolder>
        <ItemLabelHolder>
          Type:{" "}
          {functionalReqProbability === 0
            ? (editProps ? editProps.type : " -x-")
            : functionalReqProbability > nonFunctionalReqProbability
            ? " Functional-Req"
            : " Non-Functional-Req"}
        </ItemLabelHolder>

        <ItemLabelHolder>
          (<b>F: </b>
          {functionalReqProbability}
        </ItemLabelHolder>
        <ItemLabelHolder>
          <b>NF: </b>
          {nonFunctionalReqProbability})
        </ItemLabelHolder>
      </ItemHolder>
    </GroupHolder>
  );
};

export default RequirementAdditionalInfos;

const requirementCategory = [
  { value: "product", label: "Product" },
  { value: "business", label: "Business" },
  { value: "norm_law", label: "Norm and Law" },
  { value: "plc", label: "PLC" },
  { value: "design", label: "Design" },
];