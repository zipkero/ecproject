import React, { useState } from "react";

import { Radio, RadioGroup, Text } from "@blueprintjs/core";
import isString from "lodash/isString";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const RadioBasic = () => {
  const [inline, setInline] = useState(true);
  const dispatch = useDispatch();
  const {
    labelMode = false,
    disabled = false,
    values = [],
    items,
    required,
    fill = false,
    pageId,
    controlId,
  } = this.props;

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
    <RadioGroup
      inline={inline}
      label=""
      onChange={handleDataChange}
      selectedValue={value}
    >
      {items.map((item) => (
        <Radio label={item.label} value={item.value} />
      ))}
      {/*<Radio label="Soup" value="one" />*/}
      {/*<Radio label="Salad" value="two" />*/}
      {/*<Radio label="Sandwich" value="three" />*/}
    </RadioGroup>
  );
};

export default RadioBasic;
