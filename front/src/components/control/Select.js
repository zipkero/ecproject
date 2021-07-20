import React, { useCallback, useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { Suggest } from "@blueprintjs/select";
import {
  Alert,
  Button,
  Checkbox,
  InputGroup,
  Intent,
  MenuItem,
  Text,
} from "@blueprintjs/core";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const Select = (props) => {
  const dispatch = useDispatch();
  const [hasFilteredItems, setHasFilteredItems] = useState(false);
  const [query, setQuery] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const {
    values = [],
    items = [],
    labelMode,
    disabled,
    required,
    createNewCodeConfirmOpen,
    checkboxData,
    openPopup,
    pageId,
    controlId,
    focusInput,
    handleDataChange,
    openPopoverTrigger,
    fetchActionType,
  } = props;
  const selectedValue = values[0];
  const hasValue = !!selectedValue;
  const hasItems = items.length > 0;

  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  const [prevItems, setPrevItems] = useState(items);
  const [prevFocusInput, setPrevFocusInput] = useState(focusInput);

  useEffect(() => {
    if (isEqual(prevItems, items) === false) {
      setFocus();
      setPrevItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (prevFocusInput !== focusInput && focusInput === true) {
      setFocus();
      setPrevFocusInput(focusInput);
    }
  }, [focusInput]);

  const setFocus = useCallback(() => {
    if (inputRef && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const inputValueRenderer = (item) => {
    return "";
  };

  const defaultHandleDataChange = useCallback(
    (newValue) => {
      dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          values: newValue,
        })
      );
    },
    [dispatch, pageId, controlId]
  );

  const onChangeSelect = useCallback(
    (newValue) => {
      if (handleDataChange) {
        handleDataChange(newValue);
      } else {
        defaultHandleDataChange(newValue);
      }
    },
    [defaultHandleDataChange, handleDataChange]
  );

  // 전체 아이템 삭제
  const onRemoveAllSelectedItems = () => {
    onChangeSelect([]);
  };

  // 선택 아이템 변경
  const onItemSelect = useCallback(
    (newValues) => {
      onChangeSelect([newValues]);
    },
    [onChangeSelect]
  );

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

  const fetchItemList = useCallback(
    (param) => {
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
    },
    [fetchActionType, pageId, controlId, dispatch]
  );

  const onKeyUpInput = useCallback(
    (e) => {
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
    },
    [openPopoverTrigger, fetchItemList, hasFilteredItems]
  );

  const onKeyUpInputGroup = useCallback(
    (e) => {
      if (e.keyCode === 46 || e.keyCode === 8) {
        onChangeSelect([]);
      }
    },
    [onChangeSelect]
  );

  const onChangeCheckbox = useCallback(
    (e) => {
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
    },
    [dispatch, pageId, controlId, checkboxData]
  );

  // JOBCODE 에서만 사용
  const onQueryChange = useCallback(
    (value) => {
      setQuery(value);
    },
    [setQuery]
  );

  // JOBCODE 에서만 사용
  const onChangeCustomLabel = useCallback(
    (e) => {
      setCustomLabel(e.target.value);
    },
    [setCustomLabel]
  );

  const openCreateNewCodeConfirm = useCallback(
    (createNewCodeConfirmOpen) => {
      dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          createNewCodeConfirmOpen: createNewCodeConfirmOpen,
        })
      );
    },
    [pageId, controlId, dispatch]
  );

  // JOBCODE 에서만 사용
  const cancelCreateNewCode = useCallback(() => {
    openCreateNewCodeConfirm(false);
  }, [openCreateNewCodeConfirm]);

  // JOBCODE 에서만 사용
  const confirmCreateNewCode = useCallback(() => {
    dispatch(
      actions.updatePageControlData({
        pageId: pageId,
        controlId: controlId,
        items: [{ value: query, label: customLabel }],
        values: [{ value: query, label: customLabel }],
      })
    );

    openCreateNewCodeConfirm(false);
  }, [pageId, controlId, openCreateNewCodeConfirm]);

  const onDoubleClick = () => {
    if (openPopup) {
      /*
      dispatch(
        actions.updatePopupToggle({
          parentPageId: pageId,
          pageId: "PopupCodeSearch",
          isOpen: true,
          controlValues: {
            QUERYNAME: controlId,
          },
        })
      );
      */
    }
  };

  const itemRenderer = useCallback((item, { handleClick, modifiers }) => {
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
  }, []);

  if (labelMode) {
    return <Text>{hasValue ? `${selectedValue.label}` : ""}</Text>;
  }

  const component = hasValue ? (
    <>
      <InputGroup
        leftIcon={"search"}
        readOnly={false}
        value={selectedValue.value}
        onKeyUp={onKeyUpInputGroup}
      />
      <InputGroup
        readOnly={true}
        value={selectedValue.label}
        placeholder={selectedValue.label || "No Label"}
      />
      <Button icon="cross" minimal={true} onClick={onRemoveAllSelectedItems} />
    </>
  ) : (
    <>
      <Suggest
        items={items}
        disabled={disabled}
        itemRenderer={itemRenderer}
        //itemListRenderer={this.itemListRenderer.bind(this)}
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
      {checkboxData && (
        <Checkbox
          className={"bp3-checkbox-with-suggest"}
          checked={checkboxData.checked}
          label={checkboxData.label}
          onChange={onChangeCheckbox}
        />
      )}
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
        onCancel={cancelCreateNewCode}
        onConfirm={confirmCreateNewCode}
      >
        <p>
          There's no JOB CODE with this value. If you want to{" "}
          <b>CREATE A NEW JOB CODE</b>, write the JOB NAME in following input
          box, and click confirm button.
        </p>

        {/* <InputGroup placeholder="JOB CODE" disabled={true} value={"JOB CODE: " + (this.query ? this.query : "")} /> */}
        <InputGroup placeholder="JOB NAME" onChange={onChangeCustomLabel} />
      </Alert>
    </>
  );
};

export default Select;
