import * as ExcelJS from "exceljs";
import {
  DAYS_ROW_INDEX,
  JOB_CASES,
  MONTHS_ROW_INDEX,
  TRACK_ROW_INDEX,
  YEARS_ROW_INDEX,
} from "./constants";
import {
  getYearMonthDayFromDate,
  makeColumnKeyFromDate,
  nextColor,
} from "./utils";

export default function makeGanttExcel(baseDate, timebar, tracks) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Gantt");
  const ganttExcel = new GanttExcel(worksheet, baseDate, timebar, tracks);
  ganttExcel.setExcel();
  return { workbook, worksheet };
}

export class GanttExcel {
  constructor(worksheet, baseDate, timebar, tracks) {
    this.worksheet = worksheet;
    this.baseDate = baseDate;
    this.timebar = this.enrichTimebar(timebar);
    this.tracks = this.enrichTracks(tracks);

    this.excelStyleUtils = new ExcelUtils(worksheet);
  }

  enrichTimebar(timebar) {
    const [years, months, days] = timebar;

    years.cells.forEach((year) => {
      year.startRowIndex = YEARS_ROW_INDEX;
      year.startColumnKey = makeColumnKeyFromDate(year.start);
      year.endColumnKey = makeColumnKeyFromDate(year.end);
    });

    months.cells.forEach((month) => {
      month.startRowIndex = MONTHS_ROW_INDEX;
      month.startColumnKey = makeColumnKeyFromDate(month.start);
      month.endColumnKey = makeColumnKeyFromDate(month.end);
    });

    days.cells.forEach((day) => {
      day.startRowIndex = DAYS_ROW_INDEX;
      day.startColumnKey = makeColumnKeyFromDate(day.start);
      day.endColumnKey = makeColumnKeyFromDate(day.end);
      day.title = parseInt(day.title);
    });
    return timebar;
  }

  enrichTracks(tracks) {
    let startRowIndex = TRACK_ROW_INDEX;
    tracks.forEach((track) => {
      track.startRowIndex = startRowIndex;
      track.endRowIndex = startRowIndex + (track.trackRows.length - 1);
      track.trackRows.forEach((row) => {
        row.forEach((job) => {
          job.startRowIndex = startRowIndex;
          this.setJobByJobCases(job);
          job.startColumnKey = makeColumnKeyFromDate(job.start);
          job.endColumnKey = makeColumnKeyFromDate(job.end);
        });
        startRowIndex++;
      });
    });
    return tracks;
  }

  setJobByJobCases(job) {
    let title = "";

    if (job.jobCases.includes(JOB_CASES.UNDONE_JOB)) title += "개발 진행중 - ";

    if (job.jobCases.includes(JOB_CASES.HIDDEN_START_DATE)) {
      title += `시작 날짜: ${getYearMonthDayFromDate(job.start).join("-")} - `;
      job.start = this.baseDate.baseStartDate;
    }

    if (job.jobCases.includes(JOB_CASES.HIDDEN_END_DATE)) {
      title += `종료 날짜: ${getYearMonthDayFromDate(job.end).join("-")} - `;
      job.end = this.baseDate.baseEndDate;
    }

    title += job.title;

    job.title = title;
  }

  setExcel() {
    this.setAllColumnKey();

    this.setDefaultSidebar();

    this.setTimebar();

    this.setTracks();
  }

  setAllColumnKey() {
    const [years, months, days] = this.timebar;
    const columnsWithKey = [
      {
        key: "team",
      },
      {
        key: "pic",
      },
      ...days.cells.map((day) => ({
        key: day.id,
      })),
    ];
    this.worksheet.columns = columnsWithKey;
  }

  setDefaultSidebar() {
    this.setCellValue(
      { startRowIndex: DAYS_ROW_INDEX, startColumnKey: "team" },
      "TEAM"
    );
    this.setCellValue(
      { startRowIndex: DAYS_ROW_INDEX, startColumnKey: "pic" },
      "PIC"
    );
    this.excelStyleUtils.setStyle(
      { startColumnKey: "team", startRowIndex: DAYS_ROW_INDEX },
      this.excelStyleUtils.middleStyle
    );
    this.excelStyleUtils.setStyle(
      { startColumnKey: "pic", startRowIndex: DAYS_ROW_INDEX },
      this.excelStyleUtils.middleStyle
    );
  }

  setTimebar() {
    const [years, months, days] = this.timebar;

    years.cells.forEach(this.timeProcessor, this);
    months.cells.forEach(this.timeProcessor, this);
    days.cells.forEach(this.timeProcessor, this);
  }

  timeProcessor(time) {
    this.setCellValue(
      {
        startRowIndex: time.startRowIndex,
        startColumnKey: time.startColumnKey,
      },
      time.title
    );
    this.excelStyleUtils.setStyle(
      {
        startRowIndex: time.startRowIndex,
        startColumnKey: time.startColumnKey,
      },
      this.excelStyleUtils.middleStyle
    );
    if (DAYS_ROW_INDEX === time.startRowIndex) {
      // day의 경우만 실행
      if (time.isHoliday)
        this.excelStyleUtils.setStyle(
          {
            startRowIndex: DAYS_ROW_INDEX,
            startColumnKey: time.startColumnKey,
          },
          this.excelStyleUtils.holidayStyle
        );
    } else {
      this.excelStyleUtils.setMerge({
        startColumnKey: time.startColumnKey,
        endColumnKey: time.endColumnKey,
        startRowIndex: time.startRowIndex,
        endRowIndex: time.startRowIndex,
      });
    }
  }

  setTracks() {
    this.tracks.forEach((track) => {
      this.setSidebar(track);

      track.trackRows.forEach((row) => {
        row.forEach(this.setJob, this);
      });
    });
  }

  setJob(job) {
    this.setCellValue(
      { startRowIndex: job.startRowIndex, startColumnKey: job.startColumnKey },
      job.title
    );
    this.excelStyleUtils.setMerge({
      startColumnKey: job.startColumnKey,
      endColumnKey: job.endColumnKey,
      startRowIndex: job.startRowIndex,
      endRowIndex: job.startRowIndex,
    });
    this.excelStyleUtils.setStyle(
      { startColumnKey: job.startColumnKey, startRowIndex: job.startRowIndex },
      this.excelStyleUtils.jobStyle
    );
  }

  setSidebar(track) {
    this.setCellValue(
      { startRowIndex: track.startRowIndex, startColumnKey: "team" },
      track.team
    );
    this.setCellValue(
      { startRowIndex: track.startRowIndex, startColumnKey: "pic" },
      track.pic
    );
    this.excelStyleUtils.setMerge({
      startColumnKey: "team",
      endColumnKey: "team",
      startRowIndex: track.startRowIndex,
      endRowIndex: track.endRowIndex,
    });
    this.excelStyleUtils.setMerge({
      startColumnKey: "pic",
      endColumnKey: "pic",
      startRowIndex: track.startRowIndex,
      endRowIndex: track.endRowIndex,
    });
    this.excelStyleUtils.setStyle(
      { startColumnKey: "team", startRowIndex: track.startRowIndex },
      this.excelStyleUtils.middleStyle
    );
    this.excelStyleUtils.setStyle(
      { startColumnKey: "pic", startRowIndex: track.startRowIndex },
      this.excelStyleUtils.middleStyle
    );
  }

  setCellValue(position, value) {
    const { startRowIndex, startColumnKey } = position;
    this.worksheet.getRow(startRowIndex).getCell(startColumnKey).value = value;
  }
}

class ExcelUtils {
  constructor(worksheet) {
    this.worksheet = worksheet;
  }

  get jobStyle() {
    return {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF" + nextColor() },
      },
      alignment: { vertical: "middle", horizontal: "center" },
    };
  }

  get holidayStyle() {
    return {
      font: {
        color: { argb: "FFFF0000" },
      },
    };
  }

  get middleStyle() {
    return {
      alignment: { vertical: "middle", horizontal: "center" },
    };
  }

  setMerge(position) {
    const { startColumnKey, endColumnKey, startRowIndex, endRowIndex } =
      position;
    if (startColumnKey === endColumnKey && startRowIndex === endRowIndex)
      return;

    const startCell =
      this.worksheet.getColumn(startColumnKey).letter + "" + startRowIndex;
    const endCell =
      this.worksheet.getColumn(endColumnKey).letter + "" + endRowIndex;
    this.worksheet.mergeCells(startCell, endCell);
  }

  setStyle(position, style) {
    const { startColumnKey, startRowIndex } = position;
    const { font, fill, alignment } = style;
    if (font)
      this.worksheet.getRow(startRowIndex).getCell(startColumnKey).font = font;
    if (fill)
      this.worksheet.getRow(startRowIndex).getCell(startColumnKey).fill = fill;
    if (alignment)
      this.worksheet.getRow(startRowIndex).getCell(startColumnKey).alignment =
        alignment;
  }
}
