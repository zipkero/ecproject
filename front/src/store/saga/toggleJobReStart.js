import { fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* toggleJobReStart(action) {
  // const { controlValues } = action.payload;
  // const { STATUS, JOBCODE, CATEGORY, PIC, TEAM, WRITEDATE } = controlValues;

  const query = `
    mutation ECProject_Job($userId:String) {
      resumeLast(userId: $userId)
    }
  `;

  const variables = {
    userId: "default",
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

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
