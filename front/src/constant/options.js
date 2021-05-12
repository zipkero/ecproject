export const options = {
  /**
   * 서버에서 선언된 JobCategoryEnum의 별도 옵션을 주기 위함
   * isCreateUse: 입력페이지 노출여부
   * isRelationUpdate: 연관 컨트롤 데이터 변경으로 인한 데이터 변경 여부
   */
  CATEGORY: [
    {
      key: "plan_exp",
      value: 10,
      isCreateUse: false,
      isRelationUpdate: false,
    },
    {
      key: "analyze_review",
      value: 20,
      isCreateUse: false,
      isRelationUpdate: false,
    },
    {
      key: "mid_review",
      value: 30,
      isCreateUse: false,
      isRelationUpdate: false,
    },
    {
      key: "final_review",
      value: 40,
      isCreateUse: false,
      isRelationUpdate: false,
    },
  ],
  /**
   * 서버에서 선언된 JobStatusEnum의 별도 옵션을 주기 위함
   * @type {{}}
   */
  STATUS: [],
};

export const getControlOption = (controlId) => {
  const controlOptions = options[controlId];
  return ({ key, value }) => {
    if (controlOptions) {
      return controlOptions.find((opt) => {
        if (key && value) {
          return opt.key === key && opt.value === value;
        }
        if (key) {
          return opt.key === key;
        }
        return opt.value === value;
      });
    }
  };
};
