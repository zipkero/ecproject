import React from "react";
import PropTypes from "prop-types";

import TrackKey from "./TrackKey";

const TrackKeys = ({ tracks }) => (
  <div className="">
    {tracks.map((track) => (
      <TrackKey key={track.id} track={track} />
    ))}
  </div>
);

TrackKeys.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
};

export default TrackKeys;
