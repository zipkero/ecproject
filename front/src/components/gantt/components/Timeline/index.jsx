import React, { Component, useState } from "react";
import PropTypes from "prop-types";

import Header from "./Header";
import Body from "./Body";
import NowMarker from "./Marker/Now";
import PointerMarker from "./Marker/Pointer";
import getMouseX from "../../utils/getMouseX";
import getGrid from "../../utils/getGrid";

function Timeline({ now, time, timebar, tracks, sticky, handlePopup }) {
  const [state, setState] = useState({
    pointerDate: null,
    pointerVisible: false,
    pointerHighlighted: false,
  });

  const { pointerDate, pointerVisible, pointerHighlighted } = state;

  const grid = getGrid(timebar);

  const handleMouseMove = (e) => {
    // const { time } = this.props
    // this.setState({ pointerDate: time.fromX(getMouseX(e)) })
  };

  const handleMouseLeave = () => {
    // this.setState({ pointerHighlighted: false })
  };

  const handleMouseEnter = () => {
    // this.setState({ pointerVisible: true, pointerHighlighted: true })
  };

  return (
    <div className="rt-timeline" style={{ width: time.timelineWidthStyle }}>
      {/* {now && <NowMarker now={now} visible time={time} />}
      {pointerDate && (
        <PointerMarker date={pointerDate} time={time} visible={pointerVisible} highlighted={pointerHighlighted} />
      )} */}
      <Header
        time={time}
        timebar={timebar}
        onMove={handleMouseMove}
        onEnter={handleMouseEnter}
        onLeave={handleMouseLeave}
        width={time.timelineWidthStyle}
        sticky={sticky}
      />
      <Body time={time} grid={grid} tracks={tracks} handlePopup={handlePopup} />
    </div>
  );
}

Timeline.propTypes = {
  now: PropTypes.instanceOf(Date),
  time: PropTypes.shape({
    fromX: PropTypes.func.isRequired,
    toStyleLeftAndWidth: PropTypes.func,
    timelineWidthStyle: PropTypes.string,
  }).isRequired,
  timebar: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
    }).isRequired
  ).isRequired,
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
  sticky: PropTypes.shape({}),
};

export default React.memo(Timeline);
