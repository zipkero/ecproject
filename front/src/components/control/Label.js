import React from "react";
import { Text } from "@blueprintjs/core";

const Label = (props) => {
  const { values = [], formatter } = props;
  let value = values.length > 0 ? values[0].toString() : "";

  if (typeof formatter === "function" && values.length > 0) {
    value = formatter(value);
  }
  return <Text ellipsize={true}>{value}</Text>;
};

export default Label;
