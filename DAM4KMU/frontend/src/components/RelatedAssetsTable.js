import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRelatedAssets } from "../actions/ajax";

export default function RelateAssetTable({ asset_id, asset_name }) {
  const dispatch = useDispatch();
  const allRelatedAssets = useSelector(
    (state) => state.ajax.allRelatedAssets
  );
  useEffect(() => dispatch(getAllRelatedAssets([asset_id], "single")), []);

  return (
    <div>
    <h2>List of related assets from "{asset_name}" [id:{asset_id}]</h2>
      {allRelatedAssets.length === 0 ? (
        "No Assets detected that are related."
      ) : (
        <table className="table table-striped bg-white">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset-Type</th>
              <th>Name</th>
              <th>Sentence</th>
              <th>Rel-Type</th>
            </tr>
          </thead>
          <tbody>
            {allRelatedAssets.map((targetAsset) =>
              targetAsset.asset_id === asset_id
                ? targetAsset.related_assets.map((asset) => (
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
                      <td>{asset.type}</td>
                    </tr>
                  ))
                : null
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
