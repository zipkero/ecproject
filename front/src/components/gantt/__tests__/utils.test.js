import { getYearMonthDayFromDate } from "./utils";

test.each([
  ["2021-03-09", [2021, 3, 9]],
  ["2021-03-29T11:14:20", [2021, 3, 29]],
  [new Date("2021-03-29"), [2021, 3, 29]],
])(
  "getYearMonthDayFromDate should return year month day tuple in number",
  (date, expected) => {
    const result = getYearMonthDayFromDate(date);
    expect(result).toEqual(expected);
  }
);
