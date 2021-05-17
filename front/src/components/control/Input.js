import React from "react";

import {InputGroup, Intent, Text} from "@blueprintjs/core";
import isString from "lodash/isString";
import {useDispatch} from "react-redux";
import {actions} from "../../store/actionTypes";

const Input = (props) => {
  const {
    labelMode = false,
    disabled = false,
    values = [],
    required,
    fill = false,
    pageId,
    controlId,
  } = props;
  const value = values.length > 0 ? values[0].toString() : "";

  const dispatch = useDispatch();
  const handleDataChange = (e) => {
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
  };

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