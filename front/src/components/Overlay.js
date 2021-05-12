import React from "react";
import { Overlay as BPOverlay, Spinner, Intent } from "@blueprintjs/core";

const Overlay = ({ isOpen }) => {
  return (
    <BPOverlay
      className={"bp3-overlay-zindex-21"}
      isOpen={isOpen}
      transitionDuration={50}
      usePortal={false}
    >
      <Spinner size={45} intent={Intent.PRIMARY} />
    </BPOverlay>
  );
};

export default Overlay;
