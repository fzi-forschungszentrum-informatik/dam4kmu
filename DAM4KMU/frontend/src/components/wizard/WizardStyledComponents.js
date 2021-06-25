import Select from "react-select";
import styled from "styled-components";

export const TitleLabelHolder = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

export const ItemLabelHolder = styled.div`
  font-size: 20px;
`;

export const GroupHolder = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 10px;
  width: 100%;
`;

export const GroupTableHolder = styled(GroupHolder)`
  justify-content: space-between;
`;

export const ItemHolder = styled(GroupHolder)`
  align-items: center;
  & > div {
    margin-right: 30px;
  }
`;

export const CustomSelect = styled(Select)`
  max-width: 300px;
  width: 100%;
`;

export const RequiredTag = styled.sup`
  color: red;
`;

export const CompCandidatesGroupHolder = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  grid-row-gap: 80px;
  margin-top: 35px;
`;

export const ComponentCandidatesItemHolder = styled.div`
  // display: flex;
  // flex-flow: column nowrap;
`;

export const CustomHorizontalLine = styled.hr`
  border-top: 2px dashed gray;
`;

export const AssistantButton = styled.button`
  color: #fff;
  border-radius: 3px;
  width: 250px;
  background-color: #2a94cf;
  padding: 4px 8px;
  border: 1px solid;
  font-weight: 600;
  margin: 10px 10px;
  :hover:enabled {
    background-color: #237aa9;
  }
`;

export const OldSentenceHolder = styled.div`
  margin-left: 10px;
`;

export const EditSentenceButton = styled.button`
  color: #fff;
  border-radius: 3px;
  width: 70px;
  padding: 4px 8px;
  border: 1px solid #000;
  font-weight: 600;
  background-color: #313435;
  :hover:enabled {
    background-color: #0c0d0d;
  }
`;

export const ItemContentHolder = styled.div`
  max-width: 220px;
  width: 100%;
`;
