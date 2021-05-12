import React, { PureComponent } from "react";
import DateInput from "components/control/DateInput";
import { getParsedDate } from "common";

export default class DateEditor extends PureComponent {
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
    };
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

  handleChange(value, isUserChange) {
    if (isUserChange) {
      const newValue = getParsedDate(value);
      this.setState({ value: newValue }, this.stopEditing.bind(this));
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
    return (
      <>
        <DateInput
          values={value}
          handleDataChange={this.handleChange.bind(this)}
        />
      </>
    );
  }
}
