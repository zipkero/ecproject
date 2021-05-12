import React, { PureComponent } from "react";

import { Intent, TextArea } from "@blueprintjs/core";

export default class Textarea extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleDataChange(e) {
    const newValue = [e.target.value];
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      values: newValue,
    });
  }

  render() {
    const {
      values = [],
      required,
      fill = false,
      labelMode,
      rows,
      disabled,
    } = this.props;
    const hasValue = values.length > 0;
    return (
      <TextArea
        fill={fill}
        disabled={disabled}
        value={hasValue ? values[0] : ""}
        onChange={this.handleDataChange.bind(this)}
        intent={required && !hasValue ? Intent.DANGER : ""}
        growVertically={false}
        rows={rows ?? 5}
        style={{ resize: "none" }}
      />
    );
  }
}
