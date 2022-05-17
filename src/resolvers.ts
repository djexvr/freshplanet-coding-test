import { GraphQLScalarType, Kind } from "graphql";
import { ForbiddenError } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { users, forums, messages } from "./data";
import { Forum, Message } from "./types/interface";

function getForumById(id: string) {
  return forums.find((forum) => forum.id == id);
}

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return null;
  },
  parseValue(value) {
    if (typeof value == "string") {
      return new Date(value);
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers: IResolvers = {
  Query: {
    myForums(_parent, _args, context, _info) {
      return forums.filter((forum) => forum.members.includes(context.userId));
    },
    forums(_parent, _args, _context, _info) {
      return forums;
    },
    forum(_parent, args: { id: string }, _context, _info) {
      return getForumById(args.id);
    },
  },
  Mutation: {
    createForum(_parent, _args, context, _info) {
      const maxId = Math.max(...forums.map((forum) => parseInt(forum.id)));
      const newForum: Forum = {
        id: (maxId + 1).toString(),
        members: [context.userId],
      };
      forums.push(newForum);
      return newForum;
    },
    joinForum(_parent, args: { id: string }, context, _info) {
      const forumIndex = forums.findIndex((forum) => forum.id == args.id);
      if (!forums[forumIndex].members.includes(context.userId)) {
        forums[forumIndex].members.push(context.userId);
      }
      return forums[forumIndex];
    },
    postMessage(
      _parent,
      args: { text: string; forumId: string },
      context,
      _info
    ) {
      const forum = getForumById(args.forumId);
      if (!forum?.members.includes(context.userId)) {
        throw new ForbiddenError("You are not in this forum");
      }
      const maxId = Math.max(
        ...messages.map((message) => parseInt(message.id))
      );
      const message: Message = {
        id: (maxId + 1).toString(),
        text: args.text,
        forum: args.forumId,
        author: context.userId,
        sendAt: new Date(),
      };
      messages.push(message);
      return message;
    },
  },
  Forum: {
    members(parent, _args, context, _info) {
      const forum = getForumById(parent.id);
      if (!forum?.members.includes(context.userId)) {
        throw new ForbiddenError("You are not in this forum");
      }
      return users.filter((user) => forum.members.includes(user.id));
    },
    messages(parent, _args, context, _info) {
      const forum = getForumById(parent.id);
      if (!forum?.members.includes(context.userId)) {
        throw new ForbiddenError("You are not in this forum");
      }
      return messages
        .filter((message) => message.forum == parent.id)
        .sort((a, b) => {
          return b.sendAt.getTime() - a.sendAt.getTime();
        });
    },
  },
  Message: {
    author(parent, _args, _context, _info) {
      const message = messages.find((message) => message.id == parent.id);
      return users.find((user) => user.id == message?.author);
    },
  },
  Date: dateScalar,
};

export default resolvers;
