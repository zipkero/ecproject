import { put } from "redux-saga/effects";
import { actions } from "store/actionTypes";
import { fetchGraphQLData } from "store/saga/common";

export default function* updateUserAlarm(action) {
  const { alarmList, userId } = action.payload;
  try {
    const query = `
    mutation ECProject_Job($userId: String!, $alarmList: [UserAlarmInputType]) {
      updateUserAlarm(userId: $userId, alarmList: $alarmList)
    }
    `;

    const variables = {
      userId: userId,
      alarmList: alarmList,
    };

    yield put(actions.toggleProgressOverlay(true));
    yield fetchGraphQLData(null, query, variables);
  } catch (e) {
  } finally {
    yield put(actions.toggleProgressOverlay(false));
  }
}