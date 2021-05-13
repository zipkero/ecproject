import { fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* fetchLoginData(action) {
  const userQuery = `
    query ECProject_Job {
      myUser {
        id
        name
        site
        siteName
        currentlyDoingJob {
          ...basicField
          ...timeData
        }
        holdingJobList {
          ...basicField
          ...timeData
        }
        toPlanJobList {
          ...basicField
          ...timeData
        }
      }
    }
  `;

  const fragments = `
    fragment basicField on Job
    {
      listOrder
      boardCd
      boardSeq
      priority
      code
      title
      status {
        name
        value
      }
      category {
        name
        value
      }
      owner
      ownerDetail {
        id
        name
        site
        siteName
      }
      ownerGroup
      ownerGroupDetail{
        site
        siteName
      }      
    }
    
    fragment timeData on Job
    {
      writeDate
      planToStart
      deployDate
      timeSpendHistoryList {
          start
          end
          reason
          owner
          isEventLog
        }      
      timeSpendEstimateList {
        estimatePlanTimeInDay
        estimateWorkTimeInDay
      }
    }
  `;

  const query = `${userQuery} ${fragments}`;

  try {
    yield put(actions.toggleProgressOverlay(true));

    const userDataResult = yield fetchGraphQLData(query);
    const userData = userDataResult.data.Data.data["myUser"];

    yield put(actions.updateLoginData(userData));
  } catch (e) {
    console.log(e.message);
  } finally {
    yield put(actions.toggleProgressOverlay(false));
  }
}
