import React, { PureComponent } from "react";
import { Text } from "@blueprintjs/core";

export default class Label extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { values = [], formatter } = this.props;
    let value = values.length > 0 ? values[0].toString() : "";

    if (typeof formatter === "function" && values.length > 0) {
      value = formatter(value);
    }

    return <Text ellipsize={true}>{value}</Text>;
  }
}
