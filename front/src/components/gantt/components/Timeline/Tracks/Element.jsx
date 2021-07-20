/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from "react";
import PropTypes from "prop-types";

import BasicElement from "../../Elements/Basic";

const Element = (props) => {
  const { time, popupData, handlePopup, start, end } = props;

  const elementStyle = {
    ...time.toStyleLeftAndWidth(start, end),
    ...(handlePopup ? { cursor: "pointer" } : {})
  };

  return (
    <div
      className="rt-track__element"
      style={elementStyle}
      onClick={() => handlePopup(popupData)}
    >
      <BasicElement {...props} />
    </div>
  );
};

Element.propTypes = {
  time: PropTypes.shape({
    toStyleLeftAndWidth: PropTypes.func
  }).isRequired,
  style: PropTypes.shape({}),
  classes: PropTypes.shape({}),
  dataSet: PropTypes.shape({}),
  title: PropTypes.string,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  tooltip: PropTypes.string
};

export default Element;
