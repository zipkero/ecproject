import React, { PureComponent } from "react";
import { Intent, Spinner } from "@blueprintjs/core";

export default class IconExcel extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.spinner ? (
      <Spinner
        className="pr-5 spinner-excel"
        size={20}
        intent={Intent.PRIMARY}
      />
    ) : (
      <span className="icon-excel" {...this.props}></span>
    );
  }
}
