import React, { PureComponent } from "react";
import PageDefault from "pages/PageDefault";

export default class MyPost extends PureComponent {
  render() {
    return (
      <PageDefault {...this.props} useSearchBtn={true} useResetBtn={true} />
    );
  }
}
