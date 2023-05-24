const { gql } = require("@apollo/server");

const typeDefs = `#graphql
  type Product {
    id: String!
    title: String!
    description: String!
    price: Int!

  }

  type User {
    id: String!
    firstName : String!
    lastName : String!
    email : String!
    password : String!
  }

  type Query {
    product(id: String!): Product
    products: [Product]
    user(id: String!): User
    users: [User]
  }
  type Mutation {
    createProduct(id: String!, title: String!, description:String!, price: Int!): Product
    createUser(id: String!, firstName : String!, lastName : String!, email : String!,password : String!): User
  }
`;

module.exports = typeDefs;
