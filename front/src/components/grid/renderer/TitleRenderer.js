import React, { useRef } from "react";

const TitleRenderer = (props) => {
  const formRef = useRef(null);

  const { data: rowData, value: title } = props;
  const {
    BOARDCD,
    BOARDSEQ,
    BOARDNUM,
    JOBCODE,
    CATEGORY,
    PIC,
    WRITEDATE,
  } = rowData;

  const query = `
    mutation ECProject_Job($inputData:JobUpdate!, $jobKey:JobDataKey! $history: JobTimeSpendHistoryInput) {
      updateJob(inputData: $inputData, jobKey: $jobKey, history: $history) {
        code
        name
        title
        planToStart
        deployDate
        ownerDetail {
          id
          name
        }
        ownerGroupDetail {
          site
          siteName
          baseCategory{
            name
            value
          }
        }
        category {
          name
          value
        }
        status  {
          name
          value
        }
      }
    }
    `;

  const variables = {
    inputData: {
      boardCd: BOARDCD,
      boardSeq: BOARDSEQ,
    },
    jobKey: {
      code: JOBCODE.value,
      category: CATEGORY.value,
      owner: PIC?.value,
      writeDate: WRITEDATE,
    },
  };

  const EC_PROJECT_PARAM = JSON.stringify({
    operationName: "ECProject_Job",
    query: query,
    variables: variables,
  });

  const SUBMIT_FORM_PARAMS = [
    {
      name: "MENU_TYPE",
      value: "S", // 메뉴가 없기 때문에 코드팝업 적용 버튼이 안나오는 현상이 있다. 강제로 지정.
    },
    {
      name: "BOARD_CD",
      value: BOARDCD,
    },
    {
      name: "BOARD_SEQ",
      value: BOARDSEQ,
    },
    // {
    //   name: "GRAPHQL_API_PARAM",
    //   value: EC_PROJECT_PARAM
    // },
  ];

  const handleClick = (e) => {
    const popup = window.open(
      "",
      "popupForm",
      "width=800, height=800, menubar=no, status=no, toolbar=no, location=no"
    );
    const reqSid = window.location.href.match(/ec_req_sid=([^#]+)/)[0];
    const host = window.location.origin;
    const url = `${host}/ECERP/EGM/EGM026M?${reqSid}&ec_project_param=${EC_PROJECT_PARAM}`;
    const form = formRef.current;

    form.action = url;
    form.method = "post";
    form.target = "popupForm";
    form.submit();
  };

  // ETC Category 인 경우 link 걸리지 않는 것이 원칙이나 boardNum 임의수정하여 저장한 경우 link 걸리도록
  return CATEGORY.value === 999999 && !BOARDNUM ? (
    <>{title}</>
  ) : (
    <>
      <form ref={formRef}>
        {SUBMIT_FORM_PARAMS.map((param) => {
          const { name, value } = param;
          return (
            <input type="hidden" key={name} name={name} value={value || ""} />
          );
        })}
      </form>
      <span className={"span-link"} onClick={handleClick}>
        {title}
      </span>
    </>
  );
};

export default TitleRenderer;
