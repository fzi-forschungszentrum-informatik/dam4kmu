import React, { Fragment, Component } from "react";
import { Prompt } from "react-router-dom";
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
  changeNodeAtPath,
  getNodeAtPath,
} from "react-sortable-tree";
import Select from "react-select";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Modal from "react-modal";
import matchSorter from "match-sorter";

import {
  getRelatedComponentsFromProject,
  getRelatedComponentsFromDownshift,
  getFilteredComponentsAutocompleteSuggestion,
  saveButtonComponentWizard,
} from "../../actions/ajax";
import { getProjects } from "../../actions/projects";
import RelatedAssetsTable from "../RelatedAssetsTable";
import CustomDownshift from "../CustomDownshift";

Modal.setAppElement("#app");

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    width: "60%",
    transform: "translate(-50%, -50%)",
  },
  overlay: { zIndex: 1000 },
};

var lastHighlightedIndexClicked = -1;

// setChildren and parent ref Id to -1 (not the siblings)
function changeIntoACopy(treeData, path, toBeDeletedPool) {
  const clonePath = [...path];
  const currentNode = getNodeAtPath({
    treeData: treeData,
    path: clonePath,
    getNodeKey: ({ treeIndex }) => treeIndex,
  });

  console.log(treeData);
  console.log(path);
  console.log(currentNode);
  // check first if object is a reference object or not. False -> exit the whole function.
  if (currentNode.node.ref_id == -1) {
    console.log("The object is already a copy or an independent object");
    return treeData;
  } else {
    if (currentNode.node.comp_id != -1) {
      toBeDeletedPool.push({
        parent_id: currentNode.node.ref_id,
        children_id: currentNode.node.comp_id,
        rel_type: "isReferenceOf",
      });
    }
    currentNode.node.name += " new";
    currentNode.node.ref_id = -1;
  }

  // set children ref_id
  if (currentNode.node.hasOwnProperty("children")) {
    changeChildrenIntoACopy(currentNode.node.children, toBeDeletedPool);
  }

  for (var i = 0; i < path.length - 1; i++) {
    clonePath.pop();
    var currentParentNode = getNodeAtPath({
      treeData: treeData,
      path: clonePath,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });
    if (currentParentNode.node.ref_id != -1) {
      currentParentNode.node.name += " new";
      if (currentParentNode.node.comp_id != -1) {
        toBeDeletedPool.push({
          parent_id: currentParentNode.node.ref_id,
          children_id: currentParentNode.node.comp_id,
          rel_type: "isReferenceOf",
        });
      }
    }
    currentParentNode.node.ref_id = -1;
  }

  return treeData;
}

function changeChildrenIntoACopy(children, toBeDeletedPool) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].comp_id != -1) {
      toBeDeletedPool.push({
        parent_id: children[i].ref_id,
        children_id: children[i].comp_id,
        rel_type: "isReferenceOf",
      });
    }
    children[i].name += " new";
    children[i].ref_id = -1;
    if (children[i].hasOwnProperty("children")) {
      changeChildrenIntoACopy(children[i].children);
    }
  }
}

function searchDuplicateElementChildren(children, currentValue) {
  var duplicate = false;
  for (var i = 0; i < children.length; i++) {
    if (currentValue == children[i].name) {
      duplicate = true;
      break;
    } else if (children[i].hasOwnProperty("children")) {
      duplicate = searchDuplicateElementChildren(
        children[i].children,
        currentValue
      );
    }
  }
  return duplicate;
}

function searchDuplicateElementParent(treeData, path, currentValue) {
  var duplicate = false;
  var clonePath = [...path];
  for (var i = 0; i < path.length; i++) {
    clonePath.pop();
    var currentParentNode = getNodeAtPath({
      treeData: treeData,
      path: clonePath,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });
    if (currentParentNode.node.name == currentValue) {
      var duplicate = true;
      break;
    }
  }
  return duplicate;
}

function validateTreeDataInput(treeData, path) {
  if (searchForEmptyString(treeData)) {
    return false;
  }

  var duplicateInChildren = false;
  const currentNode = getNodeAtPath({
    treeData: treeData,
    path: path,
    getNodeKey: ({ treeIndex }) => treeIndex,
  });

  if (currentNode.node.hasOwnProperty("children")) {
    duplicateInChildren = searchDuplicateElementChildren(
      currentNode.node.children,
      currentNode.node.name
    );
  }

  console.log("duplicate in children: " + duplicateInChildren);

  if (
    searchDuplicateElementParent(treeData, path, currentNode.node.name) ||
    duplicateInChildren
  ) {
    return false;
  } else {
    return true;
  }
}

function searchForEmptyString(treeData) {
  var emptyString = false;
  for (var i = 0; i < treeData.length; i++) {
    if (treeData[i].name == "") {
      emptyString = true;
      break;
    }
    if (treeData[i].hasOwnProperty("children") && !emptyString) {
      emptyString = emptyString || searchForEmptyString(treeData[i].children);
    }
  }
  return emptyString;
}

function addElementToDeletionPool(node, project, toBeDeletedPool) {
  var comp_id = node.comp_id;
  var parent_id = node.old_parent_id;
  var isExcluded = node.isExcluded;
  var project_id = null;

  if (project != null) {
    project_id = project.value;
  }

  if (comp_id != -1) {
    if (node.hasOwnProperty("children")) {
      for (var i = 0; i < node.children.length; i++) {
        addElementToDeletionPool(node.children[i], project, toBeDeletedPool);
      }
    }
    if (parent_id != -1) {
      toBeDeletedPool.push({
        parent_id: parent_id,
        children_id: comp_id,
        rel_type: "hasChild",
      });
    }

    if (!isExcluded && project_id != null) {
      toBeDeletedPool.push({
        parent_id: project_id,
        children_id: comp_id,
        rel_type: "contains",
      });
    }
  }
}

export class ComponentWizard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      project: { value: null },
      treeData: [],
      // exampleTreeData
      //   treeData: [
      //     {
      //       name: "Auto",
      //       comp_id: 99,
      //       cost: 0,
      //       ref_id: 123,
      //       old_parent_id: -1,
      //       isExcluded: false,
      //       children: [
      //         {
      //           name: "Tür",
      //           comp_id: 101,
      //           cost: 0,
      //           ref_id: 42,
      //           old_parent_id: 99,
      //           isExcluded: true,
      //         },
      //       ],
      //     },
      //     {
      //       name: "Jacke",
      //       comp_id: -1,
      //       cost: 0,
      //       ref_id: -1,
      //       old_parent_id: -1,
      //       isExcluded: true,
      //       children: [
      //         {
      //           name: "Tasche",
      //           comp_id: -1,
      //           cost: 0,
      //           ref_id: -1,
      //           old_parent_id: -1,
      //           isExcluded: true,
      //         },
      //       ],
      //     },
      //   ],
      currentActiveDownshiftValue: "",
      currentActiveDownshiftPath: "",
      validInput: true,
      toBeDeletedRelations: [],
      isChanged: false,
      modalIsOpen: false,
      currentActiveModalAssetId: -1,
      currentActiveModalAssetName: "",
      updateAllReferencesComponent: false,
    };
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  static propTypes = {
    getRelatedComponentsFromProject: PropTypes.func.isRequired,
    getRelatedComponentsFromDownshift: PropTypes.func.isRequired,
    getFilteredComponentsAutocompleteSuggestion: PropTypes.func.isRequired,
    saveButtonComponentWizard: PropTypes.func.isRequired,
    getProjects: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.getProjects();
    this.props.getFilteredComponentsAutocompleteSuggestion();
  }

  openModal(assetId, assetName) {
    this.setState({
      modalIsOpen: true,
      currentActiveModalAssetId: assetId,
      currentActiveModalAssetName: assetName,
    });
  }

  afterOpenModal() {
    console.log("Component Wizard Modal is opened.");
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  handleSelectChange = (value, action) => {
    this.setState({ [action.name]: { value } });
    this.props.getRelatedComponentsFromProject({ project_id: value.value });
    this.setState({ toBeDeletedRelations: [], isChanged: true });
    setTimeout(() => {
      this.setState({ treeData: this.props.treeData });
    }, 800);

    console.log(this.state);
  };

  handleStateChange = (changes, state) => {
    if (
      changes.hasOwnProperty("highlightedIndex") &&
      changes.highlightedIndex !== null
    ) {
      lastHighlightedIndexClicked = changes.highlightedIndex;
    }
    if (changes.hasOwnProperty("inputValue")) {
      if (changes.hasOwnProperty("selectedItem")) {
        var splittedInputValue = this.state.currentActiveDownshiftValue.split(
          / \s*/
        );
        var itemQuery = splittedInputValue.pop();
        this.setState({
          currentActiveDownshiftValue:
            splittedInputValue.join(" ") + " " + changes.selectedItem,
        });

        setTimeout(
          () =>
            this.props.getRelatedComponentsFromDownshift(
              {
                comp_id: this.getItems(itemQuery)[lastHighlightedIndexClicked]
                  .comp_id,
              },
              { treeData: this.state.treeData }
            ),
          500
        );
      } else {
        this.setState({ currentActiveDownshiftValue: changes.inputValue });
      }
    }
  };

  convertProjectsAsDict() {
    var options = [];
    for (var i = 0; i < this.props.projects.length; i++) {
      var project = this.props.projects[i];
      var projectObj = {
        value: project.id,
        label: project.name + ", id:" + project.id,
      };
      options.push(projectObj);
    }
    return options;
  }

  getItems = (inputValue) => {
    // const items =  this.props.components
    const items = this.props.filteredComponents.map((c) => ({
      label: c.name + ", id:" + c.id,
      value: c.name,
      comp_id: c.id,
    }));

    var splittedInputValue = inputValue.split(" ");

    return inputValue
      ? matchSorter(items, splittedInputValue[splittedInputValue.length - 1], {
          keys: ["value"],
        })
      : items;
  };

  render() {
    const getNodeKey = ({ treeIndex }) => treeIndex;

    const canDrop = ({ node, nextParent, prevPath, nextPath }) => {
      return false;
    };

    const toBeDeletedRelationItems = this.state.toBeDeletedRelations.map(
      (relation, idx) => {
        return (
          <li key={idx}>
            Parent ID: {relation.parent_id} &nbsp;&nbsp; Children ID:{" "}
            {relation.children_id} &nbsp;&nbsp; rel_type: {relation.rel_type}
          </li>
        );
      }
    );

    return (
      <Fragment>
        <Prompt
          when={this.state.isChanged}
          message="Are you sure you want to leave?"
        />
        <h2>
          <b>Project</b>
        </h2>
        <br />
        <h3>Select existing project</h3>

        <Select
          name="project"
          onChange={this.handleSelectChange}
          options={this.convertProjectsAsDict()}
        />

        <br />
        <hr />
        <br />
        <h2>
          <b>Component Tree Table</b>
        </h2>
        <div style={{ height: 400 }}>
          <SortableTree
            treeData={this.state.treeData}
            canDrop={canDrop}
            onChange={(treeData) => this.setState({ treeData })}
            generateNodeProps={({ node, path }) => ({
              buttons: [
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    this.setState((state) => ({
                      treeData: addNodeUnderParent({
                        treeData: state.treeData,
                        parentKey: path[path.length - 1],
                        expandParent: true,
                        getNodeKey,
                        newNode: {
                          name: "",
                          cost: 0,
                          comp_id: -1,
                          ref_id: node.ref_id != -1 ? -2 : -1,
                          old_parent_id: -1,
                          isExcluded: false,
                        },
                        addAsFirstChild: state.addAsFirstChild,
                      }).treeData,
                      validInput: false,
                    }));
                  }}
                >
                  <i className="fas fa-plus-square"></i>
                </button>,
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    this.setState({
                      treeData: changeIntoACopy(
                        this.state.treeData,
                        path,
                        this.state.toBeDeletedRelations
                      ),
                    });
                  }}
                >
                  <i className="fas fa-copy"></i>
                </button>,
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    this.openModal(node.comp_id, node.name);
                  }}
                  disabled={node.comp_id === -1}
                >
                  <i className="fa fa-search"></i>
                </button>,
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    this.setState((state) => ({
                      treeData: removeNodeAtPath({
                        treeData: state.treeData,
                        path,
                        getNodeKey,
                      }),
                    }));
                    addElementToDeletionPool(
                      node,
                      this.state.project.value,
                      this.state.toBeDeletedRelations
                    );
                    // setTimeout(() => {this.setState({validInput: validateTreeDataInput(this.state.treeData, path)});}, 300)
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>,
              ],
              title: (
                <div style={{ display: "flex" }}>
                  {node.ref_id === -1 ? (
                    <CustomDownshift
                      initialInputValue={node.name}
                      onStateChange={this.handleStateChange}
                      getItems={this.getItems}
                      selectedItem={
                        path === this.state.currentActiveDownshiftPath
                          ? this.state.currentActiveDownshiftPath
                          : node.name
                      }
                      onInputValueChange={(inputValue) => {
                        const name = inputValue;
                        this.setState((state) => ({
                          treeData: changeNodeAtPath({
                            treeData: state.treeData,
                            path,
                            getNodeKey,
                            newNode: { ...node, name },
                          }),
                          isChanged: true,
                          currentActiveDownshiftPath: path,
                        }));
                        setTimeout(() => {
                          this.setState({
                            validInput: validateTreeDataInput(
                              this.state.treeData,
                              path
                            ),
                          });
                        }, 300);
                      }}
                      onSelect={(selectedItem) => {
                        if (selectedItem != undefined) {
                          // todo make the disable method better
                          if (
                            !validateTreeDataInput(this.state.treeData, path)
                          ) {
                            alert(
                              "The tree data already have'" +
                                selectedItem +
                                "' as element.title"
                            );
                          } else {
                            const comp_id = -2;
                            addElementToDeletionPool(
                              node,
                              this.state.project.value,
                              this.state.toBeDeletedRelations
                            );
                            this.setState((state) => ({
                              treeData: changeNodeAtPath({
                                treeData: state.treeData,
                                path,
                                getNodeKey,
                                newNode: { ...node, comp_id },
                              }),
                            }));

                            setTimeout(() => {
                              this.setState({ treeData: this.props.treeData });
                            }, 1000);
                          }
                          this.setState({
                            validInput: validateTreeDataInput(
                              this.state.treeData,
                              path
                            ),
                          });
                        }
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        position: "relative",
                        top: "5px",
                        left: "-2px",
                        margin: "0px 6px",
                      }}
                    >
                      {node.name}
                    </span>
                  )}
                  &nbsp;&nbsp;&nbsp;
                  <span
                    style={{ position: "relative", top: "5px", left: "-2px" }}
                  >
                    $:
                  </span>
                  <input
                    style={{ width: "75px" }}
                    className="cost_input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={node.cost}
                    onChange={(event) => {
                      const cost = event.target.value;

                      this.setState((state) => ({
                        treeData: changeNodeAtPath({
                          treeData: state.treeData,
                          path,
                          getNodeKey,
                          newNode: { ...node, cost },
                        }),
                        isChanged: true,
                      }));
                    }}
                  />
                  &nbsp;&nbsp;&nbsp;
                  <span
                    className="comp_id"
                    style={{ position: "relative", top: "5px", left: "-2px" }}
                  >
                    [id: {node.comp_id}] &nbsp; [ref_id: {node.ref_id}] &nbsp;
                    [ol_par_id: {node.old_parent_id}] &nbsp;&nbsp; excluded:
                  </span>
                  &nbsp;
                  <input
                    style={{
                      width: "22px",
                      height: "22px",
                      position: "relative",
                      top: "5px",
                      left: "-2px",
                    }}
                    type="checkbox"
                    checked={node.isExcluded}
                    onChange={(event) => {
                      const isExcluded = event.target.checked;

                      this.setState((state) => ({
                        treeData: changeNodeAtPath({
                          treeData: state.treeData,
                          path,
                          getNodeKey,
                          newNode: { ...node, isExcluded },
                        }),
                        isChanged: true,
                      }));
                    }}
                  />
                </div>
              ),
            })}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "space-between",
          }}
        >
          <button
            className="btn btn-secondary"
            onClick={() => {
              this.setState((state) => ({
                treeData: state.treeData.concat({
                  name: "",
                  cost: 0,
                  comp_id: -1,
                  ref_id: -1,
                  old_parent_id: -1,
                  isExcluded: false,
                }),
              }));
              this.setState({ validInput: false });
            }}
          >
            Add new Component
          </button>
          <div>
            <input
              style={{
                width: "22px",
                height: "22px",
                position: "relative",
                top: "5px",
                left: "-2px",
              }}
              type="checkbox"
              checked={this.state.updateAllReferencesComponent}
              onChange={(event) => {
                this.setState({
                  updateAllReferencesComponent: event.target.checked,
                });
              }}
            />
            Update all referenced components
          </div>
        </div>
        <hr />
        <div>
          <span>Relations to be deleted when save button pressed:</span>
          <ul>{toBeDeletedRelationItems}</ul>
        </div>
        <hr />
        <div className="row">
          <div className="col-lg-12">
            <a className="btn btn-danger float-right" href="/">
              Cancel
            </a>

            <button
              className="btn btn-primary float-right"
              disabled={
                !this.state.validInput || this.state.project.value == null
              }
              onClick={() => {
                this.props.saveButtonComponentWizard(
                  this.state.treeData,
                  this.state.toBeDeletedRelations,
                  this.state.project.value,
                  this.state.updateAllReferencesComponent
                );
              }}
            >
              Save
            </button>
          </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customModalStyles}
          contentLabel="Current component related assets"
        >
          <RelatedAssetsTable
            asset_id={this.state.currentActiveModalAssetId}
            asset_name={this.state.currentActiveModalAssetName}
          />
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  treeData: state.ajax.treeData,
  filteredComponents: state.ajax.filteredComponents,
  projects: state.projects.projects,
});

export default connect(mapStateToProps, {
  getRelatedComponentsFromProject,
  getRelatedComponentsFromDownshift,
  getFilteredComponentsAutocompleteSuggestion,
  saveButtonComponentWizard,
  getProjects,
})(ComponentWizard);
