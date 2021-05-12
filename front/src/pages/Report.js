import React, { PureComponent } from "react";
import PageDefault from "pages/PageDefault";

export default class Report extends PureComponent {
  render() {
    return (
      <PageDefault {...this.props} useSearchBtn={true} useResetBtn={true} />
    );
  }
}
