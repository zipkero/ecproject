import { fetchGraphQLData } from "store/saga/common.js";
import { put } from "redux-saga/effects";
import { actions } from "store/actionTypes";

export default function* addReason(action) {
  const { controlValues, pageId } = action.payload;
  const query = `
    mutation ECProject_Job($jobKey:JobDataKey!, $reason: String!) {
      addTimeHistoryReason( jobKey: $jobKey, reason: $reason) 
    }
    `;

  const { JOBCODE, CATEGORY, PIC, WRITEDATE, REASON } = controlValues;
  const userData = window.SCHEDULER_GLOBAL_DATA.userData; // fetched in src/index.js

  const variables = {
    jobKey: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC?.value,
      writeDate: WRITEDATE,
    },
    reason: REASON,
  };

  try {
    if (REASON === null || REASON === undefined || REASON === "") {
      throw { message: "No REASON" };
    } else if (REASON) {
      variables.reason =
        "'" + userData.name + "' 님이 입력 한 추가사유: " + REASON;
    }

    yield put(actions.toggleProgressOverlay(true));

    const data = yield fetchGraphQLData(null, query, variables);

    yield put(
      actions.updatePopupToggle({
        pageId: pageId,
        isOpen: false,
      })
    );

    yield put(
      actions.noticeSuccessOrFail({
        isSuccess: true,
      })
    );
  } catch (e) {
    yield put(
      actions.noticeSuccessOrFail({
        isSuccess: false,
        message: e.message,
      })
    );
  } finally {
    yield put(actions.triggerFetchJobList());
    yield put(actions.toggleProgressOverlay(false));
  }
}
