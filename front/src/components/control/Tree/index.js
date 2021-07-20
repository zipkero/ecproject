import React, { useCallback, useState } from "react";
import CheckboxTree from "react-checkbox-tree";
import "./style.css";
import { Button, Intent } from "@blueprintjs/core";

function Tree({ nodes, onSave, onClose }) {
  const userAlarmData = window.SCHEDULER_GLOBAL_DATA?.userData?.userAlarm || [];

  const [checked, setChecked] = useState(userAlarmData.map((x) => x.targetId));
  const [expanded, setExpanded] = useState(nodes.map((n) => n.value));
  const onTreeClick = (checked) => {
    setChecked(checked);
  };
  const onTreeExpand = (expanded) => {
    setExpanded(expanded);
  };

  const onClickSave = () => {
    onSave(checked);
  };

  return (
    <>
      <div
        className="contents"
        style={{
          overflowY: "auto",
          height: "500px",
        }}
      >
        <CheckboxTree
          nodes={nodes}
          checked={checked}
          expanded={expanded}
          onCheck={onTreeClick}
          onExpand={onTreeExpand}
        />
      </div>
      <div className="footer">
        <div className="wrapper-toolbar">
          <Button
            className="btn btn-primary"
            small={true}
            onClick={onClickSave}
          >
            Save
          </Button>
          <Button className="btn btn-default" small={true} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

export default Tree;