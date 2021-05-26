import React from "react";
import { Classes, Tree } from "@blueprintjs/core";
import { actions } from "store/actionTypes";
import { useDispatch } from "react-redux";

const Navigator = () => {
  const dispatch = useDispatch();
  const userData = window.SCHEDULER_GLOBAL_DATA?.userData;
  const [nodes, setNodes] = useState([
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
  ]);

  const userDataComponent = userData ? (
    <div className="header-user">
      <span>{userData.siteName ?? ""}</span>
      {userData.name ?? ""}
    </div>
  ) : (
    <></>
  );

  const handleNodeClick = (nodeData, _nodePath, e) => {
    setNodes((prev) => {
      return forEachNode(prev, (node) => {
        if (node.id === nodeData.id) {
          node.isSelected = true;
        } else {
          if (!e.shiftKey) {
            node.isSelected = false;
          }
        }
      });
    });
    
    dispatch(actions.updateNavigatorActiveMenu(nodeData.menuId));
  };

  const handleNodeCollapse = (nodeData) => {
    setNodes((prev) => {
      return forEachNode(prev, (node) => {
        if (node.id === nodeData.id) {
          node.isExpanded = false;
        }
      });
    });
  };

  const handleNodeExpand = (nodeData) => {
    setNodes((prev) => {
      return forEachNode(prev, (node) => {
        if (node.id === nodeData.id) {
          node.isExpanded = true;
        }
      });
    });
  };

  const forEachNode = (nodes, callback) => {
    if (nodes == null) {
      return;
    }

    return nodes.map((node) => {
      callback(node);
      if (node.childNodes) {
        node.childNodes = {
          ...forEachNode(node.childNodes, callback),
        };
      }
      return {
        ...node,
      };
    });
  };

  return (
    <div className="navigator-template">
      {userDataComponent}
      <Tree
        contents={nodes}
        onNodeClick={handleNodeClick}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
        className={Classes.ELEVATION_0}
      />
    </div>
  );
};

export default Navigator;
