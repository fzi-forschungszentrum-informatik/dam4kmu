import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "styled-components";

import Modal from "react-modal";
import RelatedAssetsTable from "../RelatedAssetsTable";

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

const ShowTableButton = styled.button`
  color: #fff;
  border-radius: 3px;
  width: 100%;
  background-color: #52527a;
  padding: 4px 8px;
  border: 1px solid;
  font-weight: 600;
  margin-top: 20px;
  :hover {
    background-color: #33334d;
  }
`;

function ActiveProjectRelatedAssetsLayout({
  activeProjectsAllRelatedAssets,
  project,
}) {
  const [showTable, setShowTable] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentActiveModalAssetId, setCurrentActiveModalAssetId] = useState();
  const [currentActiveModalAssetName, setCurrentActiveModalAssetName] = useState();
  const toggleShowTable = useCallback(() => {
    setShowTable(!showTable);
  }, [showTable]);

  const openModal = (assetId, assetName) => {
    setModalIsOpen(true);
    setCurrentActiveModalAssetId(assetId);
    setCurrentActiveModalAssetName(assetName);
  };

  const afterOpenModal = () => {
    console.log("Modal is opened.");
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div>
      <ShowTableButton type="button" onClick={toggleShowTable}>
        {showTable ? "Hide related-assets-table" : "Show related-assets-table"}
      </ShowTableButton>
      {showTable ? (
        activeProjectsAllRelatedAssets.length === 0 ? (
          "No Assets detected that are related."
        ) : (
          <table className="table table-striped bg-white">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Sentence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeProjectsAllRelatedAssets.map((activeProject) =>
                activeProject.asset_id === project.value
                  ? activeProject.related_assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.related_asset_id}</td>
                        <td>
                          {asset.first_asset_type === ""
                            ? asset.second_asset_type
                            : asset.first_asset_type}
                        </td>
                        <td>
                          {asset.first_asset_type === ""
                            ? asset.second_asset
                            : asset.first_asset}
                        </td>
                        <td>{asset.related_asset_sentence}</td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              openModal(
                                asset.related_asset_id,
                                asset.first_asset_type === ""
                                  ? asset.second_asset
                                  : asset.first_asset
                              );
                            }}
                          >
                            <i className="fa fa-search"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  : null
              )}
            </tbody>
          </table>
        )
      ) : null}
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Current component related assets"
      >
        <RelatedAssetsTable
          asset_id={currentActiveModalAssetId}
          asset_name={currentActiveModalAssetName}
        />
      </Modal>
    </div>
  );
}

ActiveProjectRelatedAssetsLayout.propTypes = {
  activeProjectsAllRelatedAssets: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  activeProjectsAllRelatedAssets: state.ajax.activeProjectsAllRelatedAssets,
});

export default connect(mapStateToProps, null)(ActiveProjectRelatedAssetsLayout);
