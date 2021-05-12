import React, { PureComponent } from "react";
import Form from "components/form/Form";
import {
  getParsedControlValuesByControlList,
  getDifferentControlValues,
} from "common";
import { isArray, includes } from "lodash";
import { Button } from "@blueprintjs/core";

export default class PopupCreateNewJob extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      popupTitle: "New Job",
    };

    if (props.pageData.from === "Create Request") {
      this.state.popupTitle = props.pageData.from;

      props.pageData.controlList.map((ctrl) => {
        switch (ctrl.controlId) {
          case "TEAM":
            ctrl.useRelationControlData = false; // PIC ==> TEAM =X=> CATEGORY
            break;
          case "PRIORITY2":
            ctrl.hide = false;
            break;
        }
      });
    } else if (props.pageData.from === "Request QA") {
      this.state.popupTitle = props.pageData.from;

      props.pageData.controlList.map((ctrl) => {
        switch (ctrl.controlId) {
          case "TEAM":
            ctrl.useRelationControlData = false;
            break;
          case "PRIORITY2":
            ctrl.hide = false;
            break;
        }
      });
    } else if (props.pageData.from === "Create Support") {
      this.state.popupTitle = props.pageData.from;

      props.pageData.controlList.map((ctrl) => {
        switch (ctrl.controlId) {
          case "TEAM":
            ctrl.useRelationControlData = false;
            break;
          case "CATEGORY":
          case "HOWTODEV":
          case "REASONFORDEV":
          case "COMMONORNOT":
            ctrl.hide = true;
            break;
        }
      });
    }

    // 게시판 종류 설정 (boardType은 그리드에 없는 데이터 이기 때문에 Grid.js onCellContextMenu 함수가 아닌 여기서 세팅)
    const boardType = props.pageData.controlList.find(
      (ctrl) => ctrl.controlId === "BOARDTYPE"
    );
    const userData = window.SCHEDULER_GLOBAL_DATA?.userData; // 주의: userData.site (code) 와 codeUserGroupList[n].site (name) 가 다르다.
    boardType.values = [];
    //const boardTypeByTeam = props.pageData.controlList.find(item=>item.controlId==="TEAM")?.items?.find(item=>item.label===userData.siteName)?.baseBoard; // 추후 필요시 사용
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

    this.handleKeydownOnPage = this.handleKeydownOnPage.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener("keydown", this.handleKeydownOnPage);
  }

  componentDidUpdate(prevProps) {
    this.updateJobCodeCheckbox(prevProps, this.props);
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
    const { TEAM, BOARDTYPE } = updateControlValues;

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

  updateJobCodeCheckbox(prevProps, props) {
    const prevCodeCheckbox = prevProps.pageData.controlList.find(
      (ctrl) => ctrl.controlId === "JOBCODE"
    ).checkboxData;
    const currCodeCheckbox = props.pageData.controlList.find(
      (ctrl) => ctrl.controlId === "JOBCODE"
    ).checkboxData;

    if (prevCodeCheckbox?.checked !== currCodeCheckbox?.checked) {
      this.updatePageControlData("JOBTITLE", {
        hide: !currCodeCheckbox?.checked,
      });
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
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    this.props.containerActions.triggerCreateNewJob({
      pageId: this.props.pageData.pageId,
      from: this.props.pageData.from,
      controlValues: controlValues,
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
    const { controlList, controlValues, pageId } = this.props.pageData;
    const { popupTitle } = this.state;

    return (
      <>
        <div className="header">
          <div className="wrapper-title">{popupTitle}</div>
          <div className="wrapper-toolbar">
            <Button
              icon={"cross"}
              className="btn btn-sm btn-default"
              onClick={this.handleClickClose.bind(this)}
            ></Button>
          </div>
        </div>
        <div className="contents">
          <Form
            pageId={pageId}
            formId={"PopupNewForm"}
            controlList={controlList}
            controlValues={controlValues}
            containerActions={this.props.containerActions}
          />
        </div>
        <div className="footer">
          <div className="wrapper-toolbar">
            <Button
              className="btn btn-primary"
              onClick={this.handleClickSave.bind(this)}
            >
              Save (F8)
            </Button>
            <Button
              className="btn btn-default"
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
