import React, { PureComponent } from "react";
import Form from "components/form/Form";
import {
  getParsedControlValuesByControlList,
  getDifferentControlValues,
} from "common";

import { Button } from "@blueprintjs/core";

export default class PopupChangeStatus extends PureComponent {
  constructor(props) {
    super(props);
    this.originControlValues = {};
    this.keyControlValues = {};
    this.handleKeydownOnPage = this.handleKeydownOnPage.bind(this);

    this.state = {
      popupTitle: props.pageData.from || "Change Status",
    };
  }

  componentDidMount() {
    this.originControlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.keyControlValues = {
      JOBCODE: this.originControlValues.JOBCODE,
      CATEGORY: this.originControlValues.CATEGORY,
      PIC: this.originControlValues.PIC,
      WRITEDATE: this.originControlValues.WRITEDATE,
    };

    document.body.addEventListener("keydown", this.handleKeydownOnPage);
  }

  componentDidUpdate(prevProps) {
    const prevControlValues = getParsedControlValuesByControlList(
      prevProps.pageData.controlList
    );
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    const { STATUS: prevSTATUS } = prevControlValues;
    const { STATUS } = controlValues;

    if (prevSTATUS?.value !== STATUS?.value) {
      if (STATUS?.value === 50 || STATUS?.value === 1000) {
        // 상태 hold, cancel 변경시 reason toggle
        this.updatePageControlData({
          controlId: "REASON",
          hide: false,
        });
      } else {
        this.updatePageControlData({
          controlId: "REASON",
          hide: true,
        });
      }
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

  updatePageControlData(options) {
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageData.pageId,
      ...options,
    });
  }

  handleClickSave(e) {
    const prev = this.originControlValues;
    const curr = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    const updateControlValues = Object.assign(
      getDifferentControlValues(prev, curr),
      {
        // STATUS 초기값 hold 고정되어있으므로 바뀐 값인지 알수없음. 현재상태 그대로 전달
        STATUS: curr.STATUS,
      }
    );
    const toIngRowData = this.props.pageData?.volatileValues?.toIngRowData;

    if (this.props.pageData.from == "Add Reason") {
      this.props.containerActions.triggerAddReason({
        pageId: this.props.pageData.pageId,
        controlValues: curr,
      });
    } else {
      this.props.containerActions.triggerUpdateJob({
        pageId: this.props.pageData.pageId,
        allControlValues: curr,
        keyControlValues: this.keyControlValues,
        updateControlValues: updateControlValues,
        toIngRowData: toIngRowData,
      });
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

  remakeControl(orgControls) {
    let newControls = [...orgControls];
    if (this.props.pageData.from == "Add Reason") {
      newControls.map((ctrl) => {
        switch (ctrl.controlId) {
          case "STATUS":
            ctrl.hide = true;
            break;
        }
      });
    }
    return newControls;
  }

  render() {
    const { controlList, controlValues, pageId } = this.props.pageData;
    const newControlList = this.remakeControl(controlList);
    const { popupTitle } = this.state;
    return (
      <>
        <div className="header">
          <div className="wrapper-title">{popupTitle}</div>
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
            formId={"PopupChangeStatus"}
            controlList={newControlList}
            controlValues={controlValues}
            containerActions={this.props.containerActions}
          />
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
