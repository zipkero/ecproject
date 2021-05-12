import React, { PureComponent } from "react";

export default class SubmitForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { params, target, handleSubmit } = this.props;

    return (
      <form
        onSubmit={() => {
          handleSubmit();
        }}
      >
        <input type="hidden" name="params" value={params} />
      </form>
    );
  }
}
