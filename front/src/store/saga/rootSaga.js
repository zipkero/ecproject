import { take, takeEvery, takeLatest } from "redux-saga/effects";
import { types } from "store/actionTypes";

import toggleJobStatus from "store/saga/toggleJobStatus";
import toggleJobStatusList from "store/saga/toggleJobStatusList";
import toggleJobReStart from "store/saga/toggleJobReStart";
import updateJob from "store/saga/updateJob";
import updatePlanList from "store/saga/updatePlanList";
import addReason from "store/saga/addReason";
import deleteJob from "store/saga/deleteJob";
import openPopup from "store/saga/openPopup";
import createNewJob from "store/saga/createNewJob";
import assignPIC from "store/saga/assignPIC";
import fetchJobList from "store/saga/fetchJobList";
import fetchLoginData from "store/saga/fetchLoginData";
import fetchProjectCodeList from "store/saga/fetchProjectCodeList";

export function* schedulerSaga() {
  yield takeLatest(types.TRIGGER_TOGGLE_JOB_STATUS, toggleJobStatus);
  yield takeLatest(types.TRIGGER_TOGGLE_JOB_STATUS_LIST, toggleJobStatusList);
  yield takeLatest(types.TRIGGER_TOGGLE_JOB_RESTART, toggleJobReStart);
  yield takeLatest(types.TRIGGER_UPDATE_JOB, updateJob);
  yield takeLatest(types.TRIGGER_ADD_REASON, addReason);
  yield takeLatest(types.TRIGGER_UPDATE_PLAN_LIST, updatePlanList);
  yield takeLatest(types.TRIGGER_DELETE_JOB, deleteJob);
  yield takeLatest(types.TRIGGER_OPEN_POPUP, openPopup);
  yield takeLatest(types.TRIGGER_CREATE_NEW_JOB, createNewJob);
  yield takeLatest(types.TRIGGER_ASSIGN_PIC, assignPIC);
  yield takeLatest(types.TRIGGER_FETCH_LOGIN_DATA, fetchLoginData);
  yield takeLatest(types.TRIGGER_FETCH_JOB_LIST, fetchJobList);
  yield takeLatest(types.TRIGGER_FETCH_PROJECT_CODE_LIST, fetchProjectCodeList);

  //yield takeEvery(types.TEST, codeFetchTest);
}
