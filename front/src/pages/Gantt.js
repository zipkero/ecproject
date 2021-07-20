import React, { Component } from "react";
import PageDefault from "pages/PageDefault";

export default class Gantt extends Component {
  validateControlList(controlList) {
    const startFrom = controlList.find(
      (control) => control.controlId === "START_FROM"
    );
    const startTo = controlList.find(
      (control) => control.controlId === "START_TO"
    );

    return {
      validity: startFrom.values && startTo.values ? true : false,
      message: "시작 날짜 또는 종료 날짜가 설정되지 않았습니다.",
    };
  }

  render() {
    return (
      <PageDefault
        {...this.props}
        validateControlList={this.validateControlList}
        useSearchBtn={true}
        useResetBtn={true}
      />
    );
  }
}
