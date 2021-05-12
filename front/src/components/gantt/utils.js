export const getYearMonthDayFromDate = (date) => {
  if (typeof date === "string") {
    const onlyYearMonthDayStr = date.match(/\d{4}-\d{1,2}-\d{1,2}/g)[0];
    const yearMonthDayArr = onlyYearMonthDayStr
      .split("-")
      .map((data) => parseInt(data));
    return yearMonthDayArr;
  }

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
};

export const makeStartDate = (year, month, day = 1) => {
  // DateString 2021-03-17 포맷을 숫자로된 2021, 3, 17 포맷으로 변환
  if (typeof year === "string") {
    const dateString = year;
    [year, month, day] = getYearMonthDayFromDate(dateString);
  }

  month -= 1;
  const result = new Date(year, month, day, 0);
  return result;
};

export const makeEndDate = (year, month, day = 0) => {
  if (typeof year === "string") {
    const dateString = year;
    [year, month, day] = getYearMonthDayFromDate(dateString);
  }

  if (day > 0) {
    month -= 1;
  }
  // month 0이 1월
  // 3월 마지막 날을 알고 싶다면 month 3, day 0으로 설정
  const result = new Date(year, month, day, 23, 59, 59);
  return result;
};

export const getLastDay = (year, month) => {
  // new Date의 month는 0 부터 시작 일반적으로 이해할 때 month가 3이면 3월이지만 new Date에서는 4월로 인식 하지만 day가 0 이면 전월 마지막 날을 가리킴
  return new Date(year, month, 0).getDate();
};

export const makeColumnKeyFromDate = (date) => {
  return `y${date.getFullYear()}m${date.getMonth() + 1}d${date.getDate()}`;
};

const COLORS = [
  "FF005D",
  "0085B6",
  "0BB4C1",
  "00D49D",
  "FEDF03",
  "FE7F2D",
  "FCCA46",
  "A1C181",
  "579C87",
];

export const randomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

let color = -1;
export const nextColor = () => {
  color = (color + 1) % COLORS.length;
  return COLORS[color];
};

export const hexToRgb = (hex) => {
  const v = parseInt(hex, 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  return [r, g, b];
};

export const colourIsLight = (r, g, b) => {
  const a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return a < 0.5;
};
