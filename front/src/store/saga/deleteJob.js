import { fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* deleteJob(action) {
  try {
    yield put(actions.toggleProgressOverlay(true));

    const { keyControlValues } = action.payload;

    const { JOBCODE, CATEGORY, PIC, WRITEDATE } = keyControlValues;

    const query = `
    mutation ECProject_Job($jobKey:JobDataKey!) {
      deleteJob( jobKey: $jobKey) {
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
      jobKey: {
        code: JOBCODE?.value,
        category: CATEGORY?.value,
        owner: PIC?.value,
        writeDate: WRITEDATE,
      },
    };

    console.log(variables);

    const data = yield fetchGraphQLData(query, variables);

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
