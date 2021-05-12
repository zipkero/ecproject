import React from "react";
import PropTypes from "prop-types";

import Track from "./Track";

const Tracks = ({ time, tracks, handlePopup }) => (
  <div className="rt-tracks">
    {tracks.map(({ id, trackRows }) => (
      <Track
        key={id}
        time={time}
        trackRows={trackRows}
        handlePopup={handlePopup}
      />
    ))}
  </div>
);

Tracks.propTypes = {
  time: PropTypes.shape({}).isRequired,
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
  clickElement: PropTypes.func,
};

export default Tracks;
