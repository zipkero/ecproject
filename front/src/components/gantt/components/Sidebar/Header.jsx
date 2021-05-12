import React, { useState } from "react";
import CustomElement from "./CustomElement";
import PropTypes from "prop-types";

const sideBarItems = ["Team", "PIC"];

const Header = ({
  sticky: { isSticky, sidebarWidth, timelineTopPosition, headerHeight } = {},
}) => {
  return (
    <div style={isSticky ? { paddingTop: headerHeight } : {}}>
      <div
        className={`rt-sidebar__header ${isSticky ? "rt-is-sticky" : ""}`}
        style={
          isSticky ? { width: sidebarWidth, top: timelineTopPosition } : {}
        }
      >
        <CustomElement />
        <CustomElement />
        <CustomElement items={sideBarItems} />
      </div>
    </div>
  );
};

Header.propTypes = {
  sticky: PropTypes.shape({
    isSticky: PropTypes.bool.isRequired,
    headerHeight: PropTypes.number.isRequired,
    sidebarWidth: PropTypes.number.isRequired,
  }),
};

export default Header;
