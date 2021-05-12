import React, { PureComponent } from "react";
import moment from "moment";

import { Position, Text, Intent } from "@blueprintjs/core";
import { DateInput as BPDateInput, TimePrecision } from "@blueprintjs/datetime";

export default class DateInput extends PureComponent {
  constructor(props) {
    super(props);
    this.format = props.format ?? "YYYY-MM-DD";
    this.inputRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.values !== this.props.values && !this.props.values) {
      this.inputRef.current.value = "";
    }
  }

  handleDataChange(newValue, isUserChange) {
    if (this.props.handleDataChange) {
      this.props.handleDataChange(newValue, isUserChange);
    } else {
      this.defaultHandleDataChange(newValue, isUserChange);
    }
  }

  defaultHandleDataChange(newValue, isUserChange) {
    const values = newValue
      ? [this.formatDate(newValue)]
      : newValue ?? undefined;
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      values: values,
    });
  }

  formatDate(date, locale) {
    if (!date) {
      return "";
    }
    const result = moment(date).format(this.format);
    return result;
  }

  parseDate(str, locale) {
    if (!str) {
      return "";
    }
    const result = moment(str, this.format).toDate();
    return result;
  }

  getCalcDateText(data, plusDate) {
    let helperDateCalc = data
      ? "\u00A0\u00A0\u00A0(" + plusDate + ")"
      : plusDate;
    return <span style={{ color: "#3377ff" }}>{helperDateCalc}</span>;
  }

  render() {
    const {
      labelMode = false,
      disabled = false,
      values = [],
      required,
      plusDate,
      plusText,
    } = this.props;
    const defaultDate =
      values.length > 0 && values[0] !== "Invalid date"
        ? moment(values[0]).toDate()
        : undefined;
    const minDate = moment().add(-4, "years").startOf("year").toDate();
    const maxDate = moment().add(2, "years").endOf("year").toDate();
    const calcDateText = plusDate
      ? this.getCalcDateText(values[0], plusDate)
      : null;

    if (labelMode) {
      const label = defaultDate ? values[0].replace("T", " ") : "";
      return (
        <Text>
          {label}
          {plusText ?? ""}
          {calcDateText}
        </Text>
      );
    }

    return (
      <BPDateInput
        inputProps={{
          inputRef: this.inputRef,
          readOnly: true,
          intent: required && !defaultDate ? Intent.DANGER : "",
        }}
        disabled={disabled}
        closeOnSelection={true}
        reverseMonthAndYearMenus={true}
        formatDate={this.formatDate.bind(this)}
        parseDate={this.parseDate.bind(this)}
        placeholder={this.format}
        defaultValue={defaultDate ?? undefined}
        maxDate={maxDate}
        minDate={minDate}
        onChange={this.handleDataChange.bind(this)}
        showActionsBar={true}
        popoverProps={{ position: Position.BOTTOM }}
        highlightCurrentDay={true}
        //timePrecision={"minutes"}
      />
    );
  }
}
