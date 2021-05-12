import React, { PureComponent } from "react";

import { ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";

export default class GridContextMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isContextMenuOpen: false,
    };
  }

  render() {
    const classes = `context-menu-node ${
      this.state.isContextMenuOpen ? "context-menu-open" : ""
    }`;
    return <div className={classes} onContextMenu={this.showContextMenu} />;
  }

  showContextMenu = (e) => {
    e.preventDefault();

    ContextMenu.show(
      <Menu>
        <MenuItem icon="search-around" text="Search around..." />
        <MenuItem icon="search" text="Object viewer" />
        <MenuItem icon="graph-remove" text="Remove" />
        <MenuItem icon="group-objects" text="Group" />
        <MenuDivider />
        <MenuItem disabled={true} text="Clicked on node" />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => this.setState({ isContextMenuOpen: false })
    );
    this.setState({ isContextMenuOpen: true });
  };
}
