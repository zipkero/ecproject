import React, { useCallback } from "react";
import Form from "components/form/Form";
import { Button } from "@blueprintjs/core";

export default function PopupNotice(props) {
  const { pageData, containerActions } = props;

  const handleClickClose = useCallback(() => {
    containerActions.updatePopupToggle({
      pageId: pageData.pageId,
      isOpen: false,
    });
  }, [containerActions]);

  const { pageId, formState, controlValues, controlList } = pageData;
  return (
    <>
      <div className="header header-fixed">
        <div className="wrapper-title">Notice</div>
        <div className="wrapper-toolbar">
          <Button
            icon={"cross"}
            className="btn btn-sm btn-default"
            onClick={handleClickClose}
          ></Button>
        </div>
      </div>
      <div className="contents contents-fixed">
        <Form
          {...props}
          pageId={pageId}
          formState={formState}
          controlList={controlList}
          controlValues={controlValues}
          containerActions={containerActions}
        />
      </div>
      <div className="footer footer-fixed">
        <div className="wrapper-toolbar">
          <Button className="btn btn-sm btn-default" onClick={handleClickClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
