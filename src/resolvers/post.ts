import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from '../types';

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, {nullable: true})
     post( @Arg('id') id: number, ): Promise<Post | null> {
        return Post.findOne(id)
    }

    @Mutation(() => Post)
    async createPost( @Arg('title') title: string, ): Promise<Post | null> {
        const post = Post.create({title}).save()
        return post
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne(id)
        if (!post) {
            return null
        }
        if (title) {
            await Post.update({id}, {title})
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
    ): Promise<boolean> {
        const result = await Post.delete(id)
        return Boolean(result)
    }
}
