import React, { useCallback } from "react";
import { getParsedDate } from "common";
import moment from "moment";

const DateRenderer = (props) => {
  const { data: rowData, value } = props;
  const label = getParsedDate(value);
  const field = props.colDef.field;
  const isFin = ["FIN"].includes(field);
  const isFinDate = ["FIN_DATE"].includes(field);
  const status = rowData.STATUS?.value;
  const isAfter =
    isFin && value && status === 30
      ? moment(new Date())
          .set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          })
          .isAfter(value, "day")
      : false; // 과거날짜면 붉은색

  const renderFinDate = useCallback(() => {
    if (isFinDate && value && status <= 50) {
      const diff = moment(new Date())
        .set({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 0,
        })
        .diff(value, "day");
      if (diff > 0) {
        return (
          <span style={{ color: "red", fontWeight: "bold", marginLeft: "3px" }}>
            (+{diff})
          </span>
        );
      }
    }
    return "";
  }, [isFinDate, value, status]);

  return isFin || isFinDate ? (
    <>
      <span
        className={"span-link"}
        style={isAfter ? { color: "red", fontWeight: "bold" } : {}}
      >
        {label}
      </span>
      {renderFinDate()}
    </>
  ) : (
    <>{label}</>
  );
};

export default DateRenderer;
