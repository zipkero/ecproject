import { stateSelector } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put, select } from "redux-saga/effects";
import { getParsedControlValuesByControlList } from "common";
import fetchJobPageData from "store/saga/fetchJobPageData";

export default function* fetchJobList(action) {
  let state = yield select(stateSelector);
  const activePageId = state.navigator.activeMenu;
  const pageState = state.pages[activePageId];
  const controlValues = getParsedControlValuesByControlList(
    pageState.controlList
  );
  const maxPageNum = pageState.gridList?.[0]?.stepperOptions?.maxPageNum;
  let { activePageNum = 1, requestDataNum, dontNeedAllAmount } =
    action?.payload ?? pageState.gridList?.[0]?.stepperOptions ?? {};
  const {
    isShowOthers = false,
    isShowAllStatus = false,
  } = pageState?.options || {
    isShowOthers: false,
    isShowAllStatus: false,
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

    const parsedPageData = yield fetchJobPageData(
      activePageId,
      controlValues,
      activePageNum,
      requestDataNum,
      dontNeedAllAmount,
      pageState,
      isShowOthers,
      isShowAllStatus
    );

    const pageData = {
      rowData: parsedPageData.rowData,
      paginationData: {
        activePageNum: activePageNum,
        maxPageNum: parsedPageData.maxPageNum ?? maxPageNum,
      },
    };

    if (activePageId === "Gantt") {
      yield put(actions.updatePageGanttData(pageData));
    } else {
      yield put(actions.updatePageGridData(pageData));
    }
  } catch (e) {
    console.log(e.message);
  } finally {
    yield put(actions.toggleProgressOverlay(false));
  }
}
