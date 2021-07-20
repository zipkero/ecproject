import {
  fetchECAPIData,
  fetchGraphQLData,
  getKeyControlValuesByFetchedData,
} from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* createNewJob(action) {
  let _doNotFetchList = false;

  try {
    yield put(actions.toggleProgressOverlay(true));

    const { pageId, controlValues, isSimpleJob, from, simpleJobType } =
      action.payload;
    let {
      BOARDTYPE,
      BOARDCD,
      BOARDNUM,
      JOBCODE = {},
      JOBTITLE,
      CATEGORY,
      TEAM,
      PIC,
      TITLE,
      LABEL,
      RECEIVERS,
      DETAIL,
      REASON,
      HOWTODEV,
      REASONFORDEV,
      COMMONORNOT,
    } = controlValues;
    const preventCreateERPBoard = isSimpleJob || !!BOARDNUM; // simpleJob 생성이거나 boardNum 임의로 넘겨준 경우 8만번 새 게시글 만들어지지 않도록 플래그 true 로 설정
    const isQuickMenu =
      from == "Create Request" ||
      from == "Request QA" ||
      from == "Create Support";

    // JOBTITLE 설정된 경우 자동채번되는 로직 돌리기위해 JOBCODE data 변경
    if (JOBTITLE) {
      JOBCODE = {};
      JOBCODE.value = undefined;
      JOBCODE.label = JOBTITLE;
    }

    //TODO: 필수값체크 로직 통일 > saga 하나 따서 select 해온 page state에서 controlList 체크 > not hide, required, no value
    if (TITLE === undefined || TITLE === null) {
      throw { message: "No Title" };
    }
    if (
      JOBCODE === null ||
      JOBCODE.value === null ||
      (JOBCODE.value === undefined && JOBCODE.label === undefined)
    ) {
      throw { message: "No Job Code" };
    }
    if ((isQuickMenu || isSimpleJob) && !BOARDTYPE && BOARDNUM) {
      throw { message: "No Board Type" };
    }
    if (CATEGORY === "" || CATEGORY === undefined || CATEGORY === null) {
      throw { message: "No Category" };
    }
    const BOARD_CD =
      BOARDTYPE?.value ??
      BOARDCD ??
      window.SCHEDULER_GLOBAL_DATA?.CONNECT_BOARD_CD?.main; // 게시판 종류를 선택할 수 있도록 변경되었다. (BOARD_CD 없으면 api 에러남)
    const query = `
    mutation ECProject_Job($inputData:JobInput!) {
      createJob(inputData: $inputData) {
        code
        name
        category {
          name
          value
        }
        ownerDetail {
          id
          name
          site
          siteName
        }
        planToStart
        writeDate
      }
    }
    `;
    const variables = {
      inputData: {
        boardCd: BOARD_CD,
        boardNum: BOARDNUM === "" ? undefined : BOARDNUM, // "" 로 넣으면 GraphQL 단에서 오류남. "" 에 대한 예외처리 없는듯
        code: JOBCODE.value,
        name: JOBCODE.label,
        title: TITLE,
        category: CATEGORY.value,
        ownerGroup: TEAM?.value,
        owner: PIC?.value,
        labels: LABEL,
        alramReceivers: RECEIVERS,
        comment1: HOWTODEV,
        comment2: REASONFORDEV,
        comment3: COMMONORNOT,
      },
    };

    // ERP 게시판 관련 변수
    const params = {
      EditFlag: "I",
      BOARD_CD: BOARD_CD,
      BOARD_NM: "33333",
      BOARD_TYPE: "N", // 게시판 유형 아님.
      IsSetDefaultData: true,
      DetailsInfo: {
        PURETXT: DETAIL ?? REASON ?? "", // text content
        TXT: (DETAIL ?? REASON ?? "").replace(/\n|\r|\r\n/g, "<br>"), // 개행변환
        LABEL_CD_LIST: LABEL
          ? LABEL.split(window.SCHEDULER_GLOBAL_DATA.delimiter).map((code) => {
              return { LABEL_CD: code };
            })
          : "", // 라벨
      },
      MasterInfo: {
        TITLE: TITLE,
        PJT_CD: JOBCODE.value,
        PJT_DES: JOBCODE.label,
        SITE_CD: TEAM?.value,
        SITE_DES: TEAM?.label,
        EMP_CD: PIC?.value, //담당자(DA/DBA History 게시판은 사원코드를 사용하고 있어 적용되지 않음)
        EMP_DES: PIC?.label,
      },
    };

    const tabInfo = {
      1022: [{ STATUS_CD: 1, STATUS_NM: "1 New" }], // DB Mgt. / System
      1038: [
        { SITE_CD: "ERP", STATUS_CD: "4", STATUS_NM: "ERP" },
        { SITE_CD: "API", STATUS_CD: "29", STATUS_NM: "ESA" },
        { SITE_CD: "EFE", STATUS_CD: "30", STATUS_NM: "EFE" },
        { SITE_CD: "EFS", STATUS_CD: "35", STATUS_NM: "EFS" },
        { SITE_CD: "FD", STATUS_CD: "9", STATUS_NM: "Toplan" },
        { SITE_CD: "UX", STATUS_CD: "31", STATUS_NM: "UX" },
        { SITE_CD: "베트남개발", STATUS_CD: "18", STATUS_NM: "VN" },
      ], // Dev. Progress
      1043: [{ STATUS_CD: 1, STATUS_NM: "New" }], // Security Request
      1044: [{ STATUS_CD: 4, STATUS_NM: "대기" }], // DA/DBA History
      1048: [{ STATUS_CD: 2, STATUS_NM: "예정" }], // SA/Security History
    };
    const tabInfoByBOARDCD = tabInfo[BOARD_CD];
    if (tabInfoByBOARDCD.length === 1) {
      params.MasterInfo.STATUS_CD = tabInfoByBOARDCD[0].STATUS_CD; // 탭정보
      params.MasterInfo.STATUS_NM = tabInfoByBOARDCD[0].STATUS_NM;
    } else {
      const erpBoardInfo = tabInfoByBOARDCD.find((item) =>
        TEAM?.value.includes(item.SITE_CD)
      );

      if (erpBoardInfo) {
        params.MasterInfo.STATUS_CD = erpBoardInfo.STATUS_CD; // 탭정보
        params.MasterInfo.STATUS_NM = erpBoardInfo.STATUS_NM;
      } else {
        params.MasterInfo.STATUS_CD = tabInfoByBOARDCD[0].STATUS_CD; // 탭정보
        params.MasterInfo.STATUS_NM = tabInfoByBOARDCD[0].STATUS_NM;
      }
    }

    // JOBCODE 입력되었는지 여부로 자동채번 체크하여 api 호출순서 결정
    if (JOBCODE.value === undefined) {
      // 잡코드가 없고 ERP게시글이 없는 경우  수정 시 알림을 보내야 함
      if (preventCreateERPBoard !== true) {
        variables["inputData"]["isNoBoardNewJob"] = true;
        variables["inputData"]["alramReceivers"] = "";
        variables["inputData"]["owner"] = "";
      }

      // ECPROJECT 게시글 생성 API
      const data = yield fetchGraphQLData(null, query, variables);
      const newJobData = data.data.Data.data.createJob;
      const keyControlValues = getKeyControlValuesByFetchedData(newJobData); // 잡코드를 여기서 생성

      params.MasterInfo.PJT_CD = newJobData.code;

      // ERP 게시판 생성 API
      if (preventCreateERPBoard !== true) {
        const boardData = yield fetchECAPIData(
          "/ECAPI/Groupware/IntegratedBoard/Save",
          params
        );
        const boardNum = boardData.data.Data.BOARD_NUM;

        // 생성된 boardNum 정보로 다시 updateJob 호출
        yield put(
          actions.triggerUpdateJob({
            keyControlValues: keyControlValues,
            updateControlValues: {
              BOARDNUM: boardNum,
              // 잡코드가 없는 일정 생성 시 boardSeq, boardNum 가 없으므로 수정시에 쪽지전달이 되도록 할당
              RECEIVERS: RECEIVERS,
              PIC: PIC?.value,
            },
            isNoBoardNewJob: true,
          })
        );
        _doNotFetchList = true;
      }
    } else {
      // ERP 게시판 생성 API
      if (preventCreateERPBoard !== true) {
        const boardData = yield fetchECAPIData(
          "/ECAPI/Groupware/IntegratedBoard/Save",
          params
        );
        variables["inputData"]["boardSeq"] = boardData.data.Data.BOARD_SEQ;
        variables["inputData"]["boardNum"] = boardData.data.Data.BOARD_NUM;
        // boardSeq, boardNum 이 모두 있으면 쪽지전달이 되도록 할당
        // variables["inputData"]["alramReceivers"] = RECEIVERS;
      } else if (BOARDNUM && (isQuickMenu || isSimpleJob)) {
        // 잡코드가 있고 기존 ERP 게시물이 있고, "Create Request" or "Request QA" 으로 접근했을 때 답글로 작성되도록 한다.
        // 서버단에서 replyContent이 있으면 해당 ERP 게시물에 답글을 작성한다.
        variables.inputData["replyContent"] = isSimpleJob
          ? REASON
          : params.DetailsInfo.PURETXT;
      }

      // ECPROJECT 게시글 생성 API
      const data = yield fetchGraphQLData(null, query, variables);

      if (isSimpleJob === true) {
        // 생성된 job 의 status ing 로 변경

        const newJobData = data.data.Data.data.createJob;
        const keyControlValues = getKeyControlValuesByFetchedData(newJobData);

        yield put(
          actions.triggerUpdateJob({
            keyControlValues: keyControlValues,
            updateControlValues: {
              STATUS: { label: "ing", value: 30 },
              REASON: REASON,
            },
          })
        );
        _doNotFetchList = true;
      }
    }

    if (pageId) {
      yield put(
        actions.updatePopupToggle({
          pageId: pageId,
          isOpen: false,
        })
      );
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
    if (!_doNotFetchList) {
      yield put(actions.triggerFetchJobList());
      yield put(actions.toggleProgressOverlay(false));
    }
  }
}
