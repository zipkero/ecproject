import React, { useCallback } from "react";
import Form from "components/form/Form";
import { Button, Tag } from "@blueprintjs/core";

function transformJobCodeValuesForLabel(JOBCODE) {
  // popup은 맨 처음 TRIGGER에 한번 UPDATE 할 때 서버에서 값을 받아와서 정보를 갱신한다.
  // 이떄 JOBCODE의 values는 계속 유지되며 참조값이기 때문에 사용 및 변경에 유의
  if (JOBCODE.values[0]) {
    const { value, label } = JOBCODE.values[0];
    if (typeof value === "string" && typeof label === "string") {
      JOBCODE.values[0] = `${value}  ${label}`;
    }
  }
}

export default function PopupGanttDetail(props) {
  const { pageData, containerActions } = props;
  const neededControlId = [
    "TIMESPENDHISTORYLIST",
    "TIMESPENDESTIMATELIST",
    "JOBCODE",
  ];

  const {
    TIMESPENDHISTORYLIST,
    TIMESPENDESTIMATELIST,
    JOBCODE,
  } = pageData.controlList.reduce((acc, control) => {
    if (neededControlId.includes(control.controlId)) {
      acc[control.controlId] = control;
      return acc;
    }
    return acc;
  }, {});

  const handleClickClose = useCallback(() => {
    containerActions.updatePopupToggle({
      pageId: pageData.pageId,
      isOpen: false,
    });
  }, [containerActions]);

  transformJobCodeValuesForLabel(JOBCODE);

  const { pageId, formState, controlValues, controlList } = pageData;
  return (
    <>
      <div className="header header-fixed">
        <div className="wrapper-title">Gantt Detail</div>
        <div className="wrapper-toolbar">
          <Button
            icon={"cross"}
            className="btn btn-sm btn-default"
            onClick={handleClickClose}
          ></Button>
        </div>
      </div>
      <div className="contents contents-fixed">
        <Form
          {...props}
          pageId={pageId}
          formState={formState}
          controlList={controlList}
          controlValues={controlValues}
          containerActions={containerActions}
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
                    {"\u00A0\u00A0Research Day : "}
                    <span>{timeInfo.estimatePlanTimeInDay}</span>
                    {"Work Day : "}
                    <span>{timeInfo.estimateWorkTimeInDay}</span>
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
          <Button className="btn btn-sm btn-default" onClick={handleClickClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
