import {Request, Response, Express} from 'express'
import {Redis} from "ioredis"
import {DataSource} from 'typeorm'

export type MyContext = {
    dataSource: DataSource
    req: Request
    res: Response
    redis: Redis
}
