import React, { PureComponent } from "react";
import {
  ButtonRenderer,
  DateRenderer,
  LinkRenderer,
  LoadingCellRenderer,
  MultiSelectRenderer,
  SelectRenderer,
  TitleRenderer,
} from "components/grid/renderer";
import { DateEditor, SelectEditor } from "components/grid/editor";
import { SelectComparator, TimeComparator } from "components/grid/comparator";
import { isArray, isBoolean, isEqual, isNil, isPlainObject } from "lodash";
import {
  Alert,
  Button,
  Checkbox,
  ContextMenu,
  Intent,
  Menu,
  MenuItem,
} from "@blueprintjs/core";
import IconExcel from "components/control/IconExcel";
import { AgGridReact } from "ag-grid-react";
import {
  copyToClipboard,
  getParsedControlValuesByControlList,
  getParsedControlValuesByFetchedData,
} from "common";
import fetchJobPageData from "store/saga/fetchJobPageData";
import { fetchCurrentlyDoingJob } from "store/saga/common";
import GridStepper from "components/grid/GridStepper";
import XLSX from "xlsx";
import "./grid.scss";
import ProgressRenderer from "./renderer/ProgressRenderer";
import StatusRenderer from "./renderer/StatusRenderer";

export default class Grid extends PureComponent {
  constructor(props) {
    super(props);
    const userData = window.SCHEDULER_GLOBAL_DATA?.userData;
    this.formRef = React.createRef();
    this.state = {
      isContextMenuOpen: false,
      isDeleteConfirmOpen: false,
      isFinAllConfirmOpen: false,
      finAllPopupMsg: "",
      spinner: false, // excel icon spinner state
      isShowOthers: false,
      isShowAllStatus: false,
      isProgressedInTestFilterApply: false,
      submitParams: [
        {
          name: "BOARD_CD",
          value: 1038,
        },
      ],
    };

    // contextMenu requestQA 에서 사용될 기본 코드값 하드매핑 (80000번 기준)

    this.defaultQA = {
      CATEGORY: { value: 501, label: "test" },
      TEAM: this.getDefaultQATeam(
        userData?.site ?? "",
        userData?.siteName ?? ""
      ),
    };

    // contextMenu Create Support 에서 사용될 기본 코드값 하드매핑 (80000번 기준)
    this.defaultSupport = {
      CATEGORY: { value: 801, label: "support" },
      TEAM: { value: userData?.site ?? "", label: userData?.siteName ?? "" },
    };

    this.gridApi = null;
    this.gridColumnApi = null;
    this.lastFilter = null;
  }

  getDefaultQATeam(site, siteName) {
    let regex = /^VN|^EFS|^EUX/; // 팀명이 VN, EFS, EUX 으로 시작하면 EQA로 설정
    let result = {};
    if (regex.test(siteName)) {
      result.value = "테스트팀";
      result.label = "EQA팀";
    } else {
      result.value = "EQC팀";
      result.label = "EQC팀";
    }
    return result;
  }

  // column type 따로 지정한 경우 우선순위 높여 적용됨 (columnDefs 에 직접 지정한 옵션 바로 다음 순위)
  columnTypes = {
    button: {
      cellRenderer: "ButtonRenderer",
    },

    text: {},

    link: {
      cellRenderer: "LinkRenderer",
    },

    title: {
      editable: true,
      cellRenderer: "TitleRenderer",
    },

    date: {
      cellRenderer: "DateRenderer",
      cellEditor: "DateEditor",
    },

    deployDate: {
      cellRenderer: "DateRenderer",
    },

    select: {
      editable: true,
      cellRenderer: "SelectRenderer",
      cellEditor: "SelectEditor",
      comparator: SelectComparator,
    },

    multiSelect: {
      //editable: true,
      //cellEditor: "MultiSelectEditor",
      cellRenderer: "MultiSelectRenderer",
    },

    time: {
      comparator: TimeComparator,
    },

    progress: {
      cellRenderer: "ProgressRenderer",
    },

    status: {
      cellRenderer: "StatusRenderer",
    },
  };
  // column 전체 기본옵션 지정 (columnDefs, column type 지정 안했을 경우 받는 가장 우선순위 낮은 전체 공통옵션)
  defaultColDef = {
    resizable: true,
    sortable: true,
    //unSortIcon: true,
    editable: false,

    filter: true,
    suppressMenu: true,
    floatingFilter: true,

    filterParams: {
      // caseSensitive: true,
      // defaultOption: 'startsWith',
      filterOptions: ["contains", "notContains"],
      textFormatter: function (data) {
        let label;
        if (isNil(data)) return "";

        if (isArray(data)) {
          // multiSelect type check
          label = data.map((item) => `${item.label} ${item.value}`).join(" ");
        } else if (isPlainObject(data)) {
          // select type check
          label = `${data.label ?? ""} ${data.value ?? ""}`;
        } else {
          label = data;
        }

        if (isNil(label)) {
          console.log("label is nil: " + data);
          return "";
        }

        label = label.toString().toUpperCase();
        return label;
      },
    },
  };

  // ag-grid 자체 기본 옵션
  defaultGridOptions = {
    // pagination: true,
    // paginationPageSize: 2,
    // singleClickEdit: true,
    rowHeight: 30,
    stopEditingWhenGridLosesFocus: false,
    multiSortKey: "ctrl",

    rowClassRules: {
      // category row color
      "ag-row-bgcolor-gainsboro": function (params) {
        const data = params.data;
        return data.SWITCH == "paused" || data.SWITCH == "otherPaused";
      },
      "ag-row-bgcolor-green": function (params) {
        const data = params.data;
        return data.STATUS?.value === 30 && data.CATEGORY?.value === 1;
      },
      "ag-row-bgcolor-blue": function (params) {
        const data = params.data;
        return (
          (data.STATUS?.value === 30 &&
            (data.CATEGORY?.value === 101 || data.CATEGORY?.value === 1001) &&
            data.SWITCH != "paused") ||
          data.SUBROW == "parent"
        );
      },
      "ag-row-bgcolor-yellow": function (params) {
        const data = params.data;
        return data.STATUS?.value === 30 && data.CATEGORY?.value === 501;
      },
      "ag-row-bgcolor-orange": function (params) {
        const data = params.data;
        return (
          data.STATUS?.value === 30 &&
          (data.CATEGORY?.value === 999999 || data.CATEGORY?.value === 801)
        );
      },
      "ag-row-bgcolor-red": function (params) {
        const data = params.data;
        return (
          data.STATUS?.value === 30 &&
          [10, 20, 30, 40].includes(data.CATEGORY?.value)
        );
      },
    },

    undoRedoCellEditing: true,
  };

  // custom framework component 정의 매핑
  frameworkComponents = {
    LinkRenderer: LinkRenderer,
    DateRenderer: DateRenderer,
    SelectRenderer: SelectRenderer,
    MultiSelectRenderer: MultiSelectRenderer,
    LoadingCellRenderer: LoadingCellRenderer,
    ButtonRenderer: ButtonRenderer,
    TitleRenderer: TitleRenderer,
    ProgressRenderer: ProgressRenderer,
    StatusRenderer: StatusRenderer,

    SelectEditor: SelectEditor,
    DateEditor: DateEditor,
  };

  componentDidUpdate(prevProps) {
    if (isEqual(prevProps.rows, this.props.rows) === false) {
      if (this.lastFilter) {
        this.gridApi.setFilterModel(this.lastFilter);
      }
    }
  }

  onFilterModified(param) {
    this.lastFilter = this.gridApi.getFilterModel();
  }

  // enter key 입력시 editing 중이면 suppress
  suppressKeyboardEvent(params) {
    const keyCode = params.event.keyCode;
    const isEditing = params.editing;
    const colDef = params.colDef;
    let gridShouldDoNothing = false;

    if (keyCode === 13 && isEditing && colDef.cellEditor === "SelectEditor") {
      gridShouldDoNothing = true;
    }

    return gridShouldDoNothing;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    //this.autoSizeAll(false);
  }

  /**
   * 현재 화면 사이즈 핏
   */
  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  /**
   * 모든 내용 보여주는 최소사이즈 핏
   * @param {Bool} skipHeader header 영역은 다 안보여도 된다 ? true : false
   */
  autoSizeAll(skipHeader) {
    const allColumnIds = this.gridColumnApi
      .getAllColumns()
      .map((column) => column.colId);
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  /**
   * open popup handler
   * @param {String} pageId
   * @param {Object} keyControlValues
   * @param {Object} updateControlValues
   * @param {Object} volatileValues 휘발성 파라미터. 같은 팝업을 누가 호출했는지에 따라 내부 동작이 다르게 해주기 위해 추가 파라미터를 전달하는 변수(공통적으로 쓸수 있는) 자리를 만들었다.
   */
  openPopup(pageId, keyControlValues, updateControlValues, volatileValues) {
    if (keyControlValues) {
      this.props.containerActions.triggerOpenPopup({
        parentPageId: this.props.pageId,
        pageId: pageId,
        isOpen: true,
        from: volatileValues ? volatileValues?.from ?? "" : "",
        keyControlValues: keyControlValues,
        updateControlValues: updateControlValues,
        volatileValues: volatileValues,
      });
    } else {
      this.props.containerActions.updatePopupToggle({
        pageId: pageId,
        isOpen: true,
      });
    }
  }

  toggleJobReStart(controlValues, newStatus) {
    // 주의하기 위해 문제 코드 주석으로 유지: toggleJobStatus 와 다르게 이 코드를 사용하면 그리드가 다시 그려지지 않음.
    // 값을 미리 바꿔서 새 그리드 데이터와 같아서 다시 그리지 않는 것 같다. (toggleJobStatus는 SWITCH, STATUS.label, timeSpendHistoryList 값 차이가 있음)
    // if (newStatus) {
    //   controlValues.SWITCH = newStatus;
    // }
    this.props.containerActions.triggerToggleJobReStart({
      controlValues: controlValues,
    });
  }

  toggleJobStatus(controlValues, newStatus) {
    if (newStatus) {
      const newControlValues = {
        ...controlValues,
        STATUS: {
          ...controlValues.STATUS,
          value: newStatus,
        },
      };
      this.props.containerActions.triggerToggleJobStatus({
        controlValues: newControlValues,
      });
    }
  }

  toggleJobStatusList(rowData, newStatus) {
    for (let i = 0; i < rowData.length; i++) {
      rowData[i].STATUS.value = newStatus;
    }
    this.props.containerActions.triggerToggleJobStatusList({
      rowData: rowData,
    });
  }

  // 삭제 컨펌팝업 cancel
  handleDeleteAlertCancel() {
    this.setState({
      isDeleteConfirmOpen: false,
    });
  }

  // 삭제 컨펌팝업 confirm
  handleDeleteAlertConfirm() {
    const data = this.gridApi.getSelectedRows()?.[0];

    this.setState({
      isDeleteConfirmOpen: false,
    });

    if (data) {
      this.props.containerActions.triggerDeleteJob({
        keyControlValues: data,
      });
    }
  }

  // finAll 컨펌팝업 cancel
  handleFinAllAlertCancel() {
    this.setState({
      isFinAllConfirmOpen: false,
    });
  }

  // finAll 컨펌팝업 confirm
  handleFinAllAlertConfirm() {
    this.setState({
      isFinAllConfirmOpen: false,
    });

    let selectedRows = this.gridApi.getSelectedRows();
    if (selectedRows.length > 0) {
      this.toggleJobStatusList(selectedRows, 92); // 테스트하려면 30(ing) 으로
    }
  }

  // fetching page data with async/await iteration
  async fetchAllPageData(activePageNum = 1, requestDataNum = 3000, resolve) {
    const dontNeedAllAmount = true;
    const { gridId, pageId } = this.props;
    const usedGrid =
      this.props.gridType == "report" ? { usedGrid: this.props.gridId } : {}; // Report 출력물 라디오에 따라 현재 활성화된 그리드 아이디 정보
    const gridData = { gridList: [{ ...this.props }] }; // 그리드 정보
    const controlValues = this.props.searchControlList
      ? getParsedControlValuesByControlList(this.props.searchControlList)
      : this.props.parentControlList
      ? getParsedControlValuesByControlList(this.props.parentControlList)
      : {};
    const { rowData, maxPageNum } = await fetchJobPageData(
      pageId,
      controlValues,
      activePageNum,
      requestDataNum,
      !dontNeedAllAmount,
      {
        ...usedGrid,
        ...gridData,
      },
      this.props.options?.isShowOthers,
      this.props.options?.isShowAllStatus,
      this.props.options?.isProgressedInTestFilterApply
    );
    let rows = rowData?.[gridId] ?? [];

    while (activePageNum++ < maxPageNum) {
      const { rowData } = await fetchJobPageData(
        pageId,
        controlValues,
        activePageNum,
        requestDataNum,
        dontNeedAllAmount,
        {
          ...usedGrid,
          ...gridData,
        }
      );
      rows = rows.concat(rowData?.[gridId] ?? []);
    }

    resolve(rows);
  }

  // export grid data for excel
  handleClickExcelIcon() {
    const { columnFields, pageId, gridId, title } = this.props;
    const columns = columnFields
      .filter((column) => {
        return (
          column.hide !== true && ["SWITCH"].includes(column.field) === false
        );
      })
      .map((column) => column.field);
    const data = [columns];

    const activePage = 1;
    const requestDataNum = 10000;

    // excel icon spinner on
    this.setState({
      spinner: true,
    });

    this.fetchAllPageData(
      activePage,
      requestDataNum,
      function (rows) {
        rows.forEach((row) => {
          let rowData = [];
          for (var i = 0; i < columns.length; i++) {
            let column = columns[i];
            let value = row[column];
            let type = this.gridApi.getColumnDef(column)?.type;
            let result;

            switch (type) {
              case "select":
                if (column === "JOBCODE") {
                  result = value?.value ?? "";
                } else {
                  result = value?.label ?? "";
                }
                break;
              case "multiSelect":
                result = (value ?? [])
                  .map((_) => (_.label ?? "").toString())
                  .join(" ");
                break;
              default:
                result = value ?? "";
                break;
            }
            rowData.push(result);
          }

          data.push(rowData);
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
        let newTitle = this.props.title.replace(regExp, "").substr(0, 30); // 엑셀 시트 제목으로 \ / ? * [ ] 특수문자가 들어갈 수 없다. 31 길이를 넘을 수 없다.
        XLSX.utils.book_append_sheet(workbook, worksheet, newTitle);
        XLSX.writeFile(workbook, `${title ?? gridId}.xlsx`);

        // excel icon spinner off
        this.setState({
          spinner: false,
        });
      }.bind(this)
    );

    // this.gridApi.exportDataAsCsv({

    //   allColumns: true,

    //   fileName: this.props.title,

    //   processCellCallback: (param) => {
    //     const cellType = param.column.colDef.type;
    //     const value = param.value;
    //     let result;

    //     switch (cellType) {
    //       case "select":
    //         result = value?.label ?? "";
    //         break;
    //       case "multiSelect":
    //         result = (value ?? []).map(_ => (_.label ?? "").toString()).join(" ");
    //         break;
    //       default:
    //         result = value ?? "";
    //         break;
    //     }

    //     return result;
    //   }
    // });
  }

  handleClickSpread() {
    const { gridId, containerActions, isSpread = true } = this.props;
    const gridData = {
      gridId: gridId,
      isSpread: !isSpread,
    };
    containerActions.updatePageGridData({
      gridData: gridData,
    });
  }

  handleClickFinAllButton() {
    let selectedRows = this.gridApi.getSelectedRows();
    let finAllPopupMsg = [];

    if (selectedRows.length > 0) {
      // this.gridApi.getSelectedNodes().length 으로 해도됨
      finAllPopupMsg = selectedRows.map((o) => {
        return o.JOBCODE.value + " (" + o.STATUS.label + ")";
      });
      console.log(
        "FinAllButton >>> " + finAllPopupMsg.length + " 건 \n",
        finAllPopupMsg.join(", ")
      );

      this.setState({
        isFinAllConfirmOpen: true,
        finAllPopupMsg: "Would you like to change all to finall?",
      });
    } else {
      alert("There is no target. Job Check Please");
    }
  }

  handleChangeGroupCode(e) {
    const {
      target: { checked },
    } = e;
    this.props.headerCheckbox.value = checked;
    this.props.containerActions.triggerFetchJobList();
  }

  onCellClicked(param) {
    if (this.props.gridType == "report") {
      param.event.preventDefault();
      return false;
    }

    const data = param.data;
    const isETCCategory = data.CATEGORY?.value === 999999;

    // 편의기능: ctrl 키 누르고 클릭하면 해당 cell label 클립보드로 복사되도록
    if (param.event.ctrlKey) {
      if (param.event.altKey) {
        const { JOBCODE, TITLE } = data;
        copyToClipboard(`${JOBCODE?.value ?? ""} ${TITLE}`);
      } else {
        copyToClipboard(param.event.target.innerText);
      }
      return false;
    }

    if (
      ["FIN", "FIN_DATE"].includes(param.colDef.field) &&
      isETCCategory !== true
    ) {
      if (data.START) {
        this.openPopup("PopupUpdatePlanList", data);
        param.event.preventDefault();
      } else {
        // date type click event occur
      }
    }

    if (param.colDef.field == "JOBCODE") {
      this.openPopup("PopupDetail", data);
    }
    if (param.colDef.field == "SWITCH") {
      if (data.SWITCH === 30 || data.PRIVATE_STATUS.value === 30) {
        // ing 에서 hold 로 변경
        if (isETCCategory) {
          // ETC category인 경우 바로 완료처리
          this.toggleJobStatus(data, 92);
        } else {
          this.openPopup("PopupChangeStatus", data, {
            STATUS: { value: 50, label: "hold" },
          });
        }
      } else if (data.SWITCH === "paused") {
        // pause 에서 ing 로 변경
        this.toggleJobReStart(data, 30);
      } else if (isNil(data.SWITCH) === false) {
        // hold 등 에서 ing 로 변경
        this.getXCurrentlyDoingJob(
          function (doingJob) {
            if (doingJob && doingJob.category.value !== 999999) {
              this.openPopup(
                "PopupChangeStatus",
                getParsedControlValuesByFetchedData(doingJob),
                {
                  STATUS: { value: 50, label: "hold" },
                },
                {
                  toIngRowData: data,
                }
              );
            } else {
              this.toggleJobStatus(data, 30);
            }
          }.bind(this)
        );
      }
    }

    if (
      param.colDef.field == "CHECKBOX" &&
      isBoolean(param.event.target.checked)
    ) {
      this.props.rows[param.rowIndex].checkbox = param.event.target.checked;
    }
  }

  async getXCurrentlyDoingJob(resolve) {
    const loginData = await fetchCurrentlyDoingJob();
    resolve(loginData.currentlyDoingJob);
  }

  onCellContextMenu(param) {
    const { event: e, node, data } = param;
    const { siteManagerData, userData } = window.SCHEDULER_GLOBAL_DATA;
    const isETCCategory = data.CATEGORY?.value === 999999;
    const isMgmt =
      this.props.gridId === "byTeamForMgmt" ||
      this.props.gridId === "unAllocatedJobForMgmt";
    const isDevProgress =
      data.BOARDCD === 1038 ||
      (userData?.comCode !== "80000" ? data.BOARDCD === 1002 : false); // 1002 는 test board

    if (isETCCategory || this.props.gridType == "report") {
      e.preventDefault();
      return false;
    }

    const findManager = (site) => {
      const manager = siteManagerData.find((o) => o.site === site);
      if (manager) {
        return [{ value: manager.id, label: manager.id }];
      }
      return [];
    };

    const createRequestPlanExp = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Request Plan Exp."
        onClick={() => {
          const { TEAM } = this.defaultSupport ?? [];
          const manager = findManager(TEAM.value);

          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: [{ value: 10, label: "plan_exp" }],
              TEAM: TEAM,
              PIC: manager,
              RECEIVERS: manager,
            },
            {
              from: "Create Request",
            }
          );
        }}
      />
    );
    const createRequestAnalyzeReview = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Request Analyze Review."
        onClick={() => {
          const { TEAM } = this.defaultSupport ?? [];
          const manager = findManager(TEAM.value);

          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: [{ value: 20, label: "analyze_review" }],
              TEAM: TEAM,
              PIC: manager,
              RECEIVERS: manager,
            },
            {
              from: "Create Request",
            }
          );
        }}
      />
    );
    const createRequestMidReview = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Request Mid Review"
        onClick={() => {
          const { TEAM } = this.defaultSupport ?? [];
          const manager = findManager(TEAM.value);

          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: [{ value: 30, label: "mid_review" }],
              TEAM: TEAM,
              PIC: manager,
              RECEIVERS: manager,
            },
            {
              from: "Create Request",
            }
          );
        }}
      />
    );
    const createRequestFinalReview = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Request Final Review"
        onClick={() => {
          const { TEAM } = this.defaultSupport ?? [];
          const manager = findManager(TEAM.value);

          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: [{ value: 40, label: "final_review" }],
              TEAM: TEAM,
              PIC: manager,
              RECEIVERS: manager,
            },
            {
              from: "Create Request",
            }
          );
        }}
      />
    );

    const createRequestMenu = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Create Request"
        onClick={() => {
          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: [],
              TEAM: [],
              PIC: [],
            },
            {
              from: "Create Request",
            }
          );
        }}
      />
    );

    const createSupportMenu = isMgmt ? null : (
      <MenuItem
        icon="add-to-artifact"
        text="Create Support"
        onClick={() => {
          if (data.STATUS.value === 90) {
            if (data.CATEGORY.value !== 501) {
              alert("Can't change the status of deployed job");
              return false;
            }
          }

          const { CATEGORY, TEAM } = this.defaultSupport ?? [];
          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: CATEGORY,
              TEAM: TEAM,
              PIC: [],
            },
            {
              from: "Create Support",
            }
          );
        }}
      />
    );

    const requestQAMenu = (
      <MenuItem
        icon="add-to-artifact"
        text="Request QA"
        onClick={() => {
          const { CATEGORY, TEAM } = this.defaultQA ?? [];
          this.openPopup(
            "PopupCreateNewJob",
            data,
            {
              CATEGORY: CATEGORY,
              TEAM: !isDevProgress
                ? [{ label: "EQA팀", value: "테스트팀" }]
                : TEAM,
              PIC: [],
              BOARDNUM: !isDevProgress ? "" : data.BOARDNUM,
              BOARDCD: !isDevProgress ? 1038 : data.BOARDCD,
              LABEL: !isDevProgress ? [] : data.LABEL,
              HOWTODEV: undefined,
            },
            {
              from: "Request QA",
            }
          );
        }}
      />
    );

    const assignPICMenu =
      data.STATUS?.value === 71 ? ( // assign PIC menu 는 done_next 상태에서만 보이도록
        <MenuItem
          icon="add-to-artifact"
          text="Assign PIC"
          onClick={() => {
            this.openPopup("PopupAssignPIC", data, {
              CATEGORY: [],
              TEAM: [],
              PIC: [],
            });
          }}
        />
      ) : (
        ""
      );

    const addChangeDueDate = (
      <MenuItem
        icon="edit"
        text="Change Due Date"
        onClick={() => {
          this.openPopup("PopupUpdatePlanList", data);
        }}
      />
    );

    const addReasonMenu = (
      <MenuItem
        icon="edit"
        text="Add Reason"
        onClick={() => {
          this.openPopup("PopupChangeStatus", data, null, {
            from: "Add Reason",
          });
        }}
      />
    );

    const addCreateNewJob = (
      <MenuItem
        icon="add-to-artifact"
        text="Create New Job"
        onClick={() => {
          this.openPopup("PopupCreateNewJob");
        }}
      />
    );

    const resetJob = (
      <MenuItem
        icon="trash"
        text="Reset"
        onClick={() => {
          // this.setState({
          //   isDeleteConfirmOpen: true
          // });
        }}
      />
    );

    const boardCDSet = window.SCHEDULER_GLOBAL_DATA?.CONNECT_BOARD_CD ?? {};
    const { issued, testProgress, DBReview } = boardCDSet;

    const createBoardMenu = isMgmt ? null : (
      <MenuItem icon="add-to-artifact" text="Board">
        <MenuItem
          icon="add-to-artifact"
          text="Test Progress"
          onClick={this.openBoardPopup.bind(this, {
            boardCd: testProgress,
            data,
          })}
        />
        <MenuItem
          icon="add-to-artifact"
          text="DB Review"
          onClick={this.openBoardPopup.bind(this, { boardCd: DBReview, data })}
        />
        <MenuItem
          icon="add-to-artifact"
          text="Dev.Support"
          onClick={this.openBoardPopup.bind(this, { boardCd: issued, data })}
        />
      </MenuItem>
    );

    node.setSelected(true, true); // 우클릭해도 선택상태 되도록
    e.preventDefault();

    ContextMenu.show(
      <Menu>
        {createRequestPlanExp}
        {createRequestAnalyzeReview}
        {createRequestMidReview}
        {createRequestFinalReview}

        {/* create request */}
        {createRequestMenu}

        {/* create Support */}
        {createSupportMenu}

        {/* Request QA */}
        {requestQAMenu}

        {/* change due date */}
        {/*{addChangeDueDate}*/}

        {/* add reason */}
        {addReasonMenu}

        {/* create new job */}
        {/*{addCreateNewJob}*/}

        {/* assign PIC */}
        {assignPICMenu}

        {/* reset job */}
        {/*{resetJob}*/}

        {/* delete job */}

        {createBoardMenu}

        <MenuItem
          icon="trash"
          text="Remove"
          onClick={() => {
            this.setState({
              isDeleteConfirmOpen: true,
            });
          }}
        />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => this.setState({ isContextMenuOpen: false })
    );
    this.setState({ isContextMenuOpen: true });
  }

  getBoardParameter({ boardCd, data }) {
    const boardCDSet = window.SCHEDULER_GLOBAL_DATA?.CONNECT_BOARD_CD ?? {};
    const { issued, testProgress, DBReview } = boardCDSet;

    switch (boardCd) {
      case issued:
        return {
          name: "EC_PROJECT_PARAMS",
          value: JSON.stringify({
            PJT_CD: data.JOBCODE.value,
          }),
        };
      case testProgress:
        return {
          name: "EC_PROJECT_PARAMS",
          value: JSON.stringify({
            PJT_CD: data.JOBCODE.value,
          }),
        };
      case DBReview:
        return {
          name: "EC_PROJECT_PARAMS",
          value: JSON.stringify({
            PJT_CD: data.JOBCODE.value,
            COL201: data.JOBCODE.value,
            HEADER_LIST: "COL201",
            VALUE_LIST: data.JOBCODE.value,
          }),
        };
    }
  }

  openBoardPopup({ boardCd, data }) {
    if (boardCd) {
      this.setState((prevState) => {
        return {
          ...prevState,
          submitParams: [
            {
              name: "BOARD_CD",
              value: boardCd,
            },
            this.getBoardParameter({ boardCd, data }),
          ],
        };
      }, this.openErpPopup.bind(this, data));
    }
  }

  openErpPopup(data) {
    window.open(
      "",
      "popupForm",
      "width=800, height=800, menubar=no, status=no, toolbar=no, location=no"
    );
    const reqSid = window.location.href.match(/ec_req_sid=([^#]+)/)[0];
    const host = window.location.origin;
    const url = `${host}/ECERP/EGM/EGM024M?${reqSid}`;
    const form = this.formRef.current;

    form.action = url;
    form.method = "post";
    form.target = "popupForm";
    form.submit();
  }

  onCellValueChanged(param) {
    const oldValue = param.oldValue ?? "";
    const newValue = param.newValue ?? "";
    const key = param.colDef.field;
    const data = param.node.data;
    const { JOBCODE, CATEGORY, PIC, WRITEDATE } = data;

    // CATEGORY, STATUS 는 빈 값으로 수정할 수 없으므로 cancel 처리
    if (["CATEGORY", "STATUS"].includes(key) && !newValue) {
      this.gridApi.undoCellEditing();
      return false;
    }

    const defaultValues = {
      JOBCODE: JOBCODE,
      CATEGORY: CATEGORY,
      PIC: PIC,
      WRITEDATE: WRITEDATE,
    };

    const keyControlValues = Object.assign(
      { ...defaultValues },
      {
        [key]: oldValue,
      }
    );

    const updateControlValues = {
      [key]: newValue,
    };

    this.props.containerActions.triggerUpdateJob({
      allControlValues: data,
      keyControlValues: keyControlValues,
      updateControlValues: updateControlValues,
    });
  }

  changeShowOthers({ target }) {
    this.props.containerActions.triggerToggleShowOptions({
      pageId: this.props.pageId,
      options: {
        isShowOthers: target.checked,
      },
    });
    this.props.containerActions.triggerFetchJobList();
  }

  changeShowAllStatus({ target }) {
    this.props.containerActions.triggerToggleShowOptions({
      pageId: this.props.pageId,
      options: {
        isShowAllStatus: target.checked,
      },
    });
    this.props.containerActions.triggerFetchJobList();
  }

  changeProgressedInTestFilterApply({ target }) {
    this.props.containerActions.triggerToggleShowOptions({
      pageId: this.props.pageId,
      options: {
        isProgressedInTestFilterApply: target.checked,
      },
    });
    this.props.containerActions.triggerFetchJobList();
  }

  render() {
    const {
      pageId,
      columnFields,
      rows,
      title,
      containerActions,
      gridOptions = {},
      stepperOptions,
      isSpread,
      isRowSelectable,
      onSelectionChanged,
      suppressRowClickSelection,
    } = this.props;
    const {
      gridApi,
      defaultColDef,
      columnTypes,
      defaultGridOptions,
      frameworkComponents,
    } = this;
    const stepper = stepperOptions ? (
      <GridStepper
        stepperOptions={stepperOptions}
        containerActions={containerActions}
      />
    ) : (
      ""
    );
    const multiJobCodeCheckbox = this.props.headerCheckbox ? (
      <Checkbox
        className={"mb-0"}
        checked={this.props.headerCheckbox.value}
        label={this.props.headerCheckbox.name}
        onChange={this.handleChangeGroupCode.bind(this)}
      />
    ) : null;

    const showTypeCheckBox = ["myTeamJobAllocated", "myJobAllocated"].includes(
      this.props.gridId
    ) && (
      <>
        <Checkbox
          className="mb-0 ml-15"
          large={false}
          small={true}
          label="Show Others"
          onChange={this.changeShowOthers.bind(this)}
          value={this.state.isShowOthers}
        />
        <Checkbox
          className="mb-0 ml-25"
          large={false}
          small={true}
          label="Show All Status"
          onChange={this.changeShowAllStatus.bind(this)}
          value={this.state.isShowAllStatus}
        />
      </>
    );

    const finAllButton = this.props.headerButton ? (
      <Button
        className={"mb-0"}
        small={true}
        onClick={this.handleClickFinAllButton.bind(this)}
      >
        {this.props.headerButton.name}
      </Button>
    ) : null;

    const showProgressedInTestCheckBox = ["byCategoryTest"].includes(
      this.props.gridId
    ) && (
      <>
        <Checkbox
          className="mb-0 ml-15"
          large={false}
          small={true}
          label="Show Testing Over Than 2 Days"
          onChange={this.changeProgressedInTestFilterApply.bind(this)}
          value={this.state.isProgressedInTestFilterApply}
        />
      </>
    );

    return (
      <>
        <form ref={this.formRef}>
          {this.state.submitParams.map(({ name, value }) => (
            <input type="hidden" key={name} name={name} value={value} />
          ))}
        </form>
        <div className="ag-grid-header">
          <Button
            icon={isSpread !== false ? "chevron-down" : "chevron-right"}
            small={true}
            minimal={true}
            outlined={false}
            onClick={this.handleClickSpread.bind(this)}
          >
            {title || ""}
          </Button>
          {showTypeCheckBox}
          {multiJobCodeCheckbox}
          {finAllButton}
          {showProgressedInTestCheckBox}
          <IconExcel
            spinner={this.state.spinner}
            onClick={this.handleClickExcelIcon.bind(this)}
          />
        </div>
        {stepper}
        <div
          className="ag-theme-custom"
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          <AgGridReact
            pageId={pageId}
            containerActions={containerActions}
            onGridReady={this.onGridReady.bind(this)}
            defaultColDef={defaultColDef}
            columnTypes={columnTypes}
            columnDefs={columnFields}
            isRowSelectable={isRowSelectable}
            onSelectionChanged={onSelectionChanged}
            suppressRowClickSelection={suppressRowClickSelection}
            frameworkComponents={frameworkComponents}
            loadingCellRenderer={"LoadingCellRenderer"}
            rowData={rows}
            rowSelection="multiple"
            animateRows={true}
            onCellClicked={this.onCellClicked.bind(this)}
            onCellContextMenu={this.onCellContextMenu.bind(this)}
            onCellValueChanged={this.onCellValueChanged.bind(this)}
            onFilterModified={this.onFilterModified.bind(this)}
            suppressKeyboardEvent={this.suppressKeyboardEvent.bind(this)}
            disableStaticMarkup={true}
            {...defaultGridOptions}
            {...gridOptions}
          ></AgGridReact>
        </div>
        <Alert
          canEscapeKeyCancel={true}
          canOutsideClickCancel={true}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          icon="trash"
          intent={Intent.DANGER}
          isOpen={this.state.isDeleteConfirmOpen}
          onCancel={this.handleDeleteAlertCancel.bind(this)}
          onConfirm={this.handleDeleteAlertConfirm.bind(this)}
        >
          <p>
            Are you sure you want to <b>DELETE</b> ?
          </p>
        </Alert>
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          icon="updated"
          intent={Intent.DANGER}
          isOpen={this.state.isFinAllConfirmOpen}
          onCancel={this.handleFinAllAlertCancel.bind(this)}
          onConfirm={this.handleFinAllAlertConfirm.bind(this)}
        >
          <p>{this.state.finAllPopupMsg}</p>
        </Alert>
      </>
    );
  }
}
