import React, { PureComponent } from "react";
import Form from "components/form/Form";
import { getParsedControlValuesByControlList } from "common";

import { Button } from "@blueprintjs/core";

export default class PopupCodeSearch extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.props.containerActions.resetPageState({
      pageId: this.props.pageData.pageId,
    });
  }

  handleClickApply(e) {
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.props.containerActions.triggerCreateNewJob({
      pageId: this.props.pageData.pageId,
      controlValues: controlValues,
    });
  }

  handleClickClose(e) {
    this.closePopup();
  }

  closePopup() {
    this.props.containerActions.updatePopupToggle({
      pageId: this.props.pageData.pageId,
      isOpen: false,
    });
  }

  render() {
    const { controlList, pageId } = this.props.pageData;
    return (
      <>
        <div className="header">
          <div className="wrapper-title">{"Code Search List"}</div>
          <div className="wrapper-toolbar">
            <Button
              icon={"cross"}
              className="btn btn-sm btn-default"
              onClick={this.handleClickClose.bind(this)}
            ></Button>
          </div>
        </div>
        <div className="contents">
          <Form
            pageId={pageId}
            formId={"PopupCodeSearchForm"}
            controlList={controlList}
            containerActions={this.props.containerActions}
          />
        </div>
        <div className="footer">
          <div className="wrapper-toolbar">
            <Button
              className="btn btn-primary"
              onClick={this.handleClickApply.bind(this)}
            >
              Apply
            </Button>
            <Button
              className="btn btn-default"
              onClick={this.handleClickClose.bind(this)}
            >
              Close
            </Button>
          </div>
        </div>
      </>
    );
  }
}
