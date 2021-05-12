import { gql } from "apollo-server-koa";

export const typeDef = gql`
  interface Job {
    Code: String!
    RequestDate: Date
    Category: Int
    Owner: String
    Title: String!
    Status: Int
    PlanToStart: Date
    IsStarted: Boolean
    Writer: String
    Labels: String
    Version: Int
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

  input JobData {
    title: String!
  }

  type myJobList {
    myJobAllocated: [Job]
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
