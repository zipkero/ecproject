import React from "react";

function StatusRenderer(props) {
  const { data: rowData, value } = props;
  let codeLabel = value?.label ?? "";
  if (rowData.CATEGORY?.value === 801 && rowData.PRIVATE_STATUS?.value === 30) {
    codeLabel = rowData.PRIVATE_STATUS?.label;
  }
  return <span>{codeLabel}</span>;
}

export default StatusRenderer;