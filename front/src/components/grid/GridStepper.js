import React from "react";
// import { makeStyles } from '@material-ui/core/styles';
// import MobileStepper from '@material-ui/core/MobileStepper';
// import IconButton from '@material-ui/core/IconButton';
// import FirstPageIcon from "@material-ui/icons/FirstPage";
// import LastPageIcon from "@material-ui/icons/LastPage";
// import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
// import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { Button, InputGroup } from "@blueprintjs/core";

export default function GridStepper(props) {
  const { stepperOptions, containerActions } = props;
  const { maxPageNum = 1, activePageNum = 1 } = stepperOptions;
  const [search, setSearch] = React.useState("");

  const setActivePage = (activePageNum) => {
    containerActions.triggerFetchJobList({
      activePageNum: activePageNum,
      dontNeedAllAmount: true,
    });
  };

  const handleFirst = () => {
    setActivePage(1);
  };

  const handleBack = () => {
    setActivePage(activePageNum - 1);
  };

  const handleNext = () => {
    setActivePage(activePageNum + 1);
  };

  const handleLast = () => {
    setActivePage(maxPageNum);
  };

  const handleKeydown = (e) => {
    const value = parseInt(e.target.value);
    if (e.key === "Enter") {
      if (value < 1 || !value) {
        setActivePage(1);
      } else if (value > maxPageNum) {
        setActivePage(maxPageNum);
      } else {
        setActivePage(value);
      }

      setSearch("");
    }
  };

  const handleChange = (e) => {
    const value = (e.target.value ?? "").replace(/[^\d]/g, "");
    setSearch(parseInt(value) || "");
  };

  return (
    <div className="grid-stepper">
      <Button
        minimal={true}
        icon={"double-chevron-left"}
        onClick={handleFirst}
        disabled={activePageNum === 1}
      />
      <Button
        minimal={true}
        icon={"chevron-left"}
        onClick={handleBack}
        disabled={activePageNum === 1}
      />
      <InputGroup
        className={"align-center"}
        small={true}
        style={{
          alignSelf: "center",
          width: "40px",
        }}
        value={search}
        onKeyDown={handleKeydown}
        onChange={handleChange}
      />
      <span>
        {activePageNum} / {maxPageNum}
      </span>
      <Button
        minimal={true}
        icon={"chevron-right"}
        onClick={handleNext}
        disabled={activePageNum === maxPageNum}
      />
      <Button
        minimal={true}
        icon={"double-chevron-right"}
        onClick={handleLast}
        disabled={activePageNum === maxPageNum}
      />
    </div>
  );
}
