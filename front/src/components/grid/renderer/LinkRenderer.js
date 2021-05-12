import React from "react";

const LinkRenderer = (props) => {
  const { data: rowData, value } = props;

  const handleClick = (e) => {};

  return <a onClick={handleClick}>{value}</a>;
};

export default LinkRenderer;
