import {
  YEARS_ROW_INDEX,
  MONTHS_ROW_INDEX,
  DAYS_ROW_INDEX,
  TRACK_ROW_INDEX,
} from "../constants";
import { excelTestData } from "./apiData";
import { makeColumnKeyFromDate } from "../utils";
import { BaseDate, BuildTimebar, BuildTracks } from "../builders";
import makeGanttExcel from "../excelBuilder";

describe("gantt Excel", () => {
  let ganttWorkSheet;
  const startDateString = "2020-12-01";
  const endDateString = "2020-12-31";
  const baseDate = new BaseDate(startDateString, endDateString);
  const { timebar } = new BuildTimebar(baseDate, excelTestData.holiday);
  const { tracks } = new BuildTracks(baseDate, excelTestData.tracks);
  const [years, months, days] = timebar;
  const middleAlignment = { vertical: "middle", horizontal: "center" };
  ganttWorkSheet = makeGanttExcel(baseDate, timebar, tracks).worksheet;

  test("check all columns key is set like y2020m12d11 format", () => {
    const columnsKey = ["team", "pic", ...days.cells.map((day) => day.id)];
    columnsKey.forEach((columnKey, columnKeyIdx) => {
      const currentExcelColumnIndex = columnKeyIdx + 1;
      expect(
        ganttWorkSheet.getRow(1).getCell(currentExcelColumnIndex)._column._key
      ).toEqual(columnKey);
    });
  });

  describe("First row should have years info", () => {
    test("year value", () => {
      years.cells.forEach((year) => {
        const columnKey = makeColumnKeyFromDate(year.start);
        expect(
          ganttWorkSheet.getRow(YEARS_ROW_INDEX).getCell(columnKey).value
        ).toEqual(year.title);
      });
    });

    test("each year should be merged from start day to end day", () => {
      years.cells.forEach((year) => {
        const [startColumnKey, endColumnKey] = [
          makeColumnKeyFromDate(year.start),
          makeColumnKeyFromDate(year.end),
        ];
        const row = ganttWorkSheet.getRow(YEARS_ROW_INDEX);
        expect(row.getCell(startColumnKey).value).toEqual(
          row.getCell(endColumnKey).value
        );
      });
    });

    test("each year should be aligned center", () => {
      years.cells.forEach((year) => {
        const columnKey = makeColumnKeyFromDate(year.start);
        const row = ganttWorkSheet.getRow(YEARS_ROW_INDEX);
        expect(row.getCell(columnKey).alignment).toEqual(middleAlignment);
      });
    });
  });

  describe("Second row should have months info", () => {
    test("month value", () => {
      months.cells.forEach((month) => {
        const columnKey = makeColumnKeyFromDate(month.start);
        expect(
          ganttWorkSheet.getRow(MONTHS_ROW_INDEX).getCell(columnKey).value
        ).toEqual(month.title);
      });
    });

    test("each month should be merged from start day to end day", () => {
      months.cells.forEach((month) => {
        const [startColumnKey, endColumnKey] = [
          makeColumnKeyFromDate(month.start),
          makeColumnKeyFromDate(month.end),
        ];
        const row = ganttWorkSheet.getRow(MONTHS_ROW_INDEX);
        expect(row.getCell(startColumnKey).value).toEqual(
          row.getCell(endColumnKey).value
        );
      });
    });

    test("each month should be aligned center", () => {
      months.cells.forEach((month) => {
        const columnKey = makeColumnKeyFromDate(month.start);
        const row = ganttWorkSheet.getRow(MONTHS_ROW_INDEX);
        expect(row.getCell(columnKey).alignment).toEqual(middleAlignment);
      });
    });
  });

  describe("Third row should have sidebar info and days info", () => {
    test("day value", () => {
      days.cells.forEach((day) => {
        const columnKey = makeColumnKeyFromDate(day.start);
        expect(
          ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell(columnKey).value
        ).toEqual(day.title);
      });
    });

    test("If day is holiday then the cell should be red", () => {
      const red = "FFFF0000";
      days.cells.forEach((day) => {
        const columnKey = makeColumnKeyFromDate(day.start);
        if (day.isHoliday)
          expect(
            ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell(columnKey).font.color
              .argb
          ).toBe(red);
      });
    });

    test("each day should be aligned center", () => {
      days.cells.forEach((day) => {
        const columnKey = makeColumnKeyFromDate(day.start);
        const row = ganttWorkSheet.getRow(DAYS_ROW_INDEX);
        expect(row.getCell(columnKey).alignment).toEqual(middleAlignment);
      });
    });

    test("sidebar value", () => {
      expect(
        ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell("team").value
      ).toEqual("TEAM");
      expect(
        ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell("pic").value
      ).toEqual("PIC");
    });
    test("sidebar should be aligned center", () => {
      expect(
        ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell("team").alignment
      ).toEqual(middleAlignment);
      expect(
        ganttWorkSheet.getRow(DAYS_ROW_INDEX).getCell("pic").alignment
      ).toEqual(middleAlignment);
    });
  });

  describe("Track Rows should have sidebar info and jobs info", () => {
    let startRowIndex;
    beforeEach(() => {
      startRowIndex = TRACK_ROW_INDEX;
    });
    // test.each([
    //   [{ title: 'A20_03380_test', jobCase: 'undoneJob' }],
    //   [{ title: 'A20_03380_test', jobCase: 'hiddenStartDate' }],
    //   [{ title: 'A20_03380_test', jobCase: 'hiddenEndDate' }],
    // ])('makeTitle should return %s with jobCase', (expected, job) => {})
    // test('sidebar and jobs value', () => {
    //   tracks.forEach(track => {
    //     expect(ganttWorkSheet.getRow(startRowIndex).getCell('pic').value).toEqual(track.pic)
    //     expect(ganttWorkSheet.getRow(startRowIndex).getCell('team').value).toEqual(track.team)

    //     track.trackRows.forEach(row => {
    //       row.forEach(element => {
    //         const { start, end, title } = element
    //         const [startColumnKey, endColumnKey] = [makeColumnKeyFromDate(start), makeColumnKeyFromDate(end)]
    //         expect(ganttWorkSheet.getRow(startRowIndex).getCell(startColumnKey).value).toEqual(title)
    //       })
    //       startRowIndex++
    //     })
    //   })
    // })

    test("job should be merged from start date to end date horizontally", () => {
      tracks.forEach((track) => {
        track.trackRows.forEach((row) => {
          row.forEach((element) => {
            const { start, end } = element;
            const [startColumnKey, endColumnKey] = [
              makeColumnKeyFromDate(start),
              makeColumnKeyFromDate(end),
            ];
            const row = ganttWorkSheet.getRow(startRowIndex);
            expect(row.getCell(startColumnKey).value).toEqual(
              row.getCell(endColumnKey).value
            );
          });
          startRowIndex++;
        });
      });
    });

    test("job should have foreground color", () => {
      tracks.forEach((track) => {
        track.trackRows.forEach((row) => {
          row.forEach((element) => {
            const { start } = element;
            const columnKey = makeColumnKeyFromDate(start);
            expect(
              ganttWorkSheet.getRow(startRowIndex).getCell(columnKey).fill
                .fgColor.argb
            ).not.toBeUndefined();
          });
          startRowIndex++;
        });
      });
    });

    test("sidebar should be merged from start row to end row vertically", () => {
      tracks.forEach((track) => {
        // 시작 인덱스 포함 진행되기 때문에 1 빼기
        const endRowIndex = startRowIndex + (track.trackRows.length - 1);
        expect(
          ganttWorkSheet.getRow(startRowIndex).getCell("team").value
        ).toEqual(ganttWorkSheet.getRow(endRowIndex).getCell("team").value);
        expect(
          ganttWorkSheet.getRow(startRowIndex).getCell("pic").value
        ).toEqual(ganttWorkSheet.getRow(endRowIndex).getCell("pic").value);
        track.trackRows.forEach((row) => {
          startRowIndex++;
        });
      });
    });

    test("each sidebar should be aligned center", () => {
      tracks.forEach((track) => {
        // 시작 인덱스 포함 진행되기 때문에 1 빼기
        expect(
          ganttWorkSheet.getRow(startRowIndex).getCell("team").alignment
        ).toEqual(middleAlignment);
        expect(
          ganttWorkSheet.getRow(startRowIndex).getCell("pic").alignment
        ).toEqual(middleAlignment);
        track.trackRows.forEach((row) => {
          startRowIndex++;
        });
      });
    });
  });
});
