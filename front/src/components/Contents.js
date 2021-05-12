import React, { Component } from "react";
import { getDefaultJobInfo } from "common";
import { fetchGraphQLData } from "store/saga/common";
import MyJob from "pages/MyJob";
import MyTeam from "pages/MyTeam";
import AllJob from "pages/AllJob";
import ByJob from "pages/ByJob";
import ByTeam from "pages/ByTeam";
import UnAllocatedSupportTest from "pages/UnAllocatedSupportTest";
import MyPost from "pages/MyPost";
import UnAllocatedDev from "pages/UnAllocatedDev";
import UnAllocatedPlan from "pages/UnAllocatedPlan";
import ProgressedInTest from "pages/ProgressedInTest";
import ETCCategory from "pages/ETCCategory";
import Report from "pages/Report";
import Gantt from "pages/Gantt";
import ByTeamForMgmt from "pages/ByTeamForMgmt";
import UnAllocatedJobForMgmt from "pages/UnAllocatedJobForMgmt";
import Overlay from "components/Overlay";
import { Button, Intent } from "@blueprintjs/core";

import "./Contents.css";

const CONTENTS_TYPE = {
  MYJOB: MyJob,
  MYTEAM: MyTeam,
  ALLJOB: AllJob,
  BYJOB: ByJob,
  BYTEAM: ByTeam,
  UNALLOCATEDSUPPORTTEST: UnAllocatedSupportTest,
  MYPOST: MyPost,
  UNALLOCATEDDEV: UnAllocatedDev,
  UNALLOCATEDPLAN: UnAllocatedPlan,
  PROGRESSEDINTEST: ProgressedInTest,
  ETCCATEGORY: ETCCategory,
  REPORT: Report,
  BYTEAMFORMGMT: ByTeamForMgmt,
  UNALLOCATEDJOBFORMGMT: UnAllocatedJobForMgmt,
  GANTT: Gantt,
};

export default class Contents extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      SUBMIT_FORM_PARAMS: [
        {
          name: "BOARD_CD",
          value: 1038,
        },
        // {
        //   name: "BOARD_SEQ",
        //   value: 0
        // },
      ],
    };
  }

  componentDidMount() {
    this.props.containerActions.triggerFetchJobList(); // fetch initial grid data
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeMenuId !== prevProps.activeMenuId) {
      this.props.containerActions.triggerFetchJobList(); // fetch initial grid data
    }
  }

  handleClickERPSync() {
    const query = `
      query ECProject_Job {
        manage {
        erpSync 
        }
      }
    `;

    fetchGraphQLData(null, query)
      .then((result) => {
        const isSucess = result.data.Data.data.manage.erpSync;
        alert(isSucess ? "success!" : "fail. check if you are a master or not");
      })
      .catch((error) => {
        console.log(error);
        alert("fail with error");
      });
  }

  handleNotification() {
    const query = `
      query ECProject_Job {
        manage {
        erpAlert 
        }
      }
    `;
    fetchGraphQLData(null, query)
      .then((result) => {
        const isSucess = result.data.Data.data.manage.erpAlert;

        alert(isSucess ? "success!" : "fail!");
      })
      .catch((error) => {
        console.log(error);
        alert("fail with error");
      });
  }

  togglePopup(pageId, isOpen, controlValues, volatileValues) {
    this.props.containerActions.updatePopupToggle({
      pageId: pageId,
      isOpen: isOpen,
      controlValues: controlValues,
      volatileValues: volatileValues,
      from: this.props?.activeMenuId ?? "",
    });
  }

  refreshCurrentPage() {
    this.props.containerActions.triggerFetchJobList(); // fetch grid data
  }

  openBoardPopup(boardCD) {
    if (boardCD) {
      this.setState(
        {
          SUBMIT_FORM_PARAMS: [
            {
              name: "BOARD_CD",
              value: boardCD,
            },
          ],
        },
        this.openPopup
      );
    }
  }

  openPopup() {
    window.open(
      "",
      "popupForm",
      "width=800, height=800, menubar=no, status=no, toolbar=no, location=no"
    );
    const reqSid = window.location.href.match(/ec_req_sid=([^#]+)/)[0];
    const host = window.location.origin;
    const url = `${host}/ECERP/EGM/EGM024M?${reqSid}`;
    const form = this.formRef.current;

    form.action = url;
    form.method = "post";
    form.target = "popupForm";
    form.submit();
  }

  isMaster(userData) {
    const comCode = userData?.comCode;
    const userID = userData?.id;

    if (
      comCode === "80000" &&
      [
        "복섭",
        "병각",
        "다솔",
        "동환",
        "고소영",
        "주영",
        "명수",
        "기진",
        "문영",
      ].includes(userID)
    ) {
      return true;
    }

    if (comCode === "313773") {
      return true;
    }

    return false;
  }

  toggleSimpleJob(type) {
    const controlValues = getDefaultJobInfo(type);

    if (type == "support") {
      this.togglePopup("PopupCreateSimpleJob", true, controlValues, {
        simpleJobType: "support",
      });
    } else {
      this.togglePopup("PopupCreateSimpleJob", true, controlValues);
    }
  }

  render() {
    const userData = window.SCHEDULER_GLOBAL_DATA?.userData;
    const { isOpenOverlay, activeMenuId, pages } = this.props;
    const PageComponent = CONTENTS_TYPE[activeMenuId.toUpperCase()];
    const boardCDSet = window.SCHEDULER_GLOBAL_DATA?.CONNECT_BOARD_CD ?? {};
    const { devProgress, work, info } = boardCDSet;
    const headerToolbar = pages[this.props.activeMenuId]
      .headerToolbarHide ? null : (
      <div className="header-toolbar">
        <div className="pull-left">
          <Button
            icon={"add"}
            className="bp3-small"
            onClick={() => {
              this.togglePopup(pages.PopupCreateNewJob.pageId, true);
            }}
          >
            New
          </Button>
          <Button
            icon={"refresh"}
            className="bp3-small"
            onClick={this.refreshCurrentPage.bind(this)}
          >
            Refresh
          </Button>
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.openBoardPopup.bind(this, devProgress)}
          >
            Dev.Progress
          </Button>
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.openBoardPopup.bind(this, work)}
          >
            Work.New
          </Button>
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.openBoardPopup.bind(this, info)}
          >
            Info
          </Button>
          <Button
            icon={"notifications"}
            className="bp3-small"
            intent={Intent.SUCCESS}
            onClick={this.handleNotification.bind(this)}
          ></Button>
          {this.isMaster(userData) ? (
            <Button
              icon="refresh"
              className="bp3-small"
              intent={Intent.DANGER}
              onClick={this.handleClickERPSync.bind(this)}
            >
              ERP
            </Button>
          ) : (
            <></>
          )}
        </div>
        <div className="pull-right">
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.toggleSimpleJob.bind(this, "meeting")}
          >
            Meeting
          </Button>
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.toggleSimpleJob.bind(this, "support")}
          >
            Support
          </Button>
          <Button
            icon={"issue-new"}
            className="bp3-small"
            onClick={this.toggleSimpleJob.bind(this, "call")}
          >
            Call
          </Button>
        </div>
      </div>
    );

    return (
      <div className="contents-template">
        <Overlay isOpen={isOpenOverlay} />
        {headerToolbar}
        <form ref={this.formRef}>
          {this.state.SUBMIT_FORM_PARAMS.map((param) => {
            const { name, value } = param;
            return (
              <input type="hidden" key={name} name={name} value={value || ""} />
            );
          })}
        </form>
        <PageComponent
          containerActions={this.props.containerActions}
          pageData={pages[activeMenuId]}
        />
      </div>
    );
  }
}
