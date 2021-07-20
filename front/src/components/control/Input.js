import React, { useCallback } from "react";

import { InputGroup, Intent, Text } from "@blueprintjs/core";
import isString from "lodash/isString";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const Input = (props) => {
  const dispatch = useDispatch();
  const {
    pageId,
    controlId,
    labelMode = false,
    disabled = false,
    values = [],
    required,
    fill = false,
  } = props;
  const value = values.length > 0 ? values[0].toString() : "";

  const handleDataChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (isString(value)) {
        dispatch(
          actions.updatePageControlData({
            pageId: pageId,
            controlId: controlId,
            values: [value],
          })
        );
      }
    },
    [pageId, controlId, dispatch]
  );

  if (labelMode) {
    return <Text>{value}</Text>;
  }
  return (
    <InputGroup
      disabled={disabled}
      selectAllOnFocus={true}
      //alwaysRenderInput={true}
      fill={fill}
      value={value}
      onChange={handleDataChange}
      placeholder={""}
      intent={required && !value ? Intent.DANGER : ""}
    />
  );
};

export default Input;
