import { gql } from 'apollo-server-express'
export default gql`
  type CollectedCard {
    cardId: String!
    setId: String!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    theme: String
    collection: [CollectedCard]
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
    addToCollection(cardId: String!, setId: String!): User
    removeFromCollection(cardId: String!, setId: String!): User
  }
`