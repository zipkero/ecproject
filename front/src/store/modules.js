import { handleActions } from "redux-actions";
import produce, { enableES5 } from "immer";
import { getCurrentDatehWithLastDay, getCurrentDateWithFirstDay } from "common";
import { types } from "store/actionTypes";
import { cloneDeep, isArray, isEmpty, isNil } from "lodash";
import { options } from "../constant/options";
import { vMove, vSlice } from "../lib/utils";

enableES5();

const initialControlItems = {};

const columnBasic = [
  {
    field: "BOARDCD",
    headerName: "boardCd",
    type: "text",
    hide: true,
  },
  {
    field: "BOARDSEQ",
    headerName: "boardSeq",
    type: "text",
    hide: true,
  },
];

const columnAlign = [
  {
    field: "PRIORITY",
    headerName: "P",
    type: "text",
    editable: true,
    width: 60,
  },
  {
    field: "PRIORITY2",
    headerName: "COM.P",
    type: "text",
    editable: true,
    width: 60,
  },
];

const columnDatas = [
  {
    field: "TEAM",
    headerName: "Team",
    type: "select",
    width: 80,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "PIC",
    headerName: "PIC",
    type: "select",
    width: 100,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "LABEL",
    headerName: "LABEL",
    type: "multiSelect",
    width: 100,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "BOARDNUM",
    headerName: "Dev.No",
    type: "text",
    hide: false,
    width: 100,
    sortable: true,
    filter: true,
  },
  {
    field: "JOBCODE",
    headerName: "Job Code",
    editable: false,
    type: "select",
    width: 100,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "TITLE",
    headerName: "Title (open with board link of center)",
    type: "title",
    width: 300,
    filter: true,
  },
  {
    field: "CATEGORY",
    headerName: "Category",
    type: "select",
    width: 80,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "STATUS",
    headerName: "Status",
    type: "status",
    width: 80,
    cellEditorParams: {
      items: [],
    },
  },
  {
    field: "WRITEDATE",
    headerName: "REQ",
    type: "date",
    width: 95,
  },
  {
    field: "START",
    headerName: "Start",
    editable: true,
    type: "date",
    width: 95,
  },
  /*{
    field: "FIN",
    headerName: "Fin",
    type: "date",
    width: 95,
    valueGetter: function (params) {
      return params.data.STATUS?.value == 50 ? null : params.data.FIN; // status가 '50 hold' 일 때 Fin 날짜를 표시하지 않는다
    },
  },*/
  {
    field: "FIN_DATE",
    headerName: "FinDate",
    type: "date",
    width: 105,
    valueGetter: function (params) {
      return [0, 10, 50, 1000].includes(params.data.STATUS?.value)
        ? null
        : params.data.FIN_DATE; // status가 '50 hold' 일 때 Fin 날짜를 표시하지 않는다
    },
  },
  {
    field: "DEPLOY",
    headerName: "Deploy",
    editable: true,
    type: "deployDate",
    width: 95,
    cellEditorSelector: (params) => {
      if (
        params.data.CATEGORY?.value === 501 &&
        params.data.STATUS?.value >= 90
      ) {
        // CATEGORY: TEST 이고 STATUS wait 이상일 때만 수정가능
        return {
          component: "DateEditor",
        };
      }
      params.stopEditing();
    },
  },
  {
    field: "USEDTIME",
    headerName: "UTime",
    type: "time",
    width: 70,
  },
  {
    field: "HOWTODEV",
    headerName: "How to Dev",
    type: "text",
    editable: true,
    width: 100,
  },
  {
    field: "TYPE",
    headerName: "TYPE",
    type: "text",
    editable: true,
    width: 60,
  },
  {
    field: "REASONFORDEV",
    headerName: "Reason for dev",
    type: "text",
    editable: true,
    sortable: false,
    filter: false,
    width: 100,
  },
  {
    field: "COMMONORNOT",
    headerName: "Common or not",
    type: "text",
    editable: true,
    sortable: false,
    filter: false,
    width: 100,
  },
];

const columnFields = [...columnBasic, ...columnAlign, ...columnDatas];

const rows = [];

const controlOptions = {
  WRITEDATE: {
    controlId: "WRITEDATE",
    title: "REQ",
    type: "DateInput",
    labelMode: true,
    required: true,
  },

  WRITER: {
    controlId: "WRITER",
    title: "WRITER",
    type: "Input",
    labelMode: true,
    hide: true,
  },

  START: {
    controlId: "START",
    title: "Start",
    type: "DateInput",
    labelMode: true,
    format: "YYYY-MM-DD HH:mm",
  },

  FIN: {
    controlId: "FIN",
    title: "Fin",
    type: "DateInput",
    labelMode: true,
    format: "YYYY-MM-DD",
    plusDate: "",
    plusText: "",
  },

  FIN_DATE: {
    controlId: "FIN_DATE",
    title: "Fin Date",
    type: "DateInput",
    format: "YYYY-MM-DD",
    labelMode: false,
  },

  JOBCODE: {
    controlId: "JOBCODE",
    title: "Job Code",
    type: "Select",
    fetchActionType: "triggerFetchProjectCodeList",
    openPopoverTrigger: "enter",
    forcePopoverClose: undefined,
    createNewCodeConfirmOpen: false,
    items: [],
    required: true,
  },

  JOBTITLE: {
    controlId: "JOBTITLE",
    title: "Job Title",
    type: "Input",
    required: true,
    filter: true,
    hide: true,
  },

  CATEGORY: {
    controlId: "CATEGORY",
    title: "Category",
    type: "Select",
    items: [],
    required: true,
    hide: false,
  },

  TEAM: {
    controlId: "TEAM",
    title: "Team",
    type: "Select",
    items: [],
  },

  PIC: {
    controlId: "PIC",
    title: "PIC",
    type: "Select",
    items: [],
  },

  LABEL: {
    controlId: "LABEL",
    title: "LABEL",
    type: "MultiSelect",
    items: [],
    matchValue: false,
    itemFilter: (matchValue) => {
      return (item) => {
        return matchValue === false ? false : item.boardCd == matchValue;
      };
      // return (item) => { return matchValue === false ? false : item.color == matchValue; }; // 테스트용 코드 color: "#0000ff"
    },
  },

  STATUS: {
    controlId: "STATUS",
    title: "Status",
    type: "Select",
    items: [],
    hide: false,
  },

  DEPLOY: {
    controlId: "DEPLOY",
    title: "Deploy",
    type: "DateInput",
  },

  BOARDTYPE: {
    controlId: "BOARDTYPE",
    title: "Board Type",
    type: "Select",
    items: [],
  },

  BOARDCD: {
    controlId: "BOARDCD",
    title: "Board Code",
    type: "Input",
    hide: true,
  },

  BOARDNUM: {
    controlId: "BOARDNUM",
    title: "Board Number",
    type: "Input",
  },

  BOARDSEQ: {
    controlId: "BOARDSEQ",
    title: "Board Seq",
    type: "Input",
    hide: true,
  },

  TITLE: {
    controlId: "TITLE",
    title: "Title",
    type: "Input",
    fill: true,
    required: true,
  },

  NOTICE: {
    controlId: "NOTICE",
    title: "Notice",
    type: "Input",
    fill: true,
    required: true,
    labelMode: true,
  },

  PRIORITY: {
    controlId: "PRIORITY",
    title: "Priority",
    type: "Input",
  },

  PRIORITY2: {
    controlId: "PRIORITY2",
    title: "COM.P",
    type: "Input",
    hide: true,
  },

  ESTIMATEPLANTIME: {
    controlId: "ESTIMATEPLANTIME",
    title: "Estimated Research Cost (day)",
    type: "Input",
  },

  ESTIMATEWORKTIME: {
    controlId: "ESTIMATEWORKTIME",
    title: "Estimated Work Cost (day)",
    type: "Input",
  },

  TIMESPENDHISTORYLIST: {
    controlId: "TIMESPENDHISTORYLIST",
    title: "timeSpendHistoryList",
    type: "Label",
    hide: true,
  },

  TIMESPENDESTIMATELIST: {
    controlId: "TIMESPENDESTIMATELIST",
    title: "timeSpendEstimateList",
    type: "Label",
    hide: true,
  },

  REASON: {
    controlId: "REASON",
    title: "Reason",
    type: "Textarea",
    fill: true,
    required: true,
  },

  RECEIVERS: {
    controlId: "RECEIVERS",
    title: "Msg.",
    type: "MultiSelect",
  },

  DETAIL: {
    controlId: "DETAIL",
    title: "Detail",
    type: "Textarea",
    fill: true,
  },

  HOWTODEV: {
    controlId: "HOWTODEV",
    title: "How to dev.",
    type: "Input",
    fill: true,
    hide: false,
  },

  REASONFORDEV: {
    controlId: "REASONFORDEV",
    title: "Reason for dev.",
    type: "Input",
    fill: true,
    hide: false,
  },

  COMMONORNOT: {
    controlId: "COMMONORNOT",
    title: "Common or not",
    type: "Input",
    fill: true,
    hide: false,
  },

  REPORTTYPE: {
    controlId: "REPORTTYPE",
    title: "Report type",
    type: "RadioBasic",
    selectedValue: "",
    items: [],
  },
  TREE: {
    controlId: "TREE",
    title: "Tree",
    type: "Tree",
    selectedValue: "",
    items: [],
  },
};

const {
  WRITEDATE,
  WRITER,
  START,
  FIN,
  FIN_DATE,
  JOBCODE,
  JOBTITLE,
  CATEGORY,
  TEAM,
  PIC,
  LABEL,
  STATUS,
  DEPLOY,
  BOARDTYPE,
  BOARDCD,
  BOARDNUM,
  TITLE,
  NOTICE,
  PRIORITY,
  PRIORITY2,
  ESTIMATEPLANTIME,
  ESTIMATEWORKTIME,
  TIMESPENDHISTORYLIST,
  TIMESPENDESTIMATELIST,
  REASON,
  RECEIVERS,
  DETAIL,
  HOWTODEV,
  REASONFORDEV,
  COMMONORNOT,
  REPORTTYPE,
  TREE,
} = controlOptions;

/* initialState */
const initialState = {
  isOpenOverlay: false,

  loginData: {},

  navigator: {
    activeMenu: "MyJob",
  },

  pageInitialStates: {},

  pages: {
    MyJob: {
      pageId: "MyJob",
      gridList: [
        {
          gridId: "myJobAllocated",
          title: "Allocated Job",
          isSpread: true,
          columnFields: vSlice(
            [
              {
                field: "SWITCH",
                headerName: "Switch",
                type: "button",
                width: 40,
                sortable: false,
                filter: false,
              },
              ...columnFields,
            ],
            (cur) => cur.field === "HOWTODEV",
            0,
            {
              field: "PROGRESS",
              headerName: "Progress",
              type: "progress",
              editable: false,
              sortable: false,
              filter: false,
              width: 120,
            }
          ),
          rows: [],
          filters: [],
        },
        {
          gridId: "myTeamJobUnAllocated",
          title: "Unallocated Job",
          isSpread: true,
          columnFields: columnFields,
          rows: [],
          filters: [],
        },
      ],
      controlValues: {},
      options: {
        isShowOthers: false,
        isShowAllStatus: false,
      },
    },

    MyTeam: {
      pageId: "MyTeam",
      gridList: [
        {
          gridId: "myTeamJobAllocated",
          title: "Team Allocated Job",
          isSpread: true,
          columnFields: [
            ...columnBasic,
            ...columnAlign,
            ...[
              {
                field: "TEAM",
                headerName: "Team",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "PIC",
                headerName: "PIC",
                type: "select",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "LABEL",
                headerName: "LABEL",
                type: "multiSelect",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "JOBCODE",
                headerName: "Job Code",
                editable: false,
                type: "select",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "TITLE",
                headerName: "Title (open with board link of center)",
                type: "title",
                width: 300,
              },
              {
                field: "CATEGORY",
                headerName: "Category",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "STATUS",
                headerName: "Status",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "WRITEDATE",
                headerName: "REQ",
                type: "date",
                width: 95,
              },
              {
                field: "START",
                headerName: "Start",
                editable: true,
                type: "date",
                width: 95,
              },
              /*{
                field: "FIN",
                headerName: "Fin",
                type: "date",
                width: 95,
              },*/
              {
                field: "DEPLOY",
                headerName: "Deploy",
                editable: true,
                type: "deployDate",
                width: 95,
                cellEditorSelector: (params) => {
                  if (
                    params.data.CATEGORY?.value === 501 &&
                    params.data.STATUS?.value >= 90
                  ) {
                    // CATEGORY: TEST 이고 STATUS wait 이상일 때만 수정가능
                    return {
                      component: "DateEditor",
                    };
                  }
                  params.stopEditing();
                },
              },
              {
                field: "USEDTIME",
                headerName: "UTime",
                type: "time",
                width: 70,
                editable: false,
                filter: false,
              },
              {
                field: "PROGRESS",
                headerName: "Progress",
                type: "progress",
                editable: false,
                sortable: false,
                filter: false,
                width: 120,
              },
              {
                field: "HOWTODEV",
                headerName: "How to Dev",
                type: "text",
                editable: true,
                width: 100,
              },
              {
                field: "TYPE",
                headerName: "TYPE",
                type: "text",
                editable: true,
                width: 60,
              },
              {
                field: "REASONFORDEV",
                headerName: "Reason for dev",
                type: "text",
                editable: true,
                width: 100,
              },
              {
                field: "COMMONORNOT",
                headerName: "Common or not",
                type: "text",
                editable: true,
                width: 100,
              },
            ],
          ],
          rows: [],
          filters: [],
        },
        {
          gridId: "myTeamJobUnAllocated",
          title: "Team Unallocated Job",
          isSpread: true,
          columnFields: [
            ...columnBasic,
            ...columnAlign,
            ...[
              {
                field: "TEAM",
                headerName: "Team",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "PIC",
                headerName: "PIC",
                type: "select",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "LABEL",
                headerName: "LABEL",
                type: "multiSelect",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "JOBCODE",
                headerName: "Job Code",
                editable: false,
                type: "select",
                width: 100,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "TITLE",
                headerName: "Title (open with board link of center)",
                type: "title",
                width: 300,
              },
              {
                field: "CATEGORY",
                headerName: "Category",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "STATUS",
                headerName: "Status",
                type: "select",
                width: 80,
                cellEditorParams: {
                  items: [],
                },
              },
              {
                field: "WRITEDATE",
                headerName: "REQ",
                type: "date",
                width: 95,
              },
              {
                field: "START",
                headerName: "Start",
                editable: true,
                type: "date",
                width: 95,
              },
              /*{
                field: "FIN",
                headerName: "Fin",
                type: "date",
                width: 95,
              },*/
              {
                field: "DEPLOY",
                headerName: "Deploy",
                editable: true,
                type: "deployDate",
                width: 95,
                cellEditorSelector: (params) => {
                  if (
                    params.data.CATEGORY?.value === 501 &&
                    params.data.STATUS?.value >= 90
                  ) {
                    // CATEGORY: TEST 이고 STATUS wait 이상일 때만 수정가능
                    return {
                      component: "DateEditor",
                    };
                  }
                  params.stopEditing();
                },
              },
              {
                field: "USEDTIME",
                headerName: "UTime",
                type: "time",
                width: 70,
              },
              {
                field: "HOWTODEV",
                headerName: "How to Dev",
                type: "text",
                editable: true,
                width: 100,
              },
              {
                field: "TYPE",
                headerName: "TYPE",
                type: "text",
                editable: true,
                width: 60,
              },
              {
                field: "REASONFORDEV",
                headerName: "Reason for dev",
                type: "text",
                editable: true,
                width: 100,
              },
              {
                field: "COMMONORNOT",
                headerName: "Common or not",
                type: "text",
                editable: true,
                width: 100,
              },
            ],
          ],
          rows: [],
          filters: [],
        },
      ],
      controlValues: {},
      options: {
        isShowOthers: false,
        isShowAllStatus: false,
      },
    },

    MyPost: {
      pageId: "MyPost",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        {
          ...CATEGORY,
          required: false,
        },
        TEAM,
        PIC,
        STATUS,
      ],
      gridList: [
        {
          gridId: "myPost",
          title: "My Post",
          columnFields: columnFields,
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    AllJob: {
      pageId: "AllJob",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        {
          ...CATEGORY,
          required: false,
        },
        TEAM,
        PIC,
        STATUS,
        {
          controlId: "START_FROM",
          title: "Start From",
          type: "DateInput",
        },
        {
          controlId: "START_TO",
          title: "Start To",
          type: "DateInput",
        },
        {
          controlId: "FIN_FROM",
          title: "Fin From",
          type: "DateInput",
        },
        {
          controlId: "FIN_TO",
          title: "Fin To",
          type: "DateInput",
        },
        {
          controlId: "DEPLOY_FROM",
          title: "Deploy From",
          type: "DateInput",
        },
        {
          controlId: "DEPLOY_TO",
          title: "Deploy To",
          type: "DateInput",
        },
        BOARDNUM
      ],
      gridList: [
        {
          gridId: "all",
          title: "All Job",
          columnFields: [
            ...columnBasic,
            ...columnAlign.slice().reverse(),
            ...columnDatas,
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    ByTeam: {
      pageId: "ByTeam",
      gridList: [
        {
          gridId: "byTeam",
          title: "By Team",
          columnFields: vSlice(
            [...columnFields],
            (cur) => cur.field === "HOWTODEV",
            0,
            {
              field: "PROGRESS",
              headerName: "Progress",
              type: "progress",
              editable: false,
              sortable: false,
              filter: false,
              width: 120,
            }
          ),
          rows: [],
          filters: [],
        },
      ],
    },

    ByJob: {
      pageId: "ByJob",
      gridList: [
        {
          gridId: "byJob",
          title: "By Job",
          columnFields: vSlice(
            [...columnFields],
            (cur) => cur.field === "HOWTODEV",
            0,
            {
              field: "PROGRESS",
              headerName: "Progress",
              type: "progress",
              editable: false,
              filter: false,
              width: 120,
            }
          ),
          rows: [],
          filters: [],
          headerCheckbox: {
            id: "multiJobCode",
            name: "Muiltiple Job Code",
            value: false,
          },
        },
      ],
    },

    UnAllocatedSupportTest: {
      pageId: "UnAllocatedSupportTest",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        {
          ...CATEGORY,
          required: false,
        },
        TEAM,
      ],
      gridList: [
        {
          gridId: "unAllocatedSupportTest",
          title: "Unalloacted Support/Test",
          columnFields: columnFields,
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    UnAllocatedDev: {
      pageId: "UnAllocatedDev",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        TEAM,
      ],
      gridList: [
        {
          gridId: "unAllocatedDev",
          title: "UnAllocated Dev",
          columnFields: [
            ...columnBasic,
            ...columnAlign.slice().reverse(),
            ...columnDatas,
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    UnAllocatedPlan: {
      pageId: "UnAllocatedPlan",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        TEAM,
      ],
      gridList: [
        {
          gridId: "unAllocatedPlan",
          title: "UnAllocated Plan",
          columnFields: [
            ...columnBasic,
            ...columnAlign.slice().reverse(),
            ...columnDatas,
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    ProgressedInTest: {
      pageId: "ProgressedInTest",
      gridList: [
        {
          gridId: "byCategoryTest",
          title: "Progressed In Test",
          headerButton: {
            id: "finAll",
            name: "FIN B to ALL",
          },
          isRowSelectable: (params) => {
            return params?.data?.STATUS && params.data.STATUS.value
              ? params.data.STATUS.value == 91
              : false; // 테스트하려면 50(hold) 추가
          }, // 전체 선택 조건(체크박스 기준이 아니므로 별도 설정을 해야 한다)
          onSelectionChanged: (event) => {
            var rowCount = event.api.getSelectedNodes().length;
            console.log(
              "FinBtoAll checkbox selection changed, " +
                rowCount +
                " rows selected",
              event.api.getSelectedRows()
            );
          }, // 선택 상태 변경된 모든 row 한번에 이벤트 잡기
          suppressRowClickSelection: true, // 행 클릭으로 선택이 되지 않도록 한다. (체크박스로만 선택을 하고 싶을 때)
          // onRowSelected: (event) => {
          //     window.alert(
          //         'row ' +
          //         event.node.data.athlete +
          //         ' selected = ' +
          //         event.node.isSelected()
          //     );
          // }, // 방금 선택 상태 변경된 row만 이벤트 잡기
          columnFields: [
            {
              field: "CHECKBOX",
              headerName: "",
              type: "checkbox",
              width: 40,
              sortable: false,
              filter: false,
              headerCheckboxSelection: true, // 전체 체크박스 추가 여부
              headerCheckboxSelectionFilteredOnly: true, // 전체 체크박스 필터링 조건 적용 여부
              checkboxSelection: (params) => {
                return params?.data?.STATUS && params.data.STATUS.value
                  ? params.data.STATUS.value == 91
                  : false; // 테스트하려면 50(hold) 추가
              }, // 체크박스 표시 여부
            },
            ...columnBasic,
            ...columnAlign,
            {
              field: "TEAM",
              headerName: "Team",
              type: "select",
              width: 80,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "HOWTODEV",
              headerName: "Mig", // 원래 이름 'How to Dev'
              type: "text",
              editable: true,
              width: 65,
            },
            {
              field: "TYPE",
              headerName: "TYPE",
              type: "text",
              editable: true,
              width: 60,
            },
            {
              field: "REASONFORDEV",
              headerName: "S/7", // 원래 이름 'Reason for dev'
              type: "text",
              editable: true,
              width: 65,
            },
            {
              field: "PIC",
              headerName: "PIC",
              type: "select",
              width: 100,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "JOBCODE",
              headerName: "Job Code",
              editable: false,
              type: "select",
              width: 100,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "TITLE",
              headerName: "Title (open with board link of center)",
              type: "title",
              width: 300,
            },
            {
              field: "DEVELOPER",
              headerName: "Developer",
              type: "multiSelect",
              width: 120,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "CATEGORY",
              headerName: "Category",
              type: "select",
              width: 80,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "STATUS",
              headerName: "Status",
              type: "select",
              width: 80,
              cellEditorParams: {
                items: [],
              },
            },
            {
              field: "WRITEDATE",
              headerName: "REQ",
              type: "date",
              width: 95,
            },
            {
              field: "START",
              headerName: "Start",
              editable: true,
              type: "date",
              width: 95,
            },
            /*{
              field: "FIN",
              headerName: "Fin",
              type: "date",
              width: 95,
            },*/
            {
              field: "FIN_DATE",
              headerName: "FinDate",
              type: "date",
              width: 105,
              valueGetter: function (params) {
                return [0, 10, 50, 1000].includes(params.data.STATUS?.value)
                  ? null
                  : params.data.FIN_DATE; // status가 '50 hold' 일 때 Fin 날짜를 표시하지 않는다
              },
            },
            {
              field: "DEPLOY",
              headerName: "Deploy",
              editable: true,
              type: "deployDate",
              width: 95,
              cellEditorSelector: (params) => {
                if (
                  params.data.CATEGORY?.value === 501 &&
                  params.data.STATUS?.value >= 90
                ) {
                  // CATEGORY: TEST 이고 STATUS wait 이상일 때만 수정가능
                  return {
                    component: "DateEditor",
                  };
                }
                params.stopEditing();
              },
            },
            {
              field: "USEDTIME",
              headerName: "UTime",
              type: "time",
              width: 70,
            },
            {
              field: "COMMONORNOT",
              headerName: "Common or not",
              type: "text",
              editable: true,
              width: 100,
            },
            {
              field: "BOARDNUM",
              headerName: "Dev.No",
              type: "text",
              hide: false,
              width: 100,
              sortable: true,
              filter: false,
            },
            {
              field: "LABEL",
              headerName: "LABEL",
              type: "multiSelect",
              width: 100,
              cellEditorParams: {
                items: [],
              },
            },
          ],
          rows: [],
          filters: [],
        },
      ],
    },

    ETCCategory: {
      pageId: "ETCCategory",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...PIC,
          required: false,
        },
        {
          ...TEAM,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
      ],
      gridList: [
        {
          gridId: "byCategoryEtc",
          title: "ETC Category",
          columnFields: columnFields,
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    Report: {
      pageId: "Report",
      formState: 2,
      headerToolbarHide: true, // Contents 버튼있는 header toolbar 감춘다.
      contentsGridApiNotCall: true, // Contents 에서 메뉴 변경 시 api 를 바로 호출하는 것을 막는다.
      controlList: [
        {
          ...REPORTTYPE,
          formState: "full",
          selectedValue: "dailyHistory",
          items: [
            {
              label: "Daily Time Spend Estimate/History",
              value: "dailyHistory",
            },
            { label: "Daily Real Spent Time by Job", value: "dailySpendByJob" },
            {
              label: "Daily Real Spent Time by PIC",
              value: "dailySpendByOwner",
            },
          ],
        },
        {
          controlId: "START_FROM",
          title: "Start From",
          type: "DateInput",
        },
        {
          controlId: "START_TO",
          title: "Start To",
          type: "DateInput",
        },
        {
          ...TEAM,
          required: false,
        },
        {
          ...PIC,
          required: false,
        },
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...STATUS,
          fill: false,
          required: false,
        },
      ],
      usedGrid: "dailyHistory",
      gridList: [],
      gridListBox: [
        {
          gridId: "dailyHistory",
          gridType: "report",
          title: "팀별, 사람별, START일자별, job별, 작성된 시간",
          columnFields: [
            {
              field: "TEAM",
              headerName: "Team",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "PIC",
              headerName: "PIC",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "JOBCODE",
              headerName: "Job Code",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "JOBTITLE",
              headerName: "Job Title",
              type: "text",
              width: 200,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "DATE",
              headerName: "Date",
              type: "text",
              width: 130,
            },
            {
              field: "REASON",
              headerName: "Reason",
              type: "text",
              width: 500,
            },
            {
              field: "START",
              headerName: "Start",
              type: "text",
              width: 130,
            },
            /*{
              field: "FIN",
              headerName: "Fin",
              type: "text",
              width: 130,
            },*/
            {
              field: "COST",
              headerName: "Cost",
              type: "text",
              width: 60,
            },
            {
              field: "REALTIME",
              headerName: "Real Time",
              type: "text",
              width: 60,
            },
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
        {
          gridId: "dailySpendByJob",
          gridType: "report",
          title: "잡코드별, 팀별, 사람별, Start, FIN, Real Time",
          columnFields: [
            {
              field: "JOBCODE",
              headerName: "Job Code",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "TEAM",
              headerName: "Team",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "PIC",
              headerName: "PIC",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "JOBTITLE",
              headerName: "Job Title",
              type: "text",
              width: 300,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "START",
              headerName: "Start",
              type: "text",
              width: 130,
            },
            /*{
              field: "FIN",
              headerName: "Fin",
              type: "text",
              width: 130,
            },*/
            {
              field: "REALTIME",
              headerName: "Real Time",
              type: "text",
              width: 80,
            },
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
        {
          gridId: "dailySpendByOwner",
          gridType: "report",
          title: "팀별, 사람별, START일자별, JOB별",
          columnFields: [
            {
              field: "TEAM",
              headerName: "Team",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "PIC",
              headerName: "PIC",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "JOBCODE",
              headerName: "Job Code",
              type: "text",
              width: 80,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "JOBTITLE",
              headerName: "Job Title",
              type: "text",
              width: 300,
              cellStyle: function (params) {
                if (params.data.SUBROW == "child") {
                  return { color: "LightGray" };
                } else {
                  return null;
                }
              },
            },
            {
              field: "START",
              headerName: "Start",
              type: "text",
              width: 130,
            },
            /*{
              field: "FIN",
              headerName: "Fin",
              type: "text",
              width: 130,
            },*/
            {
              field: "WORKEDDATE",
              headerName: "Worked Date",
              type: "text",
              width: 100,
            },
            {
              field: "REALTIME",
              headerName: "Real Time",
              type: "text",
              width: 80,
            },
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    Gantt: {
      pageId: "Gantt",
      formState: 2,
      headerToolbarHide: true, // Contents 버튼있는 header toolbar 감춘다.
      contentsGridApiNotCall: true, // Contents 에서 메뉴 변경 시 api 를 바로 호출하는 것을 막는다.
      controlList: [
        {
          controlId: "START_FROM",
          title: "Start From",
          type: "DateInput",
          values: [getCurrentDateWithFirstDay()],
        },
        {
          controlId: "START_TO",
          title: "Start To",
          type: "DateInput",
          values: [getCurrentDatehWithLastDay()],
        },
        {
          ...TEAM,
          required: false,
        },
        {
          ...PIC,
          required: false,
        },
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...STATUS,
          // values: [{ label: "done", value: 70 }],
          fill: false,
          required: false,
        },
      ],
      tracks: [
        // {
        // ownerDetail: {
        //     "id": "Hao",
        //     "name": "Hao Le",
        //     "site": "8-6.베트남개발",
        //     "siteName": "VN Scrum4"
        // }
        //     jobs: [
        //     {
        //         code: 'A20_04058_2',
        //         title: '미사용 테이블 제거_7월_2차',
        //         firstIngStartDate: '2021-03-07',
        //         lastIngEndDate: '2021-03-14',
        //     },
        //     {
        //         code: 'A20_04464',
        //         title: '7/8월 판매전표 300라인 신규입력한 ID에 쪽지 알림 발송',
        //         firstIngStartDate: '2021-03-18',
        //         lastIngEndDate: '2021-03-21',
        //     },
        //     ],
        // },
        // {
        //       "ownerDetail": {
        // "id": "재호",
        // "name": "김재호",
        // "site": "API팀",
        // "siteName": "ESA팀"
        // },
        //     jobs: [
        //     {
        //         code: 'A20_04058_2',
        //         title: '미사용 테이블 제거_7월_2차',
        //         firstIngStartDate: '2021-03-07',
        //         lastIngEndDate: '2021-03-14',
        //     },
        //     ],
        // },
      ],
      holiday: [
        {
          date: "2021-02-11",
          name: "신정",
        },
        {
          date: "2021-02-12",
          name: "신정",
        },
        {
          date: "2021-02-13",
          name: "신정",
        },
        {
          date: "2021-02-01",
          name: "삼일절",
        },
      ],
      stepperOptions: {
        activePageNum: 1,
        maxPageNum: 1,
      },
    },

    ByTeamForMgmt: {
      pageId: "ByTeamForMgmt",
      gridList: [
        {
          gridId: "byTeamForMgmt",
          title: "By Team (Mgmt)",
          columnFields: columnFields,
          rows: [],
          filters: [],
        },
      ],
    },

    UnAllocatedJobForMgmt: {
      pageId: "UnAllocatedJobForMgmt",
      formState: 2,
      controlList: [
        {
          ...JOBCODE,
          required: false,
        },
        {
          ...TITLE,
          fill: false,
          required: false,
        },
        TEAM,
      ],
      gridList: [
        {
          gridId: "unAllocatedJobForMgmt",
          title: "UnAllocated Job",
          columnFields: [
            ...columnBasic,
            ...columnAlign.slice().reverse(),
            ...columnDatas,
          ],
          rows: [],
          filters: [],
          stepperOptions: {
            activePageNum: 1,
            maxPageNum: 1,
          },
        },
      ],
    },

    PopupCodeSearch: {
      parentPageId: "",
      pageId: "PopupCodeSearch",
      width: "700px",
      isPopup: true,
      isOpen: false,
      controlList: [
        {
          title: "Search",
          controlId: "SEARCH",
          type: "Input",
          fill: true,
        },
        {
          title: "queryName",
          controlId: "QUERYNAME",
          type: "Input",
          hide: true,
        },
        {
          title: "queryResult",
          controlId: "QUERYRESULT",
          type: "Input",
          hide: true,
        },
      ],
    },

    PopupCreateNewJob: {
      parentPageId: "",
      pageId: "PopupCreateNewJob",
      isPopup: true,
      isOpen: false,
      from: "", // 호출경로
      controlItemFilterOptions: ["isCreateUse"],
      controlList: [
        BOARDTYPE,
        BOARDCD,
        BOARDNUM,
        {
          ...JOBCODE,
          checkboxData: {
            checked: false,
            label: "Use Automatically Code",
          },
        },
        JOBTITLE,
        {
          ...CATEGORY,
          values: [{ label: "plan", value: 1 }],
        },
        {
          ...TEAM,
          useRelationControlData: true, // baseCategory data 사용여부
        },
        {
          ...PIC,
          useRelationControlData: true, // baseCategory data 사용여부
        },
        LABEL,
        RECEIVERS,
        {
          ...PRIORITY2,
        },
        HOWTODEV,
        REASONFORDEV,
        COMMONORNOT,
        TITLE,
        {
          ...DETAIL,
          rows: 8,
          values: ["Comcode:\ncontact:\nrequester:\n\n[Contents]\n\n"],
        },
      ],
    },

    PopupAssignPIC: {
      parentPageId: "",
      pageId: "PopupAssignPIC",
      isPopup: true,
      isOpen: false,
      controlList: [
        {
          ...WRITEDATE,
          hide: true,
        },
        {
          ...JOBCODE,
          hide: true,
        },
        TITLE,
        CATEGORY,
        {
          ...TEAM,
          useRelationControlData: true, // baseCategory data 사용여부
        },
        {
          ...PIC,
          useRelationControlData: true, // baseCategory data 사용여부
        },
      ],
    },

    PopupUpdatePlanList: {
      parentPageId: "",
      pageId: "PopupUpdatePlanList",
      isPopup: true,
      isOpen: false,
      controlList: [
        WRITEDATE,
        {
          ...JOBCODE,
          labelMode: true,
        },
        {
          ...TITLE,
          labelMode: true,
        },
        {
          ...CATEGORY,
          items: [],
        },
        {
          ...PIC,
          labelMode: true,
        },
        {
          ...TEAM,
          labelMode: true,
        },
        START,
        FIN_DATE,
        ESTIMATEPLANTIME,
        ESTIMATEWORKTIME,
        FIN,
        REASON,
      ],
    },

    PopupChangeStatus: {
      parentPageId: "",
      pageId: "PopupChangeStatus",
      isPopup: true,
      isOpen: false,
      controlList: [
        WRITEDATE,
        {
          ...JOBCODE,
          labelMode: true,
        },
        {
          ...CATEGORY,
          labelMode: true,
        },
        {
          ...TEAM,
          labelMode: true,
        },
        {
          ...PIC,
          labelMode: true,
        },
        STATUS,
        REASON,
      ],
    },

    PopupCreateSimpleJob: {
      parentPageId: "",
      pageId: "PopupCreateSimpleJob",
      isPopup: true,
      isOpen: false,
      controlList: [
        {
          ...BOARDTYPE,
          hide: true,
        },
        {
          ...BOARDNUM,
          hide: true,
        },
        {
          ...JOBCODE,
          labelMode: true,
        },
        {
          ...CATEGORY,
          hide: true,
        },
        {
          ...PIC,
          labelMode: true,
        },
        {
          ...TEAM,
          labelMode: true,
        },
        TITLE,
        {
          ...REASON,
          required: false,
        },
      ],
    },

    PopupDetail: {
      parentPageId: "",
      pageId: "PopupDetail",
      isPopup: true,
      isOpen: false,
      width: "1000px",
      formState: 2,
      controlList: [
        WRITEDATE,
        WRITER,
        JOBCODE,
        BOARDTYPE,
        BOARDCD,
        BOARDNUM,
        LABEL,
        TITLE,
        PRIORITY,
        {
          ...TEAM,
          useRelationControlData: true, // baseCategory data 사용여부
        },
        CATEGORY,
        {
          ...PIC,
          useRelationControlData: true, // baseCategory data 사용여부
        },
        STATUS,
        RECEIVERS,
        HOWTODEV,
        {
          ...REASON,
          hide: true,
          required: false,
        },
        REASONFORDEV,
        COMMONORNOT,
        START,
        FIN,
        DEPLOY,
        TIMESPENDHISTORYLIST,
        TIMESPENDESTIMATELIST,
      ],
    },

    PopupGanttDetail: {
      parentPageId: "",
      pageId: "PopupGanttDetail",
      isPopup: true,
      isOpen: false,
      width: "700px",
      formState: 1,
      controlList: [
        {
          ...JOBCODE,
          type: "Label",
        },
        {
          ...TITLE,
          labelMode: true,
        },
        START,
        FIN,
        TIMESPENDHISTORYLIST,
        TIMESPENDESTIMATELIST,
      ],
    },

    PopupNotice: {
      parentPageId: "",
      pageId: "PopupNotice",
      isPopup: true,
      isOpen: false,
      width: "700px",
      formState: 1,
      controlList: [NOTICE],
    },

    PopupAlarmManage: {
      parentPageId: "",
      pageId: "PopupAlarmManage",
      isPopup: true,
      isOpen: false,
      width: "700px",
      formState: 1,
      controlList: [TREE],
    },
  },
};

// fetch 된 init data 있을 경우 initialState 에 반영
const updateInitialState = (fetchedInitData) => {
  if (fetchedInitData?.defaultCodeItems) {
    const defaultCodeItems = fetchedInitData.defaultCodeItems;
    const controlIds = [
      "LABEL",
      "STATUS",
      "CATEGORY",
      "PIC",
      "RECEIVERS",
      "TEAM",
      "BOARDTYPE",
    ];

    for (const pageId in initialState.pages) {
      const page = initialState.pages[pageId];

      // change controlList items
      for (let index = 0; index < (page.controlList || []).length; index++) {
        let control = page.controlList[index];
        if (controlIds.includes(control.controlId)) {
          control.items = initialControlItems[control.controlId] =
            defaultCodeItems[control.controlId];
        }
      }

      // change gridList items
      for (let index = 0; index < (page.gridList || []).length; index++) {
        let columnFields = page.gridList[index].columnFields;

        if (columnFields) {
          columnFields.forEach((column) => {
            if (controlIds.includes(column.field)) {
              column.cellEditorParams.items = defaultCodeItems[column.field];
            }
          });
        }
      }
    }
  }

  return initialState;
};

// page initialState 정의
const createInitialPageState = () => {
  for (const pageId in initialState.pages) {
    initialState.pageInitialStates[pageId] = cloneDeep(
      initialState.pages[pageId]
    );
  }
};

/* return reducers */
const createReducer = (fetchedInitData) => {
  // fetch 된 init data 있을 경우 initialState 에 반영
  if (fetchedInitData) {
    updateInitialState(fetchedInitData);
  }

  // page initialState 정의
  createInitialPageState();

  const reducers = handleActions(
    {
      [types.TOGGLE_PROGRESS_OVERLAY]: (
        state,
        { payload: isOpenOverlay } // isOpenOverlay: bool
      ) =>
        produce(state, (draft) => {
          draft.isOpenOverlay = isOpenOverlay;
        }),

      [types.UPDATE_LOGIN_DATA]: (
        state,
        { payload: data } // data: {}
      ) =>
        produce(state, (draft) => {
          draft.loginData = data;
        }),

      [types.UPDATE_NAVIGATOR_ACTIVE_MENU]: (
        state,
        { payload: menuId } // menuId: "ID"
      ) =>
        produce(state, (draft) => {
          draft.navigator.activeMenu = menuId;
        }),

      [types.NOTICE_SUCCESS_OR_FAIL]: (
        state,
        { payload: data } // data: { isSuccess: true/false, message: "errorMessage" }
      ) =>
        produce(state, (draft) => {
          if (data.isSuccess) {
            //alert("success");
          } else {
            if (data?.message) {
              alert("Error: " + data.message);
            } else {
              alert("fail with unkown reasons. please report it");
            }
          }
        }),

      [types.UPDATE_PAGE_GRID_DATA]: (
        state,
        { payload: data } // data: { rowData: {...}, paginationData: { maxPageNum: 100, activePageNum: 1 }, gridData: { gridId: "", isSpread: true, ... } }
      ) =>
        produce(state, (draft) => {
          const { rowData, paginationData, gridData } = data;
          for (var pageId in draft.pages) {
            var page = draft.pages[pageId];
            for (var index = 0; index < (page.gridList || []).length; index++) {
              var grid = page.gridList[index];
              if (rowData?.[grid.gridId]) {
                grid.rows = rowData[grid.gridId];
                if (grid.stepperOptions && paginationData) {
                  grid.stepperOptions = {
                    activePageNum: paginationData.activePageNum,
                    maxPageNum: paginationData.maxPageNum,
                  };
                }
              }

              if (gridData?.gridId === grid.gridId) {
                Object.assign(grid, { ...gridData });
              }
            }
          }
        }),

      [types.UPDATE_PAGE_GANTT_DATA]: (
        state,
        { payload: data } // data: { rowData: {...}, paginationData: { maxPageNum: 100, activePageNum: 1 }, gridData: { gridId: "", isSpread: true, ... } }
      ) =>
        produce(state, (draft) => {
          const {
            rowData: { tracks, holiday },
            paginationData,
          } = data;
          const ganttPage = draft.pages.Gantt;
          ganttPage.stepperOptions = {
            activePageNum: paginationData.activePageNum,
            maxPageNum: paginationData.maxPageNum,
          };
          ganttPage.tracks = tracks;
          ganttPage.holiday = holiday;
        }),

      [types.UPDATE_POPUP_TOGGLE]: (
        state,
        { payload: pageData } // pageData: { parentPageId: "pid", pageId: "id", isOpen: true/false, controlValues: {} }
      ) =>
        produce(state, (draft) => {
          const popup = draft.pages[pageData.pageId];

          if (popup) {
            popup.parentPageId = pageData.parentPageId;
            popup.isOpen = pageData.isOpen;
            popup.from = pageData.from ?? ""; // 누가 팝업을 열엇는가에 따른 분기처리가 필요해서 추가한 설정값
            popup.volatileValues = pageData?.volatileValues;
            if (pageData.isOpen) {
              if (pageData.controlValues) {
                (popup.controlList || []).forEach((ctrl) => {
                  let newValue = pageData.controlValues[ctrl.controlId];
                  if (isNil(newValue) === true) {
                    newValue = undefined;
                  } else if (
                    isEmpty(newValue) === false &&
                    isArray(newValue) === false
                  ) {
                    newValue = [newValue];
                  }
                  ctrl.values = newValue;
                });
              }

              if (
                popup.controlItemFilterOptions &&
                popup.controlItemFilterOptions.length > 0
              ) {
                // 컨트롤 아이템에 대한 필터가 있는 경우
                (popup.controlList || []).forEach((ctrl) => {
                  if (options[ctrl.controlId]) {
                    // 특정 로우에서 클릭하지 않은 경우
                    if (!pageData.controlValues) {
                      ctrl.items = ctrl.items.filter((item) => {
                        const target = options[ctrl.controlId].find(
                          (x) => x.value === item.value
                        );
                        if (target) {
                          return !popup.controlItemFilterOptions.some(
                            (opt) => target[opt] === false
                          );
                        }
                        return true;
                      });
                    } else {
                      if (initialControlItems[ctrl.controlId]) {
                        // 기본값이 있는 경우 복원
                        ctrl.items = initialControlItems[ctrl.controlId];
                      }
                    }
                  }
                });
              }
            } else {
              //draft.pages[pageData.pageId] = draft.pageInitialStates[popup.pageId];
            }
          }
        }),

      [types.UPDATE_PAGE_CONTROL_DATA]: (
        state,
        { payload: controlData } // controlData: { pageId: "id", controlId: "id", items: [], values: [], ... }
      ) =>
        produce(state, (draft) => {
          const page = draft.pages[controlData.pageId];
          if (page.controlList) {
            if (controlData.controlList) {
              page.controlList = controlData.controlList;
            } else {
              const target = page.controlList.find(
                (ctrl) => ctrl.controlId === controlData.controlId
              );
              if (target) {
                Object.assign(target, controlData);
              }
            }
          } else {
            // 전부 page 영역으로 옮긴 후 제거
            if (page.controlValues) {
              page.controlValues[controlData.controlId] = controlData.values;
            } else {
              page.controlValues = {
                [controlData.controlId]: controlData.values,
              };
            }
          }
        }),

      [types.RESET_PAGE_STATE]: (
        state,
        { payload: pageData } // pageData = { pageId: "id", resetOnlyControlData: bool }
      ) =>
        produce(state, (draft) => {
          const pageId = pageData.pageId;
          const resetOnlyControlData = pageData.resetOnlyControlData;

          if (draft.pages[pageId]) {
            if (
              resetOnlyControlData &&
              draft.pageInitialStates[pageId].controlList
            ) {
              draft.pages[pageId].controlList =
                draft.pageInitialStates[pageId].controlList;
            } else {
              draft.pages[pageId] = draft.pageInitialStates[pageId];
            }
          }
        }),
      [types.TRIGGER_TOGGLE_SHOW_OPTIONS]: (
        state,
        { payload: { pageId, options } }
      ) =>
        produce(state, (draft) => {
          draft.pages[pageId].options = {
            ...draft.pages[pageId].options,
            ...options,
          };
        }),
    },
    initialState
  );

  return reducers;
};

export default createReducer;
