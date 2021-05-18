import React, {useRef, useState} from "react";
import {Suggest} from "@blueprintjs/select";
import {
  Alert,
  Button,
  Checkbox,
  InputGroup,
  Intent,
  MenuItem,
  Text,
} from "@blueprintjs/core";
import {useDispatch} from "react-redux";
import {actions} from "../../store/actionTypes";

const Select = (props) => {
  const {
    values = [],
    items = [],
    labelMode,
    disabled,
    required,
    createNewCodeConfirmOpen,
    checkboxData,
    openPopup,
    handleDataChange,
    fetchActionType,
    openPopoverTrigger,
  } = props;
  const selectedValue = values[0];
  const hasValue = !!selectedValue;
  const hasItems = items.length > 0;

  const [hasFilteredItems, setHasFilteredItems] = useState(false);
  const [query, setQuery]= useState('');
  const [customLabel, setCustomLabel] = useState('');

  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  const inputValueRenderer = (item) => {
    return "";
  };

  const onChangeSelect = (newValue) => {
    if (handleDataChange) {
      handleDataChange(newValue);
    } else {
      defaultHandleDataChange(newValue);
    }
  };

  const defaultHandleDataChange = (newValue) => {
    dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          values: newValue,
        })
    );
  };

  // 전체 아이템 삭제
  const onRemoveAllSelectedItems = () => {
    onChangeSelect([]);
  };

  // 선택 아이템 변경
  const onItemSelect = (newValues) => {
    handleDataChange([newValues]);
  };

  const onChangeCheckbox = (e) => {
    const checked = e.target.checked;
    dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          required: !checked,
          disabled: checked,
          checkboxData: {
            ...checkboxData,
            checked: checked,
          },
        })
    );
  };

  const fetchItemList = (param) => {
    if (!param) {
      return false;
    }

    if (fetchActionType && actions[fetchActionType]) {
      dispatch(
          actions[fetchActionType]({
            pageId: pageId,
            controlId: controlId,
            param: param || "",
          })
      );
    }
  };

  // JOBCODE 에서만 사용
  const onQueryChange = (value) => {
    setQuery(value);
  };

  // JOBCODE 에서만 사용
  const onChangeCustomLabel = (e) => {
    setCustomLabel(e.target.value);
  };

  // JOBCODE 에서만 사용
  const cancelCreateNewCode = () => {
    openCreateNewCodeConfirm(false);
  };

  // JOBCODE 에서만 사용
  const confirmCreateNewCode = () => {
    dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          items: [{value: query, label: customLabel}],
          values: [{value: query, label: customLabel}],
        })
    );

    openCreateNewCodeConfirm(false);
  };

  const openCreateNewCodeConfirm = (createNewCodeConfirmOpen) => {
    dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          createNewCodeConfirmOpen: createNewCodeConfirmOpen,
        })
    );
  };

  const itemListPredicate = (query, items) => {
    const result = (items ?? []).filter((item) => {
      return (
          `${item.value.toString().toUpperCase()} ${item.label
              .toString()
              .toUpperCase()}`.indexOf(query.toString().toUpperCase()) >= 0
      );
    });

    if (result.length > 0) {
      setHasFilteredItems(true);
    } else {
      setHasFilteredItems(false);
    }

    return result;
  };

  const onKeyUpInput = (e) => {
    const value = e.target.value;
    if (
        e.keyCode === 13 &&
        openPopoverTrigger === "enter" &&
        hasFilteredItems === false
    ) {
      fetchItemList(value);
      e.preventDefault();
      return false;
    }
  };

  const onDoubleClick = (e) => {
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
  };

  const itemRenderer = (item, {handleClick, modifiers}) => {
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
  };

  const clearButton = (
      <Button icon="cross" minimal={true} onClick={onRemoveAllSelectedItems}/>
  );

  const checkbox = checkboxData ? (
      <Checkbox
          className={"bp3-checkbox-with-suggest"}
          checked={checkboxData.checked}
          label={checkboxData.label}
          onChange={onChangeCheckbox}
      />
  ) : (
      <></>
  );

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
            itemRenderer={itemRenderer}
            onItemSelect={onItemSelect}
            itemListPredicate={itemListPredicate}
            inputValueRenderer={inputValueRenderer}
            onQueryChange={onQueryChange}
            noResults={"No Results"}
            openOnKeyDown={!hasItems}
            //resetOnSelect={true}
            //resetOnClose={true}
            //resetOnQuery={false}
            inputProps={{
              inputRef: inputRef,
              leftIcon: "search",
              onKeyUp: onKeyUpInput,
              onDoubleClick: onDoubleClick,
              intent: required && !hasValue ? Intent.DANGER : "",
            }}
            popoverProps={{
              popoverRef: popoverRef,
              //isOpen: (forcePopoverClose === true ? false : undefined),
            }}
        />
        {checkbox}
      </>
  );

  if (labelMode) {
    return <Text>{hasValue ? `${selectedValue.label}` : ""}</Text>;
  }

  return (
      <>
        {component}
        <Alert // JOBCODE 에서만 사용
            cancelButtonText="Cancel"
            confirmButtonText="Confirm"
            icon="confirm"
            intent={Intent.PRIMARY}
            isOpen={createNewCodeConfirmOpen}
            onCancel={cancelCreateNewCode}
            onConfirm={confirmCreateNewCode}
        >
          <p>
            There's no JOB CODE with this value. If you want to{" "}
            <b>CREATE A NEW JOB CODE</b>, write the JOB NAME in following input
            box, and click confirm button.
          </p>

          <InputGroup placeholder="JOB NAME" onChange={onChangeCustomLabel}/>
        </Alert>
      </>
  );
};

export default Select;