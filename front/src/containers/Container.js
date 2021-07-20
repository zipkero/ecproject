import React, { Component } from "react";
import Navigator from "components/Navigator";
import Contents from "components/Contents";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actions } from "store/actionTypes";
import { Dialog } from "@blueprintjs/core";

import PopupCodeSearch from "pages/popup/PopupCodeSearch";
import PopupCreateNewJob from "pages/popup/PopupCreateNewJob";
import PopupCreateSimpleJob from "pages/popup/PopupCreateSimpleJob";
import PopupAssignPIC from "pages/popup/PopupAssignPIC";
import PopupUpdatePlanList from "pages/popup/PopupUpdatePlanList";
import PopupChangeStatus from "pages/popup/PopupChangeStatus";
import PopupDetail from "pages/popup/PopupDetail";
import PopupGanttDetail from "pages/popup/PopupGanttDetail";
import PopupNotice from "pages/popup/PopupNotice";
import PopupAlarmManage from "pages/popup/PopupAlarmManage";

const POPUP_COMPONENT_TYPE = {
  PopupCodeSearch: PopupCodeSearch,
  PopupCreateNewJob: PopupCreateNewJob,
  PopupCreateSimpleJob: PopupCreateSimpleJob,
  PopupAssignPIC: PopupAssignPIC,
  PopupUpdatePlanList: PopupUpdatePlanList,
  PopupChangeStatus: PopupChangeStatus,
  PopupDetail: PopupDetail,
  PopupGanttDetail: PopupGanttDetail,
  PopupNotice: PopupNotice,
  PopupAlarmManage: PopupAlarmManage,
};

class Container extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { navigator, pages, isOpenOverlay, Actions } = this.props;
    const popupPages = [];

    for (const pageId in pages) {
      if (pages[pageId].isPopup) {
        popupPages.push(pages[pageId]);
      }
    }

    return (
      <div className="page">
        {/* <Test /> */}
        <Navigator containerActions={Actions} />
        <Contents
          isOpenOverlay={isOpenOverlay}
          containerActions={Actions}
          activeMenuId={navigator.activeMenu}
          pages={pages}
        />
        {popupPages.map((popupData) => {
          const PopupComponent = POPUP_COMPONENT_TYPE[popupData.pageId];
          return (
            <Dialog
              className="pb-0"
              key={popupData.pageId}
              style={{ width: popupData.width || 600 }}
              canEscapeKeyClose={true}
              canOutsideClickClose={false}
              isOpen={popupData.isOpen}
              onClose={() => {
                Actions.updatePopupToggle({
                  pageId: popupData.pageId,
                  isOpen: false,
                });
              }}
            >
              <PopupComponent containerActions={Actions} pageData={popupData} />
            </Dialog>
          );
        })}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    navigator: state.navigator,
    pages: state.pages,
    isOpenOverlay: state.isOpenOverlay,
  }),
  (dispatch) => ({
    Actions: bindActionCreators(actions, dispatch),
  })
)(Container);
