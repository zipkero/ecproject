import axios from "axios";

export const jobFragments = `
fragment basicField on Job
{
  comment1
  comment2
  comment3
  comment4
  listOrder
  boardCd
  boardSeq
  boardNum
  priority
  priority2
  code
  title
  status {
    name
    value
  }
  paused
  intergratedStatus{
    name
    value
  }
  category {
    name
    value
  }
  owner
  ownerDetail {
    id
    name
    site
    siteName
  }
  ownerGroup
  ownerGroupDetail{
    site
    siteName
    baseCategory{
      name
      value
    }
  }
  labels {
    code
    color
    name
  }
}

fragment timeData on Job
{
  writeDate
  costDays
  firstIngStartDate
  lastIngEndDate
  writer
  planToStart
  deployDate
  usedTime
}
`;

export function stateSelector(state) {
  return state;
}

export function gridRowSelector(state, pageId, gridId) {
  const gridData = state.pages[pageId].gridList.find(
    (grid) => grid.gridId === gridId
  );

  if (gridData) {
    return gridData.rows;
  }
}

export function getKeyControlValuesByFetchedData(fecthedData) {
  if (!fecthedData) {
    return false;
  }

  const keyControlValues = {
    CATEGORY: {
      value: fecthedData.category.value,
      name: fecthedData.category.name,
    },
    JOBCODE: {
      value: fecthedData.code,
      label: fecthedData.name,
    },
    PIC: {
      value: fecthedData.ownerDetail?.id,
      name: fecthedData.ownerDetail?.name,
    },
    WRITEDATE: fecthedData.writeDate,
  };
  return keyControlValues;
}

export function fetchDefaultCodeList() {  
  const query = `
    query ECProject_Job{
      codeList {
        codeLabelList {
          code
          name
          color
          boardCd
        }
        codeJobStatusListAll {
            name
            value
        }
        codeJobCategoryListAll {
            name
            value
        }
        codeBoardList {
            code
            name
        }
        codeSiteManagerList {
          id
          site
        }
      }
    }
  `;

  return fetchGraphQLData(query).then((result) => {
    const defaultCodeList = result.data.Data.data["codeList"];
    const labelList = (defaultCodeList.codeLabelList || []).map((item) => ({
      label: item.name,
      value: item.code,
      color: item.color,
      boardCd: item.boardCd,
    }));
    const statusList = (defaultCodeList.codeJobStatusListAll || []).map(
      (item) => ({
        label: item.name ?? "",
        value: item.value,
      })
    );
    const categoryList = (defaultCodeList.codeJobCategoryListAll || [])
      .filter((item) => item.value !== 999999)
      .map((item) => ({
        label: item.name ?? "",
        value: item.value,
      }));
    const boardList = (defaultCodeList.codeBoardList || []).map((item) => ({
      label: item.name ?? "",
      value: item.code,
    }));
    const siteManagerList = defaultCodeList.codeSiteManagerList || [];
    return {
      labelList: labelList,
      statusList: statusList,
      categoryList: categoryList,
      boardList: boardList,
      siteManagerList: siteManagerList,
    };
  });
}

export function fetchSiteCodeList() {
  const query = `
    query ECProject_Job ($inputData: UserGroupSearchOptionType!) {
      codeList {
        codeUserGroupList (inputData: $inputData) {
          site
          siteName
          baseCategory {
            name
            value
          }
          baseBoard {
            name
            value
          }
        }
      }
    }
  `;

  const variables = {
    inputData: {
      pageCurrent: 1,
      pageSize: 100,
      siteCdDept: "",
      siteDesDept: "",
    },
  };

  return fetchGraphQLData(query, variables).then((result) => {
    const siteCodeList = result.data.Data.data["codeList"];
    return (siteCodeList.codeUserGroupList || []).map((item) => ({
      label: item.siteName ?? "",
      value: item.site,
      baseBoard: { label: item.baseBoard.name, value: item.baseBoard.value },
      relationControlData: {
        // 팀 바뀌면 기본 카테고리 변경되도록 미리 할당
        controlId: "CATEGORY",
        value: item.baseCategory.value,
        label: item.baseCategory.name,
      },
    }));
  });
}

export function fetchUserCodeList() {
  const query = `
    query ECProject_Job ($inputData: UserSearchOptionType!) {
      codeList {
        codeUserList (inputData: $inputData) {
          id
          name
          site
          siteName
        }
      }
    }
  `;

  const variables = {
    inputData: {
      pageCurrent: 1,
      pageSize: 100,
      searchText: "",
    },
  };

  return fetchGraphQLData(query, variables).then((result) => {
    const userCodeList = result.data.Data.data["codeList"];
    return (userCodeList.codeUserList || []).map((item) => ({
      label: item.name ?? "",
      value: item.id,
      relationControlData: {
        // 담당자 바뀌면 기본 팀 변경되도록 미리 할당
        controlId: "TEAM",
        value: item.site,
        label: item.siteName,
      },
    }));
  });
}

export function fetchLoginData(params) {
  const userQuery = `
    query ECProject_Job {
      myUser {
        comCode
        id
        name
        site
        siteName
        currentlyDoingJob {
          ...basicField
          ...timeData
        }
        holdingJobList {
          ...basicField
          ...timeData
        }
        toPlanJobList {
          ...basicField
          ...timeData
        }
      }
    }
  `;

  const fragments = `
    fragment basicField on Job
    {
      boardCd
      boardSeq      
      priority      
      code
      title
      status {
        name
        value
      }
      category {
        name
        value
      }
      owner
      ownerDetail {
        id
        name
        site
        siteName
      }
      ownerGroup
      ownerGroupDetail{
        site
        siteName
      }      
    }
    
    fragment timeData on Job
    {
      writeDate
      costDays
      firstIngStartDate
      lastIngEndDate
      planToStart
      deployDate
    }
  `;

  const query = `${userQuery} ${fragments}`;

  return fetchGraphQLData(query).then((result) => {
    return result.data.Data.data["myUser"];
  });
}

export function fetchCurrentlyDoingJob(params) {
  const userQuery = `
    query ECProject_Job {
      myUser {
        comCode
        id
        name
        currentlyDoingJob {
          ...basicField
          ...timeData
        }
      }
    }
  `;

  const fragments = `
    fragment basicField on Job
    {
      boardCd
      boardSeq      
      priority      
      code
      title
      status {
        name
        value
      }
      category {
        name
        value
      }
      owner
      ownerDetail {
        id
        name
        site
        siteName
      }
      ownerGroup
      ownerGroupDetail{
        site
        siteName
      }      
    }
    
    fragment timeData on Job
    {
      writeDate
      costDays
      firstIngStartDate
      lastIngEndDate
      planToStart
      deployDate
    }
  `;

  const query = `${userQuery} ${fragments}`;

  return fetchGraphQLData(query).then((result) => {
    return result.data.Data.data["myUser"];
  });
}

export function fetchECAPIData(url, params) {
  const reqSid = window.location.href.match(/ec_req_sid=([^#]+)/)[0];
  const apiUrl = `${url}?${reqSid}`;

  return axios({
    url: apiUrl,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    data: JSON.stringify(params),
  });
}

export function fetchGraphQLData(query, variables) {
  const defaultUrl = "/graphql";  

  return axios({
    url: defaultUrl,
    method: "post",
    data: {
      operationName: "ECProject_Job",
      query: query,
      variables: variables,
    },
  }).then((data) => {
    const errors = data?.data?.Data?.errors;
    const messageList = [];
    let messageResult;
    let isError = false;

    if (errors?.length > 0) {
      errors.forEach((error) => {
        const errCode = error.extensions.code;
        const message = error.message ?? "";

        if (errCode?.endsWith("Error")) {
          isError = true;
        }

        messageList.push(message.replace("GraphQL.ExecutionError:", ""));
      });

      messageResult = messageList.join("\n");

      if (isError) {
        throw {
          message: messageResult,
        };
      } else {
        alert("Notice: " + messageResult);
      }
    }

    return data;
  });
}
