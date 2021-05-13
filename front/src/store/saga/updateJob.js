import { fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* updateJob(action) {
  const {
    pageId,
    allControlValues,
    updateControlValues,
    keyControlValues,
    toIngRowData,
    isNoBoardNewJob,
  } = action.payload;

  const { STATUS: aSTATUS, CATEGORY: aCATEGORY } = allControlValues ?? {};
  const {
    STATUS,
    JOBCODE,
    CATEGORY,
    PIC,
    TEAM,
    TITLE,
    PRIORITY,
    PRIORITY2,
    WRITEDATE,
    DEPLOY,
    START,
    REASON,
    LABEL,
    RECEIVERS,
    HOWTODEV,
    TYPE,
    REASONFORDEV,
    COMMONORNOT,
    BOARDTYPE,
    BOARDCD,
    BOARDNUM,
  } = updateControlValues;
  const {
    JOBCODE: kJOBCODE,
    CATEGORY: kCATEGORY,
    PIC: kPIC,
    WRITEDATE: kWRITEDATE,
  } = keyControlValues;
  const BOARD_CD = BOARDTYPE?.value ?? BOARDCD; // 게시판 종류를 변경 할수 있도록 한다. (BOARD_CD 없으면 api 에러남)

  const query = `
    mutation ECProject_Job($inputData:JobUpdate!, $jobKey:JobDataKey! $history: JobTimeSpendHistoryInput) {
      updateJob(inputData: $inputData, jobKey: $jobKey, history: $history) {
        code
        name
        title
        planToStart
        deployDate
        ownerDetail {
          id
          name
        }
        ownerGroupDetail {
          site
          siteName
          baseCategory{
            name
            value
          }
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
      code: JOBCODE?.value ?? JOBCODE,
      category: CATEGORY?.value ?? CATEGORY,
      owner: PIC?.value ?? PIC,
      ownerGroup: TEAM?.value ?? TEAM,
      status: STATUS?.value ?? STATUS,
      title: TITLE,
      priority: PRIORITY,
      priority2: PRIORITY2,
      planToStart: START,
      labels: LABEL,
      alramReceivers: RECEIVERS,
      comment1: HOWTODEV,
      comment2: REASONFORDEV,
      comment3: COMMONORNOT,
      comment4: TYPE,
      boardNum: BOARDNUM,
      writeDate: WRITEDATE,
      isNoBoardNewJob: isNoBoardNewJob === true,
    },
    jobKey: {
      code: kJOBCODE.value,
      category: kCATEGORY.value,
      owner: kPIC?.value,
      writeDate: kWRITEDATE,
    },
  };

  let isCallToIngRowData = false;

  try {
    //TODO: 필수값체크 로직 통일 > saga 하나 따서 select 해온 page state에서 controlList 체크 > not hide, required, no value
    // status hold/cancel 로 바꿀 때는 reason 필수
    if (REASON) {
      let dueToJob = "";
      if (STATUS?.value === 1000) {
        variables.inputData["replyContent"] = REASON;
      }
      if (toIngRowData?.JOBCODE?.value) {
        dueToJob =
          "due to '" +
          toIngRowData.JOBCODE.value +
          " / " +
          toIngRowData.TITLE +
          "'\n";
      }
      Object.assign(variables, {
        history: {
          reason: dueToJob + "Reason : " + REASON,
        },
      });
    } else {
      if (STATUS?.value === 50 || STATUS?.value === 1000) {
        throw { message: "Please Enter a Reason" };
      }
    }

    // CATEGORY: TEST 이고 STATUS wait 이상일 때만 수정가능
    if (DEPLOY || DEPLOY === "") {
      if (aCATEGORY?.value === 501 && aSTATUS?.value >= 90) {
        Object.assign(variables["inputData"], {
          deployDate: DEPLOY,
        });
      } else {
        throw {
          message:
            "Deploy date only can change in status WAIT (or after), and has TEST category.",
        };
      }
    }

    yield put(actions.toggleProgressOverlay(true));

    const data = yield fetchGraphQLData(query, variables);

    if (toIngRowData) {
      toIngRowData.STATUS.value = 30;
      yield put(
        actions.triggerToggleJobStatus({
          controlValues: toIngRowData,
        })
      );
      isCallToIngRowData = true;
    }

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
    if (!isCallToIngRowData) {
      yield put(actions.triggerFetchJobList());
      yield put(actions.toggleProgressOverlay(false));
    }
  }
}
