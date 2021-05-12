import { gql } from "apollo-server-koa";
import Model from "../models";
import { UserKey } from "../models/user";

export const typeDef = gql`
  type User {
    Owner: String!    
    MainRole: Int
    CurrentJobCode: String
    CurrentJobRequestDate: Date
    CurrentJobCategory: Int
    PreviousJobCode: String
  }

  input UserParam {
    Owner: String
    Password: String
  }

  extend type Query {
    getUser(Owner: String): User
    getUsers: [User]
  }

  extend type Mutation {
    addUser(Owner: String, Password: String): User
  }
`;

export const resolvers = {
  Query: {
    getUser: async (root: any, args: UserKey, ctx: any) => {
      return await Model.User.getUser({
        Owner: args.Owner,
        Password: require("md5")(args.Password),
      });
    },
    getUsers: async () => {
      return await Model.User.getUsers();
    },
  },
  Mutation: {
    addUser: async (root: any, args: UserKey, ctx: any) => {
      const user = {
        ...args,
        Password: require("md5")(args.Password),
      };
      const result = await Model.User.addUser(user);
      if (result < 1) {
        return null;
      }
      return await Model.User.getUser(user);
    },
  },
};
