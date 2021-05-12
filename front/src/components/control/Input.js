import React, { PureComponent } from "react";

import { InputGroup, Intent, Text } from "@blueprintjs/core";
import isString from "lodash/isString";

export default class Input extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleDataChange(e) {
    const value = e.target.value;
    if (isString(value)) {
      this.props.containerActions.updatePageControlData({
        pageId: this.props.pageId,
        controlId: this.props.controlId,
        values: [value],
      });
    }
  }

  render() {
    const {
      labelMode = false,
      disabled = false,
      values = [],
      required,
      fill = false,
    } = this.props;
    const value = values.length > 0 ? values[0].toString() : "";

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
        onChange={this.handleDataChange.bind(this)}
        placeholder={""}
        intent={required && !value ? Intent.DANGER : ""}
      />
    );
  }
}
