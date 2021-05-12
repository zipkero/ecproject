import { fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* toggleJobStatusList(action) {
  const { rowData } = action.payload;

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

  try {
    yield put(actions.toggleProgressOverlay(true));

    let saveResult = [];
    for (let i = 0; i < rowData.length; i++) {
      let { STATUS, JOBCODE, CATEGORY, PIC, WRITEDATE } = rowData[i];
      let variables = {
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
      saveResult.push(yield fetchGraphQLData(null, query, variables));
    }

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
