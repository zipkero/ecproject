import React from "react";
import { Popover } from "@blueprintjs/core";
import useFetch from "hooks/useFetch";
import fetchReviewHistory from "../../../store/saga/fetchReviewHistory";
import { getParsedDate } from "../../../common";

/**
 * 진행상태 컬럼 렌더러
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function ProgressRenderer(props) {
  const progressObj = props.value?.split("|");
  return (
    <div
      style={{
        height: "30px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {progressObj &&
        progressObj.map((k, number) => (
          <ProgressCircle
            key={number}
            index={number}
            rowData={props.data}
            value={k}
          />
        ))}
    </div>
  );
}

function ProgressCircle(props) {
  const { value, index, rowData } = props;
  let color = "#E1E1E1";
  switch (value) {
    case "0":
    case "10":
      color = "#FFC177";
      break;
    case "30":
      color = "green";
      break;
    case "70":
      color = "black";
      break;
    default:
    case "-1":
      break;
  }
  return (
    <>
      {index > 0 && (
        <div
          style={{
            width: "5px",
            height: "2px",
            border: "none",
            backgroundColor: "gray",
          }}
        />
      )}
      <Popover
        content={
          <ProgressHistory category={index} rowData={rowData} value={value} />
        }
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            backgroundColor: `${color}`,
            border: `3px solid white`,
            borderRadius: "50%",
            boxShadow: "1px 1px gray",
            cursor: "pointer",
          }}
        />
      </Popover>
    </>
  );
}

const getProgressCategoryName = (category) => {
  switch (category) {
    case 10:
      return "Plan.Exp";
    case 20:
      return "Analyze.Review";
    case 30:
      return "Mid.Review";
    case 40:
      return "Final.Review";
    default:
      return "";
  }
};

function ProgressHistory(props) {
  const code = props.rowData.JOBCODE.value;
  // [10, 20, 30, 40]
  const category = 10 * props.category + 10;
  const type = props.value;
  const history = useFetch({
    deps: [code, category],
    fetch: () => {
      return fetchReviewHistory({ code, category });
    },
    initial: [],
  });

  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      <p>{getProgressCategoryName(category)}</p>
      {history.length < 1
        ? type === "-1"
          ? `None`
          : `Request`
        : history.map((h) => (
            <div>
              {getParsedDate(h.writeDate)} {h.status.name}
            </div>
          ))}
    </div>
  );
}

export default ProgressRenderer;
