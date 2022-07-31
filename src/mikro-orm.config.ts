import path from 'path'
import {MikroORM} from '@mikro-orm/core'

import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { __prod__ } from "./constants";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post, User],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !__prod__,
    allowGlobalContext: true,
    password: 'postgres',
} as Parameters<typeof MikroORM.init>[0];
