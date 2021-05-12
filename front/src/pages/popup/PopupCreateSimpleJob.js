import React, { PureComponent } from "react";
import {
  getDifferentControlValues,
  getParsedControlValuesByControlList,
} from "common";
import PopupDefault from "pages/popup/PopupDefault";

export default class PopupCreateSimpleJob extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      simpleJobType: props.pageData?.volatileValues?.simpleJobType,
    };
  }

  componentDidUpdate(prevProps) {
    this.handleUpdateProps(prevProps, this.props);
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
    const { JOBCODE, CATEGORY } = updateControlValues;

    if (JOBCODE !== undefined && this.state.simpleJobType == "support") {
      if (JOBCODE?.value && JOBCODE.value.indexOf("WG") == -1) {
        this.updatePageControlData("CATEGORY", {
          values: { value: 801, label: "support" },
        });
      } else {
        this.updatePageControlData("CATEGORY", {
          values: { value: 999999, label: "etc" },
        });
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

  remakePageData() {
    let newPageData = { ...this.props.pageData };
    if (this.state.simpleJobType == "support") {
      newPageData.controlList.map((ctrl) => {
        switch (ctrl.controlId) {
          case "JOBCODE":
            ctrl.labelMode = false;
            break;
          case "BOARDTYPE":
          case "BOARDNUM":
            ctrl.hide = false;
            break;
          // case "CATEGORY": // 테스트용
          //   ctrl.hide = false;
          //   break;
        }
      });
    }
    return newPageData;
  }

  handleClickSave(e) {
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.props.containerActions.triggerCreateNewJob({
      pageId: this.props.pageData.pageId,
      controlValues: controlValues,
      isSimpleJob: true,
      simpleJobType: this.state?.simpleJobType ?? "",
    });
  }

  render() {
    const newPageData = this.remakePageData();
    const { containerActions, pageData } = this.props;

    return (
      <PopupDefault
        containerActions={containerActions}
        pageData={newPageData}
        handleClickSave={this.handleClickSave.bind(this)}
        title={"Create Simple Job"}
      />
    );
  }
}
