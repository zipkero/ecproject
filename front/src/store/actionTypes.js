import { createAction } from "redux-actions";

/* action types */
export const types = {
  TRIGGER_FETCH_LOGIN_DATA: "TRIGGER_FETCH_LOGIN_DATA",
  TRIGGER_FETCH_JOB_LIST: "TRIGGER_FETCH_JOB_LIST",
  TRIGGER_FETCH_PROJECT_CODE_LIST: "TRIGGER_FETCH_PROJECT_CODE_LIST",
  TRIGGER_FETCH_USER_CODE_LIST: "TRIGGER_FETCH_USER_CODE_LIST",
  TRIGGER_FETCH_SITE_CODE_LIST: "TRIGGER_FETCH_SITE_CODE_LIST",
  TRIGGER_FETCH_DEFAULT_CODE_LIST: "TRIGGER_FETCH_DEFAULT_CODE_LIST",
  TRIGGER_CREATE_NEW_JOB: "TRIGGER_CREATE_NEW_JOB",
  TRIGGER_ASSIGN_PIC: "TRIGGER_ASSIGN_PIC",

  TRIGGER_OPEN_POPUP: "TRIGGER_OPEN_POPUP",
  TRIGGER_UPDATE_POPUP_TOGGLE: "TRIGGER_UPDATE_POPUP_TOGGLE",
  TRIGGER_UPDATE_JOB: "TRIGGER_UPDATE_JOB",
  TRIGGER_ADD_REASON: "TRIGGER_ADD_REASON",
  TRIGGER_UPDATE_PLAN_LIST: "TRIGGER_UPDATE_PLAN_LIST",
  TRIGGER_TOGGLE_JOB_STATUS: "TRIGGER_TOGGLE_JOB_STATUS",
  TRIGGER_TOGGLE_JOB_STATUS_LIST: "TRIGGER_TOGGLE_JOB_STATUS_LIST",
  TRIGGER_TOGGLE_JOB_RESTART: "TRIGGER_TOGGLE_JOB_RESTART",
  TRIGGER_DELETE_JOB: "TRIGGER_DELETE_JOB",

  TRIGGER_TOGGLE_SHOW_OPTIONS: "TRIGGER_TOGGLE_SHOW_OPTIONS",

  TOGGLE_PROGRESS_OVERLAY: "TOGGLE_PROGRESS_OVERLAY",
  NOTICE_SUCCESS_OR_FAIL: "NOTICE_SUCCESS_OR_FAIL",

  UPDATE_ALARM_DATA: "UPDATE_ALARM_DATA",
  UPDATE_LOGIN_DATA: "UPDATE_LOGIN_DATA",
  UPDATE_PAGE_GRID_DATA: "UPDATE_PAGE_GRID_DATA",
  UPDATE_PAGE_GANTT_DATA: "UPDATE_PAGE_GANTT_DATA",
  UPDATE_NAVIGATOR_ACTIVE_MENU: "UPDATE_NAVIGATOR_ACTIVE_MENU",
  UPDATE_POPUP_TOGGLE: "UPDATE_POPUP_TOGGLE",
  UPDATE_PAGE_CONTROL_DATA: "UPDATE_PAGE_CONTROL_DATA",
  RESET_PAGE_STATE: "RESET_PAGE_STATE",

  TEST: "TEST",
};

/* actions */
export const actions = {
  triggerCreateNewJob: createAction(types.TRIGGER_CREATE_NEW_JOB),
  triggerAssignPIC: createAction(types.TRIGGER_ASSIGN_PIC),

  triggerOpenPopup: createAction(types.TRIGGER_OPEN_POPUP),
  triggerUpdatePopupToggle: createAction(types.TRIGGER_UPDATE_POPUP_TOGGLE),
  triggerFetchJobList: createAction(types.TRIGGER_FETCH_JOB_LIST),
  triggerFetchLoginData: createAction(types.TRIGGER_FETCH_LOGIN_DATA),
  triggerFetchProjectCodeList: createAction(
    types.TRIGGER_FETCH_PROJECT_CODE_LIST
  ),
  triggerFetchUserCodeList: createAction(types.TRIGGER_FETCH_USER_CODE_LIST),
  triggerFetchSiteCodeList: createAction(types.TRIGGER_FETCH_SITE_CODE_LIST),
  triggerFetchDefaultCodeList: createAction(
    types.TRIGGER_FETCH_DEFAULT_CODE_LIST
  ),
  triggerUpdateJob: createAction(types.TRIGGER_UPDATE_JOB),
  triggerAddReason: createAction(types.TRIGGER_ADD_REASON),
  triggerUpdatePlanList: createAction(types.TRIGGER_UPDATE_PLAN_LIST),
  triggerToggleJobStatus: createAction(types.TRIGGER_TOGGLE_JOB_STATUS),
  triggerToggleJobStatusList: createAction(
    types.TRIGGER_TOGGLE_JOB_STATUS_LIST
  ),
  triggerToggleJobReStart: createAction(types.TRIGGER_TOGGLE_JOB_RESTART),
  triggerDeleteJob: createAction(types.TRIGGER_DELETE_JOB),

  triggerToggleShowOptions: createAction(types.TRIGGER_TOGGLE_SHOW_OPTIONS),

  noticeSuccessOrFail: createAction(types.NOTICE_SUCCESS_OR_FAIL),

  toggleProgressOverlay: createAction(types.TOGGLE_PROGRESS_OVERLAY),
  updateLoginData: createAction(types.UPDATE_LOGIN_DATA),
  updatePageGridData: createAction(types.UPDATE_PAGE_GRID_DATA),
  updatePageGanttData: createAction(types.UPDATE_PAGE_GANTT_DATA),
  updateNavigatorActiveMenu: createAction(types.UPDATE_NAVIGATOR_ACTIVE_MENU),
  updatePopupToggle: createAction(types.UPDATE_POPUP_TOGGLE),
  updatePageControlData: createAction(types.UPDATE_PAGE_CONTROL_DATA),
  resetPageState: createAction(types.RESET_PAGE_STATE),
  updateAlarmData: createAction(types.UPDATE_ALARM_DATA),

  test: createAction(types.TEST),
};
