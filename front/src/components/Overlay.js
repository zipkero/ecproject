import React, { PureComponent } from "react";
import { Intent, Overlay as BPOverlay, Spinner } from "@blueprintjs/core";

export default class Overlay extends PureComponent {
  render() {
    const { isOpen } = this.props;
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
  }
}
