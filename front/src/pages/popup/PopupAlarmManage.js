import React, { useCallback, useMemo } from "react";
import Tree from "components/control/Tree";
import { useDispatch } from "react-redux";
import { actions } from "store/actionTypes";
import axios from "axios";
import { getApiUrl } from "store/saga/common";

function PopupAlarmManage(props) {
  const dispatch = useDispatch();
  const userList = window.SCHEDULER_GLOBAL_DATA?.userList || [];

  const getNodes = (userList) => {
    const nodes = [];
    userList.forEach((u) => {
      if (u.relationControlData?.controlId === "TEAM") {
        if (!nodes.some((n) => n.value === u.relationControlData?.value)) {
          nodes.push({
            value: u.relationControlData?.value,
            label: u.relationControlData?.label,
            children: [],
          });
        }

        const node = nodes.find(
          (p) => p.value === u.relationControlData?.value
        );
        if (node) {
          node.children.push({
            label: u.label,
            value: u.value,
          });
        }
      }
    });
    return nodes;
  };

  const nodes = useMemo(() => getNodes(userList), [userList]);

  const onClose = useCallback(() => {
    props.containerActions.updatePopupToggle({
      pageId: props.pageData.pageId,
      isOpen: false,
    });
  }, []);

  const onSave = useCallback(
    (checked) => {
      const saveData = userList
        .filter((x) => checked.includes(x.value))
        .map((x) => {
          return {
            targetId: x.value,
            targetTeam: x.relationControlData?.value,
          };
        });
      actions.toggleProgressOverlay(true);
      const query = `
      mutation ECProject_Job($userId: String!, $alarmList: [UserAlarmInputType]) {
        updateUserAlarm(userId: $userId, alarmList: $alarmList)
      }
      `;
      const variables = {
        userId: window.SCHEDULER_GLOBAL_DATA.userData.id,
        alarmList: saveData,
      };

      axios({
        url: getApiUrl(),
        method: "post",
        data: {
          operationName: "ECProject_Job",
          query: query,
          variables: variables,
        },
      }).then((data) => {
        window.SCHEDULER_GLOBAL_DATA.userData.userAlarm = saveData;
        onClose();
      });
    },
    [dispatch]
  );

  return <Tree nodes={nodes} onSave={onSave} onClose={onClose} />;
}

export default PopupAlarmManage;