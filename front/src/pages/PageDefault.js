import React, { Component } from "react";
import Grid from "components/grid/Grid";
import Form from "components/form/Form";
import GanttApp from "components/GanttApp";
import { Button } from "@blueprintjs/core";
import { getParsedControlValuesByControlList } from "../common";

export default class PageDefault extends Component {
  constructor(props) {
    super(props);

    this.state = {
      usedGrid: props.pageData.usedGrid,
      searchControlList: null,
    };
    if (props.pageData.usedGrid) {
      props.pageData.gridList = [
        props.pageData.gridListBox.find(
          (item) => item.gridId == props.pageData.usedGrid
        ),
      ];
    }
  }

  componentWillUnmount() {
    if (this.state.usedGrid) {
      this.props.pageData.usedGrid = this.state.usedGrid;
      this.props.pageData.gridList = [];
    }
    this.executeReset();
  }

  componentDidUpdate(prevProps) {
    const prevControlValues = getParsedControlValuesByControlList(
      prevProps.pageData.controlList
    );
    const controlValues = getParsedControlValuesByControlList(
      this.props.pageData.controlList
    );
    const { REPORTTYPE: prevREPORTTYPE } = prevControlValues;
    const { REPORTTYPE } = controlValues;

    if (prevREPORTTYPE !== REPORTTYPE) {
      if (this.props.pageData.usedGrid) {
        this.props.pageData.usedGrid = REPORTTYPE ?? this.state.usedGrid; // search reset 에 의해 REPORTTYPE 값이 undefined 로 들어올 수 있다.
        this.props.pageData.gridList = [
          this.props.pageData.gridListBox.find(
            (item) => item.gridId == this.props.pageData.usedGrid
          ),
        ];
        this.props.containerActions.triggerFetchJobList();
      }
    }
  }

  handleClickSearch(e) {
    this.state.searchControlList = this.props.pageData?.controlList;
    const resultOfValidate = this.props.validateControlList?.(
      this.state.searchControlList
    );
    if (resultOfValidate?.validity === false) {
      this.props.containerActions.updatePopupToggle({
        pageId: "PopupNotice",
        isOpen: true,
        controlValues: { NOTICE: resultOfValidate.message },
      });
      return;
    }
    this.executeSearch();
  }

  handleClickReset(e) {
    this.executeReset();
  }

  executeReset() {
    this.props.containerActions.resetPageState({
      pageId: this.props.pageData.pageId,
      resetOnlyControlData: true,
    });
  }

  executeSearch() {
    this.props.containerActions.triggerFetchJobList({
      activePageNum: 1,
    });
  }

  render() {
    const {
      pageData,
      containerActions,
      useSearchBtn,
      useResetBtn,
    } = this.props;
    const { pageId, gridList, controlList, formState, tracks } = pageData;
    const formId = pageId + "_form";
    const formComponent =
      (controlList ?? []).length > 0 ? (
        <div className="form">
          <Form
            containerActions={containerActions}
            pageId={pageId}
            formId={formId}
            controlList={controlList}
            formState={formState}
          />
        </div>
      ) : (
        <></>
      );
    const searchControlList = this.state.searchControlList;
    const gridComponent = (gridList || []).map((gridData) => {
      return (
        <div
          className={`grid ${gridData.isSpread !== false ? "" : "flex-none"}`}
          key={gridData.gridId}
        >
          <Grid
            {...gridData}
            searchControlList={searchControlList}
            containerActions={containerActions}
            pageId={pageId}
          />
        </div>
      );
    });
    const GanttComponent = tracks ? (
      <GanttApp
        {...pageData}
        tracks={tracks}
        searchControlList={searchControlList}
        containerActions={containerActions}
        pageId={pageId}
      />
    ) : null;

    return (
      <>
        {formComponent}
        <div>
          {useSearchBtn ? (
            <Button
              icon={"search"}
              className="btn btn-sm btn-default"
              onClick={this.handleClickSearch.bind(this)}
            >
              Search
            </Button>
          ) : (
            <></>
          )}
          {useResetBtn ? (
            <Button
              icon={"reset"}
              className="btn btn-sm btn-default"
              onClick={this.handleClickReset.bind(this)}
            >
              Reset
            </Button>
          ) : (
            <></>
          )}
        </div>
        {gridComponent}
        {GanttComponent}
      </>
    );
  }
}
