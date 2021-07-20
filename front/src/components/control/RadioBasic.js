import React, { useCallback } from "react";

import { Radio, RadioGroup, Text } from "@blueprintjs/core";
import isString from "lodash/isString";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const RadioBasic = (props) => {
  const dispatch = useDispatch();
  const {
    labelMode = false,
    disabled = false,
    values = [],
    items,
    required,
    fill = false,
    inline = true,
    pageId,
    controlId,
  } = props;

  const value = values.length > 0 ? values[0].toString() : items[0].value;

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
    <RadioGroup
      inline={inline}
      label=""
      onChange={handleDataChange}
      selectedValue={value}
    >
      {items.map((item) => (
        <Radio key={item.label} label={item.label} value={item.value} />
      ))}
      {/*<Radio label="Soup" value="one" />*/}
      {/*<Radio label="Salad" value="two" />*/}
      {/*<Radio label="Sandwich" value="three" />*/}
    </RadioGroup>
  );
};

export default RadioBasic;
