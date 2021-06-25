import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { getProjectEffortAndCost } from "../../actions/ajax";
import ActiveProjectRelatedAssetsLayout from "./ActiveProjectRelatedAssetsLayout";

const ItemRowHolder = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-bottom: 15px;
`;

const ItemLegendHolder = styled(ItemRowHolder)`
  justify-content: center;
  margin-bottom: 0;
  margin-top: 15px;
  & > div {
    margin-left: 40px;
    margin-right: 15px;
  }
`;

const LegendLabelHolder = styled.div`
  margin-left: 0px !important;
`;

const ItemLabelHolder = styled.div`
  width: 15%;
  float: left;
  font-weight: bold;
`;

const ItemValueHolder = styled.div`
  width: 85%;
  float: left;
`;

const ShowProjectPropertiesButton = styled.button`
  color: #fff;
  background-color: #2a94cf;
  padding: 8px 15px;
  border: none;
  font-weight: 600;
  float: right;
  margin-left: 5px;
  :hover {
    background-color: #156794;
  }
`;

const RefreshButton = styled.button`
  background-color: none;
  float: right;
`;

const ItemRowPropertiesHolder = styled(ItemRowHolder)`
  margin-bottom: 0px !important;
  & > div {
    width: 20%;
  }
`;

const PropertiesLabelHolder = styled.div`
  margin: 0 10px 5px;
`;

const PropertiesHolder = styled.div`
  background-color: #404040;
  padding: 10px 15px;
  border: 2px dotted #666666;
`;

const AlertTextHolder = styled.div`
  color: #db1414;
  font-size: 20px;
`;

function getRelevantProjectPropertiesObject(project_properties, project_id) {
  var index = 0;
  project_properties.map((item, i) => {
    if (item.id === project_id) {
      index = i;
    }
  });
  return project_properties[index];
}

function ImpactAnalysis({
  project,
  // updated, // maybe for something..
  projectProperties,
  getProjectEffortAndCost,
}) {
  useEffect(() => {
    getProjectEffortAndCost({ project_id: project.value });
  }, [project]);

  const projProp = useMemo(() => {
    return getRelevantProjectPropertiesObject(projectProperties, project.value);
  }, [projectProperties]);

  const wastedTime = function () {
    return projProp ? projProp.effort.elapsed - projProp.effort.completed : 0;
  };

  const remEffort = function () {
    return projProp
      ? ((projProp.effort.remaining / projProp.effort.total) * 100).toFixed(2)
      : null;
  };

  const completedEffort = function () {
    return projProp
      ? ((projProp.effort.completed / projProp.effort.total) * 100).toFixed(2)
      : null;
  };

  const wastedTimeBar = function () {
    return projProp ? ((wastedTime() / projProp.effort.total) * 100).toFixed(2) : null;
  };

  //   const wastedCostBar = function () {
  //     return projProp
  //       ? ((wastedTime() * projProp.cost.cost_per_hour) / projProp.cost.total) *
  //           100
  //       : null;
  //   };

  const elapsedTimeBar = function () {
    return projProp
      ? ((projProp.effort.elapsed / projProp.effort.total) * 100).toFixed(2)
      : null;
  };

  const remCost = function () {
    return projProp
      ? (projProp.cost.remaining / projProp.cost.total) * 100
      : null;
  };

  const completedCost = function () {
    return projProp
      ? (projProp.cost.completed / projProp.cost.total) * 100
      : null;
  };

  const compCost = function () {
    return projProp
      ? (projProp.cost.comp_cost / projProp.cost.total) * 100
      : null;
  };

  const newAllocatedEffort = function () {
    if (project.new_effort > 0) {
      return projProp
        ? ((project.new_effort / projProp.effort.total) * 100).toFixed(2)
        : null;
    } else {
      return null;
    }
  };

  const newAllocatedCost = function () {
    if (project.new_cost > 0) {
      return projProp ? (project.new_cost / projProp.cost.total) * 100 : null;
    } else {
      return null;
    }
  };

  const newAllocatedHourlyCost = function () {
    if (project.new_effort > 0) {
      return projProp
        ? ((project.new_effort * project.cost_per_hour) / projProp.cost.total) *
            100
        : null;
    } else {
      return null;
    }
  };

  const isEffortBarExceeded = useCallback(() => {
    if (projProp) {
      var totalBarPercentage = completedEffort() + remEffort();
      if (wastedTime() > 0) {
        totalBarPercentage += wastedTimeBar();
      }
      if (project.new_effort > 0) {
        totalBarPercentage += newAllocatedEffort();
      }
      if (totalBarPercentage > 100) {
        return true;
      }
    }
    return false;
  }, [projectProperties, project]);

  const isCostBarExceeded = useCallback(() => {
    if (projProp) {
      var totalBarPercentage = remCost() + compCost() + completedCost();
      //   if (wastedTime() > 0) {
      //     totalBarPercentage += wastedCostBar();
      //   }
      if (project.new_cost > 0) {
        totalBarPercentage += newAllocatedCost();
      }
      if (project.new_effort > 0) {
        totalBarPercentage += newAllocatedHourlyCost();
      }
      if (totalBarPercentage > 100) {
        return true;
      }
    }
    return false;
  }, [projectProperties]);

  const today = new Date();

  const [showProperties, setShowProperties] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const toggleShowProperties = useCallback(() => {
    setShowProperties(!showProperties);
  }, [showProperties]);

  const toggleShowImpact = useCallback(() => {
    setShowImpact(!showImpact);
  }, [showImpact]);

  const toggleRefresh = useCallback(() => {
    getProjectEffortAndCost({ project_id: project.value });
    setRefresh(!refresh);
  }, [refresh]);

  return (
    <div
      className="bg-dark text-white"
      style={{
        display: "flex",
        flexFlow: "column nowrap",
        padding: "20px",
        marginBottom: "10px",
      }}
    >
      {isCostBarExceeded() ? (
        <ItemRowHolder>
          <AlertTextHolder>
            Warning insufficient Budget, please add appropriate budget or adjust
            the cost!
          </AlertTextHolder>
        </ItemRowHolder>
      ) : null}
      {isEffortBarExceeded() ? (
        <ItemRowHolder>
          <AlertTextHolder>
            Warning insufficient working time, please reschedule your tasks in
            the project!
          </AlertTextHolder>
        </ItemRowHolder>
      ) : null}
      <ItemRowHolder>
        <ItemLabelHolder>Project Name:</ItemLabelHolder>
        <ItemValueHolder style={{ width: "65%" }}>
          {project.label}
        </ItemValueHolder>
        <RefreshButton onClick={toggleRefresh}>
          <i className="fas fa-sync" aria-hidden="true"></i>
        </RefreshButton>
        <ShowProjectPropertiesButton onClick={toggleShowProperties}>
          {showProperties ? "hide details" : "show details"}
        </ShowProjectPropertiesButton>
        <ShowProjectPropertiesButton onClick={toggleShowImpact}>
          {showImpact ? "hide impact" : "show impact"}
        </ShowProjectPropertiesButton>
      </ItemRowHolder>
      <ItemRowHolder style={{ marginBottom: "0px" }}>
        <ItemLabelHolder>Time Allocation Bar:</ItemLabelHolder>
        <ItemValueHolder>
          <div
            style={{
              height: "14px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "12px",
              }}
            >
              {projProp ? projProp.start_date : null}
            </div>
            <div
              style={{
                fontSize: "12px",
              }}
            >
              {projProp ? projProp.end_date : null}
            </div>
          </div>
          <div className="progress bg-dark" style={{ height: "12px" }}>
            <div
              className="progress-bar-marker"
              role="progressbar"
              style={{
                width: elapsedTimeBar() + "%",
                backgroundColor: "none",
                borderRight: "4px white solid",
              }}
              aria-valuenow={elapsedTimeBar()}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <div
              className="progress-bar bg-dark"
              role="progressbar"
              style={{
                width: "11%",
                fontSize: "10px",
              }}
              aria-valuenow="11"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              Today {today.toISOString().substr(0, 10)}
            </div>
          </div>
          <div className="progress" style={{ height: "18px" }}>
            {wastedTime() > 0 ? (
              <div
                className="progress-bar progress-bar-striped"
                role="progressbar"
                style={{
                  width: wastedTimeBar() + "%",
                  backgroundColor: "lightgrey",
                }}
                aria-valuenow={wastedTimeBar()}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {wastedTimeBar()}%
              </div>
            ) : null}
            <div
              className="progress-bar progress-bar-striped"
              role="progressbar"
              style={{ width: completedEffort()+ "%" }}
              aria-valuenow={completedEffort()}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {completedEffort()}%
            </div>
            <div
              className="progress-bar progress-bar-striped bg-warning"
              role="progressbar"
              style={{ width: remEffort() + "%" }}
              aria-valuenow={remEffort()}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {remEffort()}%
            </div>
            {project.new_effort > 0 ? (
              <div
                className="progress-bar progress-bar-striped bg-info"
                role="progressbar"
                style={{ width: newAllocatedEffort() + "%" }}
                aria-valuenow={newAllocatedEffort()}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {newAllocatedEffort()}%
              </div>
            ) : null}
          </div>
          <div className="progress bg-dark" style={{ height: "12px" }}>
            <div
              className="progress-bar-marker"
              role="progressbar"
              style={{
                width: elapsedTimeBar() + "%",
                backgroundColor: "none",
                borderRight: "4px white solid",
              }}
              aria-valuenow={elapsedTimeBar()}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div className="progress bg-dark" style={{ height: "14px" }}>
            <div
              className="progress-bar-marker"
              role="progressbar"
              style={{
                width: elapsedTimeBar() + "%",
                backgroundColor: "none",
              }}
              aria-valuenow={elapsedTimeBar()}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </ItemValueHolder>
      </ItemRowHolder>
      <ItemRowHolder style={{ marginBottom: "0px" }}>
        <ItemLabelHolder>Cost Allocation Bar:</ItemLabelHolder>
        <ItemValueHolder>
          {/* <ProgressBar striped now={45} label={"45%"} height={"30px"} /> */}
          <div
            style={{
              height: "14px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "12px",
              }}
            >
              0 &euro;
            </div>
            <div
              style={{
                fontSize: "12px",
              }}
            >
              {projProp ? projProp.cost.total : null} &euro;
            </div>
          </div>
          <div className="progress" style={{ height: "18px" }}>
            {/* {wastedTime() > 0 ? (
              <div
                className="progress-bar progress-bar-striped"
                role="progressbar"
                style={{
                  width: parseInt(wastedCostBar()) + "%",
                  backgroundColor: "lightgrey",
                }}
                aria-valuenow={wastedCostBar()}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {parseInt(wastedTimeBar())}%
              </div>
            ) : null} */}
            <div
              className="progress-bar progress-bar-striped bg-success"
              role="progressbar"
              style={{ width: parseInt(compCost()) + "%" }}
              aria-valuenow={compCost()}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {parseInt(compCost())}%
            </div>
            <div
              className="progress-bar progress-bar-striped"
              role="progressbar"
              style={{ width: parseInt(completedCost()) + "%" }}
              aria-valuenow={completedCost()}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {parseInt(completedCost())}%
            </div>
            <div
              className="progress-bar progress-bar-striped bg-warning"
              role="progressbar"
              style={{ width: parseInt(remCost()) + "%" }}
              aria-valuenow={remCost()}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {parseInt(remCost())}%
            </div>
            {project.new_effort > 0 ? (
              <div
                className="progress-bar progress-bar-striped bg-info"
                role="progressbar"
                style={{ width: parseInt(newAllocatedHourlyCost()) + "%" }}
                aria-valuenow={newAllocatedHourlyCost()}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {parseInt(newAllocatedHourlyCost())}%
              </div>
            ) : null}
            {project.new_cost > 0 ? (
              <div
                className="progress-bar progress-bar-striped bg-info"
                role="progressbar"
                style={{ width: parseInt(newAllocatedCost()) + "%" }}
                aria-valuenow={newAllocatedCost()}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {parseInt(newAllocatedCost())}%
              </div>
            ) : null}
          </div>
          <div className="progress bg-dark" style={{ height: "14px" }}></div>
        </ItemValueHolder>
      </ItemRowHolder>
      {showProperties && projProp ? (
        <PropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Manpower (in hour): {projProp.effort.total}h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Completed Effort: {projProp.effort.completed}h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Allocated Effort: {projProp.effort.remaining}h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder style={{ width: "25%" }}>
              Wasted Time: {wastedTime()}h
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Budget: {projProp.cost.total}&euro;
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Completed Cost: {projProp.cost.completed}&euro;
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Allocated Cost: {projProp.cost.remaining}&euro;
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Component Cost: {projProp.cost.comp_cost}&euro;
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Remaining Time:{" "}
              {projProp.effort.total -
                projProp.effort.completed -
                projProp.effort.remaining -
                (wastedTime() > 0 ? wastedTime() : 0)}
              h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Remaining Budget:{" "}
              {projProp.cost.total -
                projProp.cost.completed -
                projProp.cost.remaining -
                projProp.cost.comp_cost}
              &euro;
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Elapsed Time: {projProp.effort.elapsed}h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Cost per hour: {projProp.cost.cost_per_hour}&euro;
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
        </PropertiesHolder>
      ) : null}
      {showImpact && projProp ? (
        <PropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Impact Effort:{" "}
              {project.new_effort > 0
                ? (
                    (project.new_effort /
                      (projProp.effort.completed +
                        projProp.effort.remaining +
                        (wastedTime() > 0 ? wastedTime() : 0))) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              New Alloc. Effort: {project.new_effort}h
            </PropertiesLabelHolder>
            <PropertiesLabelHolder style={{ width: "35%" }}>
              Total Used Manpower:{" "}
              {projProp.effort.completed + projProp.effort.remaining}h
              {/* {(projProp.effort.completed +
                projProp.effort.remaining +
                (wastedTime() > 0 ? wastedTime() : 0)) *
                projProp.cost.cost_per_hour}
              &euro;) */}
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Impact Budget:{" "}
              {project.new_cost > 0
                ? (
                    (project.new_cost /
                      (projProp.cost.completed +
                        projProp.cost.remaining +
                        projProp.cost.comp_cost)) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              New Alloc. Cost: {project.new_cost}&euro;
            </PropertiesLabelHolder>
            <PropertiesLabelHolder>
              Total Used Cost:{" "}
              {projProp.cost.completed +
                projProp.cost.remaining +
                projProp.cost.comp_cost}
              &euro;
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
          <ItemRowPropertiesHolder>
            <PropertiesLabelHolder>
              Total Impact:{" "}
              {project.new_cost > 0 || project.new_effort > 0
                ? (
                    ((project.new_cost + project.new_effort) /
                      (projProp.cost.completed +
                        projProp.cost.remaining +
                        projProp.cost.comp_cost +
                        (projProp.effort.completed +
                          projProp.effort.remaining +
                          (wastedTime() > 0 ? wastedTime() : 0)))) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </PropertiesLabelHolder>
          </ItemRowPropertiesHolder>
        </PropertiesHolder>
      ) : null}

      <ItemLegendHolder>
        <div
          className="progress-bar progress-bar-striped"
          role="progressbar"
          style={{ width: "10px", height: "10px" }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LegendLabelHolder>Completed / Used</LegendLabelHolder>
        <div
          className="progress-bar progress-bar-striped bg-warning"
          role="progressbar"
          style={{ width: "10px", height: "10px" }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LegendLabelHolder>Allocated</LegendLabelHolder>
        <div
          className="progress-bar progress-bar-striped bg-info"
          role="progressbar"
          style={{ width: "10px", height: "10px" }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LegendLabelHolder>New Allocation</LegendLabelHolder>
        <div
          className="progress-bar progress-bar-striped bg-success"
          role="progressbar"
          style={{ width: "10px", height: "10px" }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LegendLabelHolder>Component_Cost</LegendLabelHolder>
        <div
          className="progress-bar progress-bar-striped"
          role="progressbar"
          style={{
            width: "10px",
            height: "10px",
            backgroundColor: "lightgrey",
          }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LegendLabelHolder>Wasted Time</LegendLabelHolder>
      </ItemLegendHolder>
      <ActiveProjectRelatedAssetsLayout project={project} />
    </div>
  );
}

ImpactAnalysis.propTypes = {
  projectProperties: PropTypes.array.isRequired,
  getProjectEffortAndCost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  projectProperties: state.ajax.projectProperties,
});

export default connect(mapStateToProps, { getProjectEffortAndCost })(
  ImpactAnalysis
);
