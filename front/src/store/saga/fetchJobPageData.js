import { fetchGraphQLData, jobFragments } from "store/saga/common.js";
import { buildSearchOption, parseGridRowData } from "common";
import { isArray } from "lodash";

export default function fetchJobPageData(
  activePageId,
  controlValues,
  activePageNum = 1,
  requestDataNum,
  dontNeedAllAmount,
  additiveData,
  isShowOthers = false,
  isShowAllStatus = false,
  isProgressedInTestFilterApply = false,
) {
  const url = "/ECProject/API/SVC/Project/Common/CommonAPI";
  const defaultPageSize =
    requestDataNum && requestDataNum > 1 ? requestDataNum : 30;
  const rowData = {};

  const pageQuerySet = {
    MyJob: {
      queryResultSetName: "myJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          myJobList{
            myJobAllocated(searchOption: $searchOption) {             
              ...basicField
              ...timeData
              progress     
            }
            myTeamJobUnAllocated {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    MyTeam: {
      queryResultSetName: "myJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          myJobList{
            myTeamJobAllocated(searchOption: $searchOption) {
              ...basicField
              ...timeData
              progress     
            }
            myTeamJobUnAllocated {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    MyPost: {
      pageSize: defaultPageSize,
      queryResultSetName: "myJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          myJobList{
            ${
              dontNeedAllAmount !== true
                ? `myPost_count  (searchOption: $searchOption)`
                : ``
            }
            myPost (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    AllJob: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `all_count  (searchOption: $searchOption)`
                : ``
            }
            all (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    UnAllocatedSupportTest: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `unAllocatedSupportTest_count  (searchOption: $searchOption)`
                : ``
            }
            unAllocatedSupportTest (searchOption: $searchOption) {
              ...basicField
              ...timeData
              developerList {
                id
                name
              }
            }
          }
        }
      `,
    },

    UnAllocatedDev: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `unAllocatedDev_count  (searchOption: $searchOption)`
                : ``
            }
            unAllocatedDev (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    UnAllocatedPlan: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `unAllocatedPlan_count  (searchOption: $searchOption)`
                : ``
            }
            unAllocatedPlan (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    ByTeam: {
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            byTeam (searchOption: $searchOption) {
              ...basicField
              ...timeData
              progress     
            }
          }
        }
      `,
    },

    ByJob: {
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            byJob (searchOption: $searchOption) {
              ...basicField
              ...timeData
              progress     
            }
          }
        }
      `,
    },

    ProgressedInTest: {
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            byCategoryTest (searchOption: $searchOption) {
              ...basicField
              ...timeData
              developerList {
                id
                name
              }
            }
          }
        }
      `,
    },

    ETCCategory: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `byCategoryEtc_count  (searchOption: $searchOption)`
                : ``
            }
            byCategoryEtc (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    dailyHistory: {
      pageSize: defaultPageSize,
      queryResultSetName: "reportList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          reportList {
            ${
              dontNeedAllAmount !== true
                ? `dailyHistory_count (searchOption: $searchOption)`
                : ``
            }
            dailyHistory (searchOption: $searchOption) {
              job {
                code
                title
                writeDate
                owner
                ownerGroupDetail{
                  siteName
                }
                usedTime
                costDays
                planToStart
                firstIngStartDate
                lastIngEndDate
                intergratedStatus{
                  name
                  value
                }
              }
              totalHistory {
                start
                end
                reason
              }
            }
         }
        }
      `,
    },

    dailySpendByJob: {
      pageSize: defaultPageSize,
      queryResultSetName: "reportList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          reportList {
            ${
              dontNeedAllAmount !== true
                ? `dailySpendByJob_count (searchOption: $searchOption)`
                : ``
            }
            dailySpendByJob (searchOption: $searchOption) {
              job {
                code
                title
                writeDate
                owner
                ownerGroupDetail{
                  siteName
                }
                usedTime
                costDays
                planToStart
                firstIngStartDate
                lastIngEndDate
                intergratedStatus{
                  name
                  value
                }
              }
            }
          }
        }
      `,
    },

    dailySpendByOwner: {
      pageSize: defaultPageSize,
      queryResultSetName: "reportList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          reportList {
            ${
              dontNeedAllAmount !== true
                ? `dailySpendByOwner_count (searchOption: $searchOption)`
                : ``
            }
            dailySpendByOwner (searchOption: $searchOption) {
              job {
                code
                title
                writeDate
                owner
                ownerGroupDetail{
                  siteName
                }
                usedTime
                costDays
                planToStart
                firstIngStartDate
                lastIngEndDate
                intergratedStatus{
                  name
                  value
                }
              }
              usedTimeByDay {
                workedDate
                usedTime
              }
            }
         }
        }
      `,
    },

    Gantt: {
      pageSize: defaultPageSize,
      queryResultSetName: "ganttList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          ganttList {
            ${
              dontNeedAllAmount !== true
                ? `gantt_count (searchOption: $searchOption)`
                : ``
            }
            gantt (searchOption: $searchOption) {
              ownerDetail {
                id
                name
                site
                siteName
              }
              jobs {
                code
                title
                writeDate
                usedTime
                costDays
                planToStart
                firstIngStartDate
                lastIngEndDate
              }
            }
            holiday (searchOption: $searchOption) {
              date
              name
            }
         }
        }
      `,
    },

    ByTeamForMgmt: {
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            byTeamForMgmt (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },

    UnAllocatedJobForMgmt: {
      pageSize: defaultPageSize,
      queryResultSetName: "allJobList",
      query: `
        query ECProject_Job($searchOption:JobSearchOptionType) {
          allJobList{
            ${
              dontNeedAllAmount !== true
                ? `unAllocatedJobForMgmt_count (searchOption: $searchOption)`
                : ``
            }
            unAllocatedJobForMgmt (searchOption: $searchOption) {
              ...basicField
              ...timeData
            }
          }
        }
      `,
    },
  };

  const callByGridName = additiveData?.usedGrid; // usedGrid가 있는 경우 메뉴 이름이 아닌, 사용하는 그리드 이름으로 api 조회
  const pageQueryData = callByGridName
    ? pageQuerySet[callByGridName]
    : pageQuerySet[activePageId];

  const fragments = jobFragments;
  const variable = buildSearchOption(
    controlValues,
    activePageNum,
    pageQueryData,
    activePageId,
    isShowOthers,
    isShowAllStatus,
    isProgressedInTestFilterApply,
  );

  const query = `${pageQueryData.query} ${
    pageQueryData.queryResultSetName === "reportList" ||
    pageQueryData.queryResultSetName === "ganttList"
      ? ""
      : fragments
  }`;

  // fetchPageLimitPage(pageQueryData.countQueryName, variable).then(result => {
  //   const data = result.data.Data.data;
  //   const pageData = data[pageQueryData.queryResultSetName];
  //   const count = pageData[pageQueryData.countQueryName];

  //   return fetchGraphQLData(url, query, variable);

  // }).then(result => {
  //   const data = result.data.Data.data;
  //   const pageData = data[pageQueryData.queryResultSetName];

  //   for (const key in pageData) {
  //     if (key.toString().endsWith("_count")) {
  //       maxPageNum = (parseInt((pageData[key]) / (pageQueryData.pageSize ?? defaultPageSize)) + 1) || 1;
  //     } else {
  //       const gridId = key;
  //       rowData[gridId] = parseGridRowData(pageData[gridId], gridId);
  //     }
  //   }

  //   const parsedPageData = {
  //     rowData: rowData,
  //     maxPageNum: maxPageNum,
  //   };

  //   return parsedPageData;
  // });;

  return fetchGraphQLData(url, query, variable).then((result) => {
    debugger;
    const data = result.data.Data.data;
    const pageData = data[pageQueryData.queryResultSetName];
    let maxPageNum;

    if (activePageId === "Gantt") {
      rowData.holiday = pageData.holiday;
      rowData.tracks = pageData.gantt;
      maxPageNum = pageData.gantt_count;
    } else {
      for (const key in pageData) {
        if (key.toString().endsWith("_count")) {
          maxPageNum =
            parseInt(pageData[key] / pageQueryData.pageSize) + 1 || 1;
        } else {
          const gridId = key;
          let gridData =
            isArray(additiveData.gridList) &&
            additiveData.gridList.find((item) => item.gridId == gridId);
          rowData[gridId] = parseGridRowData(
            pageData[gridId],
            gridId,
            gridData?.headerCheckbox
          );
        }
      }
    }

    const parsedPageData = {
      rowData: rowData,
      maxPageNum: maxPageNum,
    };

    return parsedPageData;
  });
}
