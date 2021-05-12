import React, { PureComponent } from "react";
import PageDefault from "pages/PageDefault";

export default class MyJob extends PureComponent {
  render() {
    return <PageDefault {...this.props} />;
  }
}
