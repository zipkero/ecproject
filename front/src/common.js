import {
  isArray,
  isNil,
  isEmpty,
  cloneDeep,
  isEqual,
  isString,
  map,
  filter,
} from "lodash";
import moment from "moment";

export const copyToClipboard = (text) => {
  if (isString(text)) {
    var textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  }
};

// Get contrast color for a color (hexadecimal)
export const getContrastColor = (hexcolor) => {
  let result = "#000000";

  if (hexcolor.indexOf("#") !== 0) {
    hexcolor = "#" + hexcolor;
  }

  if (hexcolor.match(/^#[a-f0-9]{6}$/i) !== null) {
    hexcolor = hexcolor.replace("#", "");
    result = parseInt(hexcolor, 16) > 0xffffff / 2 ? "#000000" : "#ffffff";
  }

  return result;
};

export const getDefaultJobInfo = (type) => {
  const userData = window.SCHEDULER_GLOBAL_DATA?.userData;
  const { id, name, site, siteName } = userData ?? {};

  const JOBCODE = {};

  switch (type) {
    case "meeting":
      JOBCODE.value = "WG_00060";
      JOBCODE.label = "회의(Meeting)";
      break;
    case "support":
      JOBCODE.value = "WG_00151";
      JOBCODE.label = "지원(Support)";
      break;
    case "call":
      JOBCODE.value = "WG_00310";
      JOBCODE.label = "전화상담 (Cust. Support)";
      break;
  }

  return {
    JOBCODE: JOBCODE,
    CATEGORY: {
      label: "etc",
      value: 999999,
    },
    TEAM: {
      label: siteName,
      value: site,
    },
    PIC: {
      label: name,
      value: id,
    },
    TITLE: JOBCODE.label,
  };
};

export const getParsedDate = (date, format) => {
  const defaultFormat = format || "YYYY-MM-DD";
  return date ? moment(date).format(defaultFormat) : "";
};

export const getParsedControlValuesByControlList = (controlList) => {
  const delimiter = window.SCHEDULER_GLOBAL_DATA.delimiter ?? "∬";
  const controlValues = {};

  for (let i = 0; i < (controlList || []).length; i++) {
    const ctrl = controlList[i];
    let value = ctrl.values;

    if (isNil(value)) {
      continue;
    }

    switch (ctrl.type.toUpperCase()) {
      case "MULTISELECT":
        value = isEmpty(value[0])
          ? ""
          : value.map((_) => _.value).join(delimiter);
        break;
      default:
        if (isArray(value)) {
          value = isEmpty(value[0]) ? "" : value[0];
        }
        break;
    }

    controlValues[ctrl.controlId] = value;
  }

  return controlValues;
};

const getSchedulePeriod = (jobData) => {
  var startDateFormat = "YYYY-MM-DD HH:mm",
    endDateFormat = "YYYY-MM-DD HH:mm",
    sumOfPlan = 0,
    timeSpendHistoryList = jobData.timeSpendHistoryList || [], // status 변경 기록
    timeSpendEstimateList = jobData.timeSpendEstimateList || [], // 분석, 개발 일정
    startDate = jobData.planToStart,
    endDate = null,
    usedTime = getUsedTimeDisplay(jobData.usedTime);

  if (jobData.firstIngStartDate) {
    startDate = jobData.firstIngStartDate;
  }

  if (jobData.intergratedStatus?.value >= 70) {
    // 이미 완료한 잡이면 마지막 endDate 할당
    endDate = jobData.lastIngEndDate;
  } else if (startDate /*&& jobData.costDays > 0*/) {
    // 완료되지 않은 잡이면 예상일정 합산하여 계산
    sumOfPlan = parseFloat((jobData.costDays * 24).toFixed(2));

    // 일정 하루 미만은 START 에서 시간 제외하고 FIN 찍히도록
    if (sumOfPlan < 24) {
      endDate = moment(startDate);
    } else {
      endDate = moment(startDate).add(sumOfPlan, "h");
    }

    // userTime 계산 jobData.usedTime
    // estimate end date = job 시작일 + 예상소요일(분석예정일+개발예정일) + MAX(job 시작후 현재까지 경과 일자 - Math.floor(실제 작업시간 / 8), 0)
    if (usedTime) {
      var nowMinusStartDate = moment()
        .startOf("day")
        .diff(moment(startDate).startOf("day"), "days");
      var userTimeToDay = Math.floor(Number(usedTime.h) / 8); // 소수점은 버림
      if (nowMinusStartDate > userTimeToDay) {
        endDate.add(nowMinusStartDate - userTimeToDay, "d");
      }
    }

    endDateFormat = "YYYY-MM-DD"; // 완료되지 않은 잡의 Fin 시간은 찍어주지 않기로
  }

  startDate = startDate ? getParsedDate(startDate, startDateFormat) : null;
  endDate = endDate ? getParsedDate(endDate, endDateFormat) : null;

  return {
    startDate: startDate,
    endDate: endDate,
    timeSpendHistoryList: timeSpendHistoryList,
    timeSpendEstimateList: timeSpendEstimateList,
  };
};
const getUsedTimeDisplay = (usedTime) => {
  let result;
  if (usedTime) {
    const time = usedTime.toString().split(".");
    const hours = time[0].padStart(2, "0");
    const minutes = (parseFloat("0." + time[1]) * 60)
      .toFixed(0)
      .padStart(2, "0");
    result = { h: hours, m: minutes };
  } else {
    result = "";
  }

  return result;
};
export const getParsedControlValuesByFetchedData = (data) => {
  const userData = window.SCHEDULER_GLOBAL_DATA.userData; // fetched in src/index.js
  const period = getSchedulePeriod(data);
  const usedTime = getUsedTimeDisplay(data.usedTime);
  const isMyJob = data.ownerDetail?.id === userData?.id;
  const labels = (data.labels ?? []).map((item) => {
    return {
      value: item.code,
      label: item.name,
      color: item.color,
    };
  });
  const developerList = (data.developerList ?? []).map((item) => {
    return {
      value: item.id,
      label: item.name,
    };
  });

  const controlValues = {
    BOARDCD: data.boardCd,
    BOARDSEQ: data.boardSeq,
    BOARDNUM: data.boardNum,
    LISTORDER: data.listOrder,
    SWITCH:
      data.intergratedStatus && isMyJob
        ? data.paused
          ? "paused"
          : data.intergratedStatus.value
        : data.paused
        ? "otherPaused"
        : null,
    checkbox: null,
    PRIORITY: data.priority?.toString(),
    PRIORITY2: data.priority2?.toString(),
    CATEGORY: data.category && {
      value: data.category.value,
      label: data.category.name,
    },
    DEVELOPER: developerList,
    TEAM: data.ownerGroupDetail && {
      value: data.ownerGroupDetail.site,
      label: data.ownerGroupDetail.siteName,
    },
    PIC: data.ownerDetail && {
      value: data.ownerDetail.id,
      label: data.ownerDetail.name,
    },
    LABEL: labels,
    JOBCODE: { value: data.code, label: data.name ?? "" },
    TITLE: data.title,
    //STATUS: data.status && { value: data.status.value, label: data.status.name },
    STATUS: data.intergratedStatus && {
      value: data.intergratedStatus.value,
      label: data.intergratedStatus.name,
    },
    WRITEDATE: data.writeDate,
    WRITER: data.writer,
    START: period.startDate,
    FIN: period.endDate,
    DEPLOY: data.deployDate,
    USEDTIME: usedTime ? usedTime.h + " : " + usedTime.m : usedTime,
    TIMESPENDHISTORYLIST: period.timeSpendHistoryList,
    TIMESPENDESTIMATELIST: period.timeSpendEstimateList,
    HOWTODEV: data.comment1,
    REASONFORDEV: data.comment2,
    COMMONORNOT: data.comment3,
    TYPE: data.comment4,
    PROGRESS: data.progress,
  };

  return controlValues;
};

export const getParsedControlValuesByFetchedData_dailyHistory = (data) => {
  const resultRow = [];
  const userData = window.SCHEDULER_GLOBAL_DATA.userData; // fetched in src/index.js
  const period = getSchedulePeriod(data.job);
  const usedTime = getUsedTimeDisplay(data.job.usedTime);

  const controlValues = {
    TEAM: data.job.ownerGroupDetail?.siteName ?? "",
    PIC: data.job.owner,
    JOBCODE: data.job.code,
    JOBTITLE: data.job.title,
    DATE: getParsedDate(data.job.writeDate, "YYYY-MM-DD HH:mm"),
    START: getParsedDate(period.startDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].start
    FIN: getParsedDate(period.endDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].end
    COST: data.job.costDays,
    REALTIME: usedTime ? usedTime.h + " : " + usedTime.m : usedTime,
    REASON: "", // data.totalHistory[0].reason
    SUBROW: "parent",
  };
  resultRow.push(controlValues);

  if (data.totalHistory && data.totalHistory.length > 0) {
    for (let i = 0; i < data.totalHistory.length; i++) {
      resultRow.push({
        ...controlValues,
        DATE: getParsedDate(data.totalHistory[i].end, "YYYY-MM-DD HH:mm"),
        START: "",
        FIN: "",
        COST: "",
        REALTIME: "",
        REASON: data.totalHistory[i].reason,
        SUBROW: "child",
      });
    }
  }

  return resultRow;
};

export const getParsedControlValuesByFetchedData_dailySpendByJob = (data) => {
  const resultRow = [];
  const period = getSchedulePeriod(data.job);
  const usedTime = getUsedTimeDisplay(data.job.usedTime);

  const controlValues = {
    TEAM: data.job.ownerGroupDetail?.siteName ?? "",
    PIC: data.job.owner,
    JOBCODE: data.job.code,
    JOBTITLE: data.job.title,
    DATE: getParsedDate(data.job.writeDate, "YYYY-MM-DD HH:mm"),
    START: getParsedDate(period.startDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].start
    FIN: getParsedDate(period.endDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].end
    COST: data.job.costDays,
    REALTIME: usedTime ? usedTime.h + " : " + usedTime.m : usedTime,
  };
  resultRow.push(controlValues);

  return resultRow;
};

export const getParsedControlValuesByFetchedData_dailySpendByOwner = (data) => {
  const resultRow = [];
  const userData = window.SCHEDULER_GLOBAL_DATA.userData; // fetched in src/index.js
  const period = getSchedulePeriod(data.job);

  const controlValues = {
    TEAM: data.job.ownerGroupDetail?.siteName ?? "",
    PIC: data.job.owner,
    JOBCODE: data.job.code,
    JOBTITLE: data.job.title,

    START: getParsedDate(period.startDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].start
    FIN: getParsedDate(period.endDate, "YYYY-MM-DD HH:mm"), // data.totalHistory[0].end
    WORKEDDATE: "",
    REALTIME: "",
    SUBROW: "parent",
  };
  resultRow.push(controlValues);

  if (data.usedTimeByDay && data.usedTimeByDay.length > 0) {
    for (let i = 0; i < data.usedTimeByDay.length; i++) {
      let usedTime = getUsedTimeDisplay(data.usedTimeByDay[i].usedTime);
      if (usedTime != "") {
        resultRow.push({
          ...controlValues,
          START: "",
          FIN: "",
          WORKEDDATE: getParsedDate(
            data.usedTimeByDay[i].workedDate,
            "YYYY-MM-DD"
          ),
          REALTIME: usedTime ? usedTime.h + " : " + usedTime.m : usedTime,
          SUBROW: "child",
        });
      }
    }
  }

  return resultRow;
};

export const getDifferentControlValues = (prev, curr) => {
  const result = {};
  const cloneCurr = cloneDeep(curr);
  const currKeys = Object.keys(cloneCurr);

  for (var key in prev) {
    var prevValue = prev[key];
    var currValue = cloneCurr[key];

    if (currKeys.includes(key)) {
      // 동일한 키 있을 때는 비교
      if (isEqual(prevValue, currValue) === false) {
        result[key] = currValue;
      }
      delete cloneCurr[key]; // 동일한 키는 제거
    } else {
      result[key] = ""; // prev 에만 있는 key값은 제거된 것이므로 "" 할당 (api 호출시 제거될 수 있도록)
    }
  }

  Object.assign(result, cloneCurr); // cloneCurr 에 남아있는 key값은 curr 에만 있는 값이므로 신규 생성

  return result;
};

export const getGridDataParser = (gridId) => {
  let gridDataParserFunc = () => [];

  switch (gridId) {
    case "dailyHistory":
      gridDataParserFunc = getParsedControlValuesByFetchedData_dailyHistory;
      break;
    case "dailySpendByJob":
      gridDataParserFunc = getParsedControlValuesByFetchedData_dailySpendByJob;
      break;
    case "dailySpendByOwner":
      gridDataParserFunc =
        getParsedControlValuesByFetchedData_dailySpendByOwner;
      break;
  }
  return gridDataParserFunc;
};

export const parseGridRowData = (rowList, gridId, headerCheckbox) => {
  var result = [];
  var isSpecialGrid = [
    "dailyHistory",
    "dailySpendByJob",
    "dailySpendByOwner",
  ].includes(gridId);
  var parsedControlValuesFunc = getParsedControlValuesByFetchedData;

  if (isSpecialGrid) {
    parsedControlValuesFunc = getGridDataParser(gridId);
  }

  for (var i = 0; i < (rowList || []).length; i++) {
    var row = rowList[i];
    if (isSpecialGrid) {
      result = [...result, ...parsedControlValuesFunc(row)];
    } else {
      result.push(parsedControlValuesFunc(row));
    }
  }

  if (headerCheckbox?.value === true) {
    result = filter(
      map(result, function (item) {
        if (
          filter(result, { JOBCODE: { value: item.JOBCODE?.value } }).length > 1
        ) {
          return item;
        }
        return false;
      }),
      function (value) {
        return value;
      }
    );
  }

  if (gridId === "myJobAllocated") {
    return getSortedMyJobGridRowData(result);
  }

  if (gridId === "myTeamJobAllocated") {
    return getSortedMyTeamJobGridRowData(result);
  }

  if (gridId === "byTeam" || gridId === "byTeamForMgmt") {
    return getSortedByTeamGridRowData(result);
  }

  return result;
};

export const buildSearchOption = (
  controlValues,
  activePageNum,
  pageQueryData,
  activePageId,
  isShowOthers = false,
  isShowAllStatus = false
) => {
  const {
    JOBCODE,
    CATEGORY,
    TITLE,
    TEAM,
    PIC,
    STATUS,
    DEPLOY_FROM,
    DEPLOY_TO,
    START_FROM,
    START_TO,
  } = controlValues ?? {};
  switch (pageQueryData.queryResultSetName) {
    case "myJobList":
      return {
        searchOption: {
          isShowOthers: isShowOthers,
          isShowAllStatus: isShowAllStatus,
        },
      };
    case "allJobList":
    case "reportList":
    case "MyPost":
      return {
        searchOption: {
          code: JOBCODE?.value,
          title: TITLE,
          category: CATEGORY?.value,
          owner: PIC?.value,
          ownerGroup: TEAM?.value,
          status: STATUS?.value,
          deployFrom: DEPLOY_FROM || undefined,
          deployTo: DEPLOY_TO || undefined,
          startFrom: START_FROM || undefined,
          startTo: START_TO || undefined,
          page: activePageNum,
          pageSize: pageQueryData.pageSize ?? null,
          isShowOthers: isShowOthers,
          isShowAllStatus: isShowAllStatus,
        },
      };
    case "ganttList":
      return {
        searchOption: {
          code: JOBCODE?.value,
          title: TITLE,
          category: CATEGORY?.value,
          owner: PIC?.value,
          ownerGroup: TEAM?.value,
          status: STATUS?.value,
          startFrom: START_FROM || undefined,
          startTo: START_TO || undefined,
          page: activePageNum,
          pageSize: pageQueryData.pageSize ?? null,
        },
      };
  }
};

export const getCurrentDateWithFirstDay = () => {
  const date = new Date();
  date.setDate(1);
  const month = date.getMonth() + 1;
  return `${date.getFullYear()}-${month}-${date.getDate()}`;
};
export const getCurrentDatehWithLastDay = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  date.setMonth(month, 0); // 이번 달 마지막 날 셋팅
  return `${date.getFullYear()}-${month}-${date.getDate()}`;
};

const sortJobByListOrder = (jobA, jobB) => {
  const { PRIORITY: priorityA = 999, LISTORDER: listOrderA } = jobA;
  const { PRIORITY: priorityB = 999, LISTORDER: listOrderB } = jobB;
  let result;

  result = listOrderA - listOrderB; // 1차판단: listOrder

  if (result === 0) {
    // 1차 동점일 경우 2차판단: priority
    result = priorityA - priorityB;
  }

  return result;
};

const sortJobByName = (jobA, jobB) => {
  const teamA = jobA.TEAM?.label ?? "";
  const teamB = jobB.TEAM?.label ?? "";
  const picA = jobA.PIC?.label ?? "";
  const picB = jobB.PIC?.label ?? "";
  const listOrderA = jobA.LISTORDER ?? "";
  const listOrderB = jobB.LISTORDER ?? "";

  let result;

  if (teamA === teamB) {
    // 1차 동점일 경우 2차판단: PIC name
    if (picA === picB) {
      // 2차 동점일 경우 3차판단: listOrder
      if (listOrderA === listOrderB) {
        result = 0;
      } else {
        result = listOrderA > listOrderB ? 1 : -1;
      }
    } else {
      result = picA > picB ? 1 : -1;
    }
  } else {
    result = teamA > teamB ? 1 : -1; // 1차판단: TEAM name
  }

  return result;
};

const getSortedMyJobGridRowData = (rowList) => {
  const { currentlyDoingJob, id: myId } =
    window.SCHEDULER_GLOBAL_DATA.userData ?? {};

  const jobBundleSet = {};
  let sortedRowList = [];

  for (var i = 0; i < rowList.length; i++) {
    const job = rowList[i];
    let {
      JOBCODE,
      CATEGORY,
      STATUS,
      PIC,
      LISTORDER = 999,
      PRIORITY = 999,
    } = job;
    JOBCODE = JOBCODE.value;
    CATEGORY = CATEGORY.value;
    STATUS = STATUS.value;
    PIC = PIC?.value;

    // 내가 진행중인 잡의 listOrder는 0 부여
    if (
      currentlyDoingJob &&
      currentlyDoingJob.code === JOBCODE &&
      PIC === myId &&
      STATUS === 30
    ) {
      LISTORDER = 0;
      PRIORITY = 0;
      job.LISTORDER = 0;
    }

    // 1. job code 별로 묶인 bundle 만들기 > LISTORDER 는 각 번들에서 가장 낮은 job 이 대표로 등록
    if (!jobBundleSet[JOBCODE]) {
      jobBundleSet[JOBCODE] = {
        PRIORITY: 999,
        LISTORDER: 999,
        list: [],
      };
    }

    if (jobBundleSet[JOBCODE].PRIORITY > PRIORITY) {
      jobBundleSet[JOBCODE].PRIORITY = PRIORITY;
    }

    if (jobBundleSet[JOBCODE].LISTORDER > LISTORDER) {
      jobBundleSet[JOBCODE].LISTORDER = LISTORDER;
    }

    jobBundleSet[JOBCODE].list.push(job);
  }

  // 2. job code 묶음 끼리 sorting
  for (var jobCode in jobBundleSet) {
    const jobBundle = jobBundleSet[jobCode];
    const bundleListOrder = jobBundle.LISTORDER;
    jobBundle.list.sort(sortJobByListOrder); // 2-1. 묶음별 내부 sorting

    // 2-2. 묶음 자체에 대한 sorting > listOrder 를 index 기준으로 neted array 만들기
    if (sortedRowList[bundleListOrder]) {
      sortedRowList[bundleListOrder].push(jobBundle);
    } else {
      sortedRowList[bundleListOrder] = [jobBundle];
    }
  }

  sortedRowList.filter((_) => !!_);
  sortedRowList.forEach((bundleList) => {
    bundleList.sort(sortJobByListOrder);
  });
  sortedRowList = sortedRowList.flat().map((bundle) => bundle.list);

  return sortedRowList.flat();
};

const getSortedMyTeamJobGridRowData = (rowList) => {
  const {
    currentlyDoingJob,
    id: myId,
    site: myTeam,
  } = window.SCHEDULER_GLOBAL_DATA.userData;

  let member_order_index = 0;
  let MEMBERORDER;
  const jobBundleSet = {};
  const sortedMemberJobList = [];
  let sortedRowList = [];
  const myTeamMemberOrder = {
    [myId]: member_order_index++,
  };

  for (var i = 0; i < rowList.length; i++) {
    const job = rowList[i];
    let { JOBCODE, CATEGORY, STATUS, PIC, TEAM, LISTORDER = 999 } = job;
    JOBCODE = JOBCODE.value;
    CATEGORY = CATEGORY.value;
    STATUS = STATUS.value;
    PIC = PIC?.value;
    TEAM = TEAM?.value;
    MEMBERORDER = myTeamMemberOrder[PIC] ?? 999;

    // 나와 같은 팀 멤버 index 관리 > 우리팀사람별로 번들 묶는 데 사용
    if (TEAM === myTeam) {
      if (PIC && myTeamMemberOrder[PIC] === undefined) {
        MEMBERORDER = member_order_index++;
        myTeamMemberOrder[PIC] = MEMBERORDER;
      }
    }

    // 내가 진행중인 잡의 listOrder는 0 부여
    if (
      currentlyDoingJob &&
      currentlyDoingJob.code === JOBCODE &&
      PIC === myId &&
      STATUS === 30
    ) {
      LISTORDER = 0;
      job.LISTORDER = 0;
    }

    // 1. job code 별로 묶인 bundle 만들기 > LISTORDER 는 각 번들에서 가장 낮은 job 이 대표로 등록
    if (!jobBundleSet[JOBCODE]) {
      jobBundleSet[JOBCODE] = {
        memberOrder: 999,
        listOrder: 999,
        list: [],
      };
    }

    if (jobBundleSet[JOBCODE].memberOrder > MEMBERORDER) {
      jobBundleSet[JOBCODE].memberOrder = MEMBERORDER;
    }

    if (jobBundleSet[JOBCODE].listOrder > LISTORDER) {
      jobBundleSet[JOBCODE].listOrder = LISTORDER;
    }

    jobBundleSet[JOBCODE].list.push(job);
  }

  // 2. myTeamMember sorting
  for (var jobCode in jobBundleSet) {
    const jobBundle = jobBundleSet[jobCode];
    const jobMemberOrder = jobBundle.memberOrder;

    if (sortedMemberJobList[jobMemberOrder] === undefined) {
      sortedMemberJobList[jobMemberOrder] = [jobBundle];
    } else {
      sortedMemberJobList[jobMemberOrder].push(jobBundle);
    }
  }

  sortedMemberJobList.forEach((memberJobList) => {
    var result = [];
    memberJobList.forEach((jobBundle) => {
      const jobListOrder = jobBundle.listOrder;
      jobBundle.list.sort(sortJobByListOrder); // 2-1. 묶음별 내부 sorting

      // 2-2. 묶음 자체에 대한 sorting > rank 를 index 기준으로 neted array 만들고 flat
      if (result[jobListOrder]) {
        result[jobListOrder] = result[jobListOrder].concat(jobBundle.list);
      } else {
        result[jobListOrder] = jobBundle.list;
      }
    });
    sortedRowList = sortedRowList.concat(result.flat());
  });

  return sortedRowList.flat();
};

const getSortedByTeamGridRowData = (rowList) => {
  (rowList ?? []).sort(sortJobByName);

  return rowList;
};
