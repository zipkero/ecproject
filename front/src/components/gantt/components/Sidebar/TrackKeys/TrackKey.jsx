import React from "react";
import CustomElement from "../CustomElement";
import PropTypes from "prop-types";

const TrackKey = ({ track }) => {
  const { pic, team, trackRows } = track;
  const items = [team, pic];
  const BORDER_SIZE = 1;
  const currentTrackHeight = trackRows.length * (35 + BORDER_SIZE);
  return <CustomElement items={items} style={{ height: currentTrackHeight }} />;
};

TrackKey.propTypes = {
  track: PropTypes.shape({
    title: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.shape({})),
    isOpen: PropTypes.bool,
    hasButton: PropTypes.bool,
    sideComponent: PropTypes.element,
  }),
};

export default TrackKey;
