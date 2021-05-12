import React, { PureComponent } from "react";
import {
  getDifferentControlValues,
  getParsedControlValuesByControlList,
} from "common";
import PopupDefault from "pages/popup/PopupDefault";
import moment from "moment";

export default class PopupUpdatePlanList extends PureComponent {
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
    const { ESTIMATEPLANTIME, ESTIMATEWORKTIME } = updateControlValues;

    if (ESTIMATEPLANTIME !== undefined || ESTIMATEWORKTIME !== undefined) {
      let plusDateValue =
        Number(currControlValues.ESTIMATEPLANTIME ?? 0) +
        Number(currControlValues.ESTIMATEWORKTIME ?? 0);
      let plusDate = plusDateValue
        ? moment(currControlValues.FIN || currControlValues.START)
            .add({ days: plusDateValue ?? 0 })
            .format("YYYY-MM-DD HH:mm")
        : "";
      this.updatePageControlData("FIN", {
        plusDate: plusDate,
      });
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
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.props.containerActions.triggerUpdatePlanList({
      pageId: this.props.pageData.pageId,
      controlValues: controlValues,
    });
  }

  render() {
    return (
      <PopupDefault
        {...this.props}
        handleClickSave={this.handleClickSave.bind(this)}
        title={"Update Plan List"}
      />
    );
  }
}
