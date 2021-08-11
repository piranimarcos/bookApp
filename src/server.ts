import express from "express";
import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { BookResolver } from "./resolvers/book.resolver";
import { AuthorResolver } from "./resolvers/author.resolver";

export async function startServer() {
  const app: any = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [BookResolver, AuthorResolver, AuthorResolver] })
  });

  apolloServer.applyMiddleware({ app , path: "/graphql" });
  
  return app;
}
