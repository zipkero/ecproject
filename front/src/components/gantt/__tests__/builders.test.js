import { BuildTracks, BottomScroll, BaseDate, BuildTimebar } from "../builders";
import { makeEndDate, makeStartDate } from "../utils";
import { apiData } from "./apiData";

const trackRowsStub = `[[{"id":"t-0-el-0","title":"A20_03380_test","start":"2020-12-09T15:00:00.000Z","end":"2020-12-10T14:59:59.000Z","jobCases":[],"style":{"backgroundColor":"#FF005D","color":"#ffffff","borderRadius":"4px","boxShadow":"1px 1px 0px rgba(0, 0, 0, 0.25)","textTransform":"capitalize"},"classes":{},"popupData":{"JOBCODE":{"value":"A20_03380","label":""},"PIC":{"value":"다솔","label":""},"CATEGORY":{"value":null,"label":""},"WRITEDATE":"2020-12-10T16:22:06"}},{"id":"t-1-el-0","title":"A13_01112_지원(Support)","start":"2020-12-30T15:00:00.000Z","end":"2020-12-31T14:59:59.000Z","jobCases":[],"style":{"backgroundColor":"#0085B6","color":"#ffffff","borderRadius":"4px","boxShadow":"1px 1px 0px rgba(0, 0, 0, 0.25)","textTransform":"capitalize"},"classes":{},"popupData":{"JOBCODE":{"value":"A13_01112","label":""},"PIC":{"value":"다솔","label":""},"CATEGORY":{"value":null,"label":""},"WRITEDATE":"2020-12-31T13:07:26"}}]]`;
describe("BuildTracks", () => {
  const startDateString = "2020-12-01";
  const endDateString = "2021-01-31";
  const baseDate = new BaseDate(startDateString, endDateString);
  const buildTracks = new BuildTracks(baseDate, apiData.tracks);

  test("makeTrackRowsFromDate should return specific data structure", () => {
    const result = JSON.parse(trackRowsStub);
    const { tracks } = buildTracks;
    const expectedObj = tracks[0].trackRows;
    expectedObj.forEach((a) =>
      a.forEach((b) => {
        delete b.style;
        delete b.jobCases;
      })
    );
    result.forEach((a) =>
      a.forEach((b) => {
        delete b.style;
        delete b.jobCases;
      })
    );
    result.forEach((a) =>
      a.forEach((b) => {
        b.start = new Date(b.start);
        b.end = new Date(b.end);
      })
    );

    expect(expectedObj).toEqual(result);
  });

  test.each([
    [["undoneJob"], { undoneJob: "rt-custom-undone-job" }],
    [
      ["hiddenStartDate"],
      {
        textAlign: "text-align-right",
        tooltipPosition: "tooltip-position-right",
      },
    ],
    [
      ["hiddenEndDate"],
      {
        textAlign: "text-align-left",
        tooltipPosition: "tooltip-position-left",
      },
    ],
    [
      ["undoneJob", "hiddenStartDate"],
      {
        undoneJob: "rt-custom-undone-job",
        textAlign: "text-align-right",
        tooltipPosition: "tooltip-position-right",
      },
    ],
    [[], {}],
  ])("makeClasses should return object by %s", (jobCases, expectedObj) => {
    const received = buildTracks.makeClasses(jobCases);

    expect(expectedObj).toEqual(received);
  });

  test.each([
    [
      {
        start: makeStartDate("2020-11-01"),
        end: makeEndDate("2020-12-12"),
        isUndoneJob: false,
      },
      ["hiddenStartDate"],
    ],
    [
      {
        start: makeStartDate("2021-01-25"),
        end: makeEndDate("2021-02-05"),
        isUndoneJob: false,
      },
      ["hiddenEndDate"],
    ],
    [
      {
        start: makeStartDate("2021-01-15"),
        end: makeEndDate("2021-01-31"),
        isUndoneJob: true,
      },
      ["undoneJob"],
    ],
    [
      {
        start: makeStartDate("2020-11-01"),
        end: makeEndDate("2021-01-31"),
        isUndoneJob: true,
      },
      ["undoneJob", "hiddenStartDate"],
    ],
    [
      {
        start: makeStartDate("2021-01-15"),
        end: makeEndDate("2021-01-20"),
        isUndoneJob: false,
      },
      [],
    ],
  ])("verdictJobCases should return jobCase by %s", (params, expected) => {
    const { start, end, isUndoneJob } = params;

    const received = buildTracks.verdictJobCases(start, end, isUndoneJob);

    expect(received).toEqual(expected);
  });
});

test.each([
  ["Scroll Direction is right", 90, 0, 30],
  [
    "Scroll Direction is right And nextScrollLeft is maxScrollLeft",
    20,
    50,
    150,
  ],
  ["Scroll Direction is left", 110, 50, 20],
  ["Scroll Direction is rleft And nextScrollLeft is zero", 180, 50, 0],
])(
  "BottomScroll returns right nextScrollLeft / describe %s",
  (describe, currentPageX, currentScrollLeft, expectedNextScrollLeft) => {
    const bottomScrol = new BottomScroll({
      pageX: 100,
      maxScrollLeft: 150,
      moveScroll: true,
    });
    bottomScrol.currentPageX = currentPageX;
    bottomScrol.currentScrollLeft = currentScrollLeft;
    const result = bottomScrol.nextScrollLeft;
    expect(result).toBe(expectedNextScrollLeft);
  }
);

describe("BuildTimebar", () => {
  let buildTimebar;
  beforeEach(() => {
    const startDateString = "2020-12-01";
    const endDateString = "2021-01-31";
    const baseDate = new BaseDate(startDateString, endDateString);
    buildTimebar = new BuildTimebar(baseDate, apiData.holiday);
  });

  test("startMonthEndMonthOfYears should return each start month and end month of years", () => {
    const startDateString = "2019-10-01";
    const endDateString = "2021-03-31";
    const baseDate = new BaseDate(startDateString, endDateString);
    const buildTimebar = new BuildTimebar(baseDate, apiData.holiday);

    const expected = [
      {
        year: 2019,
        startMonth: 10,
        endMonth: 12,
      },
      {
        year: 2020,
        startMonth: 1,
        endMonth: 12,
      },
      {
        year: 2021,
        startMonth: 1,
        endMonth: 3,
      },
    ];

    expect(buildTimebar.startMonthEndMonthOfYears).toEqual(expected);
  });

  test("startMonthEndMonthOfYears should return each start month and end month of current year", () => {
    const startDateString = "2021-01-01";
    const endDateString = "2021-03-31";
    const baseDate = new BaseDate(startDateString, endDateString);
    const buildTimebar = new BuildTimebar(baseDate, apiData.holiday);

    const expected = [
      {
        year: 2021,
        startMonth: 1,
        endMonth: 3,
      },
    ];

    expect(buildTimebar.startMonthEndMonthOfYears).toEqual(expected);
  });

  test.each([
    [
      "2021-01-01",
      "2021-03-31",
      [
        {
          id: `y${2021}`,
          title: "2021년",
          start: makeStartDate(2021, 1),
          end: makeEndDate(2021, 3),
        },
      ],
    ],
    [
      "2019-10-01",
      "2021-03-31",
      [
        {
          id: `y${2019}`,
          title: "2019년",
          start: makeStartDate(2019, 10),
          end: makeEndDate(2019, 12),
        },
        {
          id: `y${2020}`,
          title: "2020년",
          start: makeStartDate(2020, 1),
          end: makeEndDate(2020, 12),
        },
        {
          id: `y${2021}`,
          title: "2021년",
          start: makeStartDate(2021, 1),
          end: makeEndDate(2021, 3),
        },
      ],
    ],
  ])("yearTimebar returns years", (startDateString, endDateString, cells) => {
    const baseDate = new BaseDate(startDateString, endDateString);
    const buildTimebar = new BuildTimebar(baseDate, apiData.holiday);

    const expected = {
      id: "years",
      title: "Years",
      cells,
      style: {},
    };

    expect(buildTimebar.yearTimebar).toEqual(expected);
  });

  test.each([
    [
      "2020-11-01",
      "2021-1-31",
      [
        {
          id: "m11",
          title: "11월",
          start: makeStartDate(2020, 11),
          end: makeEndDate(2020, 11),
        },
        {
          id: "m12",
          title: "12월",
          start: makeStartDate(2020, 12),
          end: makeEndDate(2020, 12),
        },
        {
          id: "m1",
          title: "1월",
          start: makeStartDate(2021, 1),
          end: makeEndDate(2021, 1),
        },
      ],
    ],
    [
      "2021-01-01",
      "2021-03-31",
      [
        {
          id: "m1",
          title: "1월",
          start: makeStartDate(2021, 1),
          end: makeEndDate(2021, 1),
        },
        {
          id: "m2",
          title: "2월",
          start: makeStartDate(2021, 2),
          end: makeEndDate(2021, 2),
        },
        {
          id: "m3",
          title: "3월",
          start: makeStartDate(2021, 3),
          end: makeEndDate(2021, 3),
        },
      ],
    ],
  ])(
    "monthTimebar should return months",
    (startDateString, endDateString, cells) => {
      const baseDate = new BaseDate(startDateString, endDateString);
      const buildTimebar = new BuildTimebar(baseDate, apiData.holiday);

      const expected = {
        id: "months",
        title: "Months",
        cells,
        style: {},
      };

      expect(buildTimebar.monthTimebar).toEqual(expected);
    }
  );

  test("dayTimebar should return days of month", () => {
    const resultOfDaysOfMarch = `{"id":"days","title":"Days","cells":[{"id":"y2021m3d1","title":"1","start":"2021-02-28T15:00:00.000Z","end":"2021-03-01T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d2","title":"2","start":"2021-03-01T15:00:00.000Z","end":"2021-03-02T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d3","title":"3","start":"2021-03-02T15:00:00.000Z","end":"2021-03-03T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d4","title":"4","start":"2021-03-03T15:00:00.000Z","end":"2021-03-04T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d5","title":"5","start":"2021-03-04T15:00:00.000Z","end":"2021-03-05T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d6","title":"6","start":"2021-03-05T15:00:00.000Z","end":"2021-03-06T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d7","title":"7","start":"2021-03-06T15:00:00.000Z","end":"2021-03-07T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d8","title":"8","start":"2021-03-07T15:00:00.000Z","end":"2021-03-08T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d9","title":"9","start":"2021-03-08T15:00:00.000Z","end":"2021-03-09T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d10","title":"10","start":"2021-03-09T15:00:00.000Z","end":"2021-03-10T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d11","title":"11","start":"2021-03-10T15:00:00.000Z","end":"2021-03-11T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d12","title":"12","start":"2021-03-11T15:00:00.000Z","end":"2021-03-12T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d13","title":"13","start":"2021-03-12T15:00:00.000Z","end":"2021-03-13T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d14","title":"14","start":"2021-03-13T15:00:00.000Z","end":"2021-03-14T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d15","title":"15","start":"2021-03-14T15:00:00.000Z","end":"2021-03-15T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d16","title":"16","start":"2021-03-15T15:00:00.000Z","end":"2021-03-16T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d17","title":"17","start":"2021-03-16T15:00:00.000Z","end":"2021-03-17T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d18","title":"18","start":"2021-03-17T15:00:00.000Z","end":"2021-03-18T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d19","title":"19","start":"2021-03-18T15:00:00.000Z","end":"2021-03-19T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d20","title":"20","start":"2021-03-19T15:00:00.000Z","end":"2021-03-20T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d21","title":"21","start":"2021-03-20T15:00:00.000Z","end":"2021-03-21T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d22","title":"22","start":"2021-03-21T15:00:00.000Z","end":"2021-03-22T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d23","title":"23","start":"2021-03-22T15:00:00.000Z","end":"2021-03-23T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d24","title":"24","start":"2021-03-23T15:00:00.000Z","end":"2021-03-24T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d25","title":"25","start":"2021-03-24T15:00:00.000Z","end":"2021-03-25T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d26","title":"26","start":"2021-03-25T15:00:00.000Z","end":"2021-03-26T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d27","title":"27","start":"2021-03-26T15:00:00.000Z","end":"2021-03-27T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d28","title":"28","start":"2021-03-27T15:00:00.000Z","end":"2021-03-28T14:59:59.000Z","isHoliday":true},{"id":"y2021m3d29","title":"29","start":"2021-03-28T15:00:00.000Z","end":"2021-03-29T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d30","title":"30","start":"2021-03-29T15:00:00.000Z","end":"2021-03-30T14:59:59.000Z","isHoliday":false},{"id":"y2021m3d31","title":"31","start":"2021-03-30T15:00:00.000Z","end":"2021-03-31T14:59:59.000Z","isHoliday":false}],"useAsGrid":true,"style":{}}`;
    const startDateString = "2021-03-01";
    const endDateString = "2021-03-31";
    const baseDate = new BaseDate(startDateString, endDateString);
    const buildTimebar = new BuildTimebar(baseDate, apiData.holiday);

    const result = JSON.stringify(buildTimebar.dayTimebar);
    expect(result).toEqual(resultOfDaysOfMarch);
  });
});
