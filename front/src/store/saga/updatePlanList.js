import { fetchGraphQLData } from "store/saga/common.js";
import { put } from "redux-saga/effects";
import { actions } from "store/actionTypes";
import moment from "moment";

export default function* updatePlanList(action) {
  const { controlValues, pageId } = action.payload;
  const {
    JOBCODE,
    CATEGORY,
    PIC,
    FIN_DATE,
    WRITEDATE,
    ESTIMATEPLANTIME,
    ESTIMATEWORKTIME,
    REASON,
  } = controlValues;

  const query = `
    mutation ECProject_Job($inputData:JobTimeSpendEstimateInput!, $jobKey:JobDataKey!, $jobData: JobUpdate!) {
      insertJobEstimateTime(inputData: $inputData, jobKey: $jobKey, jobData: $jobData) {
          estimatePlanTimeInDay
          estimateWorkTimeInDay
          reason
          writeDate
      }
    }
    `;

  const estimatePlanTimeInDay = ESTIMATEPLANTIME
    ? parseFloat(ESTIMATEPLANTIME)
    : 0;
  const estimateWorkTimeInDay = ESTIMATEWORKTIME
    ? parseFloat(ESTIMATEWORKTIME)
    : 0;

  const plusHourValue = (estimatePlanTimeInDay + estimateWorkTimeInDay) * 24;

  let finDate = moment(FIN_DATE);
  if (plusHourValue > 24) {
    finDate = finDate.add({ hours: plusHourValue ?? 0 });
  }
  finDate = finDate.format("YYYY-MM-DD HH:mm");

  const variables = {
    inputData: {
      estimatePlanTimeInDay: estimatePlanTimeInDay,
      estimateWorkTimeInDay: estimateWorkTimeInDay,
      reason: REASON,
      finDate: finDate,
    },
    jobKey: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC?.value,
      writeDate: WRITEDATE,
    },
    jobData: {
      finDate: finDate,
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
