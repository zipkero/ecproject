import React from "react";
import { Intent, Spinner } from "@blueprintjs/core";

const IconExcel = (props) => {
  const { spinner, ...rest } = props;

  if (!spinner) {
    return <span className="icon-excel" {...rest} />;
  }
  return (
    <Spinner className="pr-5 spinner-excel" size={20} intent={Intent.PRIMARY} />
  );
};

export default IconExcel;
