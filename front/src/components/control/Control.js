import React from "react";
import Select from "components/control/Select";
import MultiSelect from "components/control/MultiSelect";
import RadioBasic from "components/control/RadioBasic";
import Input from "components/control/Input";
import DateInput from "components/control/DateInput";
import Textarea from "components/control/Textarea";
import Label from "components/control/Label";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

const CONTROL_COMPONENT_TYPE = {
  SELECT: Select,
  MULTISELECT: MultiSelect,
  RADIOBASIC: RadioBasic,
  INPUT: Input,
  DATEINPUT: DateInput,
  TEXTAREA: Textarea,
  LABEL: Label,
};

const Control = (props) => {
  const { type } = props;
  const ControlComponent = CONTROL_COMPONENT_TYPE[type.toUpperCase()];
  if (!ControlComponent) {
    return <>null</>;
  } else {
    return <ControlComponent {...props} />;
  }
};

export default Control;
