import { gql } from "apollo-server-core";

export default gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    picture: String
  }

  type Forum {
    id: ID!
    members: [User!]
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    sendAt: Date!
    author: User!
  }

  type Query {
    myForums: [Forum!]
    forums: [Forum!]
    forum(id: String!): Forum
  }

  type Mutation {
    createForum: Forum!
    joinForum(id: String!): Forum!
    postMessage(text: String!, forumId: String!): Message!
  }
`;
