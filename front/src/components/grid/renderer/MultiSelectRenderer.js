import React from "react";
import { Tag } from "@blueprintjs/core";
import { getContrastColor } from "common";

const MultiSelectRenderer = (props) => {
  const { data: rowData, value = [] } = props;
  const hasValue = value.length > 0;

  const tagRenderer = (item) => {
    const color = item.color;
    return (
      <Tag
        style={
          color
            ? {
                backgroundColor: color,
                color: getContrastColor(color),
                marginRight: "5px",
              }
            : {
                marginRight: "5px",
              }
        }
      >
        {item.label}
      </Tag>
    );
  };

  return hasValue ? (
    value.map((item) => {
      return tagRenderer(item);
    })
  ) : (
    <>{""}</>
  );
};

export default MultiSelectRenderer;
