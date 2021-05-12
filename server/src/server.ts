import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { ApolloServer } from "apollo-server-koa";
import schema from "./schema";

const app = new Koa();
const port = 4000;

const path = "/graphql";

const server = new ApolloServer({ schema });
server.applyMiddleware({ app, path });

app.use(bodyParser());

app.listen(port, () => {
  console.log(`server on port http://localhost:${port}${path}`);
});
