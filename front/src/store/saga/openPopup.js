import { fetchGraphQLData, jobFragments } from "store/saga/common";
import { actions } from "store/actionTypes";
import { put } from "redux-saga/effects";
import { getParsedControlValuesByFetchedData } from "common";

export default function* openPopup(action) {
  const {
    parentPageId,
    pageId,
    from,
    keyControlValues,
    updateControlValues = {},
    volatileValues,
  } = action.payload;
  const { JOBCODE, CATEGORY, PIC, WRITEDATE } = keyControlValues;

  const query = `
    query ECProject_Job($key:JobDataKey!) {
      job(key: $key) {
        name
        ...basicField
        ...timeData
        timeSpendHistoryList {
            start
            end
            reason
            owner
            isEventLog
          }      
        timeSpendEstimateList {
          writeDate
          estimatePlanTimeInDay
          estimateWorkTimeInDay
          reason
        }
      }
    }
    ${jobFragments}
  `;

  const variables = {
    key: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC ? PIC.value : null,
      writeDate: WRITEDATE,
    },
  };

  try {
    yield put(actions.toggleProgressOverlay(true));

    const result = yield fetchGraphQLData(query, variables);
    const data = result.data.Data.data.job;
    const controlValues = getParsedControlValuesByFetchedData(data);

    yield put(
      actions.updatePopupToggle({
        parentPageId: parentPageId,
        pageId: pageId,
        isOpen: true,
        from: from ?? "",
        controlValues: {
          ...controlValues,
          ...updateControlValues,
        },
        volatileValues,
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
    yield put(actions.toggleProgressOverlay(false));
  }
}
