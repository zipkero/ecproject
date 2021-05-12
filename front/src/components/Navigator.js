import React, { Component } from "react";
import { Classes, Tree, Tabs, Tab } from "@blueprintjs/core";

export default class Navigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [
        {
          id: "MyMenu",
          menuId: "MyJob",
          isExpanded: true,
          label: "My Menu",
          childNodes: [
            {
              id: "MyJob",
              menuId: "MyJob",
              label: "My Job",
              isSelected: true,
            },
            {
              id: "MyTeam",
              menuId: "MyTeam",
              label: "My Team",
            },
            {
              id: "MyPost",
              menuId: "MyPost",
              label: "My Post",
            },
          ],
        },
        {
          id: "AllMenu",
          menuId: "ByTeam",
          label: "All Menu",
          isExpanded: true,
          childNodes: [
            {
              id: "ByTeam",
              menuId: "ByTeam",
              label: "By Team",
            },
            {
              id: "ByJob",
              menuId: "ByJob",
              label: "By Job",
            },
            {
              id: "ProgressedInTest",
              menuId: "ProgressedInTest",
              label: "Progressed In Test",
            },
            {
              id: "UnAllocatedSupportTest",
              menuId: "UnAllocatedSupportTest",
              label: "Unalloacted Support/Test",
            },
            {
              id: "UnAllocatedDev",
              menuId: "UnAllocatedDev",
              label: "UnAllocated Dev",
            },
            {
              id: "UnAllocatedPlan",
              menuId: "UnAllocatedPlan",
              label: "UnAllocated Plan",
            },
            {
              id: "All",
              menuId: "AllJob",
              label: "All Job",
            },
            {
              id: "ETCCategory",
              menuId: "ETCCategory",
              label: "ETC Category",
            },
            {
              id: "Report",
              menuId: "Report",
              label: "Report",
            },
            {
              id: "Gantt",
              menuId: "Gantt",
              label: "Gantt",
            },
          ],
        },
        {
          id: "AllMenuMgmt",
          menuId: "ByTeamForMgmt",
          isExpanded: true,
          label: "All Menu (Mgmt.)",
          childNodes: [
            {
              id: "ByTeamForMgmt",
              menuId: "ByTeamForMgmt",
              label: "By Team",
            },
            {
              id: "UnAllocatedJobForMgmt",
              menuId: "UnAllocatedJobForMgmt",
              label: "UnAllocated Job",
            },
          ],
        },
      ],
    };
  }

  handleNodeClick(nodeData, _nodePath, e) {
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, (n) => (n.isSelected = false));
    }
    nodeData.isSelected = true;
    this.setState(this.state);
    this.props.containerActions.updateNavigatorActiveMenu(nodeData.menuId);
  }

  handleNodeCollapse(nodeData) {
    nodeData.isExpanded = false;
    this.setState(this.state);
  }

  handleNodeExpand(nodeData) {
    nodeData.isExpanded = true;
    this.setState(this.state);
  }

  forEachNode(nodes, callback) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }

  render() {
    const userData = window.SCHEDULER_GLOBAL_DATA?.userData;
    const userDataComponent = userData ? (
      <div className="header-user">
        <span>{userData.siteName ?? ""}</span>
        {userData.name ?? ""}
      </div>
    ) : (
      <></>
    );
    return (
      <div className="navigator-template">
        {userDataComponent}
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick.bind(this)}
          onNodeCollapse={this.handleNodeCollapse.bind(this)}
          onNodeExpand={this.handleNodeExpand.bind(this)}
          className={Classes.ELEVATION_0}
        />
      </div>
    );
  }
}
