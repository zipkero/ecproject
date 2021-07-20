/* eslint-disable import/no-unresolved */
import React from "react";
import Timeline from "components/gantt/index";
import GanttExcel from "./gantt/components/Excel";
import GridStepper from "components/grid/GridStepper";
import "lib/css/style.css";

import { BaseDate, BuildTimebar, BuildTracks } from "components/gantt/builders";

const now = new Date();

const MIN_ZOOM = 2;
const MAX_ZOOM = 20;

function GanttApp(props) {
  const { controlList, tracks, holiday, stepperOptions, containerActions } =
    props;

  const startFrom = controlList.find(
    (control) => control.controlId === "START_FROM"
  );
  const startTo = controlList.find(
    (control) => control.controlId === "START_TO"
  );
  const startDateString = startFrom.values[0];
  const endDateString = startTo.values[0];

  const baseDate = new BaseDate(startDateString, endDateString);
  const buildTimebar = new BuildTimebar(baseDate, holiday);
  const buildTracks = new BuildTracks(baseDate, tracks);

  const open = false;
  const zoom = 2;
  const ganttTracks = buildTracks.tracks;
  const { timebar } = buildTimebar;
  const { baseStartDate, baseEndDate } = baseDate;

  const stepper = stepperOptions ? (
    <GridStepper
      stepperOptions={stepperOptions}
      containerActions={containerActions}
    />
  ) : (
    ""
  );

  const handlePopup = ({ JOBCODE, WRITEDATE, PIC, CATEGORY }) => {
    containerActions.triggerOpenPopup({
      parentPageId: "Gantt",
      pageId: "PopupGanttDetail",
      isOpen: true,
      from: "",
      keyControlValues: {
        JOBCODE,
        CATEGORY,
        PIC,
        WRITEDATE
      }
    });
  };

  const handleToggleOpen = () => {
    // this.setState(({ open }) => ({ open: !open }))
  };

  const handleZoomIn = () => {
    // this.setState(({ zoom }) => ({ zoom: Math.min(zoom + 1, MAX_ZOOM) }))
  };

  const handleZoomOut = () => {
    // this.setState(({ zoom }) => ({ zoom: Math.max(zoom - 1, MIN_ZOOM) }))
  };
  return (
    <div className="gantt-app">
      {/* {stepper} */}
      <div className="gantt-header">
        <GanttExcel
          baseDate={baseDate}
          timebar={timebar}
          tracks={ganttTracks}
        />
      </div>
      <Timeline
        scale={{
          start: baseStartDate,
          end: baseEndDate,
          zoom,
          zoomMin: MIN_ZOOM,
          zoomMax: MAX_ZOOM
        }}
        isOpen={open}
        toggleOpen={handleToggleOpen}
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        timebar={timebar}
        tracks={ganttTracks}
        now={now}
        handlePopup={handlePopup}
        enableSticky
        scrollToNow
      />
    </div>
  );
}

function onlyRenderWhenChangedTracks(prevProps, nextProps) {
  // 참이면 render 하지 않음
  // track이 바뀌는 경우 외에는 re-rendering 하지 않음
  return prevProps.tracks === nextProps.tracks;
}

export default React.memo(GanttApp, onlyRenderWhenChangedTracks);
