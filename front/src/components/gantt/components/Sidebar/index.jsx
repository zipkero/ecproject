import React from "react";
import PropTypes from "prop-types";

import Header from "./Header";
import Body from "./Body";

const Sidebar = ({ tracks, sticky }) => (
  <div className="rt-sidebar">
    <Header sticky={sticky} />
    <Body tracks={tracks} />
  </div>
);

Sidebar.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
  sticky: PropTypes.shape({}),
};

export default Sidebar;
