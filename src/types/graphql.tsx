export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Query = {
  __typename?: 'Query';
  store?: Maybe<Store>;
  stores?: Maybe<Stores>;
};

export type QueryStoreArgs = {
  storeId: Scalars['ID'];
};

export type QueryStoresArgs = {
  category?: Maybe<Scalars['String']>;
};

export type Store = {
  __typename?: 'Store';
  id: Scalars['ID'];
  name: Scalars['String'];
  category: Scalars['String'];
  address?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
};

export type Stores = {
  __typename?: 'Stores';
  totalCount: Scalars['Int'];
  categories: Array<Maybe<Scalars['String']>>;
  nodes: Array<Maybe<Store>>;
};

export type Location = {
  __typename?: 'Location';
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
};

export enum CacheControlScope {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export type StoresQueryVariables = Exact<{
  category?: Maybe<Scalars['String']>;
}>;

export type StoresQuery = { __typename?: 'Query' } & {
  stores?: Maybe<
    { __typename?: 'Stores' } & Pick<Stores, 'totalCount' | 'categories'> & {
        nodes: Array<
          Maybe<
            { __typename?: 'Store' } & Pick<
              Store,
              'id' | 'name' | 'category' | 'address'
            > & {
                location?: Maybe<
                  { __typename?: 'Location' } & Pick<Location, 'lat' | 'lng'>
                >;
              }
          >
        >;
      }
  >;
};
