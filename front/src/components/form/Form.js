import React from "react";
import Control from "components/control/Control";

import { isArray, isNil } from "lodash";

const Form = ({
  pageId,
  formId,
  controlList,
  controlValues,
  containerActions,
  formState,
}) => {
  const formClassName = `wrapper-form wrapper-form-state-${formState}`;
  return (
    <>
      <ul className={formClassName}>
        {controlList.map((control) => {
          let values = controlValues[control.controlId] || control.values;
          let controlFormState =
            control.formState == "full" ? " full-state" : "";
          let isHide = control.hide ? "hidden" : "";

          if (isNil(values) != true && isArray(values) == false) {
            values = [values];
          }
          return (
            <li key={control.controlId} className={isHide + controlFormState}>
              <div className="title">{control.title}</div>
              <div className="form">
                <Control
                  {...control}
                  pageId={pageId}
                  formId={formId}
                  values={values}
                  containerActions={containerActions}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

Form.defaultProps = {
  formId: "",
  controlList: [],
  controlValues: {},
  formState: 1,
};

export default Form;
