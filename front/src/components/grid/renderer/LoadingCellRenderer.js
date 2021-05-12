import React from "react";

const LoadingCellRenderer = (props) => {
  const { data: rowData, value } = props;

  return (
    <div
      className="ag-custom-loading-cell"
      style={{ paddingLeft: "10px", lineHeight: "25px" }}
    >
      <i className="fas fa-spinner fa-pulse"></i> <span> {"Loading..."}</span>
    </div>
  );
};

export default LoadingCellRenderer;
