import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type Query {
    store(storeId: ID!): Store
    stores(category: String): Stores
  }

  type Store {
    id: ID!
    name: String!
    category: String!
    address: String
    phone: String
    website: String
    location: Location
  }

  type Stores {
    totalCount: Int!
    categories: [String]!
    nodes: [Store]!
  }

  type Location {
    lat: Float
    lng: Float
  }
`;
