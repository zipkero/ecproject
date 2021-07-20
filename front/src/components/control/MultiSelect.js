import React, { useCallback, useMemo, useState } from "react";

import { MultiSelect as BPMultiSelect } from "@blueprintjs/select";
import { Button, MenuItem, Tag } from "@blueprintjs/core";
import { getContrastColor } from "common";
import { isFunction, isNil } from "lodash";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const MultiSelect = (props) => {
  const dispatch = useDispatch();
  const [hasFilteredItems, setHasFilteredItems] = useState(false);

  const {
    items = [],
    values = [],
    matchValue,
    itemFilter,
    pageId,
    controlId,
  } = props;

  const itemFilterFn =
    !isNil(matchValue) && matchValue !== false && isFunction(itemFilter)
      ? itemFilter(matchValue)
      : false;
  const itemsCustom = itemFilterFn ? items.filter(itemFilterFn) : items;

  const isAlreadySelectedItem = useCallback(
    (item) => {
      return (values ?? []).find((_) => _.value === item.value);
    },
    [values]
  );

  const handleDataChange = useCallback(
    (newValue) => {
      dispatch(
        actions.updatePageControlData({
          pageId: pageId,
          controlId: controlId,
          values: newValue,
        })
      );
    },
    [pageId, controlId, dispatch]
  );

  // 단일 아이템 삭제
  const onRemoveSelectedItem = useCallback(
    (tag) => {
      const value = tag.key;
      const newValues = (values ?? []).filter((item) => item.value !== value);
      handleDataChange(newValues);
    },
    [values, handleDataChange]
  );

  // 전체 아이템 삭제
  const onRemoveAllSelectedItems = useCallback(() => {
    handleDataChange([]);
  }, [handleDataChange]);

  // 아이템 선택시
  const onItemSelect = useCallback(
    (item) => {
      // 중복체크
      if (isAlreadySelectedItem(item)) {
        return false;
      }

      const selectedValues = values ?? [];
      const newValues = selectedValues.concat([item]);

      handleDataChange(newValues);
    },
    [values, isAlreadySelectedItem, handleDataChange]
  );

  const itemListPredicate = useCallback((query, items) => {
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
  }, []);

  const tagRenderer = useCallback((item) => {
    const color = item.color;
    return (
      <Tag
        key={item.value}
        style={
          color
            ? {
                backgroundColor: color,
                color: getContrastColor(color),
              }
            : {}
        }
      >
        {item.label}
      </Tag>
    );
  }, []);

  const clearButton = useMemo(
    () => () =>
      values.length > 0 ? (
        <Button
          icon="cross"
          minimal={true}
          onClick={onRemoveAllSelectedItems}
        />
      ) : undefined,
    [onRemoveAllSelectedItems, values]
  );

  const itemRenderer = (item, { handleClick, modifiers }) => {
    return (
      <MenuItem
        // style={{
        //   backgroundColor: item.color,
        // }}
        icon={isAlreadySelectedItem(item) ? "tick" : ""}
        active={modifiers.active}
        key={item.value}
        //label={item.label.toString()}
        onClick={handleClick}
        //text={`${item.label}`}
        text={tagRenderer(item)}
        shouldDismissPopover={false}
      />
    );
  };

  return (
    <BPMultiSelect
      items={itemsCustom}
      resetOnSelect={true}
      selectedItems={values}
      itemRenderer={itemRenderer}
      onItemSelect={onItemSelect}
      tagRenderer={tagRenderer}
      tagInputProps={{
        onRemove: onRemoveSelectedItem,
        rightElement: clearButton,
        leftIcon: "search",
        //tagProps: getTagProps,
      }}
      popoverProps={{}}
      itemListPredicate={itemListPredicate}
      noResults={"no result"}
      //openOnKeyDown={true}
    />
  );
};

export default MultiSelect;
