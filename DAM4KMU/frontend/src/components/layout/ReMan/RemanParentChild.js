import React, { Component, useState } from 'react'
import { connect } from 'react-redux';
import PropTypes, { string } from 'prop-types';
import {Button} from 'reactstrap';
import Modal from 'react-modal';
import SortableTree, {getNodeAtPath} from 'react-sortable-tree';
import ComponentAddFormModal from './ComponentAddFormModal';
import { getComponents } from '../../../actions/components';
import { getRelations, addRelation } from '../../../actions/relations';

Modal.setAppElement('#app');

const componentAddFormModalStyle = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: '60%',
        transform: 'translate(-50%, -50%)'
    },
    overlay: {zIndex: 5000}
};

export class RemanInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: this.props.webInfos.length !== 0 ? this.props.webInfos[0]["parent_child"] : [],
            componentAddFormModalIsOpen: false,
            componentProps: {
                name: "",
                cost: "0",
                description: "",
                version: "0",
                subversion: "0",
            },
        };

        this.openComponentAddFormModal = this.openComponentAddFormModal.bind(this);
        this.closeComponentAddFormModal = this.closeComponentAddFormModal.bind(this);

        this.afterOpenModal = this.afterOpenModal.bind(this);
    }

    openComponentAddFormModal(treeData, path) {
        const currentNode = getNodeAtPath({
            treeData: treeData,
            path: path,
            getNodeKey: ({ treeIndex }) => treeIndex,
          });

        this.setState({
            componentAddFormModalIsOpen: true,
            componentProps: {
                name: currentNode.node.title,
                cost: "0",
                description: "",
                version: "0",
                subversion: "0",
            }
        });
    }

    closeComponentAddFormModal(){
        this.setState({componentAddFormModalIsOpen: false})
    }
        
    afterOpenModal() {
        console.log("Modal opened.");
    }

    insertAddComponentButton(treeData, path) {
        const currentNode = getNodeAtPath({
            treeData: treeData,
            path: path,
            getNodeKey: ({ treeIndex }) => treeIndex,
          });

        var components = this.props.components;
        let component_names = components.map(({name})=>name);

        let button;
        if (component_names.includes(currentNode.node.title)){
            button = <Button disabled={true} color="white"><span>&#9989;</span></Button>;
        }    
        else {
            button = <Button onClick={() => {this.openComponentAddFormModal(this.state.treeData, path)}}><i className="fas fa-plus-square"></i></Button>;
        }
        return button;
    }

    addComponent2Projects(comp_id, missing_projects) {
        for (var i = 0; i < missing_projects.length; i++) {
            const first_asset = missing_projects[i];
            const second_asset = comp_id;
            const type = "contains";
            const description = "";
            const archieved = false;
            const relation = {first_asset, type, second_asset, description, archieved}
            this.props.addRelation(relation);
        }
    }

    insertLinkComponentButton(treeData, path) {
        const currentNode = getNodeAtPath({
            treeData: treeData,
            path: path,
            getNodeKey: ({ treeIndex }) => treeIndex,
        });

        var relations = this.props.relations;

        var components = this.props.components;
        var components_dict = {};
        for (var i = 0; i < components.length; i++) {
            components_dict[components[i].name] =  components[i].id;   
        }

        var active_project_ids = new Array();
        for (var i = 0; i < this.props.activeProjects.length; i++) {
            const active_project = this.props.activeProjects[i]['value'];
            active_project_ids.push(active_project);
        }

        let button;
        var comp_id = components_dict[currentNode.node.title];
        var contain_array = new Array();
        if (comp_id) {
            //Iteriere durch alle relationen und alle aktiven Projekte durch und speichere Liste mit Ids der Projekte, die Componente bereits enthalten.
            for (var j = 0; j < relations.length; j++) {
                if (active_project_ids.includes(relations[j].first_asset) && comp_id == relations[j].second_asset && relations[j].type == "contains") {
                    contain_array.push(relations[j].first_asset)
                }
            }
            
            // Erhalte Liste mit IDs der Projekte, die Component noch nicht enthalten
            const missing_projects = active_project_ids.filter(project => !contain_array.includes(project));
            
            // Füge bei Bedarf Komponente hinzu.
            if (missing_projects.length > 0) {
                button = <Button onClick={() => {this.addComponent2Projects(comp_id, missing_projects)}}><i className="fas fa-file-import"></i></Button>;
            }
            else {
                button = <Button disabled={true} color="white"><span>&#9989;</span></Button>;
            }
        }
        else {
            button = <Button disabled={true}><i className="fas fa-file-import"></i></Button>;
        }

        return button;
    }

    addParentChildRelation(parent_asset, child_asset) {
        const first_asset = parent_asset;
        const second_asset = child_asset;
        const type = "hasChild";
        const description = "";
        const archieved = false;
        const relation = {first_asset, type, second_asset, description, archieved}
        this.props.addRelation(relation);
    }

    insertRelationButton(treeData, path) {
        const currentNode = getNodeAtPath({
            treeData: treeData,
            path: path,
            getNodeKey: ({ treeIndex }) => treeIndex,
          });

        let parent_path = path.slice(0, -1);

        const parentNode = getNodeAtPath({
            treeData: treeData,
            path: parent_path,
            getNodeKey: ({ treeIndex }) => treeIndex,
          });

        var components = this.props.components;
        let component_names = components.map(({name})=>name);
        var relations = this.props.relations;

        var components_dict = {};
        for (var i = 0; i < components.length; i++) {
            components_dict[components[i].name] =  components[i].id;   
        }

        let button;
        button = <Button disabled={true}><i className="fas fa-link"></i></Button>;
        if (component_names.includes(currentNode.node.title)){
            if (component_names.includes(parentNode.node.title)){
                var parent_asset = components_dict[parentNode.node.title]
                var child_asset = components_dict[currentNode.node.title]
                for (var j = 0; j < relations.length; j++) {
                    if (parent_asset == relations[j].first_asset && child_asset == relations[j].second_asset && relations[j].type == "hasChild") {
                        button = <Button disabled={true} color="white"><span>&#9989;</span></Button>;
                        return button;
                    }
                }
                button = <Button onClick={() => {this.addParentChildRelation(parent_asset, child_asset)}}><i className="fas fa-link"></i></Button>;
            }
        }

        return button;
    
    }

    static propTypes = {
        webInfos: PropTypes.array.isRequired,
        components: PropTypes.array.isRequired,
        getComponents: PropTypes.func.isRequired,
        relations: PropTypes.array.isRequired,
        getRelations: PropTypes.func.isRequired,
        addRelation: PropTypes.func.isRequired,
    }

    componentDidMount() {
        this.props.getComponents();
        this.props.getRelations();
      };

    componentDidUpdate(prevProps) { 
      const {
        activeProjects
      } = this.props;
    }

    render() {

            var ranking_possible = this.props.webInfos.length !== 0 ? this.props.webInfos[0]["parent_child_ranking_possible"] : "";
            var ranking_possible_alert = ranking_possible ? "" : "Be careful! All query words are OOV. No relevance ranking possible.";

            return (
                    <div style={{ height: 600 }}>
                    <p><b>Found new components and and corresponding parent-child relations between components.</b></p>
                    <p>Please add parent and child component first, before adding the parent-child relation.</p>
                    <p><b>{ranking_possible_alert}</b></p>
                    
                    <SortableTree
                      style = {{height: '80%'}}
                      treeData={this.state.treeData}
                      onChange={treeData => this.setState({ treeData })}
                      canDrag={false}
                      generateNodeProps={({ node, path }) => ({
                        buttons: path.length == 1
                        // If Source Node only show addComponent
                        ? [

                            // AddComponent
                            this.insertAddComponentButton(this.state.treeData, path),

                            // Link Component to Project
                            this.insertLinkComponentButton(this.state.treeData, path)
                            
                        ]

                        // If Intermediate or Leaf Node show addComponent and add Parent-Child-Relation
                        : [
                            
                            // AddComponent
                            this.insertAddComponentButton(this.state.treeData, path),

                            // Link Component to Project
                            this.insertLinkComponentButton(this.state.treeData, path),

                            // Add ParentChildRelation     
                            this.insertRelationButton(this.state.treeData, path)

                        ]

                    })}
                    />

                    <Modal
                    isOpen={this.state.componentAddFormModalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeComponentAddFormModal}
                    style={componentAddFormModalStyle}
                    contentLabel="Add current selected Node as new Component"
                    >
                        <ComponentAddFormModal data={this.state.componentProps} closeModal={this.closeComponentAddFormModal}/>
                    </Modal>
                </div>
            );
    }
}

const mapStateToProps = state => ({
    webInfos: state.ajax.webInfos,
    components: state.components.components,
    relations: state.relations.relations,
    activeProjects: state.projects.activeProjects,
})

export default connect(mapStateToProps, {getComponents, addRelation, getRelations})(RemanInfo);