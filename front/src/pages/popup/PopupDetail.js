import React, { PureComponent } from "react";
import Form from "components/form/Form";
import { Button, Tag } from "@blueprintjs/core";
import {
  getDifferentControlValues,
  getParsedControlValuesByControlList,
} from "common";
import { includes, isArray } from "lodash";
import { getControlOption } from "../../constant/options";
import moment from "moment";

export default class PopupDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.originControlValues = {};
    this.keyControlValues = {};
    this.handleKeydownOnPage = this.handleKeydownOnPage.bind(this);

    let writer = props.pageData.controlList.find(
      (ctrl) => ctrl.controlId === "WRITER"
    );
    if (writer && writer?.values && isArray(writer?.values)) {
      let writedate = props.pageData.controlList.find(
        (ctrl) => ctrl.controlId === "WRITEDATE"
      );
      writedate.plusText =
        "\u00A0\u00A0\u00A0/\u00A0\u00A0\u00A0" + writer.values[0] ?? "";
    }

    // 게시판 종류 설정 (boardType은 그리드에 없는 데이터 이기 때문에 Grid.js onCellContextMenu 함수가 아닌 여기서 세팅)
    const boardType = props.pageData.controlList.find(
      (ctrl) => ctrl.controlId === "BOARDTYPE"
    );
    const userData = window.SCHEDULER_GLOBAL_DATA?.userData; // 주의: userData.site (code) 와 codeUserGroupList[n].site (name) 가 다르다.
    boardType.values = [];
    props.pageData.controlList.map((ctrl) => {
      switch (ctrl.controlId) {
        case "BOARDCD":
          if (ctrl.values) {
            const matchVal = boardType.items.find(
              (item) => item.value == ctrl.values
            );
            boardType.values = matchVal
              ? [matchVal]
              : [{ label: "none", value: ctrl.values }];
          } else if (includes(["DA팀", "DBA팀"], userData.siteName)) {
            // DA, DBA팀 : DA/DBA history
            boardType.values = [{ label: "DA/DBA History", value: "1044" }];
          } else if (includes(["SA팀", "Security팀"], userData.siteName)) {
            // SA,Security팀(보안팀) : SA/Security history
            boardType.values = [
              { label: "SA/Security History", value: "1048" },
            ];
          } else {
            boardType.values = [{ label: "Dev. Progress", value: "1038" }];
          }
          break;
        case "LABEL":
          ctrl.matchValue = false; // reset
          break;
      }
    });

    // 게시판 종류 설정값이 있다면 라벨 matchValue 설정 필요
    if (isArray(boardType.values) && boardType.values.length > 0) {
      props.pageData.controlList.map((ctrl) => {
        switch (ctrl.controlId) {
          case "LABEL":
            ctrl.matchValue = boardType.values[0].value;
            // ctrl.matchValue = "#0000ff"; // 테스트용 코드
            break;
        }
      });
    }
  }

  componentDidMount() {
    this.originControlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.keyControlValues = {
      JOBCODE: this.originControlValues.JOBCODE,
      CATEGORY: this.originControlValues.CATEGORY,
      PIC: this.originControlValues.PIC,
      WRITEDATE: this.originControlValues.WRITEDATE,
    };

    document.body.addEventListener("keydown", this.handleKeydownOnPage);
  }

  componentDidUpdate(prevProps) {
    this.handleUpdateProps(prevProps, this.props);
  }

  componentWillUnmount() {
    this.props.containerActions.resetPageState({
      pageId: this.props.pageData.pageId,
    });

    document.body.removeEventListener("keydown", this.handleKeydownOnPage);
  }

  handleKeydownOnPage(e) {
    if (e.keyCode === 119) {
      // F8
      this.handleClickSave();
    }
  }

  handleUpdateProps(prevProps, props) {
    const prevControlValues = getParsedControlValuesByControlList(
      prevProps.pageData.controlList
    );
    const currControlValues = getParsedControlValuesByControlList(
      props.pageData.controlList
    );
    const updateControlValues = getDifferentControlValues(
      prevControlValues,
      currControlValues
    );
    const { TEAM, STATUS, BOARDTYPE } = updateControlValues;

    if (STATUS?.value === 50 || STATUS?.value === 1000) {
      this.updatePageControlData("REASON", {
        hide: false,
        required: true,
      });
    } else if (STATUS === "") {
      this.updatePageControlData("REASON", {
        hide: true,
        required: false,
      });
    }

    // TEAM 제거시 PIC 제거
    // if (TEAM === "") {
    //   this.updatePageControlData("PIC", { values: [] });
    // }

    // Board Type 변경 시 LABEL 제거
    if (BOARDTYPE || BOARDTYPE === "") {
      this.updatePageControlData("LABEL", {
        values: [],
        matchValue: BOARDTYPE?.value ?? false,
        // matchValue: (BOARDTYPE?.value ? "#0000ff" : false)  // 테스트용 코드
      });
    }

    // update된 control data 중 relationControlData 있을 경우 해당 데이터 같이 update
    for (const controlId in updateControlValues) {
      const control = props.pageData.controlList.find(
        (ctrl) => ctrl.controlId === controlId
      );
      const controlValue = updateControlValues[controlId].value;

      if (control?.useRelationControlData && control?.items && controlValue) {
        const relationControlData = control.items.find(
          (item) => item.value === controlValue
        )?.relationControlData;

        if (relationControlData) {
          const relationControl = props.pageData.controlList.find(
            (item) => item.controlId === relationControlData.controlId
          );
          if (relationControl) {
            //컨트롤 변경 시 연관컨트롤 변경여부 결정
            if (relationControl.values && relationControl.values.length > 0) {
              const codeOption = getControlOption(relationControl.controlId)({
                value: relationControl.values[0].value,
              });
              if (codeOption?.isRelationUpdate === false) {
                continue;
              }
            }
            this.updatePageControlData(relationControlData.controlId, {
              values: [
                {
                  value: relationControlData.value,
                  label: relationControlData.label,
                },
              ],
            });
          }
        }
      }
    }
  }

  updatePageControlData(controlId, data) {
    const { pageId } = this.props.pageData;
    const newData = {
      pageId: pageId,
      controlId: controlId,
      ...(data ?? {}),
    };
    this.props.containerActions.updatePageControlData(newData);
  }

  handleClickSave(e) {
    const prev = this.originControlValues;
    const curr = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    const updateControlValues = getDifferentControlValues(prev, curr);

    this.props.containerActions.triggerUpdateJob({
      pageId: this.props.pageData.pageId,
      allControlValues: curr,
      keyControlValues: this.keyControlValues,
      updateControlValues: updateControlValues,
    });
  }

  handleClickClose(e) {
    this.closePopup();
  }

  closePopup() {
    this.props.containerActions.updatePopupToggle({
      pageId: this.props.pageData.pageId,
      isOpen: false,
    });
  }

  render() {
    const { pageId, controlList, controlValues, formState } =
      this.props.pageData;
    const TIMESPENDHISTORYLIST = controlList.find(
      (ctrl) => ctrl.controlId === "TIMESPENDHISTORYLIST"
    );
    const TIMESPENDESTIMATELIST = controlList.find(
      (ctrl) => ctrl.controlId === "TIMESPENDESTIMATELIST"
    );

    return (
      <>
        <div className="header header-fixed">
          <div className="wrapper-title">{"Detail"}</div>
          <div className="wrapper-toolbar">
            <Button
              icon={"cross"}
              className="btn btn-sm btn-default"
              onClick={this.handleClickClose.bind(this)}
            ></Button>
          </div>
        </div>
        <div className="contents contents-fixed">
          <Form
            {...this.props}
            pageId={pageId}
            formState={formState}
            controlList={controlList}
            controlValues={controlValues}
            containerActions={this.props.containerActions}
          />
        </div>
        <div className="time-spend-list">
          <div>Time Spend Estimate List</div>
          <ul>
            {(TIMESPENDESTIMATELIST?.values || []).map((timeInfo, index) => {
              if (timeInfo.isEventLog) {
                return "";
              }
              return (
                <>
                  <li key={`estimate_${index}`}>
                    <div>
                      {(timeInfo.writeDate ?? "").replace("T", " ")}
                      {timeInfo.finDate ? (
                        <>
                          {"\u00A0\u00A0Estimate Day : "}
                          <span>{moment(timeInfo.finDate).format("YYYY-MM-DD HH:mm")}</span>
                        </>
                      ) : (
                        <>
                          {"\u00A0\u00A0Research Day : "}
                          <span>{timeInfo.estimatePlanTimeInDay}</span>
                          {"Work Day : "}
                          <span>{timeInfo.estimateWorkTimeInDay}</span>
                        </>
                      )}

                      {/* {`Research Day : ${timeInfo.estimatePlanTimeInDay} / Work Day : ${timeInfo.estimateWorkTimeInDay}`} */}
                    </div>
                    <div>{timeInfo.reason}</div>
                  </li>
                </>
              );
            })}
          </ul>
        </div>
        <div className="time-spend-list">
          <div>Time Spend History List</div>
          <ul>
            {(TIMESPENDHISTORYLIST?.values || []).map((timeInfo, index) => {
              const dateSection = timeInfo.isEventLog ? (
                <>
                  {(timeInfo.start ?? "").replace("T", " ")}
                  <Tag
                    key={`event_tag_${index}`}
                    style={{
                      backgroundColor: "#fff0ba",
                      marginLeft: "5px",
                    }}
                  >
                    event
                  </Tag>
                </>
              ) : (
                `${(timeInfo.end ?? "").replace("T", " ")}`
              );

              const reasonSection = (timeInfo.reason ?? "Ing...")
                .split("\n")
                .map((line) => {
                  return (
                    <span>
                      {line}
                      <br />
                    </span>
                  );
                });

              return (
                <>
                  <li key={`history_${index}`}>
                    <div>{dateSection}</div>
                    <div>{reasonSection}</div>
                  </li>
                </>
              );
            })}
          </ul>
        </div>
        <div className="footer footer-fixed">
          <div className="wrapper-toolbar">
            <Button
              className="btn btn-sm btn-default"
              onClick={this.handleClickSave.bind(this)}
            >
              Save (F8)
            </Button>
            <Button
              className="btn btn-sm btn-default"
              onClick={this.handleClickClose.bind(this)}
            >
              Close
            </Button>
          </div>
        </div>
      </>
    );
  }
}
