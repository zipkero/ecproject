import React, { PureComponent } from "react";
import { isEqual } from "lodash";
import { Suggest } from "@blueprintjs/select";
import {
  Button,
  MenuItem,
  Alert,
  Intent,
  InputGroup,
  Text,
  Menu,
  Checkbox,
} from "@blueprintjs/core";

export default class Select extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasFilteredItems: false,
    };
    this.inputRef = null;
    this.popoverRef = null;
  }

  componentDidUpdate(prevProps) {
    // items update 될 때  focus > JOBCODE 에서 사용
    if (isEqual(prevProps.items, this.props.items) === false) {
      this.setFocus();
    }

    // props에 setFocusInput 값 있을 때 > selectEditor 에서 사용
    if (
      prevProps.setFocusInput !== this.props.setFocusInput &&
      this.props.setFocusInput === true
    ) {
      this.setFocus();
    }
  }

  setFocus() {
    if (this.inputRef) {
      this.inputRef.focus();
    }
  }

  itemRenderer(item, { handleClick, modifiers }) {
    return (
      <MenuItem
        // tabIndex={999}
        // active={this.props.values.length > 0 ? this.props.values[0] == item.value : modifiers.active}
        active={modifiers.active}
        key={item.value.toString()}
        onClick={handleClick}
        label={item.label.toString()}
        text={item.value.toString()}
        shouldDismissPopover={false}
      />
    );
  }

  inputValueRenderer(item) {
    return "";
  }

  handleDataChange(newValue) {
    if (this.props.handleDataChange) {
      this.props.handleDataChange(newValue);
    } else {
      this.defaultHandleDataChange(newValue);
    }
  }

  defaultHandleDataChange(newValue) {
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      values: newValue,
    });
  }

  // 전체 아이템 삭제
  onRemoveAllSelectedItems() {
    this.handleDataChange([]);
  }

  // 선택 아이템 변경
  onItemSelect(newValues) {
    this.handleDataChange([newValues]);
  }

  itemListPredicate(query, items) {
    const result = (items ?? []).filter((item) => {
      return (
        `${item.value.toString().toUpperCase()} ${item.label
          .toString()
          .toUpperCase()}`.indexOf(query.toString().toUpperCase()) >= 0
      );
    });

    if (result.length > 0) {
      this.setState({ hasFilteredItems: true });
    } else {
      this.setState({ hasFilteredItems: false });
    }

    return result;
  }

  findValue(items, values) {
    var result;
    if (values.length > 0) {
      result = items.find((item) => item.value === values[0]);
    }

    return result;
  }

  onKeyUpInput(e) {
    const value = e.target.value;
    if (
      e.keyCode === 13 &&
      this.props.openPopoverTrigger === "enter" &&
      this.state.hasFilteredItems === false
    ) {
      this.fetchItemList(value);
      e.preventDefault();
      return false;
    }
  }

  onDoubleClick(e) {
    // const { pageId, openPopup, containerActions, controlId } = this.props;
    // if (openPopup) {
    //   containerActions.updatePopupToggle({
    //     parentPageId: pageId,
    //     pageId: "PopupCodeSearch",
    //     isOpen: true,
    //     controlValues: {
    //       QUERYNAME: controlId,
    //     }
    //   });
    // }
  }

  onChangeCheckbox(e) {
    const checked = e.target.checked;
    const { containerActions, pageId, controlId, checkboxData } = this.props;

    containerActions.updatePageControlData({
      pageId: pageId,
      controlId: controlId,
      required: !checked,
      disabled: checked,
      checkboxData: {
        ...checkboxData,
        checked: checked,
      },
    });
  }

  fetchItemList(param) {
    if (!param) {
      return false;
    }
    const fetchActionType = this.props.fetchActionType;
    if (fetchActionType && this.props.containerActions[fetchActionType]) {
      this.props.containerActions[fetchActionType]({
        pageId: this.props.pageId,
        controlId: this.props.controlId,
        param: param || "",
      });
    }
  }

  // JOBCODE 에서만 사용
  onQueryChange(value) {
    this.query = value;
  }

  // JOBCODE 에서만 사용
  onChangeCustomLabel(e) {
    this.customLabel = e.target.value;
  }

  // JOBCODE 에서만 사용
  cancelCreateNewCode() {
    this.openCreateNewCodeConfirm(false);
  }

  // JOBCODE 에서만 사용
  confirmCreateNewCode() {
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      items: [{ value: this.query, label: this.customLabel }],
      values: [{ value: this.query, label: this.customLabel }],
    });

    this.openCreateNewCodeConfirm(false);
  }

  openCreateNewCodeConfirm(createNewCodeConfirmOpen) {
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      createNewCodeConfirmOpen: createNewCodeConfirmOpen,
    });
  }

  render() {
    const {
      values = [],
      items = [],
      labelMode,
      disabled,
      required,
      createNewCodeConfirmOpen,
      checkboxData,
      openPopup,
    } = this.props;
    const selectedValue = values[0];
    const hasValue = !!selectedValue;
    const hasItems = items.length > 0;

    const clearButton = (
      <Button
        icon="cross"
        minimal={true}
        onClick={this.onRemoveAllSelectedItems.bind(this)}
      />
    );

    const checkbox = checkboxData ? (
      <Checkbox
        className={"bp3-checkbox-with-suggest"}
        checked={checkboxData.checked}
        label={checkboxData.label}
        onChange={this.onChangeCheckbox.bind(this)}
      />
    ) : (
      <></>
    );

    if (labelMode) {
      return <Text>{hasValue ? `${selectedValue.label}` : ""}</Text>;
    }

    const component = hasValue ? (
      <>
        <InputGroup
          leftIcon={"search"}
          readOnly={true}
          value={selectedValue.value}
        />
        <InputGroup
          readOnly={true}
          value={selectedValue.label}
          placeholder={selectedValue.label || "No Label"}
        />
        {clearButton}
      </>
    ) : (
      <>
        <Suggest
          items={items}
          disabled={disabled}
          itemRenderer={this.itemRenderer.bind(this)}
          //itemListRenderer={this.itemListRenderer.bind(this)}
          onItemSelect={this.onItemSelect.bind(this)}
          itemListPredicate={this.itemListPredicate.bind(this)}
          inputValueRenderer={this.inputValueRenderer.bind(this)}
          onQueryChange={this.onQueryChange.bind(this)}
          noResults={"No Results"}
          openOnKeyDown={!hasItems}
          //resetOnSelect={true}
          //resetOnClose={true}
          //resetOnQuery={false}
          inputProps={{
            inputRef: (input) => {
              this.inputRef = input;
            },
            leftIcon: "search",
            onKeyUp: this.onKeyUpInput.bind(this),
            onDoubleClick: this.onDoubleClick.bind(this),
            intent: required && !hasValue ? Intent.DANGER : "",
          }}
          popoverProps={{
            popoverRef: (popover) => {
              this.popoverRef = popover;
            },
            //isOpen: (forcePopoverClose === true ? false : undefined),
          }}
        ></Suggest>
        {checkbox}
      </>
    );

    return (
      <>
        {component}
        <Alert // JOBCODE 에서만 사용
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          icon="confirm"
          intent={Intent.PRIMARY}
          isOpen={createNewCodeConfirmOpen}
          onCancel={this.cancelCreateNewCode.bind(this)}
          onConfirm={this.confirmCreateNewCode.bind(this)}
        >
          <p>
            There's no JOB CODE with this value. If you want to{" "}
            <b>CREATE A NEW JOB CODE</b>, write the JOB NAME in following input
            box, and click confirm button.
          </p>

          {/* <InputGroup placeholder="JOB CODE" disabled={true} value={"JOB CODE: " + (this.query ? this.query : "")} /> */}
          <InputGroup
            placeholder="JOB NAME"
            onChange={this.onChangeCustomLabel.bind(this)}
          />
        </Alert>
      </>
    );
  }
}
