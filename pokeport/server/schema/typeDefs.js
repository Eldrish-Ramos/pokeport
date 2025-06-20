import { gql } from 'apollo-server-express'
export default gql`
  type User {
    id: ID!
    username: String!
    email: String!
    theme: String
  }
  type AuthPayload {
    token: String!
    theme: String
  }
  type Query {
    me: User
  }
  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(identifier: String!, password: String!): AuthPayload
    setTheme(theme: String!): User
  }
`