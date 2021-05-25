import React from "react";

import { Intent, TextArea } from "@blueprintjs/core";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const Textarea = (props) => {
  const {
    values = [],
    required,
    fill = false,
    labelMode,
    rows,
    disabled,
  } = props;
  const hasValue = values.length > 0;
  const dispatch = useDispatch();

  const handleDataChange = (e) => {
    const newValue = [e.target.value];
    dispatch(
      actions.updatePageControlData({
        pageId: this.props.pageId,
        controlId: this.props.controlId,
        values: newValue,
      })
    );
  };

  return (
    <TextArea
      fill={fill}
      disabled={disabled}
      value={hasValue ? values[0] : ""}
      onChange={handleDataChange}
      intent={required && !hasValue ? Intent.DANGER : ""}
      growVertically={false}
      rows={rows ?? 5}
      style={{ resize: "none" }}
    />
  );
};

export default Textarea;
