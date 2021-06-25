import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import PropTypes, { node } from 'prop-types';
import Graph from "react-graph-vis";
import styled from "styled-components";

import { getAssets } from '../actions/assets'
import { getRelations } from '../actions/relations'
import {getProjects} from '../actions/projects'

const LegendHolder = styled.div`
  position: absolute;
  top: 14em; 
  left: 1em;
  justify-content: center;
  margin-bottom: 0;
  margin-top: 15px;
  & > div {
    margin-left: 40px;
    margin-right: 15px;
  }
`;

const LabelHolder = styled.div`
  margin-left: 0px !important;
`;

export class RelationDiagram extends Component {

  static propTypes = {
    assets: PropTypes.array.isRequired,
    getAssets: PropTypes.func.isRequired,
    relations: PropTypes.array.isRequired,
    getRelations: PropTypes.func.isRequired,
    getProjects: PropTypes.func.isRequired,
    activeProjects: PropTypes.array.isRequired, // New
  }

  componentDidMount() {
    this.props.getAssets();
    this.props.getRelations();
    this.props.getProjects();
  }

  // New 
  componentDidUpdate(prevProps) { 
    const {
      activeProjects
    } = this.props;

    if (this.state.getProjectColors==0){
      var colorDict = {}
      for (var i = 0; i < this.props.projects.length; i++){
          var randomColor = Math.floor(Math.random()*16777215).toString(16); 
          var project = this.props.projects[i].id;
          colorDict[project] = "#"+randomColor;
      }
      this.setState({getProjectColors: 1})
      this.setState({projectColorDict: colorDict})
    }
  }
    
  constructor() { 
    super();
    this.state = {
      edgeColorDict: {
        dependsOn: "pink",
        contains: "blue",
        restricts: "green",
        isCopyOf: "yellow",
        isReferenceOf: "orange",
        extends: "brown",
        revise: "purple",
        hasChild: "maroon",
        hasAttribute: "grey",
      },
      projectColorDict: {},
      getProjectColors: 0,
      options: {
        height: '500px',
        width: '1000px',
        layout: {
          hierarchical: false,
        },
        edges: {
          color: "#000000",
        },
        nodes: {
          shape: "dot",
          size: 16,
        },
        physics: {
          enabled: true,
          "barnesHut": {
            "avoidOverlap": 0.3
          }
        },
        interaction: {
          multiselect: true, 
          navigationButtons: true
        },
        groups: {
          project1: {color:{background:'red'}}
        }
      },
      graph: {
        nodes: [],
        edges: []
      },
    };
  }

  getData() {
    var assets = this.props.assets;
    var relations = this.props.relations;

    //Get assets_dict for asset.id->asset.name-Mapping
    var assets_dict = {};
    for (var i = 0; i < assets.length; i++) {
        assets_dict[assets[i].id] =  assets[i].name; 
    }

    var nodes_array = new Array();
    var relation_array = new Array();
    var node_ids = new Array();
    var active_project_ids = new Array();
    var queue = new Array();

    // Get array of ids of all active projects and create nodes for active projects
    for (var i = 0; i < this.props.activeProjects.length; i++) {
        const active_project = this.props.activeProjects[i]['value'];

        nodes_array.push({id: active_project, label: assets_dict[active_project], shape: "triangle", size: 25,color: this.state.projectColorDict[active_project]});
        node_ids.push(active_project);

        active_project_ids.push(active_project);
    }

    // Set all active projects as queue
    queue = active_project_ids;

    // Start with active_project_ids as seed
    // Iterate over relation list, and append the relation of the k-hop neighborhood in the k-th step
    while(queue.length > 0) {
      var new_queue = new Array();
      for (var i = 0; i < relations.length; i++) {
        const source = relations[i].first_asset;
        const target = relations[i].second_asset;
        if (queue.includes(source)){
          // If we want to include the label, we have to insert label: relations[i].type
          relation_array.push({from: source, to: target, font: {align: "middle"}, width: 2, color: { color: this.state.edgeColorDict[relations[i].type]}});
          if (!node_ids.includes(source)){
            nodes_array.push({id: source, label: assets_dict[source], group: 'project1', size: 10});
            node_ids.push(source);
          }
          if (!node_ids.includes(target)){ 
            nodes_array.push({id: target, label: assets_dict[target], group: 'project1', size: 10});
            node_ids.push(target);  
          }
          if (!new_queue.includes(target)){
            new_queue.push(target);
          }
        }
      }
      queue = new_queue;
    }

    var data_dict = {"nodes": nodes_array, "links": relation_array};
      
    return data_dict
  }

  render() {
    if (this.props.activeProjects !== null) {
      var data_dict = this.getData()
      var nodes_array = data_dict["nodes"]
      var links_array = data_dict["links"]
    }
    else {
      var nodes_array = {}
      var links_array = {}
    }

    return (
      <Fragment>
        <h2><b>Relation Diagram</b></h2>
        <Graph 
        graph={{nodes: nodes_array, edges: links_array}} 
        options={this.state.options} 
        />

        <LegendHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "pink"}}
        ></div>
        <LabelHolder>dependsOn</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "blue"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>contains</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "green"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>restricts</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "yellow"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>isCopyOf</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "orange"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>isReferenceOf</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "brown"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>extends</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "purple"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>revise</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "maroon"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>hasChild</LabelHolder>
        <div
          style={{ width: "10px", height: "10px", backgroundColor: "grey"}}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
        <LabelHolder>hasAttribute</LabelHolder>
        </LegendHolder>
      </Fragment>
      
    );
  }
}

const mapStateToProps = state => ({
    assets: state.assets.assets,
    relations: state.relations.relations,
    projects: state.projects.projects, 
    activeProjects: state.projects.activeProjects,
})

export default connect(mapStateToProps, {getAssets, getRelations, getProjects})(RelationDiagram);