import { fetchGraphQLData } from "store/saga/common.js";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";

export default function* fetchProjectCodeList(action) {
  const { pageId, controlId, param = "" } = action.payload;
  const url = "/ECProject/API/SVC/Project/Common/CommonAPI";
  const query = `
    query ECProject_Job ($inputData: ProjectCodeSearchOptionType!) {
      codeList {
        codeProjectCodeList (inputData: $inputData) {
          code
          name
          rowNumber
        }
      }
    }    
  `;

  const variables = {
    inputData: {
      chkFlag: "G",
      param: param,
      isOthersDataFlag: "N",
      isLimit: 1,
      pageCurrent: 1,
      pageSize: 100,
    },
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

    const result = yield fetchGraphQLData(url, query, variables);
    const newItems = result.data.Data.data.codeList.codeProjectCodeList.map(
      (item) => ({
        value: item.code,
        label: item.name ?? "",
      })
    );
    const hasNoItems = newItems.length === 0;
    const newControlData = {
      pageId: pageId,
      controlId: controlId,
      items: newItems,
      autoFocusInput: !hasNoItems,
      createNewCodeConfirmOpen: hasNoItems, // 검색결과 없을시 팝업
    };

    // 검색결과 하나면 바로입력되게
    if (newItems.length === 1) {
      newControlData.values = newItems;
    }

    yield put(actions.updatePageControlData(newControlData));
  } catch (e) {
    console.log(e.message);
  } finally {
    yield put(actions.toggleProgressOverlay(false));
  }
}
