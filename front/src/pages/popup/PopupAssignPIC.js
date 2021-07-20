import React, { PureComponent } from "react";
import Form from "components/form/Form";
import {
  getDifferentControlValues,
  getParsedControlValuesByControlList,
} from "common";
import { Button } from "@blueprintjs/core";

export default class PopupAssignPIC extends PureComponent {
  constructor(props) {
    super(props);
    this.handleKeydownOnPage = this.handleKeydownOnPage.bind(this);
  }

  componentDidMount() {
    const originControlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.keyControlValues = {
      JOBCODE: originControlValues.JOBCODE,
      CATEGORY: originControlValues.CATEGORY,
      PIC: originControlValues.PIC,
      WRITEDATE: originControlValues.WRITEDATE,
    };

    document.body.addEventListener("keydown", this.handleKeydownOnPage);
  }

  componentDidUpdate(prevProps) {
    this.handleUpdateProps(prevProps, this.props);
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

  handleUpdateProps(prevProps, props) {
    const prevControlValues = getParsedControlValuesByControlList(
      prevProps.pageData.controlList
    );
    const currControlValues = getParsedControlValuesByControlList(
      props.pageData.controlList
    );
    const updateControlValues = getDifferentControlValues(
      prevControlValues,
      currControlValues
    );
    const { TEAM } = updateControlValues;

    // TEAM 제거시 PIC 제거
    if (TEAM === "") {
      this.updatePageControlData("PIC", { values: [] });
    }

    // update된 control data 중 relationControlData 있을 경우 해당 데이터 같이 update
    for (const controlId in updateControlValues) {
      const control = props.pageData.controlList.find(
        (ctrl) => ctrl.controlId === controlId
      );
      const controlValue = updateControlValues[controlId].value;

      if (control?.useRelationControlData && control?.items && controlValue) {
        const relationControlData = control.items.find(
          (item) => item.value === controlValue
        )?.relationControlData;

        if (relationControlData) {
          this.updatePageControlData(relationControlData.controlId, {
            values: [
              {
                value: relationControlData.value,
                label: relationControlData.label,
              },
            ],
          });
        }
      }
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

  handleClickSave() {
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.props.containerActions.triggerAssignPIC({
      pageId: this.props.pageData.pageId,
      controlValues: controlValues,
      keyControlValues: this.keyControlValues,
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
          <div className="wrapper-title">{"Assignment new PIC"}</div>
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
            formId={"PopupAssignPICForm"}
            controlList={controlList}
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
