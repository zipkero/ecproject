import React, { PureComponent } from "react";

import { RadioGroup, Radio, Text } from "@blueprintjs/core";
import isString from "lodash/isString";

export default class RadioBasic extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      inline: true,
      values: props.selectedValue
        ? [props.selectedValue]
        : [props.items[0].value],
    };
  }

  handleDataChange(e) {
    const value = e.target.value;
    if (isString(value)) {
      this.props.containerActions.updatePageControlData({
        pageId: this.props.pageId,
        controlId: this.props.controlId,
        values: [value],
      });
    }
  }

  render() {
    const {
      labelMode = false,
      disabled = false,
      values = [],
      items,
      required,
      fill = false,
    } = this.props;
    const value =
      values.length > 0 ? values[0].toString() : this.state.values[0];
    const makeItems = this.props.items.map((item) => (
      <Radio label={item.label} value={item.value} />
    ));

    if (labelMode) {
      return <Text>{value}</Text>;
    }
    return (
      <RadioGroup
        inline={this.state.inline}
        label=""
        onChange={this.handleDataChange.bind(this)}
        selectedValue={value}
      >
        {makeItems}
        {/*<Radio label="Soup" value="one" />*/}
        {/*<Radio label="Salad" value="two" />*/}
        {/*<Radio label="Sandwich" value="three" />*/}
      </RadioGroup>
    );
  }
}
