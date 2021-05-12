import React from "react";
import { getParsedDate } from "common";
import moment from "moment";

const DateRenderer = (props) => {
  const { data: rowData, value } = props;
  const label = getParsedDate(value);
  const field = props.colDef.field;
  const isFin = ["FIN"].includes(field);
  const isAfter =
    isFin && value && props.data.STATUS?.value == 30
      ? moment(new Date())
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .isAfter(value, "day")
      : false; // 과거날짜면 붉은색

  return isFin ? (
    <span
      className={"span-link"}
      style={isAfter ? { color: "red", fontWeight: "bold" } : {}}
    >
      {label}
    </span>
  ) : (
    <>{label}</>
  );
};

export default DateRenderer;
