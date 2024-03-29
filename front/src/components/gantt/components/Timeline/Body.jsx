import React from "react";
import PropTypes from "prop-types";

import Tracks from "./Tracks";
import Grid from "./Grid";

const Body = ({ time, grid, tracks, handlePopup }) => (
  <div className="rt-timeline__body">
    {grid && <Grid time={time} grid={grid} />}
    <Tracks time={time} tracks={tracks} handlePopup={handlePopup} />
  </div>
);

Body.propTypes = {
  time: PropTypes.shape({}).isRequired,
  grid: PropTypes.arrayOf(PropTypes.shape({})),
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
};

export default React.memo(Body);
