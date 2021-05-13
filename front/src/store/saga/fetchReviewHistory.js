import { fetchGraphQLData } from "./common";

const fetchReviewHistory = async ({ code, category }) => {
  const query = `
        query ECProject_Job ($searchOption:JobSearchOptionType) {
            reviewHistory {
                historyList (searchOption: $searchOption){
                    code
                    status {
                        name
                        value
                    }
                    writeDate
                }
            }
        }
    `;
  const variable = {
    searchOption: {
      code: code,
      category: category,
    },
  };

  const resp = await fetchGraphQLData(query, variable);

  return resp?.data?.Data?.data?.reviewHistory?.historyList || [];
};

export default fetchReviewHistory;
