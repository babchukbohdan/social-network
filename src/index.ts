import { MyContext } from './types';
import "reflect-metadata";

import express from 'express'
import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import {
    ApolloServerPluginLandingPageGraphQLPlayground
  } from "apollo-server-core";

import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';
import { __prod__ } from './constants'
import mikroConfig from './mikro-orm.config'
import { UserResolver } from "./resolvers/user";


import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax'
            },
            saveUninitialized: false,
            secret: "1dfae913-3cfb-4e66-8b51-ce14fb76e318",
            resave: false,
        })
    )

    console.log(process.env.NODE_ENV)

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}): MyContext => ({
            em: orm.em,
            req,
            res
        }),
        introspection: true,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(),
          ],
    })
    await apolloServer.start()
    apolloServer.applyMiddleware({ app })

    app.listen(4000, () => {
        console.log('server started  on localhost:4000')
    })

}

main().catch((reason) => {
    console.error(reason)
})