import { fetchGraphQLData } from "store/saga/common";
import { put } from "redux-saga/effects";
import { actions } from "store/actionTypes";

export default function* updatePlanList(action) {
  const { controlValues, pageId } = action.payload;
  const {
    JOBCODE,
    CATEGORY,
    PIC,
    WRITEDATE,
    ESTIMATEPLANTIME,
    ESTIMATEWORKTIME,
    REASON,
  } = controlValues;

  const query = `
    mutation ECProject_Job($inputData:JobTimeSpendEstimateInput!, $jobKey:JobDataKey!) {
      insertJobEstimateTime(inputData: $inputData, jobKey: $jobKey) {
          estimatePlanTimeInDay
          estimateWorkTimeInDay
          reason
          writeDate
      }
    }
    `;

  const variables = {
    inputData: {
      estimatePlanTimeInDay: ESTIMATEPLANTIME ? ESTIMATEPLANTIME : 0,
      estimateWorkTimeInDay: ESTIMATEWORKTIME ? ESTIMATEWORKTIME : 0,
      reason: REASON,
    },
    jobKey: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC?.value,
      writeDate: WRITEDATE,
    },
  };

  try {
    //TODO: 필수값체크 로직 통일 > saga 하나 따서 select 해온 page state에서 controlList 체크 > not hide, required, no value
    if (REASON === null || REASON === undefined || REASON === "") {
      throw { message: "No REASON" };
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
