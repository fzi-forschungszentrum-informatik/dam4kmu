import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import ImpactAnalysisLayout from "./ImpactAnalysisLayout";

function showImpactAnalysis(project) {
  if (project === undefined || project === null) {
    return false;
  } else {
    return true;
  }
}

const ImpactAnalysisGroupLayout = ({ activeProjects}) => {
  const [toggleUpdated, setToggleUpdated] = useState(false);
  useEffect(() => {
    setToggleUpdated(!toggleUpdated);
  }, [activeProjects]);

  return (
    <div>
      {showImpactAnalysis(activeProjects) &&
        activeProjects.map((project, id) => (
          <>
          <ImpactAnalysisLayout
            project={project}
            updated={toggleUpdated}
            key={id}
          />  
          </>
        ))}
    </div>
  );
};

ImpactAnalysisGroupLayout.propTypes = {
  activeProjects: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  activeProjects: state.projects.activeProjects,
});

export default connect(mapStateToProps, null)(
  ImpactAnalysisGroupLayout
);
