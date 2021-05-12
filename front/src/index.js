import React from "react";
import ReactDOM from "react-dom";

import {
  fetchDefaultCodeList,
  fetchLoginData,
  fetchSiteCodeList,
  fetchUserCodeList,
} from "store/saga/common";
import Overlay from "components/Overlay";
import App from "App";

let isOpen = true;

ReactDOM.render(<Overlay isOpen={isOpen} />, document.getElementById("root"));

Promise.all([
  fetchLoginData(), // login user data
  fetchDefaultCodeList(), // status, category data
  fetchSiteCodeList(), // site data
  fetchUserCodeList(), // user data
])
  .then((result) => {
    const [userData, defaultCodeData, siteList, userList] = result;
    const { labelList, statusList, categoryList, boardList, siteManagerList } =
      defaultCodeData;
    const comCode = userData?.comCode;
    // userData 는 전역변수로 사용
    window.SCHEDULER_GLOBAL_DATA = {
      // 게시글 연동 게시판 코드
      CONNECT_BOARD_CD: {
        main: 1038, // dev.progress
        issued: 1040, // dev.support
        testProgress: 1014, // test progress
        DBReview: 1020, // DB review
        devProgress: 1038,
        work: 2,
        info: 1021,
      },

      userData: userData,
      siteManagerData: siteManagerList,

      delimiter: "∬",
    };

    // 초기 반영해야하는 데이터 > Scheduler props 로 넣어 initialState 에 반영할 데이터는 여기에
    const fetchedInitData = {
      defaultCodeItems: {
        LABEL: labelList,
        // [
        //   { value: "00001", label: "빨강", color: "#ff0000", boardCd: "1002" },
        //   { value: "00002", label: "초록", color: "#00ff00", boardCd: "1002" },
        //   { value: "00003", label: "파랑", color: "#0000ff", boardCd: "1002" }
        // ],
        STATUS: statusList,
        CATEGORY: categoryList,
        TEAM: siteList,
        PIC: userList,
        RECEIVERS: userList,
        BOARDTYPE: boardList,
      },
    };

    ReactDOM.render(
      <App fetchedInitData={fetchedInitData} />,
      document.getElementById("root")
    );
    isOpen = false;
  })
  .catch((e) => {
    console.log(e);
  });
