import React from "react";
import { Button } from "@blueprintjs/core";

const ButtonRenderer = (props) => {
  const { data: rowData, value } = props;
  const intergrated_status = rowData.STATUS?.value;
  const private_status = rowData.PRIVATE_STATUS?.value;
  const isMyJob = value !== null && value !== "otherPaused";
  const playIcon =
    intergrated_status == "30" || private_status == "30"
      ? "stop"
      : value == "paused"
      ? "eject"
      : "play"; // pause
  const className = value == "paused" ? "icon-rotate-90" : null;

  return isMyJob ? (
    <>
      <Button
        className={className}
        alignText={"center"}
        active={value == "30"}
        minimal={true}
        small={true}
        icon={playIcon}
      />
    </>
  ) : (
    ""
  );
};

export default ButtonRenderer;
