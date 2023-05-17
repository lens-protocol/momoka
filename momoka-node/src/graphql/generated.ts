import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigInt: any;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  transactions?: Maybe<TransactionConnection>;
};

export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  currency?: InputMaybe<Scalars['String']>;
  hasTags?: InputMaybe<Scalars['Boolean']>;
  ids?: InputMaybe<Array<Scalars['String']>>;
  limit?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<SortOrder>;
  owners?: InputMaybe<Array<Scalars['String']>>;
  tags?: InputMaybe<Array<TagFilter>>;
};

export type Receipt = {
  __typename?: 'Receipt';
  signature: Scalars['String'];
  timestamp: Scalars['BigInt'];
  version: Scalars['String'];
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type Tag = {
  __typename?: 'Tag';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type TagFilter = {
  name: Scalars['String'];
  values: Array<Scalars['String']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  address: Scalars['String'];
  currency: Scalars['String'];
  id: Scalars['String'];
  receipt?: Maybe<Receipt>;
  signature?: Maybe<Scalars['String']>;
  tags: Array<Tag>;
  timestamp: Scalars['BigInt'];
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  edges?: Maybe<Array<Maybe<TransactionEdge>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String'];
  node: Transaction;
};

export type DataAvailabilityTransactionsQueryVariables = Exact<{
  owners?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;

export type DataAvailabilityTransactionsQuery = {
  __typename?: 'Query';
  transactions?: {
    __typename?: 'TransactionConnection';
    edges?: Array<{
      __typename?: 'TransactionEdge';
      cursor: string;
      node: { __typename?: 'Transaction'; id: string; address: string };
    } | null> | null;
    pageInfo?: { __typename?: 'PageInfo'; endCursor?: string | null; hasNextPage: boolean } | null;
  } | null;
};

export const DataAvailabilityTransactionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'DataAvailabilityTransactions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'owners' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'after' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'order' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'SortOrder' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'transactions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'owners' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'owners' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'after' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'after' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'order' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'order' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'hasTags' },
                value: { kind: 'BooleanValue', value: true },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'edges' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'node' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                          ],
                        },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'cursor' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pageInfo' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'endCursor' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'hasNextPage' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DataAvailabilityTransactionsQuery,
  DataAvailabilityTransactionsQueryVariables
>;
