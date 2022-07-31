import "reflect-metadata";

import express from 'express'
import { MikroORM } from '@mikro-orm/core'
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { PostResolver } from './resolvers/post';
import { HelloResolver } from './resolvers/hello';
import { __prod__ } from './constants'
import mikroConfig from './mikro-orm.config'
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up()

    const app = express()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({em: orm.em})
    })

    await apolloServer.start()
    apolloServer.applyMiddleware({app})

    app.listen(4000, () => {
        console.log('server started  on localhost:4000')
    })

 }

 main().catch((reason) => {
    console.error(reason)
 })