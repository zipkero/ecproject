import { JOB_CASES, MONTH_NAMES_IN_KOREAN } from "./constants";
import {
  colourIsLight,
  getLastDay,
  getYearMonthDayFromDate,
  hexToRgb,
  makeEndDate,
  makeStartDate,
  nextColor,
} from "./utils";

export class BaseDate {
  constructor(startDateString, endDateString) {
    const [startYear, startMonth] = getYearMonthDayFromDate(startDateString);
    const [endYear, endMonth] = getYearMonthDayFromDate(endDateString);
    this._startYear = startYear;
    this._startMonth = startMonth;
    this._endYear = endYear;
    this._endMonth = endMonth;
  }

  get baseStartDate() {
    return makeStartDate(this._startYear, this._startMonth);
  }

  get baseEndDate() {
    return makeEndDate(this._endYear, this._endMonth);
  }

  get startYear() {
    return this._startYear;
  }

  get startMonth() {
    return this._startMonth;
  }

  get endYear() {
    return this._endYear;
  }

  get endMonth() {
    return this._endMonth;
  }
}

export class BuildTimebar {
  constructor(baseDate, holidays) {
    const { startYear, startMonth, endYear, endMonth } = baseDate;
    this.startYear = startYear;
    this.startMonth = startMonth;
    this.endYear = endYear;
    this.endMonth = endMonth;

    this.holidays = this.transformHolidays(holidays);
  }

  get timebar() {
    return [this.yearTimebar, this.monthTimebar, this.dayTimebar];
  }

  get startMonthEndMonthOfYears() {
    const result = [];
    const [START_MONTH_OF_YEAR, LAST_MONTH_OF_YEAR] = [1, 12];

    let startMonth, endMonth;

    for (let year = this.startYear; year <= this.endYear; year++) {
      // 시작 월
      if (year === this.startYear) {
        startMonth = this.startMonth;
      } else {
        startMonth = START_MONTH_OF_YEAR;
      }

      // 끝난 월
      if (year === this.endYear) {
        endMonth = this.endMonth;
      } else {
        endMonth = LAST_MONTH_OF_YEAR;
      }

      result.push({
        year,
        startMonth,
        endMonth,
      });
    }

    return result;
  }

  get yearTimebar() {
    const cells = this.startMonthEndMonthOfYears.map(
      ({ year, startMonth, endMonth }) => {
        const [start, end] = [
          makeStartDate(year, startMonth),
          makeEndDate(year, endMonth),
        ];
        return {
          id: `y${year}`,
          title: `${year}년`,
          start,
          end,
        };
      }
    );

    return {
      id: "years",
      title: "Years",
      cells,
      style: {},
    };
  }

  get monthTimebar() {
    let cells = [];

    this.startMonthEndMonthOfYears.forEach(({ year, startMonth, endMonth }) => {
      for (let month = startMonth; month <= endMonth; month++) {
        const [start, end] = [
          makeStartDate(year, month),
          makeEndDate(year, month),
        ];
        cells.push({
          id: `m${month}`,
          title: MONTH_NAMES_IN_KOREAN[month - 1],
          start,
          end,
        });
      }
    });

    return {
      id: "months",
      title: "Months",
      cells,
      style: {},
    };
  }

  get dayTimebar() {
    const cells = [];

    this.startMonthEndMonthOfYears.forEach(({ year, startMonth, endMonth }) => {
      for (let month = startMonth; month <= endMonth; month++) {
        const lastDay = getLastDay(year, month);
        for (let day = 1; day <= lastDay; day++) {
          const [start, end] = [
            makeStartDate(year, month, day),
            makeEndDate(year, month, day),
          ];
          cells.push({
            id: `y${year}m${month}d${day}`,
            title: String(day),
            start,
            end,
            isHoliday: this.isHoliDay(start),
          });
        }
      }
    });

    return {
      id: "days",
      title: "Days",
      cells,
      useAsGrid: true, // gird cell 만드는 기준
      style: {},
    };
  }

  transformHolidays(data) {
    return data.map((d) => {
      const date = makeStartDate(d.date);
      return {
        ...d,
        date,
      };
    });
  }

  isHoliDay(date) {
    // 토요일 일요일
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) {
      return true;
    }

    // 공휴일
    const currentDayMilliSecond = date.getTime();
    const isPublicHoliday = this.holidays.some((holiday) => {
      const holidayMilliSecond = holiday.date.getTime();
      if (currentDayMilliSecond === holidayMilliSecond) {
        return true;
      }
      return false;
    });

    if (isPublicHoliday) {
      return true;
    }

    return false;
  }
}

export class BuildTracks {
  constructor(baseDate, data) {
    this._baseDate = baseDate;
    this.data = this.filterData(data);
  }

  get tracks() {
    return this.data.map(this.makeTrack, this);
  }

  makeTrack(schedule, index) {
    const { name: pic = "", siteName: team = "" } = schedule.ownerDetail;

    return {
      id: `track-${index}`,
      title: `Track ${index}`,
      pic,
      team,
      trackRows: this.makeTrackRowsFromDate(schedule),
    };
  }

  filterData(data) {
    return data.filter((schedule) => {
      if (schedule.ownerDetail) {
        return true;
      }
      return false;
    });
  }

  makeTrackRowsFromDate(schedule) {
    const parallelJobList = [[]];
    schedule.jobs.forEach((job, jobIndex) => {
      parallelJobList.some((stack, stackIndex) => {
        const elementData = {
          ownerDetail: schedule.ownerDetail,
          job,
          index: {
            trackIdx: jobIndex,
            elementIdx: stackIndex,
          },
        };
        const element = this.buildElement(elementData);

        if (stack.length === 0) {
          stack.push(element);
          parallelJobList.push([]);
          return true;
        }

        const lastIndex = stack.length - 1;
        const top = stack[lastIndex];

        if (this.isCollapsed(top.end, element.start)) {
          return false;
        } else {
          stack.push(element);
          return true;
        }
      });
    });

    return parallelJobList.filter((stack) => stack.length > 0);
  }

  isCollapsed(end, start) {
    // MilliSecond 이용
    const endTime = end.getTime();
    const startTime = start.getTime();

    return endTime >= startTime ? true : false;
  }

  buildElement(elementData) {
    const {
      ownerDetail: { id: pic },
      job,
      index,
    } = elementData;

    const start = makeStartDate(job.firstIngStartDate);
    const isUndoneJob = job.lastIngEndDate === null;
    const end = isUndoneJob
      ? this._baseDate.baseEndDate
      : makeEndDate(job.lastIngEndDate);

    const jobCases = this.verdictJobCases(start, end, isUndoneJob);

    return {
      id: `t-${index.trackIdx}-el-${index.elementIdx}`,
      title: `${job.code}_${job.title}`,
      start,
      end,
      jobCases,
      style: this.makeStyle(),
      classes: this.makeClasses(jobCases),
      // "JOBCODE": { value: "WG_00151", label: "" },
      // "PIC": { value: "승원", label: "여창모" },
      // "WRITEDATE": "2021-01-21T14:42:06"
      // popup 띄울 때 사용하는 request data
      popupData: {
        JOBCODE: { value: job.code, label: "" },
        PIC: { value: pic, label: "" },
        CATEGORY: { value: null, label: "" },
        WRITEDATE: job.writeDate,
      },
    };
  }

  verdictJobCases(start, end, isUndoneJob) {
    const result = [];
    if (isUndoneJob) {
      result.push(JOB_CASES.UNDONE_JOB);
    }

    if (
      this.isStartDateLessThanBaseStartDate(start) &&
      this.isEndDateGreaterThanBaseEndDate(end)
    ) {
      // 시작 기준 날짜, 끝 기준 날짜를 모두 초과하는 경우
    } else if (this.isStartDateLessThanBaseStartDate(start)) {
      // 시작 날짜가 간트 시작 날짜 이전일 경우
      result.push(JOB_CASES.HIDDEN_START_DATE);
    } else if (this.isEndDateGreaterThanBaseEndDate(end)) {
      // 끝 날짜가 간트 끝 날짜 이후일 경우
      result.push(JOB_CASES.HIDDEN_END_DATE);
    }

    return result;
  }

  makeClasses(jobCases) {
    const result = {};
    if (jobCases.includes(JOB_CASES.UNDONE_JOB))
      result.undoneJob = "rt-custom-undone-job";

    if (jobCases.includes(JOB_CASES.HIDDEN_START_DATE)) {
      result.textAlign = "text-align-right";
      result.tooltipPosition = "tooltip-position-right";
    }

    if (jobCases.includes(JOB_CASES.HIDDEN_END_DATE)) {
      result.textAlign = "text-align-left";
      result.tooltipPosition = "tooltip-position-left";
    }

    return result;
  }

  makeStyle() {
    const bgColor = nextColor();
    const color = colourIsLight(...hexToRgb(bgColor)) ? "#000000" : "#ffffff";
    const result = {
      backgroundColor: `#${bgColor}`,
      color,
      borderRadius: "4px",
      boxShadow: "1px 1px 0px rgba(0, 0, 0, 0.25)",
      textTransform: "capitalize",
    };
    return result;
  }

  isStartDateLessThanBaseStartDate(start) {
    const startTime = start.getTime();
    const baseStartTime = this._baseDate.baseStartDate.getTime();
    return startTime < baseStartTime;
  }

  isEndDateGreaterThanBaseEndDate(end) {
    const endTime = end.getTime();
    const baseEndTime = this._baseDate.baseEndDate.getTime();
    return endTime > baseEndTime;
  }
}

export class BottomScroll {
  constructor(data) {
    if (data) this.scrollInfo = data;
    this.BASE_DISTANCE = 20;
  }

  set scrollInfo(data) {
    const { pageX, maxScrollLeft, moveScroll } = data;

    if (pageX !== undefined) this._pageX = pageX;
    if (maxScrollLeft !== undefined) this.maxScrollLeft = maxScrollLeft;
    if (moveScroll !== undefined) this._moveScroll = moveScroll;
  }

  get moveScroll() {
    return this._moveScroll;
  }

  set currentPageX(pageX) {
    this._currentPageX = pageX;
  }

  get currentPageX() {
    return this._currentPageX;
  }

  set pageX(x) {
    this._pageX = x;
  }

  get pageX() {
    return this._pageX;
  }

  set currentScrollLeft(scrollLeft) {
    this._currentScrollLeft = scrollLeft;
  }

  get currentScrollLeft() {
    return this._currentScrollLeft;
  }

  get scrollDisatnce() {
    const { pageX, currentPageX } = this;
    return Math.abs(pageX - currentPageX) + this.BASE_DISTANCE;
  }

  get scrollDirection() {
    // 실제 스크롤이 이동할 방향
    // mouse가 왼쪽으로 이동 했다면 스크롤은 오른쪽으로 이동
    const { pageX, currentPageX } = this;
    return currentPageX < pageX ? "right" : "left";
  }

  get nextScrollLeft() {
    const {
      scrollDirection,
      scrollDisatnce,
      currentScrollLeft,
      maxScrollLeft,
    } = this;
    let scroll;
    if (scrollDirection === "left") {
      scroll = currentScrollLeft - scrollDisatnce;
    } else if (scrollDirection === "right") {
      scroll = currentScrollLeft + scrollDisatnce;
    }

    if (scroll < 0) {
      scroll = 0;
    } else if (scroll >= maxScrollLeft) {
      scroll = maxScrollLeft;
    }

    this.pageX = this.currentPageX;

    return scroll;
  }
}
