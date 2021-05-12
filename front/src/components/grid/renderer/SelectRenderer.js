import React, { useCallback, useMemo } from "react";

const fieldRender = {
  JOBCODE: (props) => <span className={"span-link"}>{props.codeValue}</span>,
  STATUS: ({ codeValue, codeLabel, rowData }) => {
    let style = {};

    return <span style={style}>{codeLabel}</span>;
  },
  DEFAULT: (props) => <>{props.codeLabel}</>,
};

const SelectRenderer = (props) => {
  const { data: rowData, value } = props;
  const field = fieldRender[props.colDef.field]
    ? props.colDef.field
    : "DEFAULT";
  const codeLabel = value?.label ?? "";
  const codeValue = value?.value ?? "";

  return useMemo(() => fieldRender[field]({ codeValue, codeLabel, rowData }), [
    value,
    rowData.CATEGORY,
  ]);
};

export default SelectRenderer;
