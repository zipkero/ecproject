import React, { useRef } from "react";
import moment from "moment";

import { Intent, Position, Text } from "@blueprintjs/core";
import { DateInput as BPDateInput } from "@blueprintjs/datetime";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const getCalcDateText = (data, plusDate) => {
  let helperDateCalc = data ? "\u00A0\u00A0\u00A0(" + plusDate + ")" : plusDate;
  return <span style={{ color: "#3377ff" }}>{helperDateCalc}</span>;
};

const DateInput = (props) => {
  const {
    labelMode = false,
    disabled = false,
    values = [],
    required,
    plusDate,
    plusText,
    format = "YYYY-MM-DD",
    handleDataChange,
  } = props;
  const defaultDate =
    values.length > 0 && values[0] !== "Invalid date"
      ? moment(values[0]).toDate()
      : undefined;

  const minDate = moment().add(-4, "years").startOf("year").toDate();
  const maxDate = moment().add(2, "years").endOf("year").toDate();
  const calcDateText = plusDate ? getCalcDateText(values[0], plusDate) : null;

  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const defaultHandleDataChange = (newValue, isUserChange) => {
    const values = newValue
      ? [this.formatDate(newValue)]
      : newValue ?? undefined;

    dispatch(
      actions.updatePageControlData({
        pageId: this.props.pageId,
        controlId: this.props.controlId,
        values: values,
      })
    );
  };

  const onChangeInput = (newValue, isUserChange) => {
    if (handleDataChange) {
      handleDataChange(newValue, isUserChange);
    } else {
      defaultHandleDataChange(newValue, isUserChange);
    }
  };

  const parseDate = (str, locale) => {
    if (!str) {
      return "";
    }
    return moment(str, format).toDate();
  };

  const formatDate = (date, locale) => {
    if (!date) {
      return "";
    }
    return moment(date).format(this.format);
  };

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
        inputRef: inputRef,
        readOnly: true,
        intent: required && !defaultDate ? Intent.DANGER : "",
      }}
      disabled={disabled}
      closeOnSelection={true}
      reverseMonthAndYearMenus={true}
      formatDate={formatDate}
      parseDate={parseDate}
      placeholder={format}
      defaultValue={defaultDate ?? undefined}
      maxDate={maxDate}
      minDate={minDate}
      onChange={onChangeInput}
      showActionsBar={true}
      popoverProps={{ position: Position.BOTTOM }}
      highlightCurrentDay={true}
    />
  );
};

export default DateInput;