import React, { useCallback } from "react";
import PropTypes from "prop-types";

import Tracks from ".";
import Element from "./Element";

// data structure: [ [], [], [] ] 각 배열이 하나의 row 배열 요소들은 elements
const Track = ({ time, trackRows, handlePopup }) => (
  <div className="tr-track">
    {trackRows.map((elements, idx) => (
      <TrackRow
        key={idx}
        time={time}
        elements={elements}
        handlePopup={handlePopup}
      />
    ))}
  </div>
);

Track.propTypes = {
  time: PropTypes.shape({}).isRequired,
  trackRows: PropTypes.arrayOf(PropTypes.array).isRequired,
  tracks: PropTypes.arrayOf(PropTypes.shape({})),
};

const TrackRow = ({ time, elements, handlePopup }) => {
  const validateDate = useCallback(({ start, end }) => end > start, []);

  return (
    <div className="rt-track__elements">
      {elements.filter(validateDate).map((element) => (
        <Element
          key={element.id}
          time={time}
          handlePopup={handlePopup}
          {...element}
        />
      ))}
    </div>
  );
};

export default React.memo(Track);
