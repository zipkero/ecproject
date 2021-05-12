import React, { PureComponent } from "react";
// import FormControl from '@material-ui/core/FormControl';
// import MenuItem from '@material-ui/core/MenuItem';
// import Select from '@material-ui/core/Select';
import Select from "components/control/Select";
import { isEqual } from "lodash";

export default class SelectEditor extends PureComponent {
  constructor(props) {
    super(props);

    // ETC category 일 경우 수정 불가능하도록
    const isETCCategory = props.data.CATEGORY?.value === 999999;
    if (isETCCategory) {
      this.stopEditing(true);
    }

    this.bodyClickHandler = this.bodyClickHandler.bind(this);
    this.state = {
      value: this.props.value,
      setFocusInput: false,
    };
  }

  afterGuiAttached() {
    this.setState({ setFocusInput: true });
  }

  bodyClickHandler(e) {
    if (
      e.target.closest("div.ag-popup-editor") === null &&
      e.target.closest("div.bp3-portal") === null
    ) {
      this.stopEditing(true);
    }
  }

  componentDidMount() {
    document.body.addEventListener("mousedown", this.bodyClickHandler);
  }

  componentWillUnmount() {
    document.body.removeEventListener("mousedown", this.bodyClickHandler);
  }

  getValue() {
    return this.state.value;
  }

  isPopup() {
    return true;
  }

  handleChange(values) {
    const { data, agGridReact, colDef } = this.props;
    const { containerActions } = agGridReact.props;
    const field = colDef.field;
    const newValue = values?.length > 0 ? values[0] : undefined;
    const oldValue = data[field];

    // 이전 값과 같은 값으로 변경시 stopEditing
    if (newValue?.value && isEqual(oldValue?.value, newValue?.value)) {
      this.stopEditing(true);
      return false;
    }

    if (newValue) {
      if (
        (field === "STATUS" && newValue.value === 50) ||
        newValue.value === 1000
      ) {
        // hold, cancel 은 팝업에서 reason 입력할 수 있도록 PopupChangeStatus open
        this.stopEditing(true);
        containerActions.triggerOpenPopup({
          pageId: "PopupChangeStatus",
          isOpen: true,
          keyControlValues: data,
          updateControlValues: {
            STATUS: newValue,
          },
        });
      } else {
        this.setState(
          { value: newValue },
          function () {
            this.stopEditing();
          }.bind(this)
        );
      }
    } else {
      this.setState({ value: newValue });
    }
  }

  stopEditing(cancel) {
    const { api, colDef } = this.props;
    const field = colDef.field;

    // CATEGORY, STATUS 는 빈 값으로 수정할 수 없으므로 cancel 처리
    if (["CATEGORY", "STATUS"].includes(field) && !this.state?.value) {
      cancel = true;
    }
    api.stopEditing(cancel);
  }

  render() {
    const value = this.state.value ? [this.state.value] : [];
    const { items = [] } = this.props.colDef.cellEditorParams;

    return (
      <div style={{ display: "flex" }}>
        <Select
          values={value}
          items={items}
          handleDataChange={this.handleChange.bind(this)}
          setFocusInput={this.state.setFocusInput}
        />
      </div>
    );
  }
}
