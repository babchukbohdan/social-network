import { MyContext } from './../types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'
import { User } from '../entities/User';

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
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') {username, password}: UsernamePasswordInput,
        @Ctx() {em}: MyContext
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
        const user = em.create(User, {username, password: hashedPassword})

        try {
            await em.persistAndFlush(user)

        } catch (error) {
            console.error(error.message)
            if (error.code === '23505' || error.detail.includes("already exists")) {
                return {
                    errors:[{
                        field:"username",
                        message: "username already taken"
                    }]
                }
            }
        }

        return {user}
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') {username, password}: UsernamePasswordInput,
        @Ctx() {em}: MyContext
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
        return {user}
    }
}