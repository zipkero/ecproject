import { fetchGraphQLData } from "store/saga/common.js";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* toggleJobStatus(action) {
  const { controlValues } = action.payload;
  const { STATUS, JOBCODE, CATEGORY, PIC, TEAM, WRITEDATE } = controlValues;

  const query = `
    mutation ECProject_Job($inputData:JobUpdate!, $jobKey:JobDataKey!) {
      updateJob(inputData: $inputData, jobKey: $jobKey) {
        code
        name
        title
        ownerDetail {
          id
          name
          site
        }
        category {
          name
          value
        }
        status  {
          name
          value
        }
      }
    }
  `;

  const variables = {
    inputData: {
      status: STATUS.value,
    },
    jobKey: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC.value,
      writeDate: WRITEDATE,
    },
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

    const data = yield fetchGraphQLData(null, query, variables);

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
