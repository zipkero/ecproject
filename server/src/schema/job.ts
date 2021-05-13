import { gql } from "apollo-server-koa";

export const typeDef = gql`
  interface Job {
    code: String!
    name: String
    requestDate: Date
    category: Int
    owner: String
    title: String!
    status: Int
    intergratedStatus: Int
    planToStart: Date
    isStarted: Boolean
    writer: String
    labels: String
    version: Int
    progress: String
  }

  interface JobTimeEstimate {
    Code: String!
    RequestDate: Date
    Category: Int
    Owner: String
    WriteDate: Date
    EstimatePlanTimeInDay: Float
    EstimatePlanWorkTimeInDay: Float
    Reason: String
  }

  interface JobTimeHistory {
    Code: String!
    RequestDate: Date
    Category: Int
    Owner: String
    Start: Date
    End: Date
    Reason: String
    Type: Int
  }

  input JobSearchOptionType {
    Code: String
    Category: Int
    Owner: String
    OwnerGroup: String
    Status: Int
    Title: String
    StartFrom: Date
    DeployFrom: Date
    Page: Int
    PageSize: Int
    IsIncludeEtc: Boolean
    IsShowOthers: Boolean
    IsShowAllStatus: Boolean
  }

  input JobData {
    title: String!
  }

  type myJobList {
    myJobAllocated(searchOption: JobSearchOptionType): [Job]
    myTeamJobAllocated: [Job]
    myTeamJobUnAllocated: [Job]
  }

  type allJobList {
    byTeam: [Job]!
    byJob: [Job]!
  }

  extend type Query {
    myJobList: myJobList
    allJobList: allJobList
  }

  extend type Mutation {
    createJob(job: JobData): Job
    updateJob(title: String!): Job
    applyToDev(title: String!): Boolean
    deleteJob(title: String!): Boolean
    resetJob(title: String!): Boolean
    updateJobTimeHistoryReason(title: String!): Job!
    addTimeHistoryReason(title: String!): Job!
    insertJobEstimateTime(title: String!): Job
    pauseLast(title: String!): Boolean
    resumeLast(title: String!): Boolean
    addJob(title: String!): Job
  }
`;

export const resolvers = {
  Query: {
    myJobList: {
      myJobAllocated: () => {},
      myTeamJobAllocated: () => {},
      myTeamJobUnAllocated: () => {},
    },
    allJobList: {
      byTeam: () => {},
      byJob: () => {},
    },
  },

  Mutation: {
    createJob: () => {},
    updateJob: () => {},
    applyToDev: () => {},
    deleteJob: () => {},
    resetJob: () => {},
    updateJobTimeHistoryReason: () => {},
    addTimeHistoryReason: () => {},
    insertJobEstimateTime: () => {},
    pauseLast: () => {},
    resumeLast: () => {},
  },
};
