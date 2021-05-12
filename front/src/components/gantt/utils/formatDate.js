import { MONTH_NAMES_IN_KOREAN } from "../constants";

export const getMonth = (date) => MONTH_NAMES_IN_KOREAN[date.getMonth()];

export const getDayMonth = (date) => `${getMonth(date)} ${date.getDate()}일`;
