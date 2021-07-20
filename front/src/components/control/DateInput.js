import React, { useCallback, useRef } from "react";
import moment from "moment";

import { Intent, Position, Text } from "@blueprintjs/core";
import { DateInput as BPDateInput } from "@blueprintjs/datetime";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const DateInput = (props) => {
  const {
    pageId,
    controlId,
    labelMode = false,
    disabled = false,
    values = [],
    required,
    plusDate,
    plusText,
    format = "YYYY-MM-DD",
    handleDataChange,
    small = false,
  } = props;

  const defaultDate =
    values.length > 0 && values[0] !== "Invalid date"
      ? moment(values[0]).toDate()
      : undefined;
  const minDate = moment().add(-4, "years").startOf("year").toDate();
  const maxDate = moment().add(2, "years").endOf("year").toDate();

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const formatDate = useCallback(
    (date, locale) => {
      if (!date) {
        return "";
      }
      return moment(date).format(format);
    },
    [format]
  );

  const parseDate = useCallback(
    (str, locale) => {
      if (!str) {
        return "";
      }
      return moment(str, format).toDate();
    },
    [format]
  );

  const getCalcDateText = useCallback((data, plusDate) => {
    let helperDateCalc = data
      ? "\u00A0\u00A0\u00A0(" + plusDate + ")"
      : plusDate;
    return <span style={{ color: "#3377ff" }}>{helperDateCalc}</span>;
  }, []);

  const defaultHandleDataChange = useCallback(
    (newValue, isUserChange) => {
      const values = newValue ? [formatDate(newValue)] : newValue ?? undefined;
      dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          values: values,
        })
      );
    },
    [pageId, controlId, formatDate, dispatch]
  );

  const onChangeInput = useCallback(
    (newValue, isUserChange) => {
      if (handleDataChange) {
        handleDataChange(newValue, isUserChange);
      } else {
        defaultHandleDataChange(newValue, isUserChange);
      }
    },
    [handleDataChange, defaultHandleDataChange]
  );

  if (labelMode === true) {
    const label = defaultDate ? values[0].replace("T", " ") : "";
    const calcDateText = plusDate ? getCalcDateText(values[0], plusDate) : null;
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
      small={small}
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
      //timePrecision={"minutes"}
    />
  );
};

export default DateInput;
