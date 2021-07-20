import React, { useCallback } from "react";

import { Intent, TextArea } from "@blueprintjs/core";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const Textarea = (props) => {
  const dispatch = useDispatch();
  const {
    values = [],
    required,
    fill = false,
    labelMode,
    rows,
    disabled,
    pageId,
    controlId,
  } = props;
  const hasValue = values.length > 0;

  const handleDataChange = useCallback(
    (e) => {
      const newValue = [e.target.value];
      dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          values: newValue,
        })
      );
    },
    [dispatch, pageId, controlId]
  );

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
