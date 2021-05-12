import React, { PureComponent } from "react";
import Form from "components/form/Form";
import {
  getParsedControlValuesByControlList,
  getDifferentControlValues,
} from "common";

import { Button } from "@blueprintjs/core";

export default class PopupDefault extends PureComponent {
  constructor(props) {
    super(props);
    this.handleKeydownOnPage = this.handleKeydownOnPage.bind(this);
    //this.keyControlValues = {};
  }

  componentDidMount() {
    // const originControlValues = getParsedControlValuesByControlList(this.props.pageData.controlList);
    // this.keyControlValues = {
    //   JOBCODE: originControlValues.JOBCODE,
    //   CATEGORY: originControlValues.CATEGORY,
    //   PIC: originControlValues.PIC,
    //   WRITEDATE: originControlValues.WRITEDATE,
    // };

    document.body.addEventListener("keydown", this.handleKeydownOnPage);
  }

  componentDidUpdate(prevProps) {
    if (this.props.handleUpdateProps) {
      this.props.handleUpdateProps(prevProps, this.props);
    }
  }

  componentWillUnmount() {
    this.props.containerActions.resetPageState({
      pageId: this.props.pageData.pageId,
    });

    document.body.removeEventListener("keydown", this.handleKeydownOnPage);
  }

  handleKeydownOnPage(e) {
    if (e.keyCode === 119) {
      // F8
      this.handleClickSave();
    }
  }

  updatePageControlData(controlId, data) {
    const { pageId } = this.props.pageData;
    const newData = {
      pageId: pageId,
      controlId: controlId,
      ...(data ?? {}),
    };
    this.props.containerActions.updatePageControlData(newData);
  }

  handleClickSave(e) {
    if (this.props.handleClickSave) {
      this.props.handleClickSave(e);
    }
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
    const {
      pageData,
      containerActions,
      title,
      contentsItemComponent = "",
    } = this.props;
    const { controlList, controlValues, pageId } = pageData;
    const formId = pageId + "_form";

    return (
      <>
        <div className="header">
          <div className="wrapper-title">{title}</div>
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
            formId={formId}
            controlList={controlList}
            controlValues={controlValues}
            containerActions={containerActions}
          />
          {contentsItemComponent}
        </div>
        <div className="footer">
          <div className="wrapper-toolbar">
            <Button
              className="btn btn-primary"
              onClick={this.handleClickSave.bind(this)}
            >
              Save (F8)
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
