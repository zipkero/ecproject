import React, { useState } from "react";
import { saveAs } from "file-saver";
import makeGanttExcel from "../../excelBuilder";
import IconExcel from "../../../control/IconExcel";

export default function Excel({ baseDate, timebar, tracks }) {
  const [spinner, setSpinner] = useState(false);

  const handleExcel = async () => {
    setSpinner(() => true);
    const workbook = makeGanttExcel(baseDate, timebar, tracks).workbook;
    // 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const blob = new Blob([buffer], { type: fileType });
    saveAs(blob, "Gantt.xlsx");
    setSpinner(() => false);
  };

  return <IconExcel spinner={spinner} onClick={handleExcel}></IconExcel>;
}
