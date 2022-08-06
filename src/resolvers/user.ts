import { MyContext } from './../types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'
import { User } from '../entities/User';

import { EntityManager } from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {

    @Query(() => [User])
    users(@Ctx() {em}: MyContext): Promise<User[]> {
        return em.find(User, {})
    }

    @Query(() => User, {nullable: true})
    async me(@Ctx() {req, em}: MyContext) {
        if (!req.session.userId) {
            return null
        }

        const user  = await em.findOne(User, {id: req.session.userId})
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') {username, password}: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {

        if (username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: 'length must be greater than 2'
                }]
            }
        }
        if (password.length <= 2) {
            return {
                errors: [{
                    field: "password",
                    message: 'length must be greater than 2'
                }]
            }
        }


        const hashedPassword = await argon2.hash(password)
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username,
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }).returning("*")

            console.log('result[0] =:>> ', result[0]);
            const retrivedUser = result[0]
            user = {
                ...retrivedUser,
                createdAt: retrivedUser.created_at,
                updatedAt: retrivedUser.updated_at
            };
        } catch (error) {
            console.error(error.message)
            if (error.detail.includes("already exists")) {
                return {
                    errors:[{
                        field:"username",
                        message: "username already taken"
                    }]
                }
            }
        }

        req.session.userId = user.id

        return {user}
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') {username, password}: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {username})
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "that user name doesn't exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            }
        }

        req.session.userId = user.id
        return {user}
    }
}