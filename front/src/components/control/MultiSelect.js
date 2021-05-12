import React, { PureComponent } from "react";

import { MultiSelect as BPMultiSelect } from "@blueprintjs/select";
import { Button, MenuItem, Tag } from "@blueprintjs/core";
import { getContrastColor } from "common";
import { isNil, isFunction } from "lodash";

export default class MultiSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasFilteredItems: false,
    };
  }

  tagRenderer(item) {
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
  }

  isAlreadySelectedItem(item) {
    return (this.props.values ?? []).find((_) => _.value === item.value);
  }

  itemRenderer(item, { handleClick, modifiers }) {
    return (
      <MenuItem
        // style={{
        //   backgroundColor: item.color,
        // }}
        icon={this.isAlreadySelectedItem(item) ? "tick" : ""}
        active={modifiers.active}
        key={item.value}
        //label={item.label.toString()}
        onClick={handleClick}
        //text={`${item.label}`}
        text={this.tagRenderer(item)}
        shouldDismissPopover={false}
      />
    );
  }

  handleDataChange(newValue) {
    this.props.containerActions.updatePageControlData({
      pageId: this.props.pageId,
      controlId: this.props.controlId,
      values: newValue,
    });
  }

  // 단일 아이템 삭제
  onRemoveSelectedItem(tag) {
    const value = tag.key;
    const newValues = (this.props.values ?? []).filter(
      (item) => item.value !== value
    );
    this.handleDataChange(newValues);
  }

  // 전체 아이템 삭제
  onRemoveAllSelectedItems() {
    this.handleDataChange([]);
  }

  // 아이템 선택시
  onItemSelect(item) {
    // 중복체크
    if (this.isAlreadySelectedItem(item)) {
      return false;
    }

    const selectedValues = this.props.values ?? [];
    const newValues = selectedValues.concat([item]);

    this.handleDataChange(newValues);
  }

  itemListPredicate(query, items) {
    const result = (items ?? []).filter((item) => {
      return (
        `${item.value
          .toString()
          .toUpperCase()} ${item.label.toString().toUpperCase()}`.indexOf(
          query.toString().toUpperCase()
        ) >= 0
      );
    });

    if (result.length > 0) {
      this.setState({ hasFilteredItems: true });
    } else {
      this.setState({ hasFilteredItems: false });
    }

    return result;
  }

  render() {
    const { items = [], values = [], matchValue, itemFilter } = this.props;
    const clearButton =
      values.length > 0 ? (
        <Button
          icon="cross"
          minimal={true}
          onClick={this.onRemoveAllSelectedItems.bind(this)}
        />
      ) : undefined;
    const itemFilterFn =
      !isNil(matchValue) && matchValue !== false && isFunction(itemFilter)
        ? itemFilter(matchValue)
        : false;
    const itemsCustom = itemFilterFn ? items.filter(itemFilterFn) : items;

    return (
      <BPMultiSelect
        items={itemsCustom}
        resetOnSelect={true}
        selectedItems={values}
        itemRenderer={this.itemRenderer.bind(this)}
        onItemSelect={this.onItemSelect.bind(this)}
        tagRenderer={this.tagRenderer.bind(this)}
        tagInputProps={{
          onRemove: this.onRemoveSelectedItem.bind(this),
          rightElement: clearButton,
          leftIcon: "search",
          //tagProps: getTagProps,
        }}
        popoverProps={{}}
        itemListPredicate={this.itemListPredicate.bind(this)}
        noResults={"no result"}
        //openOnKeyDown={true}
      />
    );
  }
}
