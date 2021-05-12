import React from "react";
import PropTypes from "prop-types";
import { getDayMonth } from "../../utils/formatDate";
import createClasses from "../../utils/classes";

const buildDataAttributes = (attributes = {}) => {
  const value = {};
  Object.keys(attributes).forEach((name) => {
    value[`data-${name}`] = attributes[name];
  });
  return value;
};

const Basic = ({ title, start, end, style, classes, dataSet, tooltip }) => {
  const { textAlign, tooltipPosition, undoneJob } = classes;
  return (
    <div
      className={createClasses("rt-element", `${textAlign} ${undoneJob}`)}
      style={style}
      {...buildDataAttributes(dataSet)}
    >
      <div className="rt-element__content" aria-hidden="true">
        <span className="rt-element__title">{title}</span>
      </div>
      <div className={createClasses("rt-element__tooltip", tooltipPosition)}>
        {tooltip ? (
          // eslint-disable-next-line react/no-danger
          <div
            dangerouslySetInnerHTML={{
              __html: tooltip.split("\n").join("<br>"),
            }}
          />
        ) : (
          <div>
            <div>{title}</div>
            <div>
              <strong>시작</strong> {getDayMonth(start)}
            </div>
            {undoneJob ? (
              "개발 진행중"
            ) : (
              <div>
                <strong>종료</strong> {getDayMonth(end)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Basic.propTypes = {
  title: PropTypes.string.isRequired,
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  style: PropTypes.shape({}),
  classes: PropTypes.shape({}),
  dataSet: PropTypes.shape({}),
  tooltip: PropTypes.string,
};

export default Basic;
