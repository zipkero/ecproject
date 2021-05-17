import React from "react";
import { Intent, Spinner } from "@blueprintjs/core";

const IconExcel = (props) => {
  const { spinner } = props;

  return spinner ? (
    <Spinner className="pr-5 spinner-excel" size={20} intent={Intent.PRIMARY} />
  ) : (
    <span className="icon-excel" {...props} />
  );
};

export default IconExcel;
