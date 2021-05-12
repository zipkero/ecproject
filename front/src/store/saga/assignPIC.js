import { fetchECAPIData, fetchGraphQLData } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* assignPIC(action) {
  const { pageId, controlValues, keyControlValues } = action.payload;

  const { JOBCODE, CATEGORY, PIC, WRITEDATE, TITLE, TEAM } = controlValues;
  const {
    JOBCODE: kJOBCODE,
    CATEGORY: kCATEGORY,
    PIC: kPIC,
    WRITEDATE: kWRITEDATE,
  } = keyControlValues;

  const BOARD_CD = window.SCHEDULER_GLOBAL_DATA?.CONNECT_BOARD_CD?.main;
  const params = {
    EditFlag: "I",
    BOARD_CD: BOARD_CD,
    BOARD_NM: "33333",
    BOARD_TYPE: "N", // 게시판 유형 아님.
    IsSetDefaultData: true,
    DetailsInfo: {
      PURETXT: "", //text content
      TXT: "", //Html content
    },
    MasterInfo: {
      TITLE: TITLE,
      PJT_CD: JOBCODE.value,
      PJT_DES: JOBCODE.label,
    },
  };

  const query = `
    mutation ECProject_Job($inputData:JobUpdate!, $jobKey:JobDataKey!) {
      applyToDev(inputData: $inputData, jobKey: $jobKey) {
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
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC?.value,
      ownerGroup: TEAM?.value,
      title: TITLE,
      writeDate: WRITEDATE,
    },
    jobKey: {
      code: kJOBCODE.value,
      category: kCATEGORY.value,
      owner: kPIC?.value,
      writeDate: kWRITEDATE,
    },
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

    //const boardData = yield fetchECAPIData("/ECAPI/Groupware/IntegratedBoard/Save", params);
    // variables["inputData"]["boardCd"] = boardData.data.Data.BOARD_CD;
    // variables["inputData"]["boardSeq"] = boardData.data.Data.BOARD_SEQ;

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
