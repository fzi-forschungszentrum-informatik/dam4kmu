import React, { Component, Fragment } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const AssetTextOptionHolder = styled.div`
  padding: 20px 30px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`;

const AssetTextButtonHolder = styled.button`
  padding: 20px 30px;
  border: 2px black solid;
  width: 100%;
  color: white;
  margin-bottom: 30px;
`;

const LinkHolder = styled(Link)`
  width: 50%;
  display: flex;
  justify-content: center;
  :hover {
    text-decoration: none;
  }
`;

const RequirementButton = styled(AssetTextButtonHolder)`
  background-color: #4db374;
  :hover {
    background-color: #3d8f5c;
  }
`;

const TaskButton = styled(AssetTextButtonHolder)`
  background-color: #6600ff;
  :hover {
    background-color: #5200cc;
  }
`;

const MainLabelHolder = styled.div`
  font-size: 28px;
  color: white;
`;

const DescriptionHolder = styled.div`
  font-size: 18px;
  color: white;
`;

export class AssetTextHomePage extends Component {
  render() {
    return (
      <Fragment>
        <h2>Asset Text - Home</h2>
        <hr />
        <h4>Please choose the following options:</h4>
        <AssetTextOptionHolder>
          <LinkHolder to="/reqTextHome">
            <RequirementButton>
              <MainLabelHolder>
                Requirement
                <hr />
              </MainLabelHolder>
              <DescriptionHolder>
                Describe the functional or non-functional necessary requirements
                for the selected active project.
              </DescriptionHolder>
            </RequirementButton>
          </LinkHolder>
          <LinkHolder to="/taskTextHome">
            <TaskButton>
              <MainLabelHolder>
                Task
                <hr />
              </MainLabelHolder>
              <DescriptionHolder>
                Add or manage some Todos to achieve the goals of the projects.
              </DescriptionHolder>
            </TaskButton>
          </LinkHolder>
        </AssetTextOptionHolder>
      </Fragment>
    );
  }
}

export default AssetTextHomePage;
