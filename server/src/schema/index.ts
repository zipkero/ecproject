import { gql, makeExecutableSchema } from "apollo-server-koa";
import * as job from "./job";
import * as user from "./user";
import {GraphQLScalarType, Kind} from "graphql";

const baseTypeDef = gql`
  scalar Date

  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
`;

const dateScalar = new GraphQLScalarType({
  name: "Date",
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  },
});

const schema = makeExecutableSchema({
  typeDefs: [baseTypeDef, job.typeDef, user.typeDef],
  resolvers: {
    Date: dateScalar,
    ...job.resolvers,
    ...user.resolvers,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
});

export default schema;
