import React, { useState } from "react";

import { MultiSelect as BPMultiSelect } from "@blueprintjs/select";
import { Button, MenuItem, Tag } from "@blueprintjs/core";
import { getContrastColor } from "common";
import { isFunction, isNil } from "lodash";
import { useDispatch } from "react-redux";
import { actions } from "../../store/actionTypes";

const MultiSelect = (props) => {
  const [, setHasFilteredItems] = useState(false);
  const { items = [], values = [], matchValue, itemFilter } = props;

  const itemFilterFn =
    !isNil(matchValue) && matchValue !== false && isFunction(itemFilter)
      ? itemFilter(matchValue)
      : false;
  const itemsCustom = itemFilterFn ? items.filter(itemFilterFn) : items;
  const dispatch = useDispatch();

  const handleDataChange = (newValue) => {
    dispatch(
      actions.updatePageControlData({
        pageId: pageId,
        controlId: controlId,
        values: newValue,
      })
    );
    j;
  };

  const onRemoveAllSelectedItems = () => {
    handleDataChange([]);
  };

  const isAlreadySelectedItem = (item) => {
    return (values ?? []).find((_) => _.value === item.value);
  };

  const onItemSelect = (item) => {
    if (isAlreadySelectedItem(item)) {
      return false;
    }

    const selectedValues = values ?? [];
    const newValues = selectedValues.concat([item]);

    handleDataChange(newValues);
  };

  const onRemoveSelectedItem = (tag) => {
    const value = tag.key;
    const newValues = (values ?? []).filter((item) => item.value !== value);
    handleDataChange(newValues);
  };

  const itemListPredicate = (query, items) => {
    const result = (items ?? []).filter((item) => {
      return (
        `${item.value.toString().toUpperCase()} ${item.label
          .toString()
          .toUpperCase()}`.indexOf(query.toString().toUpperCase()) >= 0
      );
    });

    setHasFilteredItems(result.length > 0);

    return result;
  };

  const clearButton =
    values.length > 0 ? (
      <Button icon="cross" minimal={true} onClick={onRemoveAllSelectedItems} />
    ) : undefined;

  const tagRenderer = (item) => {
    const color = item.color;
    return (
      <Tag
        key={item.value}
        style={
          color && {
            backgroundColor: color,
            color: getContrastColor(color),
          }
        }
      >
        {item.label}
      </Tag>
    );
  };

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
      itemListPredicate={itemListPredicate.bind(this)}
      noResults={"no result"}
      //openOnKeyDown={true}
    />
  );
};

export default MultiSelect;