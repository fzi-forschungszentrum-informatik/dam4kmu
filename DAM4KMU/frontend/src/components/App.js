import React, { Component, Fragment } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch} from "react-router-dom";
import { Provider } from "react-redux";
import { Provider as AlertProvider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import Dashboard from "./modules/Dashboard";
import RequirementDashboard from "./modules/RequirementDashboard";
import ComponentDashboard from "./modules/ComponentDashboard";
import RelationDashboard from "./modules/RelationDashboard";
import SentenceDashboard from "./modules/SentenceDashboard";
import WordDashboard from "./modules/WordDashboard";
import TaskDashboard from "./modules/TaskDashboard";
import ProjectDashboard from "./modules/ProjectDashboard";

import Header from "./layout/Header";
import ImpactAnalysisGroupLayout from "./layout/ImpactAnalysisGroupLayout";
import Alerts from "./layout/Alerts";
import RemanLayout from "./layout/RemanLayout";
import AssetTextHomePage from "./layout/AssetText/AssetTextHomePage";
import RequirementHomePage from "./layout/AssetText/RequirementHomePage";
import TaskHomePage from "./layout/AssetText/TaskHomePage";

import Home from "./Home";
import RelationDiagram from "./RelationDiagram";
import ComponentWizard from "./wizard/ComponentWizard";
import AssetTextWizard from "./wizard/AssetTextWizard";
import store from "../store";
import "./App.css";
import "react-sortable-tree/style.css";

// Alert Options
const alertOptions = {
  timeout: 3000,
  position: "top center",
};

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <Router>
            <Fragment>
              <Header />
              <Alerts />
              <div style={{ display: "flex", padding: "1vh" }}>
                <div
                  style={{
                    paddingLeft: "7vw",
                    paddingRight: "2vw",
                    width: "80%",
                    float: "left",
                  }}
                >
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route
                      exact
                      path="/assetTextHome"
                      component={AssetTextHomePage}
                    />
                    <Route
                      exact
                      path="/reqTextHome"
                      component={RequirementHomePage}
                    />
                    <Route
                      exact
                      path="/taskTextHome"
                      component={TaskHomePage}
                    />
                    <Route
                      exact
                      path="/reqWizard"
                      render={(props) => {
                        return <AssetTextWizard props={props} />;
                      }}
                    />
                    <Route
                      exact
                      path="/taskWizard"
                      render={(props) => {
                        return <AssetTextWizard props={props} />;
                      }}
                    />
                    <Route exact path="/diagram" component={RelationDiagram} />
                    <Route
                      exact
                      path="/componentWizard"
                      component={ComponentWizard}
                    />
                    <Route exact path="/assetsTab" component={Dashboard} />
                    <Route
                      exact
                      path="/componentsTab"
                      component={ComponentDashboard}
                    />
                    <Route
                      exact
                      path="/relationsTab"
                      component={RelationDashboard}
                    />
                    <Route
                      exact
                      path="/requirementsTab"
                      component={RequirementDashboard}
                    />
                    <Route
                      exact
                      path="/sentencesTab"
                      component={SentenceDashboard}
                    />
                    <Route exact path="/wordsTab" component={WordDashboard} />
                    <Route exact path="/tasksTab" component={TaskDashboard} />
                    <Route
                      exact
                      path="/projectsTab"
                      component={ProjectDashboard}
                    />
                  </Switch>

                  <ImpactAnalysisGroupLayout />
                </div>
                <div
                  className="remanBody bg-dark text-white"
                  style={{
                    width: "20%",
                    height: "auto",
                    float: "left",
                    padding: "20px",
                  }}
                >
                  <RemanLayout />
                </div>
              </div>

              {/* <div className="container" style={styles.container}>
                        </div> */}
            </Fragment>
          </Router>
        </AlertProvider>
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
