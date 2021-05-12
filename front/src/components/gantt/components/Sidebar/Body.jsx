import React from "react";
import PropTypes from "prop-types";

import TrackKeys from "./TrackKeys";

const Body = ({ tracks }) => (
  <div className="">
    <TrackKeys tracks={tracks} />
  </div>
);

Body.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
};

export default Body;
